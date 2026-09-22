# Changelog

All notable product-facing changes to Damaged Code will be documented in this file.

Project releases will follow Semantic Versioning when versioned releases begin.

Checkpoints are delivery workflow markers and do not map directly to minor or patch versions.

## Unreleased

### Added

- Initial project governance and delivery documentation.
- Architecture guardrails for the shared REST BFF.
- PNPM-only package management policy.
- Unit and integration testing requirements.
- English and Portuguese localization requirement.
- Docker-based local development requirement.
- OpenAPI documentation requirement.
- Planned Flutter client and guided web onboarding.
- PNPM workspace with the Next.js web client and the Fastify REST API.
- Docker Compose environment that starts the web and API applications locally.
- API health endpoint at `GET /health`.
- Web home page reporting whether the project API is reachable.
- Frontend design system with semantic tokens, Atomic Design structure, and Storybook documentation.
- Machine inspired interface style for the web application, with a control to run the API check again.
- Storybook as part of the Docker development environment.
- Optional Firebase emulator mode for local development, with no Firebase tooling required on the host.
- Episode listing endpoint `GET /v1/episodes` in the project REST contract.
- OpenAPI documentation with Swagger UI at `/docs`.
- Episode list in the web client, with loading, empty, error, and retry states.
- English and Portuguese, pt-BR, message catalogs for the web interface.

### Changed

- Published local development ports moved to a project specific block starting at 17320, configurable through environment variables.
