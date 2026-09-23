# Testing Strategy

## Objective

Automated tests should protect behavior and architectural contracts without consuming the challenge with unnecessary test infrastructure.

The initial scope includes unit and integration testing.

End-to-end testing is intentionally deferred.

## General rules

1. Add tests with the behavior they protect.
2. Run relevant tests before each logical commit.
3. Run broader test suites before closing a checkpoint.
4. Prefer observable behavior over implementation details.
5. Keep test setup understandable.
6. Mock external systems at clear boundaries.
7. Do not mock the code under test into meaninglessness.

## API

### Unit tests

Expected candidates include:

1. upstream response normalization;
2. episode transformation;
3. character transformation;
4. alphabetical sorting;
5. cache policy logic;
6. stable error mapping;
7. small domain utilities.

### Integration tests

Use Fastify request injection for route-level tests where appropriate.

Integration tests should verify combinations such as:

```text
route
schema validation
service orchestration
serialization
status code
error contract
```

The public Rick and Morty service should not be required for every automated test run.

Use controlled doubles at the upstream boundary.

## Web

Use a modern React test stack appropriate for Next.js, with Vitest and React Testing Library as the preferred direction unless implementation constraints justify another choice.

### Unit tests

Candidates include:

1. isolated utilities;
2. formatting behavior;
3. small query helpers;
4. localization helpers where useful.

### Component and integration tests

Protect behavior such as:

1. episode list rendering;
2. loading state;
3. API error state;
4. episode selection;
5. character rendering;
6. alphabetical presentation from the BFF contract;
7. language switching;
8. guided onboarding when implemented.

Tests should interact with the interface in a user-oriented way.

### Design system components

Design system components are tested for behavior and accessibility semantics, not for styling.

Appropriate assertions include:

```text
the control activates by mouse and by keyboard
a disabled or busy control cannot be activated
a busy control announces itself
status meaning is available as text, not only as color
decorative detail is hidden from assistive technology
content of different lengths is preserved
```

Inappropriate assertions include class names, token values, and the internal element structure of a component.

Storybook documents visual states. It is not a test runner, and a story is not a substitute for a behavior test.

## Flutter

### Unit tests

Candidates include:

1. API client mapping;
2. repositories or service boundaries;
3. model parsing;
4. small domain rules.

### Widget tests

Protect:

1. episode list states;
2. episode selection;
3. character presentation;
4. localization;
5. retry and error states where practical.

The Flutter `integration_test` package is not part of the initial scope because full application testing is being treated as end-to-end work for this challenge.

## Implemented coverage

```text
API    122 tests  upstream adapter, normalization, pagination, batching, service
                  rules, cache behavior, configuration, route integration through
                  inject, error sanitization, OpenAPI document
Web    101 tests  design system behavior, BFF client contract handling, episode
                  list and detail states, character dossier interaction,
                  localization behavior, navigation
```

Cache behavior is covered at the seam rather than against a running backend: hit, miss, expiry, read failure, write failure, and a hanging backend all use an injected cache, so the unit suite never needs the Firestore emulator. The emulator is used for integration validation of the Firebase mode instead.

Error sanitization has its own regression coverage, because a public response must never carry an upstream URL or the requested route back to a client.

The web navigation redesign extends this coverage with the season browser, semantic episode links, direct episode rendering, metadata, previous and next links, current episode state, external evaluation links, and the BFF only request boundary.

No test reaches the live Rick and Morty API. The upstream boundary is replaced with an injected fetch in the adapter tests, and the episode service is injected into the application factory for route tests. The web tests replace `fetch` at the browser boundary.

## Production deployment validation

Checkpoint 07 added a manual smoke pass against the deployed Firebase and Cloud Run environment:

1. the Hosting root and a direct `/episodes/1` request return successfully;
2. a hard refresh of the episode route reaches Next.js through the Hosting rewrite;
3. home, episode, previous and next episode, character dossier, and appearance navigation work in the browser;
4. character portraits load through the published BFF contract;
5. the API status and episode data load through production CORS;
6. the client build points to the production `damagedCodeApi` URL and contains no localhost API target;
7. a 390 by 844 viewport preserves the episode header, metadata, and navigator without visible horizontal overflow;
8. the API smoke suite covers health, episodes, one episode, episode characters, one character, OpenAPI, stable invalid-id errors, and the sanitized project 404 envelope.

This is deployment acceptance evidence rather than a new end-to-end test suite. Automated browser end-to-end coverage remains in the backlog.

## External dependencies

Automated tests should not depend on the live upstream API for basic correctness.

A small number of manual or explicitly separated contract checks may use the live service when useful, but they should not make the normal test suite flaky.

## Definition of done

A logical increment is test-complete when:

1. new meaningful logic has appropriate automated coverage;
2. affected existing tests pass;
3. integration behavior is covered when a public route or client interaction changes;
4. skipped tests are explained;
5. no failing test is hidden or ignored without documentation.

## Backlog

End-to-end testing remains a future enhancement.

Potential future tools can be evaluated after the initial release, including browser automation for the web client and device-level application testing for Flutter.
