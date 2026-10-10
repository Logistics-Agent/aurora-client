# Aurora Next Develop CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the `develop` branch of `aurora-next` through GitHub Actions, a private GHCR Docker image, and self-hosted Coolify on Ubuntu, with CI gates preventing failed code from reaching deployment.

**Architecture:** Pull requests to `develop` run validation only. Pushes/merges to `develop` run the same validation, build a multi-stage Next.js standalone Docker image, push `develop` and commit-SHA tags to private GHCR, then call an authenticated Coolify deploy webhook. Coolify pulls the private image and runs it on port 3000; Coolify does not rebuild source.

**Tech Stack:** Next.js 16.3.2, React 19.2.8, TypeScript 5.9.x, pnpm 10.28.0, Node.js 24, Docker Buildx, GitHub Actions, GHCR, Coolify 4.3.18, Ubuntu 24.04 LTS.

**Spec:** `docs/superpowers/specs/2026-09-10-aurora-next-develop-cicd-design.md`

## Global Constraints

- Deploy branch: `develop` only; `main`/production is out of scope.
- Package manager: `pnpm@10.28.0` from `package.json`.
- Next.js runtime output: `standalone`.
- Docker runtime: Node.js 24 Debian slim, non-root process, internal port `3000`.
- Registry: private GitHub Container Registry (`ghcr.io`).
- Image tags: mutable `develop` plus immutable `sha-<full-commit-sha>`.
- CI gates: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- GitHub Actions must push the image before triggering Coolify.
- Coolify must deploy the prebuilt Docker image and must not rebuild the source repository.
- Public build configuration for develop:
  - `NEXT_PUBLIC_API_BASE_URL=https://api.humanak.cyou`
  - `NEXT_PUBLIC_APP_NAME=Logistics AI Control Tower`
  - `NEXT_PUBLIC_FIREBASE_ENABLED=true`
  - `NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty`
- Firebase client configuration values supplied as blank remain blank until real values are provided. Because Firebase is enabled, verify actual application behavior before marking deployment healthy.
- No private secret may be committed or passed as a Docker build arg.
- Coolify API token and deploy webhook are GitHub Actions secrets.
- Coolify's deployment server must authenticate to GHCR with a read-only package credential.

---

## File Structure

- Modify `next.config.ts` — enable Next.js standalone output.
- Create `Dockerfile` — deterministic multi-stage build and minimal non-root runtime image.
- Create `.dockerignore` — prevent local artifacts, Git metadata, and dotenv files from entering build context.
- Create `.github/workflows/develop.yml` — PR CI, develop CI, Docker publication, and Coolify deployment orchestration.
- No application source code changes are required unless the existing app fails when `NEXT_PUBLIC_FIREBASE_ENABLED=true` with blank Firebase client fields.

---

### Task 1: Enable standalone Next.js output

**Files:**

- Modify: `next.config.ts`

**Interfaces:**

- Consumes: existing Next.js 16.3.2 configuration.
- Produces: `.next/standalone/server.js` during `pnpm build`, consumed by the Docker runtime stage.

- [ ] **Step 1: Capture the current baseline**

Run:

```bash
pnpm typecheck
pnpm build
```

Expected: both commands pass before the configuration change. If either already fails, record the existing failure and fix it separately before attributing failures to CI/CD work.

- [ ] **Step 2: Enable standalone output**

Replace `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 3: Verify standalone artifacts**

Run:

```bash
pnpm build
test -f .next/standalone/server.js
```

Expected: build passes and the `test` command exits with status 0.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "build: enable Next.js standalone output"
```

---

### Task 2: Add production Docker packaging

**Files:**

- Create: `Dockerfile`
- Create: `.dockerignore`

**Interfaces:**

- Consumes: `package.json`, `pnpm-lock.yaml`, source tree, standalone output from Task 1, `NEXT_PUBLIC_*` build arguments.
- Produces: Linux AMD64 image that starts `node server.js` and listens on `0.0.0.0:3000`.

- [ ] **Step 1: Add `.dockerignore`**

Create `.dockerignore`:

```text
node_modules
.next
.git
.github

.env
.env.*
!.env.example

npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

coverage
playwright-report
test-results

.DS_Store
```

Expected: dotenv files and local build outputs cannot be copied into the image context.

- [ ] **Step 2: Add the multi-stage `Dockerfile`**

Create `Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0

RUN corepack enable \
    && corepack prepare pnpm@10.28.0 --activate

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_FIREBASE_ENABLED
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY
ARG NEXT_PUBLIC_MAP_STYLE_URL
ARG NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL
ARG NEXT_PUBLIC_MAPTILER_KEY

ENV NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL"
ENV NEXT_PUBLIC_APP_NAME="$NEXT_PUBLIC_APP_NAME"
ENV NEXT_PUBLIC_FIREBASE_ENABLED="$NEXT_PUBLIC_FIREBASE_ENABLED"
ENV NEXT_PUBLIC_FIREBASE_API_KEY="$NEXT_PUBLIC_FIREBASE_API_KEY"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="$NEXT_PUBLIC_FIREBASE_PROJECT_ID"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="$NEXT_PUBLIC_FIREBASE_APP_ID"
ENV NEXT_PUBLIC_FIREBASE_VAPID_KEY="$NEXT_PUBLIC_FIREBASE_VAPID_KEY"
ENV NEXT_PUBLIC_MAP_STYLE_URL="$NEXT_PUBLIC_MAP_STYLE_URL"
ENV NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL="$NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL"
ENV NEXT_PUBLIC_MAPTILER_KEY="$NEXT_PUBLIC_MAPTILER_KEY"

RUN mkdir -p public
RUN pnpm build

FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

- [ ] **Step 3: Build the image locally with the approved develop values**

Run:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL='https://api.humanak.cyou' \
  --build-arg NEXT_PUBLIC_APP_NAME='Logistics AI Control Tower' \
  --build-arg NEXT_PUBLIC_FIREBASE_ENABLED='true' \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY='' \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN='' \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID='' \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET='' \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID='' \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID='' \
  --build-arg NEXT_PUBLIC_FIREBASE_VAPID_KEY='' \
  --build-arg NEXT_PUBLIC_MAP_STYLE_URL='https://tiles.openfreemap.org/styles/liberty' \
  --build-arg NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL='' \
  --build-arg NEXT_PUBLIC_MAPTILER_KEY='' \
  -t aurora-next:develop-local .
```

Expected: Docker build succeeds, including the existing MapLibre `prebuild` and `postbuild` scripts.

- [ ] **Step 4: Run the image locally**

Run:

```bash
docker run --rm --name aurora-next-local -p 3000:3000 aurora-next:develop-local
```

In a second terminal:

```bash
curl -I http://127.0.0.1:3000
```

Expected: an HTTP response is returned. If application startup fails because Firebase is enabled without Firebase client values, stop here and provide the required Firebase public configuration rather than weakening the deployment check.

- [ ] **Step 5: Verify the process is non-root**

While the container is running:

```bash
docker exec aurora-next-local id
```

Expected: UID `1001` / user `nextjs`, not root.

- [ ] **Step 6: Commit**

```bash
git add Dockerfile .dockerignore
git commit -m "build: add production Docker image"
```

---

### Task 3: Configure GitHub develop environment values

**Files:**

- No repository file changes.

**Interfaces:**

- Consumes: approved public develop configuration.
- Produces: GitHub Environment variables referenced by the workflow in Task 4.

- [ ] **Step 1: Create the GitHub Environment**

In GitHub repository settings:

```text
Settings
→ Environments
→ New environment
→ develop
```

Do not add a required reviewer yet; this environment is being used for build-time public configuration during the initial learning setup.

- [ ] **Step 2: Add required Environment variables**

Under `develop` → Environment variables, create exactly:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.humanak.cyou
NEXT_PUBLIC_APP_NAME=Logistics AI Control Tower
NEXT_PUBLIC_FIREBASE_ENABLED=true
NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
```

- [ ] **Step 3: Add the currently blank public Firebase/map variables**

Create these with blank values if GitHub permits blank Environment variables; otherwise omit them and let the workflow expand them to an empty string:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL=
NEXT_PUBLIC_MAPTILER_KEY=
```

Expected: no private server secret is stored in Environment variables prefixed `NEXT_PUBLIC_`; these values are intentionally public client/build configuration.

---

### Task 4: Add GitHub Actions CI and Docker publication

**Files:**

- Create: `.github/workflows/develop.yml`

**Interfaces:**

- Consumes: package scripts, GitHub `develop` Environment variables, repository `GITHUB_TOKEN`.
- Produces: CI status for PRs and private GHCR images `:develop` and `:sha-<commit>` on pushes to `develop`.

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/develop.yml`:

```yaml
name: Develop CI/CD

on:
  pull_request:
    branches:
      - develop
  push:
    branches:
      - develop

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Validate
    runs-on: ubuntu-latest
    environment: develop
    permissions:
      contents: read

    env:
      NEXT_PUBLIC_API_BASE_URL: ${{ vars.NEXT_PUBLIC_API_BASE_URL }}
      NEXT_PUBLIC_APP_NAME: ${{ vars.NEXT_PUBLIC_APP_NAME }}
      NEXT_PUBLIC_FIREBASE_ENABLED: ${{ vars.NEXT_PUBLIC_FIREBASE_ENABLED }}
      NEXT_PUBLIC_FIREBASE_API_KEY: ${{ vars.NEXT_PUBLIC_FIREBASE_API_KEY }}
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ vars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ vars.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ vars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ vars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
      NEXT_PUBLIC_FIREBASE_APP_ID: ${{ vars.NEXT_PUBLIC_FIREBASE_APP_ID }}
      NEXT_PUBLIC_FIREBASE_VAPID_KEY: ${{ vars.NEXT_PUBLIC_FIREBASE_VAPID_KEY }}
      NEXT_PUBLIC_MAP_STYLE_URL: ${{ vars.NEXT_PUBLIC_MAP_STYLE_URL }}
      NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL: ${{ vars.NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL }}
      NEXT_PUBLIC_MAPTILER_KEY: ${{ vars.NEXT_PUBLIC_MAPTILER_KEY }}

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup pnpm
        uses: pnpm/action-setup@v6
        with:
          version: 10.28.0
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: pnpm
          cache-dependency-path: pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check formatting
        run: pnpm format:check

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Unit tests
        run: pnpm test

      - name: Build
        run: pnpm build

  image:
    name: Build and publish image
    if: github.event_name == 'push'
    needs: ci
    runs-on: ubuntu-latest
    environment: develop
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Resolve lowercase GHCR image name
        shell: bash
        run: echo "IMAGE_NAME=ghcr.io/${GITHUB_REPOSITORY,,}" >> "$GITHUB_ENV"

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v4

      - name: Login to GHCR
        uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v7
        with:
          context: .
          file: ./Dockerfile
          platforms: linux/amd64
          push: true
          tags: |
            ${{ env.IMAGE_NAME }}:develop
            ${{ env.IMAGE_NAME }}:sha-${{ github.sha }}
          build-args: |
            NEXT_PUBLIC_API_BASE_URL=${{ vars.NEXT_PUBLIC_API_BASE_URL }}
            NEXT_PUBLIC_APP_NAME=${{ vars.NEXT_PUBLIC_APP_NAME }}
            NEXT_PUBLIC_FIREBASE_ENABLED=${{ vars.NEXT_PUBLIC_FIREBASE_ENABLED }}
            NEXT_PUBLIC_FIREBASE_API_KEY=${{ vars.NEXT_PUBLIC_FIREBASE_API_KEY }}
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${{ vars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
            NEXT_PUBLIC_FIREBASE_PROJECT_ID=${{ vars.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${{ vars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${{ vars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
            NEXT_PUBLIC_FIREBASE_APP_ID=${{ vars.NEXT_PUBLIC_FIREBASE_APP_ID }}
            NEXT_PUBLIC_FIREBASE_VAPID_KEY=${{ vars.NEXT_PUBLIC_FIREBASE_VAPID_KEY }}
            NEXT_PUBLIC_MAP_STYLE_URL=${{ vars.NEXT_PUBLIC_MAP_STYLE_URL }}
            NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL=${{ vars.NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL }}
            NEXT_PUBLIC_MAPTILER_KEY=${{ vars.NEXT_PUBLIC_MAPTILER_KEY }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to Coolify
    if: github.event_name == 'push'
    needs: image
    runs-on: ubuntu-latest
    environment: develop

    steps:
      - name: Trigger Coolify deployment
        env:
          COOLIFY_WEBHOOK: ${{ secrets.COOLIFY_WEBHOOK }}
          COOLIFY_TOKEN: ${{ secrets.COOLIFY_TOKEN }}
        run: |
          curl --fail --show-error --silent \
            --request GET "$COOLIFY_WEBHOOK" \
            --header "Authorization: Bearer $COOLIFY_TOKEN"
```

- [ ] **Step 2: Validate the workflow syntax locally**

If `actionlint` is installed:

```bash
actionlint .github/workflows/develop.yml
```

If it is not installed, inspect the workflow with:

```bash
sed -n '1,260p' .github/workflows/develop.yml
```

Expected: YAML indentation is valid and all `${{ ... }}` expressions remain literal in the committed file.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/develop.yml
git commit -m "ci: add develop Docker deployment pipeline"
```

---

### Task 5: Publish and secure the private GHCR package

**Files:**

- No repository file changes.

**Interfaces:**

- Consumes: successful `image` job from Task 4.
- Produces: private `ghcr.io/<owner>/<repo>:develop` and `:sha-<commit>` package versions that only authenticated clients can pull.

- [ ] **Step 1: Push the workflow to `develop` once without Coolify secrets if needed**

If `COOLIFY_WEBHOOK` and `COOLIFY_TOKEN` do not exist yet, temporarily disable only the `deploy` job while bootstrapping GHCR, or create the Coolify resource first in Task 6. Do not weaken or skip the `ci` and `image` dependency chain.

- [ ] **Step 2: Verify GHCR package creation**

After a successful image publication, open the package under the GitHub owner/account and verify that the container package exists with:

```text
develop
sha-<commit>
```

- [ ] **Step 3: Set package visibility to Private**

In package settings, keep visibility `Private`. If package access is not automatically linked to the repository, grant the source repository access so its `GITHUB_TOKEN` can continue to publish.

- [ ] **Step 4: Create a read-only GHCR token for the Ubuntu/Coolify server**

Create a GitHub personal access token (classic) with only:

```text
read:packages
```

If the package belongs to an organization using SSO, authorize the token for that organization.

Do not give the Coolify server `write:packages` or `delete:packages`.

---

### Task 6: Authenticate Ubuntu/Coolify to private GHCR and create the Docker Image application

**Files:**

- No repository file changes.

**Interfaces:**

- Consumes: private GHCR image and read-only token from Task 5.
- Produces: Coolify application configured to pull `ghcr.io/<owner>/<repo>:develop` and expose internal port 3000.

- [ ] **Step 1: Authenticate the Coolify deployment server to GHCR**

SSH to the Ubuntu server as the same server user Coolify uses for Docker and run:

```bash
export GHCR_USERNAME='<github-username>'
read -rsp 'GHCR read:packages token: ' GHCR_TOKEN
echo
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io \
  --username "$GHCR_USERNAME" \
  --password-stdin
unset GHCR_TOKEN
```

Expected:

```text
Login Succeeded
```

Do not paste the token into shell history.

- [ ] **Step 2: Verify the server can pull the private image**

Run, using the actual lowercased owner/repository path:

```bash
docker pull ghcr.io/<owner>/<repo>:develop
```

Expected: pull succeeds without `unauthorized` or `denied`.

- [ ] **Step 3: Create the Coolify resource**

In Coolify:

```text
Projects
→ <your project>
→ develop
→ + New Resource
→ Docker Image
```

Configure:

```text
Image: ghcr.io/<owner>/<repo>
Tag: develop
Port: 3000
```

Do not select a Git repository build type for this resource; GitHub Actions already builds the image.

- [ ] **Step 4: Deploy manually once**

Use Coolify's Deploy action.

Expected: Coolify pulls the private image and starts the Next.js container successfully.

- [ ] **Step 5: Verify application logs and HTTP response**

From Coolify, inspect application logs. Then use the generated Coolify URL or configured domain and verify an HTTP response.

If Firebase initialization fails while `NEXT_PUBLIC_FIREBASE_ENABLED=true`, provide valid Firebase public client configuration and rebuild the image. Do not change `FIREBASE_ENABLED` behind the user's approved configuration simply to make the deploy green.

---

### Task 7: Configure authenticated Coolify CD webhook

**Files:**

- No repository file changes.

**Interfaces:**

- Consumes: Coolify Docker Image resource from Task 6.
- Produces: `COOLIFY_WEBHOOK` and deploy-only `COOLIFY_TOKEN` repository secrets used by Task 4's deploy job.

- [ ] **Step 1: Make Coolify reachable by GitHub-hosted runners**

Before enabling CD, ensure the Coolify authenticated webhook uses an Internet-reachable HTTPS host, for example:

```text
https://coolify.<your-domain>/api/v1/deploy?uuid=<resource-uuid>&force=false
```

A private LAN URL such as `http://192.168.100.88:8000/...` is not reachable from GitHub-hosted runners.

- [ ] **Step 2: Enable Coolify API access**

In self-hosted Coolify:

```text
Settings
→ Configuration
→ Advanced
→ API Access
→ Enabled
```

- [ ] **Step 3: Create a deploy-only API token**

In Coolify:

```text
Keys & Tokens
→ API Tokens
→ + Add
```

Create a token named, for example:

```text
github-actions-develop
```

Grant only the `deploy` permission and choose a reasonable expiration period.

Copy the token once and store it securely.

- [ ] **Step 4: Copy the resource's authenticated deploy webhook**

In the Coolify application:

```text
Configuration
→ Webhooks
→ Deploy Webhook (auth required)
```

Copy the URL.

- [ ] **Step 5: Add GitHub Actions secrets**

In GitHub:

```text
Settings
→ Secrets and variables
→ Actions
→ Secrets
```

Create:

```text
COOLIFY_WEBHOOK=<authenticated deploy webhook URL>
COOLIFY_TOKEN=<deploy-only Coolify API token>
```

- [ ] **Step 6: Test the webhook from outside the LAN**

Using a machine/network that can reach the public Coolify HTTPS endpoint:

```bash
curl --fail --show-error \
  --request GET "$COOLIFY_WEBHOOK" \
  --header "Authorization: Bearer $COOLIFY_TOKEN"
```

Expected: Coolify queues a deployment; verify it in the application's Deployments page.

---

### Task 8: End-to-end CI/CD verification and branch protection

**Files:**

- No new application files unless a defect is discovered.

**Interfaces:**

- Consumes: all prior tasks.
- Produces: validated `develop` deployment flow and merge guardrails.

- [ ] **Step 1: Verify PR behavior**

Create a test branch:

```bash
git checkout -b chore/verify-develop-ci
git commit --allow-empty -m "chore: verify develop CI"
git push -u origin chore/verify-develop-ci
```

Open a PR targeting `develop`.

Expected:

```text
Validate: runs and passes
Build and publish image: skipped
Deploy to Coolify: skipped
```

- [ ] **Step 2: Verify failed CI blocks downstream jobs**

On the test branch, intentionally introduce a formatting error that makes `pnpm format:check` fail, push it, and confirm only CI runs and fails. Revert the intentional error immediately afterward.

Expected: no GHCR image publication and no Coolify deployment.

- [ ] **Step 3: Merge a clean PR into `develop`**

After restoring a clean branch and receiving a green CI result, merge the PR.

Expected pipeline:

```text
Validate ✅
→ Build and publish image ✅
→ Deploy to Coolify ✅
```

- [ ] **Step 4: Verify GHCR tags**

Confirm both exist:

```text
ghcr.io/<owner>/<repo>:develop
ghcr.io/<owner>/<repo>:sha-<merged-commit-sha>
```

- [ ] **Step 5: Verify deployed build**

Open the develop website and test at least:

```text
Page render
API requests → https://api.humanak.cyou
Map style load → https://tiles.openfreemap.org/styles/liberty
Firebase-enabled startup behavior
```

Expected: no requests target `localhost:7100` from the browser.

- [ ] **Step 6: Protect `develop`**

In GitHub branch rules/rulesets for `develop`:

```text
Require a pull request before merging
Require status checks to pass before merging
Required check: Validate
Block force pushes
```

Keep direct deployment logic tied only to pushes that reach `develop` after required CI passes.

- [ ] **Step 7: Final verification commands**

Locally:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL='https://api.humanak.cyou' \
  --build-arg NEXT_PUBLIC_APP_NAME='Logistics AI Control Tower' \
  --build-arg NEXT_PUBLIC_FIREBASE_ENABLED='true' \
  --build-arg NEXT_PUBLIC_MAP_STYLE_URL='https://tiles.openfreemap.org/styles/liberty' \
  -t aurora-next:verify .
```

Expected: every command exits 0.

- [ ] **Step 8: Commit any final documentation-only changes**

```bash
git status
git add docs/superpowers/specs/2026-09-10-aurora-next-develop-cicd-design.md \
        docs/superpowers/plans/2026-09-10-aurora-next-develop-cicd-implementation-plan.md
git commit -m "docs: document develop CI/CD deployment"
```

---

## Self-Review Results

- **Spec coverage:** branch scope, CI gates, Docker standalone build, private GHCR, two image tags, Coolify Docker Image deployment, authenticated deploy webhook, public build variables, failure gating, and end-to-end verification are all mapped to tasks.
- **Placeholder scan:** angle-bracket values remain only where the actual GitHub owner/repository/domain/resource UUID cannot be inferred from supplied files; every such value is resolved from the user's real GitHub/Coolify resource during execution rather than being an implementation TODO.
- **Type/name consistency:** workflow secret names are consistently `COOLIFY_WEBHOOK` and `COOLIFY_TOKEN`; image tags are consistently `develop` and `sha-${{ github.sha }}`; Docker port is consistently `3000`.
