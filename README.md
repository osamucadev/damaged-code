# Damaged Code: A Rick and Morty Coding Challenge

Damaged Code is a time-boxed technical challenge built around the public Rick and Morty API.

The core experience is intentionally simple: browse episodes by season, open a shareable episode page, and display the characters from that episode in alphabetical order.

The implementation is designed to show how a small requirement can be delivered with clear boundaries, reproducible development, test coverage, documented contracts, and room for multiple clients.

## A small disclaimer

The author of this project has never watched Rick and Morty. Yes, really.

The project name is a nod to "For the Damaged Coda", a reference strongly associated with the show and its fan community. Any thematic references, jokes, naming choices, or assumptions in this repository were made in good faith after researching the universe of the show for this coding challenge.

If any reference or bit of canon is slightly off, please treat it as an accidental interdimensional side effect rather than disrespect for the source material.

## Live demo and downloads

| What | Link |
| --- | --- |
| Live web | [https://zrp.samuelcaetite.dev](https://zrp.samuelcaetite.dev) |
| GitHub repository | [https://github.com/osamucadev/damaged-code](https://github.com/osamucadev/damaged-code) |
| Android APK | [v0.1.0 release](https://github.com/osamucadev/damaged-code/releases/tag/v0.1.0) |
| Production API | [https://us-central1-samuelcaetitedev.cloudfunctions.net/damagedCodeApi](https://us-central1-samuelcaetitedev.cloudfunctions.net/damagedCodeApi) |
| OpenAPI document | [/docs/json](https://us-central1-samuelcaetitedev.cloudfunctions.net/damagedCodeApi/docs/json) |

`zrp.samuelcaetite.dev` is the canonical public demo. [https://damaged-code-web.web.app](https://damaged-code-web.web.app) is the underlying Firebase Hosting URL and stays documented as an infrastructure fallback.

The Android release APK is an evaluator distribution build. It is ready to install, already configured to call the production API above, and does not require the reviewer to run Docker. See [Flutter evaluation](#flutter-evaluation) for details and for the optional local development path.

## Challenge

The required product behavior is:

1. Fetch and list all Rick and Morty episodes.
2. Allow the user to select an episode.
3. Show every character who appears in that episode.
4. Sort the characters alphabetically.

The upstream REST API is documented at:

https://rickandmortyapi.com/documentation#rest

## Planned delivery

The project is being built as a monorepo with three application surfaces:

```text
apps/
  web/       Next.js web client
  api/       Node.js BFF and REST API
  mobile/    Flutter multiplatform client
```

All three application surfaces exist. Web and Flutter consume the same project REST API.

The web and Flutter clients communicate exclusively with the project BFF.

```text
Next.js
   |
   v
Project REST API
   ^
   |
Flutter
```

Client applications do not access Firebase services directly and do not access the Rick and Morty API directly.

## Core technical direction

| Area | Direction |
| --- | --- |
| Web | Next.js, React, TypeScript |
| Server state | TanStack Query |
| API | Node.js, Fastify, REST |
| API contract | OpenAPI |
| Mobile and desktop | Flutter |
| JavaScript package manager | PNPM only |
| Local environment | Docker and Docker Compose |
| Production | Firebase Functions, Cloud Run, and Firebase Hosting |
| Internationalization | English and Portuguese, pt-BR |
| Testing | Unit and integration tests |
| End-to-end tests | Backlog |
| Source control | Small Conventional Commits in English |

## Why PNPM only

This repository intentionally uses PNPM as the only JavaScript and TypeScript package manager.

PNPM was selected for its workspace support, deterministic lockfile, content-addressable store, and efficient disk usage across multiple local projects. It has also been more reliable than the npm CLI in the Ubuntu development environments used by the author.

The repository should not contain `package-lock.json` or `yarn.lock`.

Flutter continues to use the standard Dart and Flutter package tooling.

## Local development

Docker and Docker Compose are the only requirements. No Node.js, no PNPM, no Firebase CLI, and no Java are needed on the host.

There are two local modes.

### Standard mode

```bash
docker compose up --build
```

This starts the web client, the API, and Storybook. Docker and Docker Compose are enough for the standard Web and API evaluation. Node.js, PNPM, the Firebase CLI, Java, Google credentials, Firestore, Cloud Functions, and Cloud Run are not required on the reviewer host.

Standard mode uses the API's in-process cache: the local web client calls the local BFF, and the local BFF calls the public Rick and Morty REST API directly. Local evaluation is therefore independent from Samuel's Firebase production infrastructure, but it still needs normal internet access to the Rick and Morty API. This mode is not fully offline, and it needs no Firebase project, no Google credentials, and no network access to any Google service.

| Service | URL | Container port |
| --- | --- | --- |
| Web | http://localhost:17320 | 3000 |
| API | http://localhost:17321 | 4000 |
| API documentation | http://localhost:17321/docs | 4000 |
| API health | http://localhost:17321/health | 4000 |
| Storybook | http://localhost:17322 | 6006 |

Stop it with `docker compose down`.

### Firebase emulator mode

This mode is optional. It is not required for the coding challenge behavior, which is fully exercised by standard mode above.

```bash
docker compose -f docker-compose.yml -f docker-compose.firebase.yml up --build
```

This adds the Cloud Firestore emulator and the Firebase Emulator Suite UI, and points the API at the emulator through Compose service DNS.

| Service | URL | Container port |
| --- | --- | --- |
| Emulator Suite UI | http://localhost:17323 | 4000 |
| Firestore emulator | http://localhost:17324 | 8080 |

Everything the emulator needs lives inside its container, including the pinned Firebase CLI and a Java runtime. The reviewer never installs `firebase-tools`, never installs Java, and never logs in to Firebase. The local project id is the deliberately fake `demo-damaged-code-local`, and the `demo-` prefix keeps the Emulator Suite completely offline.

Persistence is not implemented yet. This mode exists so the environment is ready for the checkpoint that introduces server side persistence.

#### Local emulator state

The Firestore emulator holds data in memory, so local state survives through export and import.

```text
first start            empty emulator, which is expected
normal shutdown        state is exported into a Docker named volume
next start             the previous export is imported automatically
```

Reset the local Firebase state on purpose:

```bash
docker volume rm damaged-code_firebase-emulator-data
```

`docker compose down -v` also resets it, together with every other local volume, including the container dependency directories.

No emulator state is ever written into the Git working tree.

### Ports

Published host ports use an uncommon project specific block so the environment does not collide with other work on the reviewer's machine. Override them by copying [.env.example](./.env.example) to `.env`.

Ports inside the Compose network stay conventional. Containers always reach each other through service names and internal ports, for example `http://api:4000`, never through a published port.

### Hot reload

Source is bind mounted into the containers, and dependency directories live in container managed volumes so the host tree never shadows them. Editing a file on the host updates the running containers with no image rebuild, for the web client, the API, and Storybook. Native filesystem events are used, with no polling.

Dependencies live in container managed volumes, and a volume is only seeded when it is created. Each development service therefore synchronizes its dependencies against the lockfile when it starts, so `docker compose up --build` is enough after adding a dependency.

### Running without Docker

Requires Node.js 22 LTS and PNPM. Corepack activates the pinned PNPM version from `package.json`.

```bash
corepack enable
pnpm install
pnpm dev
```

Outside Docker the applications use their conventional ports, so the web client runs on 3000 and the API on 4000.

### Design system

The reusable interface components are documented in Storybook, which runs as a Compose service at http://localhost:17322 and is also available on the host:

```bash
pnpm storybook
```

Storybook needs no API, no database, and no network access. See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for the component rules and token philosophy.

### Quality checks

```bash
pnpm check
```

That runs linting, type checking, and the test suites of every workspace application. The individual scripts are `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

### Flutter evaluation

The mobile application uses Flutter 3.47.2 and lives at `apps/mobile`. It runs outside Docker.

#### Evaluator APK

The APK attached to the [v0.1.0 GitHub Release](https://github.com/osamucadev/damaged-code/releases/tag/v0.1.0) is the evaluator distribution build:

1. ready to install on an Android device, no build step required;
2. already configured to call the production `damagedCodeApi` above;
3. not dependent on the evaluator running Docker or any local service;
4. manually validated on a real Android phone by the author before release.

It uses debug signing, because it is evaluator and demo distribution rather than a Play Store submission.

#### Local Flutter development

Running from source defaults to the production BFF:

```bash
cd apps/mobile
flutter pub get
flutter run
```

`API_BASE_URL` overrides that through `--dart-define`, without changing source. With Web and API running through Docker Compose, the API host port is 17321:

```bash
# Android Emulator, reaches the host machine's local BFF
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:17321

# Physical Android device on the same network as the development machine
flutter run --dart-define=API_BASE_URL=http://<HOST_LAN_IP>:17321
```

`10.0.2.2` is the Android Emulator's alias for the host loopback address, so it reaches a BFF running on the development machine. A physical phone has no such alias, so it needs the development machine's actual LAN IP address, and the phone and the machine need real network connectivity to each other; host firewalls or Wi-Fi client isolation can block that path even when the address is correct. Native Flutter makes this request through the platform HTTP stack, not a browser, so it is not subject to browser CORS.

Android blocks cleartext (plain HTTP) traffic by default from API level 28 onward. A debug-only network security configuration at `apps/mobile/android/app/src/debug` permits cleartext traffic so the local BFF addresses above work in debug builds. It is not packaged into release builds, which keep the platform default and only ever call the production API over HTTPS.

Run the quality gates and create the evaluator APK:

```bash
flutter analyze
flutter test
flutter build apk --release
```

The release artifact is generated at `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`. Build artifacts are intentionally ignored by Git; the evaluator APK is distributed through the GitHub Release instead.

The same application code developed locally is used for the Firebase production deployment. Docker is the local development and evaluation environment for Web and API, not a separate implementation of the product.

Each Dockerfile also has a `production` target that builds the deployable image for that application, so local and production execution share one source tree.

## API contract

The project REST API is documented with OpenAPI and served by Swagger UI.

```text
http://localhost:17321/docs        documentation user interface
http://localhost:17321/docs/json   raw OpenAPI document
```

Implemented endpoints:

```text
GET /v1/episodes                          every episode, in the project contract
GET /v1/episodes/{episodeId}              one episode, in the project contract
GET /v1/episodes/{episodeId}/characters   episode characters, alphabetically
GET /v1/characters/{characterId}          one character with its episode appearances
GET /health                               operational, outside the versioned product contract
```

Clients consume only this API. The Rick and Morty API is reached by the BFF alone, and upstream pagination and provider URLs never reach a client.

Responses are cached behind the BFF for one hour. The standard mode keeps entries in process, and the Firebase mode shares them through Firestore. The cache is only an optimization: if it fails, the request still goes upstream and still answers.

## Interface languages

The web client ships English and Portuguese, pt-BR, message catalogs, and localization behavior is tested. The locale currently comes from the `damaged-code-locale` cookie and falls back to English. A visible on-screen language selector is not implemented yet; it is tracked in [docs/BACKLOG.md](./docs/BACKLOG.md).

Episode names and air dates are domain data and stay exactly as the upstream API publishes them.

## Production demo

The production web application and REST API are deployed from this repository.

```text
Web:      https://zrp.samuelcaetite.dev
Web (fallback): https://damaged-code-web.web.app
API:      https://us-central1-samuelcaetitedev.cloudfunctions.net/damagedCodeApi
OpenAPI:  https://us-central1-samuelcaetitedev.cloudfunctions.net/damagedCodeApi/docs/json
APK:      GitHub Release v0.1.0, damaged-code-android-v0.1.0.apk
```

`zrp.samuelcaetite.dev` is a custom domain in front of the same Firebase Hosting site and is the canonical public demo. Firebase Hosting owns the dedicated `damaged-code-web` site and rewrites every request to the public `damaged-code-web` Cloud Run service in `us-central1`. The browser bundle calls only the production BFF. The production API uses its in-process cache, and Firestore is not used by the deployed application.

The Swagger UI route is deployed at `/docs`, but its current asset prefix is a minor known limitation. The raw OpenAPI document at `/docs/json` is the reliable production reference.

## Key engineering decisions

1. **Shared BFF.** Both Next.js and Flutter consume one project-owned REST API; neither talks to the Rick and Morty API or to Firebase directly. This keeps upstream normalization, sorting, caching, and error handling in one place.
2. **Product-owned contract.** Provider URLs and payload shapes never reach a client. Episode appearances are normalized into project references, and each client owns its own routing from that id.
3. **Alphabetical ordering is a BFF rule.** The service sorts characters once, so every client renders the same canonical order instead of re-implementing the rule.
4. **Batched upstream calls.** Episode cast resolution and character appearance resolution use the upstream multi-id endpoint, avoiding one request per related resource.
5. **Stable, safe error codes.** Public errors carry a fixed code and message; diagnostic detail, including upstream URLs, stays in server logs.
6. **In-process cache in production, not Firestore.** The existing Firebase project's default Firestore database holds unrelated data and stays untouched. Losing an in-process cache entry only costs a normal upstream refetch, so proportional infrastructure was preferred over an operationally heavier shared cache the challenge did not need. The Firestore-backed implementation still exists and is validated through the Firebase emulator mode.
7. **Cloud Run over App Hosting.** App Hosting's monorepo support did not have a straightforward path for this plain PNPM workspace within the time constraint, so the existing production Dockerfile is deployed through Cloud Run behind a dedicated Firebase Hosting site instead, with no Nx or Turborepo migration and no duplicate lockfile.
8. **Isolation inside a shared Firebase project.** The project already hosted unrelated resources. Damaged Code's Hosting site, Cloud Run service, and Functions codebase are deliberately isolated from the existing `contact` and `api` functions, the other Hosting sites, and the default Firestore database.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full reasoning behind each decision.

## Future evolution

Optional work that intentionally did not block this release lives in [docs/BACKLOG.md](./docs/BACKLOG.md), including a visible language switcher, the guided onboarding tour, and a concrete hybrid lexical and semantic episode search pipeline built on a documented synopsis enrichment step.

## Quality

Relevant unit and integration tests are part of the definition of done for each logical increment.

The initial delivery intentionally excludes end-to-end tests. They remain available as a future enhancement after the required experience and committed differentiators are stable.

## Documentation

| Document | Purpose |
| --- | --- |
| [AGENTS.md](./AGENTS.md) | Rules for any coding agent working in the repository |
| [CLAUDE.md](./CLAUDE.md) | Claude Code working protocol |
| [docs/PROJECT.md](./docs/PROJECT.md) | Product scope and delivery boundaries |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Architecture and system boundaries |
| [docs/CHECKPOINTS.md](./docs/CHECKPOINTS.md) | Incremental delivery plan |
| [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | Frontend design system, tokens, and component rules |
| [docs/TESTING.md](./docs/TESTING.md) | Test strategy and quality gates |
| [docs/BACKLOG.md](./docs/BACKLOG.md) | Optional work that must not block the core |
| [docs/DEVELOPMENT_LOG.md](./docs/DEVELOPMENT_LOG.md) | Human-readable development journal |
| [CHANGELOG.md](./CHANGELOG.md) | Product-facing change history |

## Project status

The web and API applications run together through Docker Compose and are deployed to Firebase managed infrastructure. The Flutter application provides the same episode, character, and appearance journey on Android through the project BFF.

Check [docs/CHECKPOINTS.md](./docs/CHECKPOINTS.md) for the current delivery checkpoint.

## Acknowledgements

The visual direction of this interface is inspired by the "Rick and Morty fanart UI" concept by Maksim Banshchikov.

```text
https://www.behance.net/gallery/101907237/Rick-and-Morty-fanart-UI
https://www.behance.net/mechanizzer
```

That work is used as art direction only. Damaged Code implements its own layouts, components, tokens, interactions, and assets, and does not copy or redistribute any asset from the reference. See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for the full rule.

## License and attribution

This is an independent technical challenge project.

Rick and Morty and related names are the property of their respective rights holders. The project uses the public Rick and Morty API as the challenge data source and is not affiliated with the show's creators, distributors, or the API maintainers.
