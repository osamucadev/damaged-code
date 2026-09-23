# Changelog

All notable product-facing changes to Damaged Code will be documented in this file.

Project releases will follow Semantic Versioning when versioned releases begin.

Checkpoints are delivery workflow markers and do not map directly to minor or patch versions.

## Unreleased

### Added

- Publicly hosted Storybook, deployed as its own Firebase Hosting site.
- Storybook and Swagger UI links in the web hero, alongside the existing GitHub and Android CTAs.

### Fixed

- Documented and linked the working production Swagger UI address, `/docs/#/`, instead of the address that produced broken asset links.

## [0.1.0] - 2026-09-23

The first versioned release. Damaged Code is a Rick and Morty coding challenge delivered as a Next.js web client, a Fastify REST BFF, and a Flutter Android client, all consuming one project-owned API contract.

### Added

- Episode archive, grouped by season, with a shareable page per episode.
- Character manifest per episode, alphabetically ordered, with a character dossier and episode appearance navigation.
- Project REST API with `GET /v1/episodes`, `GET /v1/episodes/{episodeId}`, `GET /v1/episodes/{episodeId}/characters`, `GET /v1/characters/{characterId}`, and `GET /health`, documented with OpenAPI and Swagger UI.
- English and Portuguese, pt-BR, localization for the web interface.
- Frontend design system with semantic tokens, Atomic Design structure, and Storybook documentation.
- Response caching behind the BFF: in-process by default, and Firestore backed in the optional Firebase emulator mode.
- Docker Compose local environment for the web client, API, and Storybook, with an optional Firebase emulator overlay.
- Flutter Android client with the same episode, character, and appearance journey, English and Brazilian Portuguese localization, and a signed-for-evaluation release APK.
- Android release download available directly from the web home page, next to the GitHub source link.
- Production deployment: web served through a custom domain in front of Firebase Hosting and Cloud Run, and the API deployed as an isolated Cloud Functions codebase.

### Changed

- Published local development ports moved to a project specific block starting at 17320, configurable through environment variables.
- The web information architecture separates the project landing page from dedicated episode pages.
- API health appears as a secondary operational disclosure instead of the primary content panel.
- Production web builds compile the public `damagedCodeApi` URL into the Next.js client.

### Fixed

- Public API error responses no longer expose upstream URLs or the requested route.

### Deferred

- A visible in-page language switcher; locale currently follows a cookie. Tracked in `docs/BACKLOG.md`.
- The guided onboarding tour originally planned for final web polish. Tracked in `docs/BACKLOG.md`.

