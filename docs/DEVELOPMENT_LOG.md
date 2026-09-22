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
