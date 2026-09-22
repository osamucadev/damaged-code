# syntax=docker/dockerfile:1

# Firebase Emulator Suite, fully contained.
#
# The reviewer needs no Firebase CLI and no Java on the host. Both live here,
# and the CLI version is pinned in the repository lockfile rather than being
# installed globally.
# Debian 13 is used here rather than the Debian 12 base of the application
# images, because firebase-tools requires a Java runtime of version 21 or above
# and Debian 12 only offers Java 17.
FROM node:22.23.2-trixie-slim

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:/app/node_modules/.bin:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# The Firestore emulator runs on the JVM.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-21-jre-headless ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Only the workspace root is installed, which is where the Firebase CLI is
# pinned. The application manifests are copied because the lockfile describes
# every workspace project.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter damaged-code

# Emulator binaries are downloaded at build time so a normal start does not have
# to fetch them. The cache directory is also a named volume at run time, which
# is seeded from this layer.
RUN firebase setup:emulators:firestore \
    && firebase setup:emulators:ui

COPY docker/firebase-emulators/firebase.json docker/firebase-emulators/firestore.rules /srv/firebase/
COPY docker/firebase-emulators/entrypoint.sh /usr/local/bin/emulator-entrypoint.sh
RUN chmod +x /usr/local/bin/emulator-entrypoint.sh

# The CLI writes its debug logs into the working directory, which stays inside
# the container image rather than in the bind mounted repository.
WORKDIR /srv/firebase

EXPOSE 4000 8080

ENTRYPOINT ["/usr/local/bin/emulator-entrypoint.sh"]
