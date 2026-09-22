# CLAUDE.md

Read `AGENTS.md` first. Its rules are mandatory and take precedence over convenience.

This file defines the preferred Claude Code workflow for Damaged Code.

## Session start

At the beginning of a work session:

1. Inspect `git status`.
2. Inspect the current branch and recent commits.
3. Read `docs/CHECKPOINTS.md`.
4. Read the latest relevant entries in `docs/DEVELOPMENT_LOG.md`.
5. Confirm the active checkpoint from the repository state.
6. Avoid asking the human author to repeat information already present in repository documentation.

Do not start coding from assumptions when the repository can answer the question.

## Execution model

Work as a senior engineer pairing with the human author.

The objective is not maximum code output. The objective is a correct, explainable, incremental delivery.

For each meaningful slice:

```text
understand
plan briefly
implement
make behavior observable
test
inspect diff
document if needed
commit
push
```

Prefer vertical slices.

When practical, implement the API capability and the client behavior that consumes it in the same development sequence.

Do not spend a long stretch building invisible infrastructure if a smaller end-to-end slice can demonstrate progress.

## Communication

Keep the human author informed about:

1. what is being changed;
2. why the change is needed;
3. important tradeoffs;
4. validation performed;
5. any limitation or unresolved risk.

Surface problems as soon as they are discovered.

Do not hide failed commands, failed tests, skipped validation, or unexpected repository state.

Do not flood the author with low-level narration for every trivial edit.

## Commits

Use Conventional Commits in English.

Keep commits small.

A checkpoint is not a commit boundary. A checkpoint should normally contain multiple focused commits.

Good examples:

```text
chore: initialize pnpm workspace
chore: add docker development services
feat(api): add health endpoint
feat(web): display api health state
test(api): cover health endpoint
```

Bad examples:

```text
feat: build entire project
update files
fix stuff
final changes
```

After a logical increment is validated:

1. inspect the diff;
2. commit it;
3. push it to the current remote branch.

Never force push.

Do not amend a pushed commit unless the human author explicitly requests it.

## PNPM

Use PNPM exclusively for JavaScript and TypeScript.

Never introduce npm or Yarn commands into scripts, docs, containers, CI, or examples.

Prefer Corepack when the environment needs a predictable PNPM version.

Use a root workspace and one root lockfile.

## Architecture guardrails

Web and Flutter are clients of the project REST API.

Never implement:

```text
Next.js -> Rick and Morty API
Flutter -> Rick and Morty API
Next.js -> Firestore client SDK
Flutter -> Firestore client SDK
```

The intended boundary is:

```text
Next.js
   |
   v
Node.js REST BFF
   ^
   |
Flutter
```

The BFF may communicate with:

```text
Rick and Morty REST API
Firebase server-side services
cache implementation
future search infrastructure
```

Do not bypass this boundary for convenience.

## Testing behavior

Add tests with the feature, not as a cleanup phase at the end.

Before committing, run the smallest relevant test scope first.

Before closing a checkpoint, run the broader relevant quality suite.

Initial test strategy:

```text
API
  unit tests
  Fastify integration tests

Web
  unit tests
  React component and integration tests

Flutter
  unit tests
  widget tests
```

Do not introduce end-to-end infrastructure unless the human author moves it out of backlog.

## Documentation behavior

Update documentation only when it adds truthful information.

When a checkpoint materially advances, update `docs/CHECKPOINTS.md`.

When an architectural decision changes, update `docs/ARCHITECTURE.md`.

When a meaningful work session or decision should remain visible to the author, add a concise entry to `docs/DEVELOPMENT_LOG.md`.

When user-visible or release-relevant behavior changes, update `CHANGELOG.md`.

Keep the documents distinct.

## Writing rule

Do not use em dashes or en dashes in prose.

Do not replace them with decorative hyphens.

Rewrite the sentence with commas, colons, semicolons, parentheses, or a separate sentence.

## Visual work

Core implementation comes first.

After the required behavior, architecture, tests, and deployment path are stable, visual refinement may be handed to Codex.

Do not preemptively redesign stable product behavior while implementing foundational checkpoints.

## Stop conditions

Pause implementation and report the situation before continuing if:

1. a requested change would violate a documented architecture boundary;
2. repository history differs materially from the expected state;
3. a required secret or external credential is missing;
4. tests reveal a design problem that requires changing the agreed contract;
5. an optional feature would put the core release at risk.

Do not silently work around these conditions.
