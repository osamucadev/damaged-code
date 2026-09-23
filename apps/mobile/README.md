# Damaged Code mobile

Flutter client for the Damaged Code project REST API. It provides the episode archive, episode character manifest, character dossier, and navigation through episode appearances without accessing the upstream Rick and Morty API or Firebase directly.

## Requirements

- Flutter 3.47.2
- Android SDK for Android builds

## Run

The production BFF is the default:

```bash
flutter pub get
flutter run
```

Override it for local Android emulator development:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000
```

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
