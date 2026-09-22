# Damaged Code: A Rick and Morty Coding Challenge

Damaged Code is a time-boxed technical challenge built around the public Rick and Morty API.

The core experience is intentionally simple: list every episode, let the user select one, and display the characters from that episode in alphabetical order.

The implementation is designed to show how a small requirement can be delivered with clear boundaries, reproducible development, test coverage, documented contracts, and room for multiple clients.

## A small disclaimer

The author of this project has never watched Rick and Morty. Yes, really.

The project name is a nod to "For the Damaged Coda", a reference strongly associated with the show and its fan community. Any thematic references, jokes, naming choices, or assumptions in this repository were made in good faith after researching the universe of the show for this coding challenge.

If any reference or bit of canon is slightly off, please treat it as an accidental interdimensional side effect rather than disrespect for the source material.

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

The web and API applications exist. The Flutter client arrives in its own checkpoint.

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
| Production | Firebase managed services from the same codebase |
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

The reproducible environment is Docker Compose. From the repository root:

```bash
docker compose up --build
```

That starts both applications:

| Service | URL | Notes |
| --- | --- | --- |
| Web | http://localhost:3000 | Next.js development server with hot reload |
| API | http://localhost:4000 | Fastify development server with hot reload |
| API health | http://localhost:4000/health | Used by the container health check and by the web client |

Stop the environment with `docker compose down`, or add `-v` to also discard the dependency volumes.

### Running without Docker

Requires Node.js 22 LTS and PNPM. Corepack activates the pinned PNPM version from `package.json`.

```bash
corepack enable
pnpm install
pnpm dev
```

### Design system

The reusable interface components are documented in Storybook.

```bash
pnpm storybook
```

Storybook runs at http://localhost:6006 and needs no API, no database, and no network access. See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for the component rules and token philosophy.

### Quality checks

```bash
pnpm check
```

That runs linting, type checking, and the test suites of every workspace application. The individual scripts are `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

The same application code developed locally will be used for the Firebase production deployment. Docker is the local development and evaluation environment, not a separate implementation of the product.

Each Dockerfile also has a `production` target that builds the deployable image for that application, so local and production execution share one source tree.

## Production demo

Production URLs and downloadable Flutter artifacts will be added after the deployment checkpoint.

```text
Web: pending
API: pending
OpenAPI: pending
APK: pending
```

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

The workspace foundation is in place: the web and API applications run together through Docker Compose, and the web client reports the API health state through the project BFF. Rick and Morty episode data is not integrated yet.

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
