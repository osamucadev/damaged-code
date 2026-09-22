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
