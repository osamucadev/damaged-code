#!/bin/sh
#
# Starts the Firebase Emulator Suite with import and export behavior.
#
# The Firestore emulator keeps its data in memory, so persistence across a
# normal restart depends on exporting on shutdown and importing on startup.
set -eu

DATA_DIR="${EMULATOR_DATA_DIR:-/emulator-data}"
PROJECT_ID="${FIREBASE_PROJECT_ID:-demo-damaged-code-local}"

# The export target is a subdirectory of the volume, not the volume mount point
# itself. The Firebase CLI clears the export directory before writing, and it
# cannot remove a mount point, which fails the export with EBUSY.
EXPORT_DIR="$DATA_DIR/export"

mkdir -p "$DATA_DIR"

if [ -f "$EXPORT_DIR/firebase-export-metadata.json" ]; then
  echo "Found a previous emulator export. Importing from $EXPORT_DIR"
  set -- --import="$EXPORT_DIR"
else
  echo "No previous emulator export found. Starting with empty local data."
  set --
fi

# exec keeps the emulator as PID 1 so it receives SIGTERM and can export before
# the container stops.
exec firebase emulators:start \
  --project "$PROJECT_ID" \
  --only firestore \
  --export-on-exit="$EXPORT_DIR" \
  "$@"
