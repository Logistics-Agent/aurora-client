# Logistics AI Control Tower UI-only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` task-by-task. Each phase prompt is a hard checkpoint.

**Goal:** Implement the approved Figma UI as a complete, responsive, UI-only Next.js application while preserving feature-first ownership.

**Architecture:** Routes are thin adapters to feature roots. Features own page composition and local presentation fixtures; shared layout/common components are extracted only after repeated cross-feature use. Figma nodes are the source of visual truth, and all backend-facing layers remain out of scope.

**Tech Stack:** Next.js App Router, React strict TypeScript, Tailwind CSS, shadcn/ui/Radix, Lucide, React Hook Form/Zod only for local UI validation, Sonner for local feedback, existing Three/R3F only when already available for a required spatial visual.

**Spec:** `plan-ui/00_UI_ONLY_EXECUTION_SPEC.md`

## Global Constraints

- Execute `plan-ui/phases` in order and do not combine phase scope.
- Read the target app's current code before editing and reconcile exact paths with its existing conventions.
- UI-only fixture files are feature-local; do not add fake API layers.
- Figma node inspection is mandatory before JSX/CSS for each phase.
- Every route page imports only a public feature root.
- Preserve Light Enterprise Logistics tokens, shipment context, exception-first hierarchy, permission rules, AI explainability and realtime honesty.
- Validate with lint/typecheck and visual comparison after each phase; build after layout/routing changes and final QA.

## Phase sequence

| Phase | Deliverable                                                    | Prompt                                          |
| ----- | -------------------------------------------------------------- | ----------------------------------------------- |
| 00    | target-app audit, Figma contract, UI-only fixture convention   | `phases/00_preflight.md`                        |
| 01    | tokens, shadcn alignment, shared primitives                    | `phases/01_foundations-and-primitives.md`       |
| 02    | staff shell, route adapters, navigation                        | `phases/02_shell-and-routing.md`                |
| 03    | S01–S03 and role-aware navigation/permission primitives        | `phases/03_auth-and-permission-ui.md`           |
| 04    | S04 and S09 North Star visual system                           | `phases/04_north-star.md`                       |
| 05    | S05–S11 including six-step Create Shipment and import          | `phases/05_shipment-core.md`                    |
| 06    | S12–S14 map/route/tracking states                              | `phases/06_route-and-tracking.md`               |
| 07    | S15–S20 document, OCR and compliance review                    | `phases/07_documents-and-compliance.md`         |
| 08    | S21–S25 cost, negotiation and billing                          | `phases/08_commercial.md`                       |
| 09    | S26–S29 assistant, notifications and email review              | `phases/09_ai-and-communication.md`             |
| 10    | S30–S35 administration                                         | `phases/10_administration.md`                   |
| 11    | Customer Portal desktop/mobile                                 | `phases/11_customer-portal.md`                  |
| 12    | global states, dialogs, banners and permission UX              | `phases/12_states-confirmations-permissions.md` |
| 13    | responsive staff, local prototype interactions, spatial polish | `phases/13_responsive-prototype-spatial.md`     |
| 14    | full visual/architecture QA and fixes                          | `phases/14_final-ui-qa.md`                      |

## Per-phase execution loop

1. Read its prompt, the mapped Figma page, relevant architecture docs, and current target files.
2. Add a frame-to-code mapping note to the phase result before editing.
3. Implement feature-root composition, then major sections, then dialogs/drawers/local interaction state.
4. Test at 1440×900; additionally test stated responsive targets.
5. Fix deviations, run quality commands, report exact Figma frames/routes/files, and stop.
