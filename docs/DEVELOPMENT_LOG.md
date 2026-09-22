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

## 2026-09-22: Local infrastructure hardening

Checkpoint: between 02 and 03, local environment hardening

Goal:

Make the local environment friendly to a reviewer who has only Docker, and prepare an optional Firebase emulator mode, before the episode integration starts.

What changed:

1. Published host ports moved to the project block 17320 to 17324 and became configurable through environment variables documented in `.env.example`.
2. Storybook became a Compose service that reuses the web application image through a new Dockerfile target.
3. An optional `docker-compose.firebase.yml` overlay was added with the Cloud Firestore emulator and the Emulator Suite UI.
4. The API learned to validate a server side Firebase target without implementing any persistence.
5. Documentation now describes both local modes, ports, hot reload, emulator persistence, reset, and the planned production target.

Decisions:

1. Only published host ports moved. Ports inside the Compose network stay conventional, and services reach each other through service DNS such as `http://api:4000`.
2. The local Firebase project id is `demo-damaged-code-local` rather than `damaged-code-local`. With a plain fake id the CLI still attempted a Google credential lookup and warned about not being authenticated. The `demo-` prefix is the Firebase convention that keeps the Emulator Suite completely offline, which is what the no login requirement actually needs.
3. The emulator image is built on Debian 13 rather than the Debian 12 base used by the application images, because firebase-tools requires Java 21 or above and Debian 12 only offers Java 17.
4. The Firebase CLI is pinned as a workspace dependency and installed into the emulator image with PNPM. Nothing depends on a globally installed CLI, and the emulator container mounts no host paths at all.
5. Emulator state is exported into a subdirectory of the named volume rather than into the volume mount point, because the CLI clears the export directory before writing and cannot remove a mount point.
6. Firebase mode is explicit on the API side. A requested Firebase mode without an emulator address fails at startup instead of falling back to another target.
7. `verifyDepsBeforeRun` is set to `warn`. Development images install a filtered subset of the workspace, so pnpm considered the container modules directory out of sync and tried to purge it, which fails without a TTY and stopped the containers from starting.
8. No polling was enabled for file watching. Native filesystem events work on this Linux host, verified for all three services.

Validation:

1. Standard mode was started from a clean Docker state after `docker compose down -v`. Web, API, and Storybook all answer, and the web container reaches the API through service DNS.
2. Hot reload was verified by editing a source file on the host and observing the running container without an image rebuild, then reverting. Web and API were checked through HTTP responses, Storybook through a browser with the page open.
3. Storybook hot reload was broken at first. The browser received a websocket URL built from the container internal port, so live updates never arrived. Vite is now told the published port, and a component style edit was seen applying live.
4. Firebase mode was started from a clean state. The Firestore emulator and the Emulator Suite UI both answer, no authentication or credential lookup appears in the logs, and the API container resolves the emulator through service DNS.
5. The emulator container was inspected and mounts only named volumes. Inside it, the CLI is the pinned 15.30.2 and Java is 21, while the host has Java 17, which firebase-tools rejects. The emulator therefore runs entirely on container tooling.
6. Persistence was verified end to end. A document was written through the emulator REST interface, the environment was stopped normally, the export appeared in the named volume, and the document was present again after the next start.
7. Reset was verified. Removing the `damaged-code_firebase-emulator-data` volume returned the emulator to empty local data, and the previously written document answered with 404. Dependency volumes survived that targeted reset.
8. `pnpm check` passes with 38 tests, and `pnpm build` succeeds for both applications.

Known issues:

1. Firebase mode starts the emulator but nothing in the product reads or writes Firestore yet. That arrives with the checkpoint that needs persistence.
2. Docker still creates an empty root owned `apps/web/.next-docker` directory in the working tree as a volume mount point. It is ignored by Git.
3. The pnpm dependency check now warns inside containers on every run. The message is expected and explained in `pnpm-workspace.yaml`.
4. No production Firebase resource was created, configured, or deployed. The target is documented only.

Relevant commits:

1. `chore: move published development ports to a project specific block`
2. `chore(web): run storybook as a compose service`
3. `fix(web): point storybook hot reload at the published host port`
4. `feat: add containerized firebase emulator mode`
5. `feat(api): validate the server side firebase target`

## 2026-09-22: Episode listing vertical slice

Checkpoint: 03, Episode listing vertical slice

Goal:

Show every Rick and Morty episode in the web client, through the project BFF only.

What changed:

1. An upstream adapter was added at `apps/api/src/upstream/rick-and-morty`, with a client, a validating mapper, upstream types, and stable error codes.
2. `GET /v1/episodes` was implemented, returning the project episode model.
3. OpenAPI documentation was added with `@fastify/swagger`, and Swagger UI is served at `/docs`.
4. The localization foundation was added to the web client with `next-intl`, including English and Portuguese catalogs.
5. TanStack Query was added for episode server state.
6. A `Badge` atom and an `EpisodeListItem` molecule joined the design system, each with stories and tests.
7. The home screen now lists every episode, with loading, empty, error, and retry states.

Decisions:

1. The episode list answers with a `data` and `meta` envelope instead of a bare array. A top level array cannot gain response metadata later without a breaking change, and the character work in the next checkpoint will extend this contract.
2. Upstream character URLs are reduced to `characterCount`. Clients never receive provider URLs, which is what keeps the client boundary real rather than declared.
3. Pagination follows the upstream `next` link rather than deriving page numbers from the reported page count, because the link is the authoritative chain. A page limit stops a malformed chain from looping forever.
4. Contract ordering belongs to the service, not to each client, so web and Flutter see the same sequence.
5. One error envelope with stable codes lives in the application error handler, so every future route inherits it. Unexpected failures are logged with detail and answered with a generic message.
6. The localization foundation resolves the locale from a cookie with an English fallback, and has no locale prefixed routing yet. The visible language selector belongs to checkpoint 06. The goal here was only to stop introducing hardcoded product strings.
7. Design system components receive already translated text. `EpisodeListItem` takes the code and the title as domain data, and the air date and character count as text the caller has translated.
8. Episode names and air dates are not translated. They are domain data from the upstream API.
9. No cache was implemented. Each request to `GET /v1/episodes` performs three upstream requests, which is deliberate and belongs to checkpoint 05.

Validation:

1. `pnpm check` passes with 81 tests, 38 on the API and 43 on the web client.
2. `pnpm build` succeeds for both applications, and `pnpm build-storybook` completes.
3. `GET /v1/episodes` was checked against the live upstream service and returned all 51 episodes across the three upstream pages, ordered by id, with no upstream URL in the payload.
4. The documentation user interface answers at `/docs`, and `/docs/json` describes the endpoint with its 200, 500, and 502 responses.
5. The feature was verified in the browser through the standard Docker environment. The page renders 51 episode rows, the badge reports 51 episodes, and the network panel shows requests only to the project API on port 17321, never to the upstream service.
6. The Portuguese interface was verified in the browser through the locale cookie. Interface strings translate, and episode titles stay as published upstream.
7. The error state was verified by stopping the API container, and the retry control recovered the full list once the API was running again.

Known issues:

1. Two Docker defects were found and fixed during this work. Dependency volumes were not updated when a dependency was added, so the containers failed to start with a missing module. A first fix introduced a second problem, because a filtered install inside one service also manages sibling workspace projects, and those paths were not covered by volumes, so the install wrote through the bind mount and emptied the host dependencies of the other application. Each development service now isolates every workspace module path.
2. There is no cache, so every page load triggers three upstream requests from the API.
3. The locale cannot be changed from the interface yet.
4. `GET /v1/episodes/{id}` does not exist. It arrives with the character slice if the contract needs it.

Relevant commits:

1. `feat(api): add rick and morty upstream adapter`
2. `feat(api): expose the episode listing endpoint`
3. `feat(api): document the contract with openapi`
4. `fix(docker): sync container dependencies on start`
5. `fix(docker): isolate every workspace module path per service`
6. `feat(web): add the localization foundation`
7. `feat(web): add tanstack query foundation`
8. `feat(web): add episode list components to the design system`
9. `feat(web): display the episode list`

## 2026-09-22: Episode characters vertical slice

Checkpoint: 04, Episode characters vertical slice

Goal:

Complete the required challenge behavior: select an episode and see its characters, alphabetically.

What changed:

1. `GET /v1/episodes/:episodeId/characters` was added, with a project owned character model.
2. The upstream adapter resolves an episode, extracts character ids from the upstream character URLs, and fetches them through the upstream multiple id endpoint.
3. Alphabetical ordering was implemented in the episode service.
4. OpenAPI documents the new route, its path parameter, and its failure responses.
5. `EpisodeListItem` became selectable, rendering a real button with an announced and visible selected state.
6. A `CharacterCard` molecule was added to the design system.
7. The web client gained an episode explorer that owns the selection and a character panel driven by a dependent TanStack Query.

Decisions:

1. `GET /v1/episodes/:id` was not added. The characters route resolves the episode itself, and nothing in the product needs a single episode resource yet.
2. Alphabetical ordering uses an English collator with a base sensitivity, so case and accents do not disturb the order, and the character id breaks ties between identical names. Episode 1 contains two characters named Davin, so ties are real data rather than a hypothetical.
3. A missing episode became its own upstream error code, `EPISODE_NOT_FOUND`, and `UpstreamError` now carries the status it maps to. The existing error envelope did not change.
4. The 404 message deliberately avoids naming the upstream URL, because clients can read it. The pre existing 502 messages still contain the upstream URL, which belongs to the contract hardening checkpoint.
5. Character ids are requested in bounded batches. The batch size only keeps the URL sane for an unusually large cast, and no concurrency machinery was introduced: an episode costs two upstream requests.
6. Selection is client state. No routing was introduced, because nothing in this checkpoint needs a shareable URL.
7. The status tone mapping lives in the feature layer, not in the design system, because it interprets product data. Unrecognized status values render neutrally instead of being guessed.
8. Portraits use a plain image element. The portrait URL is part of the contract, and the Next image pipeline would add a server side media proxy that this checkpoint does not need. API traffic from the browser still reaches only the BFF.

Validation:

1. `pnpm check` passes with 122 tests, 58 on the API and 64 on the web client.
2. `pnpm build` succeeds for both applications.
3. The endpoint was checked against the live upstream service. Episode 1 returns 19 characters, alphabetically ordered, in two upstream requests, with no upstream URL in any field other than the portrait.
4. A missing episode answers 404 with `EPISODE_NOT_FOUND`, and a non numeric id answers 400 with `INVALID_REQUEST`.
5. The feature was verified in the browser through the standard Docker environment. Selecting an episode loads its characters, the portraits render, the selected row reports `aria-pressed`, and the browser network log shows API calls only to the project API on port 17321.
6. Swagger UI lists the new route under the episodes tag.
7. Empty, error, retry, and missing episode behavior are covered by web tests, including a test proving the client renders the contract order rather than sorting characters itself.

Known issues:

1. There is still no cache. Selecting an episode costs two upstream requests every time the query is refetched.
2. Portrait images are fetched by the browser from the upstream media host, because the contract publishes absolute image URLs. No API call bypasses the BFF.
3. The 502 error messages still include the upstream URL.
4. The selected episode is not reflected in the URL, so a selection cannot be shared or restored on reload.

Relevant commits:

1. `feat(api): expose episode characters endpoint`
2. `feat(web): display episode characters`
