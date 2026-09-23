# Damaged Code mobile

Flutter client for the Damaged Code project REST API. It provides the episode archive, episode character manifest, character dossier, and navigation through episode appearances without accessing the upstream Rick and Morty API or Firebase directly.

## Requirements

- Flutter 3.47.2
- Android SDK for Android builds

## Distribution

The APK attached to the [v0.1.0 GitHub Release](https://github.com/osamucadev/damaged-code/releases/tag/v0.1.0) is the ready-to-install evaluator build. It already targets the production API and needs no local setup. Build a fresh one locally only when developing this application.

## Run

The production BFF is the default:

```bash
flutter pub get
flutter run
```

Override it for local development through `--dart-define`. With Web and API running through Docker Compose, the API host port is 17321:

```bash
# Android Emulator
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:17321

# Physical device on the same network as the development machine
flutter run --dart-define=API_BASE_URL=http://<HOST_LAN_IP>:17321
```

A debug-only Android network security configuration allows cleartext HTTP for these local addresses. It is not part of the release build, which only ever calls the production API over HTTPS.

## Verify

```bash
flutter analyze
flutter test
flutter build apk --debug
flutter build apk --release
```

The release APK is generated at `build/app/outputs/flutter-apk/app-release.apk`. It uses debug signing only for evaluator distribution and is not configured for Play Store publication.

## Structure

```text
lib/
  app/                  application composition
  core/                 configuration, transport, theme, shared widgets
  features/episodes/    episode models, repository, archive and detail
  features/characters/  character models, repository and dossier
  l10n/                 English and Portuguese ARB catalogs
```

The application uses Flutter-native navigation and screen-local asynchronous state. The `http` package is the only external runtime dependency.
