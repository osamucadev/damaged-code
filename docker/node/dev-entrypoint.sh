#!/bin/sh
#
# Development entrypoint for the Node based services.
#
# Dependencies live in a container managed volume so the host tree never
# shadows them. A volume is only seeded when it is created, so a rebuilt image
# alone does not deliver newly added dependencies. This keeps the volume in
# sync with the manifests on every start, which makes
# "docker compose up --build" enough after a dependency change.
set -eu

if [ -n "${PNPM_FILTER:-}" ]; then
  echo "Syncing dependencies for ${PNPM_FILTER}"
  # CI=true marks this as a non interactive environment, so pnpm may rebuild the
  # modules directory without asking for a confirmation it can never receive.
  CI=true pnpm install --frozen-lockfile --filter "${PNPM_FILTER}..."
fi

exec "$@"
