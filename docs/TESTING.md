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
