# Checkpoints

Checkpoints organize delivery. They are not releases and they do not map directly to Semantic Versioning.

Each checkpoint should contain several small, focused commits.

The active checkpoint should be updated as work progresses.

## Status legend

```text
PENDING
ACTIVE
DONE
BLOCKED
BACKLOG
```

## Checkpoint 00: Repository governance

Status: DONE

Goal: establish the rules and shared understanding before implementation starts.

Exit criteria:

1. `README.md` exists.
2. `AGENTS.md` exists.
3. `CLAUDE.md` exists.
4. architecture is documented.
5. testing strategy is documented.
6. backlog is separated from required work.
7. development logging conventions are established.

Expected commit style:

```text
docs: establish project governance
```

This checkpoint may be committed as one documentation-only increment because the documents form one coherent repository foundation.

## Checkpoint 01: Workspace and local foundation

Status: DONE

Goal: make the repository reproducible and ready for vertical development.

Target outcomes:

1. PNPM workspace initialized.
2. root package metadata created.
3. Next.js application scaffolded.
4. Node.js and Fastify API scaffolded.
5. Dockerfiles created for web and API.
6. Docker Compose starts the required development services.
7. health behavior is observable.
8. baseline linting, type checking, and tests run.
9. PNPM version is pinned.

Important constraint:

Do not add Flutter yet if doing so delays a working web and API development loop.

Possible small commits:

```text
chore: initialize pnpm workspace
chore(api): scaffold fastify service
chore(web): scaffold next application
chore: add docker development environment
test(api): cover health endpoint
```

Delivered state:

1. PNPM 11.25.0 workspace with one root lockfile, `apps/*` and `packages/*` globs.
2. Node.js 22 LTS pinned through `engines`, `.nvmrc`, and the Docker base image.
3. Fastify 5 API in TypeScript with `GET /health`.
4. Next.js 16 App Router client in TypeScript showing the API health state.
5. Multi stage Dockerfiles for web and API with development and production targets.
6. `docker compose up` starts the full local environment.
7. ESLint, `tsc --noEmit`, and Vitest run for both applications through `pnpm check`.

The `packages/` directory was not created because no shared code was needed yet.

## Checkpoint 02: Design system foundation

Status: ACTIVE

Goal: establish the frontend design system that the product interface will be built from.

This is a frontend design system concern. It is distinct from the system design and backend architecture already documented in `docs/ARCHITECTURE.md`.

Target outcomes:

1. `docs/DESIGN_SYSTEM.md` documents the direction.
2. visual inspiration is attributed.
3. semantic design tokens exist for color, typography, spacing, radius, border, shadow, motion, and layering.
4. Atomic Design conventions are established in the web application.
5. Storybook runs from the monorepo.
6. a minimal real component set demonstrates the system.
7. component tests cover real behavior.
8. lint, type checking, and existing tests still pass.
9. the web application still works.

Deliberate limits:

1. Do not build a large generic component library.
2. Create only the primitives that the upcoming episode interface needs.
3. Do not start the Rick and Morty integration in this checkpoint.

Possible small commits:

```text
docs: add design system direction
chore(web): add storybook
feat(web): establish design tokens
feat(web): add design system primitives
test(web): cover design system primitives
```

## Checkpoint 03: Episode listing vertical slice

Status: PENDING

Goal: show all episodes in the web application through the project BFF.

Target outcomes:

1. BFF integrates with the Rick and Morty REST API.
2. BFF exposes the project episode contract.
3. upstream pagination is handled correctly.
4. web consumes only the BFF.
5. episode list appears in the interface.
6. loading and error states exist.
7. relevant API and web tests pass.
8. OpenAPI includes the implemented route.

The feature should be visible before moving to the next slice.

## Checkpoint 04: Episode characters vertical slice

Status: PENDING

Goal: complete the required challenge behavior.

Target outcomes:

1. user can select an episode;
2. BFF resolves that episode's characters;
3. character response follows the project contract;
4. characters are alphabetically ordered;
5. web renders the selected episode and its characters;
6. loading, empty, and error states are intentional;
7. relevant API and web tests pass;
8. OpenAPI is updated.

At the end of this checkpoint, the core challenge behavior should work.

## Checkpoint 05: Reliability, cache, and contract hardening

Status: PENDING

Goal: make the core implementation robust without changing its product scope.

Target outcomes:

1. cache strategy selected and documented;
2. cache implemented behind the BFF if justified;
3. upstream failures become stable project errors;
4. API schemas are explicit;
5. OpenAPI documentation is complete for core routes;
6. integration tests cover important route behavior;
7. no client bypasses the BFF.

Avoid infrastructure that is disproportionate to the challenge.

## Checkpoint 06: Internationalization and web completion

Status: PENDING

Goal: complete the planned web experience in English and Portuguese.

Target outcomes:

1. English UI available;
2. Portuguese, pt-BR, UI available;
3. language selection behavior is intentional;
4. user-facing strings are localized;
5. relevant localization behavior is tested;
6. README setup instructions reflect the working project.

## Checkpoint 07: Firebase production deployment

Status: PENDING

Goal: make the challenge easy to evaluate without local setup.

Target outcomes:

1. web is deployed from the same codebase;
2. API is deployed from the same codebase;
3. production clients use the project REST API;
4. production configuration contains no committed secrets;
5. public demo URLs are added to the README;
6. OpenAPI documentation is reachable or clearly documented;
7. deployment decisions are recorded in architecture docs.

## Checkpoint 08: Flutter client

Status: PENDING

Goal: demonstrate the same product contract through Flutter.

Target outcomes:

1. Flutter project created;
2. Flutter consumes only the project REST API;
3. episode list works;
4. episode selection works;
5. characters are displayed;
6. English and Portuguese are supported;
7. unit tests exist;
8. widget tests exist;
9. production API configuration works;
10. Android production APK is produced if environment and time allow.

Desktop targets may be validated where the development host supports them.

## Checkpoint 09: Visual polish

Status: PENDING

Goal: improve presentation after product behavior is stable.

Refinement here extends the design system created in checkpoint 02. It does not introduce a second, parallel visual language.

This checkpoint is an appropriate point for Codex-assisted visual refinement.

Target outcomes:

1. visual hierarchy is intentional;
2. responsive behavior is polished;
3. loading and error states look deliberate;
4. accessibility basics are reviewed;
5. Rick and Morty references do not interfere with usability;
6. visual changes do not break tested behavior.

## Checkpoint 10: Guided onboarding

Status: PENDING

Goal: help a reviewer understand the product quickly.

Target outcomes:

1. short guided tour exists;
2. tour is skippable;
3. tour can be replayed;
4. completion is stored locally;
5. tour does not require backend persistence;
6. tour text is localized;
7. tour does not block normal evaluation.

## Checkpoint 11: Release review

Status: PENDING

Goal: produce the final reviewable delivery.

Exit criteria:

1. required challenge behavior works;
2. Docker setup is reproducible;
3. production demo works;
4. relevant tests pass;
5. lint and type checks pass;
6. OpenAPI reflects production behavior;
7. README matches actual commands and URLs;
8. changelog is current;
9. development log captures major decisions;
10. no secrets are tracked;
11. Git history remains incremental and understandable;
12. optional backlog work has not destabilized the core.

## Optional work

Status: BACKLOG

Optional work lives in `docs/BACKLOG.md`.

Do not promote backlog work into an active checkpoint until the core release candidate is healthy.
