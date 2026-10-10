# Aurora Next — Develop CI/CD Design

Date: 2026-09-10

## Scope

Configure CI/CD for the `develop` branch of the existing `aurora-next` Next.js application. Production/main deployment is intentionally out of scope for now.

## Current Project Baseline

- Next.js 16.3.2
- React 19.2.8
- pnpm 10.28.0
- TypeScript strict mode
- Existing scripts: `format:check`, `lint`, `typecheck`, `test`, `build`
- Build includes MapLibre prebuild/postbuild asset steps
- Coolify 4.3.18 is self-hosted on the user's Ubuntu machine

## Target Architecture

```text
feature/*
   │ PR
   ▼
develop
   │
   ▼
GitHub Actions
   ├─ pnpm install --frozen-lockfile
   ├─ pnpm format:check
   ├─ pnpm lint
   ├─ pnpm typecheck
   ├─ pnpm test
   └─ pnpm build
        │
        ▼
Docker Buildx
        │
        ▼
Private GHCR
   ├─ ghcr.io/<owner>/<image>:develop
   └─ ghcr.io/<owner>/<image>:sha-<commit>
        │
        ▼
Coolify
        │ authenticated pull
        ▼
Ubuntu self-host
        │
        ▼
Next.js standalone container :3000
```

## CI Rules

### Pull requests targeting `develop`

Run CI only:

1. Install dependencies with frozen lockfile.
2. Check formatting.
3. Lint.
4. Typecheck.
5. Run unit tests.
6. Build the Next.js app.

No Docker image is pushed and no deployment occurs for PR events.

### Pushes to `develop`

Run the same CI gates. Only if all gates pass:

1. Build Docker image.
2. Push image to private GHCR.
3. Publish mutable `develop` tag.
4. Publish immutable commit-SHA tag.
5. Trigger Coolify deployment.

## Docker Design

- Multi-stage Dockerfile.
- Node 24 Debian slim base.
- pnpm provided through Corepack and pinned to project package manager version.
- Next.js `output: "standalone"` enabled.
- Final runtime image contains only standalone output, static assets, and required public assets.
- Runtime process runs as a non-root user.
- Container listens on port 3000.

## Environment Variables

All `NEXT_PUBLIC_*` values are treated as public build-time configuration because Next.js can embed them into the client bundle.

Develop configuration includes:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.humanak.cyou
NEXT_PUBLIC_APP_NAME=Logistics AI Control Tower
NEXT_PUBLIC_FIREBASE_ENABLED=true
NEXT_PUBLIC_FIREBASE_*
NEXT_PUBLIC_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
NEXT_PUBLIC_MAP_FALLBACK_STYLE_URL=
NEXT_PUBLIC_MAPTILER_KEY=
```

Secrets that are not public must not be added as Docker build args or committed to the repository. Runtime secrets belong in Coolify.

> Note: `NEXT_PUBLIC_FIREBASE_ENABLED=true` is intentionally preserved from the approved develop configuration. The Firebase client keys are currently empty in the supplied environment sample; deployment must verify whether the application can run with Firebase enabled before declaring the environment healthy.

## Registry Security

GHCR package is private.

- GitHub Actions pushes using the repository `GITHUB_TOKEN` with `packages: write`.
- Coolify receives a separate GitHub credential/token with permission to read the private package.
- The public website may still be Internet-accessible; private registry visibility is independent from website visibility.

## Deployment

Coolify deploys from the private Docker image rather than rebuilding source.

Target resource:

```text
Environment: develop
Image: ghcr.io/<owner>/<image>:develop
Port: 3000
```

GitHub Actions triggers deployment only after the image has been pushed successfully.

## Files to Change/Add

```text
next.config.ts
Dockerfile
.dockerignore
.github/workflows/develop.yml
```

No `main`/production workflow is added yet.

## Failure Behaviour

- Formatting/lint/typecheck/test/build failure: stop pipeline; do not build/push/deploy image.
- Docker build/push failure: do not trigger Coolify.
- Coolify deployment failure: previous running deployment remains the operational fallback where supported by the configured deployment mode; investigate Coolify deployment logs before retrying.

## Verification

Before considering the setup complete:

1. `pnpm format:check` passes locally.
2. `pnpm lint` passes locally.
3. `pnpm typecheck` passes locally.
4. `pnpm test` passes locally.
5. `pnpm build` passes locally.
6. Docker image builds locally.
7. Container starts and serves Next.js on port 3000.
8. PR to `develop` runs CI without deployment.
9. Push/merge to `develop` pushes private GHCR tags.
10. Coolify successfully pulls the private image and deploys it.
