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
GET /v1/episodes/{episodeId}/characters    every character of one episode, alphabetically
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

Errors use one envelope with a stable code, because clients translate codes rather than server prose:

```json
{ "error": { "code": "UPSTREAM_UNAVAILABLE", "message": "developer facing detail" } }
```

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

Caching belongs behind the BFF.

The initial cache provider should be selected based on delivery time, operational simplicity, and actual value.

A provider must not be introduced only to demonstrate familiarity with a technology.

The project may use different freshness policies for data with different change profiles.

The final choice and rationale should be recorded here when implemented.

## Internationalization

Localization belongs primarily to clients.

Supported user interface locales:

```text
en
pt-BR
```

The BFF should prefer stable error codes over localized prose.

Upstream domain content such as episode and character names remains unchanged unless an explicit enrichment feature is later added.

## Local environment

Docker and Docker Compose provide the reproducible local environment for web and API applications.

Flutter runs through normal Flutter tooling outside Docker.

The local environment should make the architecture observable without requiring access to production.

### Implemented foundation

```text
web         http://localhost:17320   Next.js App Router, React, TypeScript
api         http://localhost:17321   Fastify, TypeScript
storybook   http://localhost:17322   design system documentation
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

### Planned production target

Nothing below is provisioned or deployed yet. It is recorded so the local environment grows toward a known destination. Provisioning belongs to the Firebase deployment checkpoint.

```text
Firebase project   samuelcaetitedev

Next.js web        Firebase App Hosting
                   planned backend name: damaged-code-web

BFF                Cloud Functions
                   planned function name: damagedCodeApi

Firestore          planned named database: damaged-code
```

The existing Firebase project already hosts unrelated work, so these constraints apply:

1. Do not modify the existing Firebase Hosting sites.
2. Do not modify the existing Cloud Functions.
3. Do not use the existing default Firestore database for Damaged Code application data.
4. Do not provision the named Firestore database before that checkpoint.
5. Do not create App Hosting resources before that checkpoint.

Firebase Hosting is not part of the local environment. The production web target is Firebase App Hosting, and the local environment models only the parts that affect development, which today means Firestore.

The client boundary does not change in production. Clients talk to the BFF, and only the BFF talks to Firestore, using server side credentials.

## Testing boundaries

Testing should protect architectural seams:

1. domain and transformation rules through unit tests;
2. BFF routes through Fastify integration tests;
3. web behavior through component and integration tests;
4. Flutter behavior through unit and widget tests.

End-to-end testing remains a backlog item for the initial delivery.
