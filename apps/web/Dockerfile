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
COPY docker/node/dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh
RUN chmod +x /usr/local/bin/dev-entrypoint.sh
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @damaged-code/web...

# Development target: Next development server with hot reload.
FROM dependencies AS development
ENV NODE_ENV=development \
    PNPM_FILTER=@damaged-code/web
COPY . .
ENTRYPOINT ["/usr/local/bin/dev-entrypoint.sh"]
EXPOSE 3000
CMD ["pnpm", "--filter", "@damaged-code/web", "dev"]

# Storybook target: documents the design system with the same source tree and
# the same dependency layer as the web application.
FROM dependencies AS storybook
ENV NODE_ENV=development \
    PNPM_FILTER=@damaged-code/web
COPY . .
ENTRYPOINT ["/usr/local/bin/dev-entrypoint.sh"]
EXPOSE 6006
CMD ["pnpm", "--filter", "@damaged-code/web", "storybook:docker"]

# Build target: produces the standalone Next server bundle.
FROM dependencies AS build
ARG NEXT_PUBLIC_API_URL
ENV NODE_ENV=production \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN pnpm --filter @damaged-code/web build

# Production target: standalone output only, no package manager at runtime.
FROM base AS production
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
