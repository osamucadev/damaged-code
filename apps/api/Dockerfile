# syntax=docker/dockerfile:1

# Shared base: Node LTS plus the workspace package manager.
FROM node:22.23.2-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# Dependency layer: only manifests, so the pnpm store cache survives source edits.
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @damaged-code/api...

# Development target: hot reload through tsx watch.
FROM dependencies AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 4000
CMD ["pnpm", "--filter", "@damaged-code/api", "dev"]

# Build target: compile TypeScript to dist.
FROM dependencies AS build
COPY . .
RUN pnpm --filter @damaged-code/api build

# Production target: runtime dependencies plus compiled output only.
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter @damaged-code/api...
COPY --from=build /app/apps/api/dist apps/api/dist
USER node
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
