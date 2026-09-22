# AGENTS.md

This file defines non-negotiable rules for any coding agent working in this repository.

Read this file before changing code, documentation, configuration, infrastructure, tests, or Git history.

## 1. Human visibility comes first

The project must remain understandable to the human author at every stage.

Before implementing a meaningful slice:

1. Inspect the current repository state.
2. Read the active checkpoint.
3. Explain the intended change at a useful level.
4. Identify important tradeoffs before introducing new infrastructure or dependencies.
5. Prefer an incremental solution that can be observed working.

Do not turn the repository into a black box.

Do not make unrelated speculative improvements without a clear connection to the active checkpoint.

## 2. Work in vertical slices

Backend and frontend should evolve together whenever the feature allows it.

Prefer:

```text
API capability
client consumption
visible behavior
tests
documentation
```

Avoid building an entire backend in isolation and only connecting the interface at the end.

The author prefers to see behavior appear in the product while the underlying capability is being developed.

## 3. Git workflow

All commit messages must be written in English and follow Conventional Commits.

Examples:

```text
chore: initialize pnpm workspace
feat(api): expose episode listing
feat(web): render episode list
test(api): cover episode route
docs: document local development
```

Rules:

1. Keep commits small and logically focused.
2. Do not combine unrelated changes in the same commit.
3. Do not wait until the end of a checkpoint to create one large commit.
4. Validate the affected code before committing.
5. Commit each completed logical increment.
6. Push each verified commit to the current remote branch.
7. Never force push unless the human author explicitly requests it.
8. Never rewrite public history unless the human author explicitly requests it.
9. Never commit secrets, generated credentials, local environment files, or private keys.
10. Keep the working tree understandable between increments.

A checkpoint may contain several small commits.

Checkpoints are workflow markers. They are not SemVer versions.

## 4. Package management

PNPM is the only supported package manager for JavaScript and TypeScript workspaces.

Use:

```text
pnpm
pnpm exec
pnpm dlx
```

Do not use:

```text
npm install
npm run
npx
yarn
```

Do not add `package-lock.json` or `yarn.lock`.

Use one root `pnpm-lock.yaml` and PNPM workspaces.

Flutter uses its standard Dart and Flutter package tooling.

## 5. Client boundary

The Next.js and Flutter clients must communicate exclusively with the project REST API.

The following are forbidden in client applications:

1. Direct access to the Rick and Morty API.
2. Firebase client SDK access to Firestore.
3. Firebase client SDK access to backend business data.
4. Business rules that belong in the BFF.
5. Provider-specific data contracts leaking into UI code.

The BFF owns upstream integration and server-side Firebase access.

If authentication is introduced later, the client still talks to the BFF contract rather than using Firebase as an application data gateway.

## 6. BFF contract

The Node.js API is the shared backend boundary for web and Flutter.

It is responsible for concerns such as:

1. Upstream Rick and Morty REST integration.
2. Normalization.
3. Validation.
4. Sorting rules owned by the product contract.
5. Cache behavior.
6. Error normalization.
7. Optional server-side Firebase access.
8. OpenAPI documentation.
9. Future search capabilities.

The public REST contract should be versionable and independent of the upstream API contract.

## 7. Internationalization

The user-facing product must support:

1. English.
2. Portuguese, pt-BR.

User-facing strings belong in localization resources rather than being scattered through components.

Domain content from the Rick and Morty API does not need to be translated unless the project explicitly introduces an enrichment layer.

Stable API error codes should be preferred over localized server error messages. Clients translate user-facing feedback.

## 8. Testing

Unit and integration tests are required from the beginning.

Relevant tests must pass before a logical increment is considered complete.

Expected coverage areas include:

```text
API
  unit tests
  Fastify route integration tests

Web
  unit tests
  component and integration tests

Flutter
  unit tests
  widget tests
```

End-to-end tests are outside the initial scope and belong in the backlog.

Do not add brittle tests that only verify implementation details.

Prefer tests that protect observable behavior and meaningful domain rules.

## 9. Docker

Docker and Docker Compose are the official local development and evaluation environment for the web and API applications.

The code executed in containers must be the same codebase used for production deployment.

Flutter applications are not required to run inside Docker.

Container configuration should favor reproducibility, understandable logs, efficient PNPM caching, and a low-friction startup command.

## 10. Production deployment

The project will be deployed using Firebase managed services where appropriate.

Local Docker execution and production Firebase deployment are two environments for the same codebase.

Do not create a separate production implementation.

Do not introduce infrastructure that is disproportionate to the challenge without documenting the reason.

## 11. OpenAPI

The REST API must be documented through OpenAPI.

When API behavior changes, its documentation and relevant tests must change in the same logical increment.

The API documentation should be useful to both human reviewers and client implementers.

## 12. Writing style

Do not use em dashes or en dashes in prose.

Prefer:

1. commas;
2. colons;
3. semicolons;
4. parentheses;
5. sentence restructuring.

Use hyphens only when grammatically or technically appropriate.

Do not use hyphens as visual substitutes for dashes.

This rule applies to:

1. README files;
2. documentation;
3. changelog entries;
4. product copy;
5. comments intended as prose;
6. agent-generated explanations committed to the repository.

## 13. Documentation discipline

Keep these files accurate as the project evolves:

```text
README.md
CHANGELOG.md
docs/CHECKPOINTS.md
docs/DEVELOPMENT_LOG.md
docs/ARCHITECTURE.md
```

Do not update documentation with claims about functionality that does not exist yet.

The development log explains process and decisions.

The changelog explains product-facing changes.

Do not use the changelog as an agent diary.

## 14. Onboarding tour

A short guided onboarding experience is planned for the final web polish stage.

It should:

1. explain the main episode and character flow;
2. remain skippable;
3. be replayable later;
4. persist completion locally;
5. avoid requiring backend state;
6. remain short enough for a reviewer to dismiss quickly.

Do not implement the tour before the core interface is stable.

## 15. Backlog discipline

The following are optional and must not delay the required experience:

1. traditional episode search;
2. hybrid or semantic search;
3. authenticated experimental area;
4. end-to-end tests;
5. other speculative enhancements.

Only start optional work after the core release candidate is functional, tested, documented, and deployable.

## 16. Definition of done for a logical increment

Before committing and pushing an increment, confirm:

1. the intended behavior works;
2. relevant automated tests pass;
3. linting and type checks pass where available;
4. no unrelated files were changed accidentally;
5. documentation is updated if the contract or architecture changed;
6. `git status` is understood;
7. the commit is small and accurately named;
8. the verified commit is pushed.

If any validation cannot be performed, document that fact clearly instead of pretending it passed.
