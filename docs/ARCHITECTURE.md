# Architecture

## Goal

Keep a small coding challenge architecturally clear without introducing infrastructure only for appearance.

The main architectural decision is that every client consumes one project-owned REST contract.

## Context

```text
                 Rick and Morty REST API
                           |
                           v
                 Project REST BFF
                  Node.js + Fastify
                    /           \
                   /             \
                  v               v
             Next.js           Flutter
               web          multiplatform
```

The BFF can also own server-side access to Firebase services and cache infrastructure.

## Client boundary

The web and Flutter applications are presentation clients.

They can own:

1. UI state;
2. user interaction;
3. localized presentation strings;
4. client-side query state;
5. navigation;
6. presentation formatting.

They do not own:

1. upstream Rick and Morty integration;
2. Firestore access;
3. backend cache rules;
4. provider-specific normalization;
5. shared business rules;
6. server credentials.

## Forbidden direct paths

```text
Next.js -> Rick and Morty API
Flutter -> Rick and Morty API
Next.js -> Firestore client SDK
Flutter -> Firestore client SDK
```

These shortcuts are intentionally prohibited.

## BFF responsibilities

The BFF is expected to own:

1. upstream REST calls;
2. normalized response models;
3. response validation;
4. product-level sorting rules where part of the contract;
5. stable API error codes;
6. cache behavior;
7. server-side Firebase integration;
8. OpenAPI generation;
9. future search capabilities if they leave backlog.

The BFF contract should remain stable even if the upstream API changes.

## Why one shared BFF

A backend for frontend can be implemented as one backend per client when web and mobile needs diverge substantially.

That complexity is not justified here.

The web and Flutter clients initially need the same episode and character model, so one shared BFF keeps the contract explicit without duplicating orchestration.

If client needs diverge later, the boundary can be revisited.

## API shape

The exact contract will be designed during implementation, but the intended resource model is similar to:

```text
GET /v1/episodes
GET /v1/episodes/{episodeId}
GET /v1/episodes/{episodeId}/characters
```

Optional endpoints must not be added before their features leave backlog.

### Implemented contract

```text
GET /health                                operational, outside the product contract
GET /v1/episodes                           every episode, in the project model
GET /v1/episodes/{episodeId}               one episode, in the project model
GET /v1/episodes/{episodeId}/characters    every character of one episode, alphabetically
GET /v1/characters/{characterId}           one character with its episode appearances
GET /docs                                  OpenAPI documentation, raw document at /docs/json
```

The episode list answers with an envelope rather than a bare array:

```json
{
  "data": [
    {
      "id": 1,
      "code": "S01E01",
      "name": "Pilot",
      "airDate": "December 2, 2013",
      "characterCount": 19
    }
  ],
  "meta": { "total": 51 }
}
```

The envelope exists so response metadata can grow without a breaking change. A bare top level array cannot gain metadata later.

Upstream character URLs are reduced to `characterCount`. Provider specific URLs and upstream pagination never reach a client.

The single episode endpoint uses the same model and envelope as the list:

```json
{
  "data": {
    "id": 28,
    "code": "S03E07",
    "name": "The Ricklantis Mixup",
    "airDate": "September 10, 2017",
    "characterCount": 65
  }
}
```

The web route `/episodes/{episodeId}` reads that resource directly. Episode identity therefore lives in the URL and supports direct links, refresh, and browser history.

### Character detail and episode references

The character list endpoint stays lean. A grid needs a portrait and a few facts, so resolving every character's appearance history to render a list would be wasted work on every episode page. Appearances are resolved only by the detail endpoint, which a client calls when a reader actually opens one character:

```json
{
  "data": {
    "id": 2,
    "name": "Morty Smith",
    "image": "https://rickandmortyapi.com/api/character/avatar/2.jpeg",
    "status": "Alive",
    "species": "Human",
    "type": "",
    "gender": "Male",
    "origin": "Earth (C-137)",
    "location": "Citadel of Ricks",
    "episodes": [{ "id": 1, "code": "S01E01", "name": "Pilot" }]
  }
}
```

Upstream publishes appearances as provider URLs such as `https://rickandmortyapi.com/api/episode/1`. The adapter extracts the ids and the service resolves them into that reference, which carries identity and nothing else.

A reference has no `href`, no `webPath`, and no route name, because a URL belongs to whoever renders it. The web turns id 3 into `/episodes/3`, and Flutter turns the same id into its own navigation action. If the BFF emitted `/episodes/3` it would be shipping one client's routing table to every client, and the mobile client would have to ignore it.

Appearances are resolved in one request. Upstream accepts a comma separated id list, so a character appearing in 51 episodes costs one batched call rather than 51, the same technique the episode cast already uses in the opposite direction. The result is ordered by episode id, so every client sees the same canonical sequence.

Errors use one envelope with a stable code, because clients branch on codes rather than on server prose:

```json
{ "error": { "code": "UPSTREAM_UNAVAILABLE", "message": "The data source is temporarily unavailable. Please try again." } }
```

The message is safe to show and stable. Diagnostic context, including the failing upstream URL, stays in the server log, so a client can never read where the data came from or which request failed.

### Upstream integration

```text
src/upstream/rick-and-morty/   adapter: client, mapper, types, error codes
src/services/                  product rules, such as contract ordering
src/routes/v1/                 transport, schemas, and documentation
src/domain/                    the project model
```

Nothing outside the adapter directory knows the upstream payload shape. The adapter follows the upstream next link until it ends, with a page limit so a malformed chain cannot loop forever.

Characters are resolved in two upstream requests per episode. The adapter reads the episode, extracts the character ids from the upstream character URLs, and asks the upstream multiple id endpoint for all of them at once. The ids and URLs never leave the adapter. Only `characterCount` and the character model do.

Alphabetical character ordering is a product contract rule, so the service applies it once and every client receives the same order. No client sorts characters.

The character model publishes `origin` and `location` as names, and `image` as the absolute portrait URL upstream publishes. That URL is media, not an API call: clients still read all data through this API.

## OpenAPI

The BFF contract must be represented through OpenAPI.

The documentation should make clear:

1. routes;
2. parameters;
3. response schemas;
4. error schemas;
5. status codes;
6. authentication requirements if authentication is later introduced.

OpenAPI should evolve in the same logical increment as the API behavior.

## Cache

Caching belongs behind the BFF, and it is an optimization rather than a second source of truth. Rick and Morty remains authoritative.

### How it works

Every service result is read through the cache before the upstream source is asked:

```text
request -> cache hit  -> return the normalized result
        -> cache miss -> fetch upstream -> validate and normalize -> store -> return
```

What is stored is the normalized project model, never a raw upstream payload, so nothing provider shaped can leak back out through a cached entry.

### What is cached

```text
v1:episodes:all                episode catalog, which costs three upstream pages
v1:episode:{id}                one episode
v1:episode:{id}:characters     one episode cast
v1:character:{id}              one character detail, appearances included
```

Four semantic keys, one per thing a client asks for repeatedly. The `v1` prefix is a schema version: if a normalized shape changes, the prefix changes with it and old entries are simply never read again. That is the only invalidation this project has, and it is enough, because nothing here needs to evict an entry early.

### Lifetime

One hour, for every entry. The upstream dataset is a finished television archive, so per entry freshness policies would be configuration without benefit. `CACHE_TTL_MS` overrides it. Expiry is enforced in application code, because a Firestore TTL policy deletes lazily and the emulator applies none, so an expired document is treated as a miss rather than trusted.

### Which implementation

The choice follows the two runtime modes the repository already has:

```text
standard mode    in-process cache, no external dependency
Firebase mode    Firestore backed cache, shared between instances
```

The seam between them is two operations, `get` and `set`. It exists because there are genuinely two implementations, not to leave room for a third some day. There is no delete, no tagging, and no invalidation API, because nothing calls for one.

The in-process cache is enough for local Docker, where a single API container serves everything. The BFF is planned for Cloud Functions, where instances are ephemeral and there can be several at once, so an in-process cache would mostly miss and every instance would repeat the same upstream work. A shared cache is the natural answer there, and the Firebase emulator mode that already exists is where it is developed locally. Firebase is imported dynamically, so the standard mode never loads the admin SDK.

### When the cache fails

A cache failure must not take the product down while the upstream source can still answer:

```text
read fails or times out    log with context, fetch upstream
write fails or times out   log with context, return the upstream result anyway
```

Operations are bounded by a timeout, because a cache that hangs would be worse than one that fails: the request would be waiting on an optimization. A hang is handled on exactly the same path as an error.

Startup configuration is a different matter. Asking for Firebase mode without a reachable target is a configuration error and still fails loudly at startup, because silently downgrading to an in-process cache would hide the mistake.

## Internationalization

Localization belongs primarily to clients.

Supported user interface locales:

```text
en
pt-BR
```

The BFF should prefer stable error codes over localized prose.

Upstream domain content such as episode and character names remains unchanged unless an explicit enrichment feature is later added.

## Flutter client

The mobile client lives in `apps/mobile` and uses Flutter 3.47.2. Its package identity is `dev.samuelcaetite.damagedcode` and its initial application version is `0.1.0+1`.

The structure stays feature oriented:

```text
lib/
  app/                  application composition
  core/                 configuration, HTTP, theme, shared widgets
  features/episodes/    models, repository, archive and detail screens
  features/characters/  models, repository and dossier screen
  l10n/                 English and Portuguese ARB catalogs
```

The `http` package is the only external runtime dependency. `ApiClient` owns JSON transport and stable error-code extraction. Repositories validate DTOs and expose project models. Each remote screen owns one future and an explicit retry transition, which is enough state management for three read-only screens and remains easy to inject in widget tests.

Navigation uses Flutter's native `Navigator` and `MaterialPageRoute`. An appearance pushes another episode detail route onto the existing stack, so Android back navigation returns through character, original episode, and archive without a parallel navigation model.

`API_BASE_URL` is read through `--dart-define`. Its production default is the public `damagedCodeApi` URL. The application contains no Firebase SDK, Firestore dependency, provider endpoint, authentication, or mobile-owned business sorting.

The mobile visual system translates the existing industrial direction into touch-first widgets. It reuses the dark machine surface, raised metal panels, paper dossier, cyan display text, and acid-green controls while keeping 48 logical pixel actions, semantic labels, responsive grids, and native scrolling.

## Local environment

Docker and Docker Compose provide the reproducible local environment for web and API applications.

Flutter runs through normal Flutter tooling outside Docker.

The local environment should make the architecture observable without requiring access to production.

### Implemented foundation

```text
web         http://localhost:17320   Next.js App Router, React, TypeScript
api         http://localhost:17321   Fastify, TypeScript
storybook   http://localhost:17322   design system documentation
mobile      Flutter 3.47.2           Android, Linux, or web target
```

Published host ports use an uncommon project specific block so the environment does not collide with other work on a reviewer's machine. They are configurable. Ports inside the Compose network stay conventional, and services always reach each other through service DNS, for example `http://api:4000`.

Runtime and tooling are pinned to Node.js 22 LTS and PNPM 11, locally and inside the containers.

Each application has a multi stage Dockerfile with a development target used by Compose and a production target that builds the deployable image. Both targets build from the same source tree. Storybook reuses the web application image and adds one target, rather than owning separate infrastructure.

### Local modes

```text
standard   web, api, storybook
firebase   standard plus the Cloud Firestore emulator and the Emulator Suite UI
```

The standard mode is the default and carries the required challenge behavior. It never needs Firebase, Google credentials, or a real project.

The Firebase mode is an optional Compose overlay. Everything it needs runs in containers, including the Firebase CLI pinned in this repository and a Java runtime, so the host needs no `firebase-tools` and no Java installation. It uses the deliberately fake project id `demo-damaged-code-local`, and the `demo-` prefix keeps the Emulator Suite fully offline.

Firebase mode is explicit on the API side. When it is requested, the API requires a project id, and outside production it requires an emulator address. A missing emulator makes the API refuse to start, so the system never falls back to another storage target without saying so.

The Firestore emulator holds its data in memory, so local state is exported to a Docker named volume on shutdown and imported on the next start. No mutable emulator state is written into the Git working tree, and no local state is committed.

### Client to BFF transport

The browser calls the BFF directly, and the API enables CORS for the configured web origin through `CORS_ORIGINS`.

The alternative was proxying every browser call through a Next.js route handler. That was rejected because it would add a second server hop, duplicate the contract, and hide the client boundary that the Flutter client will exercise anyway. Keeping the call direct also keeps the two applications independently deployable.

Server side rendering inside the Compose network can reach the API through the internal address in `API_INTERNAL_URL`.

### Operational endpoints

`GET /health` reports whether the API is running. It is intentionally outside the versioned product namespace because it is operational, not part of the product contract offered to clients.

## Production

The target production environment is Firebase managed infrastructure.

The exact Firebase services should remain proportionate to the challenge.

The important constraint is codebase continuity:

```text
same repository
same application code
local execution through Docker
production deployment through Firebase
```

The project should not maintain separate local and production implementations.

### Deployed production target

```text
Firebase project   samuelcaetitedev

Public web         Firebase Hosting site: damaged-code-web
                   https://damaged-code-web.web.app

Next.js runtime    Cloud Run service: damaged-code-web
                   region: us-central1
                   container port: 3000
                   maximum instances: 5

BFF                Cloud Functions
                   function name: damagedCodeApi
                   codebase: damaged-code-api
                   generation: 2
                   runtime: Node.js 22
                   region: us-central1

Cache              in process, one hour lifetime

Firestore          not used by production Damaged Code
```

App Hosting was evaluated first. Firebase documents PNPM support, but its monorepo guidance supports Nx and Turborepo rather than this repository's plain PNPM workspace with one root lockfile. The deployment therefore uses the existing production Dockerfile from the monorepo root, with no copied lockfile and no workspace restructuring.

Cloud Build creates the production image with `NEXT_PUBLIC_API_URL` present at build time. Cloud Run executes that immutable image. The dedicated Firebase Hosting site is the stable public edge and rewrites every path to Cloud Run, so direct episode routes and hard refreshes reach Next.js correctly.

The existing Firebase project already hosts unrelated work, so these constraints apply:

1. The preexisting Firebase Hosting sites remain unchanged.
2. The preexisting `contact` and `api` Cloud Functions remain unchanged.
3. The default Firestore database remains unchanged and is not used by Damaged Code production.
4. No named Firestore database was provisioned.
5. No App Hosting backend was created.

Firebase Hosting and Cloud Run are not part of the local environment. Docker Compose remains the reproducible local path for the same application code.

The client boundary does not change in production. Clients talk to the BFF, and the BFF alone talks to the upstream provider. The production BFF uses the standard in-process cache and never reads or writes Firestore.

## Testing boundaries

Testing should protect architectural seams:

1. domain and transformation rules through unit tests;
2. BFF routes through Fastify integration tests;
3. web behavior through component and integration tests;
4. Flutter behavior through unit and widget tests.

End-to-end testing remains a backlog item for the initial delivery.
