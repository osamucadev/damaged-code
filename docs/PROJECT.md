# Project

## Product

Damaged Code is a coding challenge based on the public Rick and Morty REST API.

The core user journey is intentionally focused:

```text
browse episodes
select an episode
see participating characters
read them in alphabetical order
```

The project should feel finished and intentional before optional ideas are introduced.

## Required outcome

The web application must:

1. use Next.js;
2. list all episodes;
3. allow episode selection;
4. show all characters from the selected episode;
5. sort those characters alphabetically;
6. run through the documented Docker development environment.

## Committed engineering goals

The challenge will also demonstrate:

1. a Node.js and Fastify REST BFF;
2. OpenAPI documentation;
3. TanStack Query in the web client;
4. PNPM workspaces;
5. English and Portuguese, pt-BR, localization;
6. unit tests;
7. integration tests;
8. Firebase production deployment from the same codebase;
9. a Flutter client consuming the same BFF;
10. a production Android APK if the Flutter checkpoint is completed;
11. a final guided onboarding tour in the web interface;
12. a documented incremental Git history.

## Product boundaries

The project has one application backend boundary.

```text
web client
    |
    v
project REST API
    ^
    |
Flutter client
```

Clients must not access the upstream API directly.

Clients must not access Firestore or application data through Firebase client SDKs.

This is intentional. The project BFF owns server communication and the contract presented to every client.

## Delivery principles

### Core first

The required experience must be complete before optional functionality begins.

### Vertical slices

Prefer changes that make behavior visible across API and client rather than implementing entire isolated layers.

### Small commits

The repository history should show natural development progress.

### Same codebase

Docker is the local environment.

Firebase is the production environment.

Both execute or build from the same source tree.

### Human-readable development

Agent assistance must not hide decisions from the author.

The repository should explain what exists, why it exists, and how it evolved.

## Out of scope for the initial release

The following ideas are explicitly in backlog:

1. traditional episode search;
2. hybrid search;
3. semantic search;
4. an authenticated experimental area;
5. end-to-end tests.

These are only candidates after the core release is stable.

## Definition of core release candidate

The core release candidate exists when:

1. all required challenge behavior works;
2. web and API run locally in Docker;
3. clients respect the BFF boundary;
4. relevant unit and integration tests pass;
5. the API contract is documented;
6. English and Portuguese interfaces work where implemented;
7. local setup is reproducible;
8. production deployment is either working or has a clearly documented final step;
9. repository documentation matches reality;
10. there are no known blocking defects.

Optional backlog work can start only after this point.
