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

This foundation was later hardened, before the episode work started:

1. published host ports moved to an uncommon project specific block and became configurable;
2. Storybook became a Compose service;
3. an optional, fully containerized Firebase emulator mode was added;
4. hot reload was explicitly verified for web, API, and Storybook.

## Checkpoint 02: Design system foundation

Status: DONE

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

Delivered state:

1. `docs/DESIGN_SYSTEM.md` documents goals, Atomic Design use, tokens, motion, accessibility, Storybook, and the future character dossier interaction.
2. The Behance reference by Maksim Banshchikov is attributed in the design system document and in the README, with an explicit rule against copying its assets or layouts.
3. Semantic tokens exist for color, typography, spacing, radius, border, shadow, motion, and layering, with reduced motion handled once at the token layer.
4. Five atoms and one molecule exist, each with stories and behavior tests.
5. Storybook 10 runs from the workspace through `pnpm storybook`.
6. The home screen was rebuilt from design system components, so the system is proven in the running application.

## Checkpoint 03: Episode listing vertical slice

Status: DONE

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

Delivered state:

1. `GET /v1/episodes` returns all 51 episodes through the project contract.
2. Upstream pagination is resolved by following the upstream next link.
3. OpenAPI documents the contract, and Swagger UI is served at `/docs`.
4. TanStack Query owns episode server state in the web client.
5. The web client renders every episode with deliberate loading, empty, error, and retry behavior.
6. A `Badge` atom and an `EpisodeListItem` molecule joined the design system.
7. The localization foundation exists with English and Portuguese catalogs.

Caching was deliberately not implemented. Every request to `GET /v1/episodes` currently performs three upstream requests, which is the subject of checkpoint 05.

## Checkpoint 04: Episode characters vertical slice

Status: DONE

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

Delivered state:

1. `GET /v1/episodes/:episodeId/characters` returns every character of the episode.
2. The adapter resolves the episode, extracts character ids from the upstream URLs, and fetches them through the upstream multiple id endpoint, so one episode costs two upstream requests.
3. Alphabetical ordering is applied in the service, because it is a contract rule rather than a client concern.
4. OpenAPI documents the route, its path parameter, and its 400, 404, and 502 responses.
5. Episode rows are real buttons with a visible and announced selected state.
6. The web client renders the character grid with portraits, status, and details, with idle, loading, empty, error, and retry states.

The required challenge behavior is complete.

## Checkpoint 05: Reliability, cache, and contract hardening

Status: DONE

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

Delivered state:

1. `GET /v1/characters/{characterId}` returns a character with its episode appearances.
2. Appearances are normalized into project references carrying id, code, and name, so no provider URL and no client route reaches the contract.
3. Appearances are resolved in one batched upstream call, so there is no request per episode.
4. Cache-aside caching sits behind the BFF with four semantic keys and a one hour lifetime, in process by default and Firestore backed in the Firebase mode.
5. Cache read and write failures degrade to the upstream source, and cache operations are bounded so a hanging backend cannot hold a request.
6. Public error responses no longer carry upstream URLs, and the not found handler no longer echoes the requested route.
7. The web opens a character dossier from the character grid, with appearance links to the project episode pages.
8. OpenAPI documents the new endpoint, its parameter, and its failure responses.

## Checkpoint 06: Internationalization and web completion

Status: DONE

Goal: complete the planned web experience in English and Portuguese.

Target outcomes:

1. English UI available;
2. Portuguese, pt-BR, UI available;
3. language selection behavior is intentional;
4. user-facing strings are localized;
5. relevant localization behavior is tested;
6. README setup instructions reflect the working project.

Delivered state:

1. English and Portuguese, pt-BR, message catalogs cover every user-facing string in the web client.
2. Locale resolves from the `damaged-code-locale` cookie with an English fallback.
3. Localization behavior is covered by web tests.

Deferred: a visible in-page language switcher control was not implemented for v0.1.0. Locale currently follows the cookie rather than an on-screen control. This is tracked in `docs/BACKLOG.md` rather than left as a misleading active item.

## Checkpoint 07: Firebase production deployment

Status: COMPLETE

Goal: make the challenge easy to evaluate without local setup.

Deployed resources:

```text
project     samuelcaetitedev
web edge    Firebase Hosting site damaged-code-web
web runtime Cloud Run service damaged-code-web, us-central1
api         Cloud Functions Gen 2 function damagedCodeApi, us-central1
firestore   untouched and unused in production
```

The original App Hosting plan was replaced after the bounded compatibility check found no supported plain PNPM workspace path that preserved the root lockfile. The Docker based Cloud Run fallback keeps the repository structure intact. Existing Hosting sites, Functions `contact` and `api`, and Firestore `(default)` remain untouched.

Target outcomes:

1. web is deployed from the same codebase;
2. API is deployed from the same codebase;
3. production clients use the project REST API;
4. production configuration contains no committed secrets;
5. public demo URLs are added to the README;
6. OpenAPI documentation is reachable or clearly documented;
7. deployment decisions are recorded in architecture docs.

All target outcomes are complete. The raw production OpenAPI document is available at `/docs/json`; the Swagger UI asset prefix remains a minor known limitation.

## Checkpoint 08: Flutter client

Status: COMPLETE

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

Delivered state:

1. `apps/mobile` is a Flutter 3.47.2 application with Android, Linux, and web targets.
2. The production BFF is the default `API_BASE_URL`, with `--dart-define` available for local overrides.
3. The archive lists all episodes by season and opens a dedicated episode screen.
4. Episode detail shows metadata and the complete character contract in BFF order.
5. Character detail shows normalized facts and navigable episode appearances.
6. Native navigation preserves the full Android back stack.
7. English and Brazilian Portuguese use `flutter_localizations`, `gen_l10n`, and ARB catalogs.
8. Every remote screen has loading, sanitized error, retry, and relevant empty states.
9. Eleven focused unit and widget tests cover transport, parsing, contract drift, locale selection, state, retry, and the critical navigation flow.
10. Debug and release APK builds succeed, and the release application was validated against the production API on a Pixel 8 emulator.

## Checkpoint 09: Visual polish

Status: DONE

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

Delivered state:

1. The home page is an intentional project entry point with a first fold GitHub repository CTA.
2. The 51 episodes are grouped into compact season views instead of one long list.
3. Episode selection lives at `/episodes/:episodeId`, so direct links, refresh, back, and forward work.
4. The dedicated episode workspace combines identity, metadata, previous and next navigation, characters, and a sticky desktop navigator.
5. Narrow screens receive a disclosure based episode navigator instead of a compressed sidebar.
6. API health is a secondary operational indicator with details behind disclosure.
7. Canonical decorative faces are consumed through a small decorative component and never replace API portraits.
8. The site includes intentional metadata, an original DC favicon, a visible source link, and the author footer.
9. Reusable episode link states are documented in Storybook and covered by component tests.

## Checkpoint 10: Guided onboarding

Status: BACKLOG

Goal: help a reviewer understand the product quickly.

This checkpoint was not implemented for v0.1.0. It was not part of the required challenge behavior, and the release was not held for it. It moved to `docs/BACKLOG.md` with its original target outcomes intact so it can be picked up later without blocking this release.

## Checkpoint 11: Release review

Status: DONE

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

Delivered as the `v0.1.0` release: the Android download CTA shipped beside the existing GitHub CTA, the README and architecture docs were brought in line with the actual deployed and local-reproducible state, the changelog gained its first versioned entry, and this checkpoint was marked complete only after quality gates and production validation passed.

## Optional work

Status: BACKLOG

Optional work lives in `docs/BACKLOG.md`.

Do not promote backlog work into an active checkpoint until the core release candidate is healthy.
