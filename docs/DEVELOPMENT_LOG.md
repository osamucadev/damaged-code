# Development Log

This document is the human-readable journal of how Damaged Code evolves.

It is not a replacement for Git history and it is not the product changelog.

Use it to preserve meaningful context that would otherwise disappear between coding sessions.

## Entry format

```text
## YYYY-MM-DD: Short topic

Checkpoint:
Goal:

What changed:
1. ...

Decisions:
1. ...

Validation:
1. ...

Known issues:
1. ...

Relevant commits:
1. ...
```

Keep entries concise.

Do not record every edited line.

## 2026-09-22: Initial project planning

Checkpoint: 00, Repository governance

Goal:

Define the delivery model before implementation begins.

What changed:

1. The project name was established as "Damaged Code: A Rick and Morty Coding Challenge".
2. The required web experience was separated from optional ideas.
3. Next.js was selected for the required web application.
4. Node.js and Fastify were selected for the shared REST BFF direction.
5. Flutter was selected as the additional multiplatform client.
6. Docker and Docker Compose were selected as the local development environment for web and API.
7. Firebase was selected as the target production ecosystem.
8. PNPM was established as the only JavaScript and TypeScript package manager.
9. English and Portuguese, pt-BR, were established as supported interface languages.
10. OpenAPI documentation was added to the committed API quality scope.
11. Unit and integration testing were added to the initial quality scope.
12. End-to-end tests were moved to backlog.
13. A guided web onboarding tour was planned for final polish.
14. Traditional search, semantic search, hybrid search, and authenticated experiments were moved to backlog.

Decisions:

1. Web and Flutter clients must communicate exclusively with the project BFF.
2. Direct Rick and Morty API access from clients is forbidden.
3. Direct Firebase application data access from clients is forbidden.
4. Work should progress in vertical slices so visible behavior appears while backend capabilities are developed.
5. Git history should use small Conventional Commits in English.
6. Verified logical increments should be committed and pushed as they are completed.
7. Checkpoints organize work but do not represent SemVer minor or patch versions.
8. Product and repository prose must not use em dashes or en dashes.
9. Optional complexity must not put the core release at risk.

Validation:

1. Repository exists and is currently empty.
2. Initial documentation package prepared before code scaffolding.

Known issues:

1. Exact cache provider is not selected yet.
2. Exact Firebase service mapping will be confirmed during implementation.
3. Node.js and PNPM pinned versions will be selected during the workspace foundation checkpoint.

Relevant commits:

1. Pending initial documentation commit.

## 2026-09-22: Workspace and local foundation

Checkpoint: 01, Workspace and local foundation

Goal:

Make the repository reproducible and ready for vertical feature development.

What changed:

1. PNPM workspace created with `apps/*` and `packages/*`, one root lockfile, and PNPM 11.25.0 pinned through `packageManager`.
2. Shared `tsconfig.base.json` created so both applications inherit the same strict TypeScript rules.
3. Fastify 5 API scaffolded in TypeScript with an application factory separated from the server entry point.
4. `GET /health` added to the API with a response schema.
5. Next.js 16 App Router client scaffolded in TypeScript with React 19.
6. Multi stage Dockerfiles added for both applications, each with a development target and a production target.
7. Root `docker-compose.yml` added to start the complete local environment.
8. Web home page now reports whether the project API is reachable.
9. Vitest, ESLint, and TypeScript checks wired for both applications, plus a root `pnpm check` script.

Decisions:

1. Node.js 22 LTS is used locally and in Docker, pinned to the `node:22.23.2-bookworm-slim` image. The Debian slim image avoids the musl workarounds that the Next.js native binaries need on Alpine.
2. TypeScript 5.9.3 was chosen instead of the newer 7.0.2 release because `typescript-eslint` still declares support for `typescript >=4.8.4 <6.1.0`, so the lint toolchain cannot run against TypeScript 7 yet.
3. ESLint 9.39.5 was chosen instead of ESLint 10 because `eslint-plugin-react`, a transitive dependency of `eslint-config-next`, still calls the `context.getFilename` API that ESLint 10 removed. This was found by running the linter, not by assumption.
4. No monorepo orchestrator was introduced. Recursive PNPM scripts are enough at this size.
5. No `packages/` workspace member was created because no shared code was needed yet.
6. The browser calls the BFF directly and the API enables CORS for the configured web origin. This keeps the two applications independently deployable and matches how the Flutter client will consume the same contract later. The alternative, proxying every call through Next.js, would have hidden the real client boundary.
7. `GET /health` stays outside the versioned product namespace because it is an operational endpoint, not part of the product contract.
8. Compose bind mounts the repository for hot reload and keeps dependency directories in named volumes so the host tree does not shadow the container installation.
9. The Docker build uses a BuildKit cache mount for the PNPM store and copies manifests before sources, so editing code does not invalidate the dependency layer.
10. Containers build Next.js into `.next-docker` through `NEXT_DIST_DIR`. Mounting the container build volume at `apps/web/.next` made Docker create that directory on the host as root, which broke `pnpm build` outside the container. The separate directory keeps host and container builds independent.

Validation:

1. `pnpm check` passes: lint, type checking, and 16 tests across both applications.
2. `docker compose down -v` followed by `docker compose up -d --build` starts both services from a clean state in about 70 seconds, and the API container reports healthy.
3. The web page loaded in a browser at `http://localhost:3000` shows "API reachable: damaged-code-api" through a real cross origin call to `http://localhost:4000/health`.
4. Stopping the API container makes the same page report "API unreachable", so the failure state was observed rather than assumed.
5. Both production Docker targets were built and smoke tested: the API answered `/health` and the web standalone server answered with status 200.
6. `pnpm build` was run on the host after the container build directory fix, so host and container builds no longer conflict.

Known issues:

1. The API has no OpenAPI document yet. It arrives with the first product route, which became checkpoint 03 after the design system checkpoint was inserted.
2. There is no continuous integration workflow yet.
3. TanStack Query is not installed yet. The health state uses a plain fetch because no server state caching is needed at this point.
4. Firebase and Flutter remain untouched, as planned for this checkpoint.
5. Docker creates an empty root owned `apps/web/.next-docker` directory on the host as the container volume mount point. It is ignored by Git and harmless, but removing it requires elevated permissions.

Relevant commits:

1. `chore: initialize pnpm workspace`
2. `chore(api): scaffold fastify service`
3. `feat(api): expose health endpoint`
4. `chore(web): scaffold next application`
5. `chore: add docker development environment`
6. `feat(web): display api health state`
7. `test: add foundation coverage and workspace quality script`
8. `fix(web): keep the container build directory out of the host .next`

## 2026-09-22: Design system foundation

Checkpoint: 02, Design system foundation

Goal:

Create the frontend design system that the product interface will be built from, before the Rick and Morty integration starts.

What changed:

1. A new checkpoint was inserted as checkpoint 02. Every checkpoint from the episode listing onward moved forward by one number, so release review is now checkpoint 11.
2. `docs/DESIGN_SYSTEM.md` was created.
3. A semantic token layer was added at `apps/web/src/design-system/tokens/tokens.css`, covering color, typography, spacing, radius, border, shadow, motion, and layering.
4. Storybook 10 was added to the web workspace with the accessibility and docs addons.
5. Five atoms and one molecule were implemented, each with stories and behavior tests.
6. The home screen was rebuilt from design system components and gained a control that runs the API check again.

Decisions:

1. Styling uses CSS Modules with token custom properties. CSS Modules ship with Next.js, need no runtime, and keep the token layer as plain CSS that the application and Storybook both read. A utility class framework was rejected because this interface is a small number of heavily styled physical objects rather than many one off layout combinations.
2. Storybook uses `@storybook/nextjs-vite`. The workspace already runs Vite through Vitest, so Storybook reuses that pipeline instead of adding a parallel webpack toolchain.
3. Tokens have two levels. Primitive palette values are private to the token layer, and components may only use semantic names.
4. Reduced motion is handled once in the token layer, so components inherit it. The Loader additionally stops its continuous rotation, because collapsing a duration does not stop an infinite animation.
5. The danger color was split into two tokens after checking contrast. A single red could not serve both as a surface behind light text and as text on a dark screen surface without failing the 4.5:1 requirement in one of the two cases.
6. Design system components never contain user facing strings. Text arrives from the caller, which keeps the component layer ready for the localization checkpoint. Product strings currently sit in the home screen component and move to localization resources in checkpoint 06.
7. The `PropertyRow` molecule was created because the home screen needed it, and because the future character dossier needs the same pattern. It was not created speculatively.
8. Atomic Design is applied only inside `src/design-system`. Next.js routes and page components stay in `src/app`.
9. Only atoms and molecules exist. No organism directory was created, because no organism exists yet.

Validation:

1. `pnpm check` passes: lint, type checking, and 33 tests across both applications, of which 25 are web tests.
2. `pnpm build-storybook` completes successfully, and `pnpm storybook` was opened in a browser to confirm the stories render with the token layer.
3. The Storybook accessibility addon reported no violations on the inspected stories.
4. Contrast ratios for every text and surface pairing in the token layer were computed and clear 4.5:1.
5. The application was loaded from the Docker environment at `http://localhost:3000`. It renders the new interface, reports the API as reachable, and the control that runs the check again works in the real browser.
6. `pnpm build` produces a successful production build of the web application.

Known issues:

1. Storybook has no automated story or visual regression run. Stories are documentation, and behavior is covered by Vitest.
2. The display typography stack uses system fonts. A licensed display face can replace the token later without touching components.
3. Product strings in the home screen are English only until the localization checkpoint.
4. Storybook is not part of the Docker environment. It runs through PNPM on the host.

Relevant commits:

1. `docs: insert design system checkpoint and renumber the delivery plan`
2. `docs: add design system direction`
3. `feat(web): establish design tokens`
4. `chore(web): add storybook`
5. `feat(web): add design system primitives`
6. `feat(web): compose the home screen from design system components`
