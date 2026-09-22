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

## Testing boundaries

Testing should protect architectural seams:

1. domain and transformation rules through unit tests;
2. BFF routes through Fastify integration tests;
3. web behavior through component and integration tests;
4. Flutter behavior through unit and widget tests.

End-to-end testing remains a backlog item for the initial delivery.
