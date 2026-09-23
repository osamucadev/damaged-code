// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Damaged Code';

  @override
  String get archiveEyebrow => 'INTERDIMENSIONAL ARCHIVE';

  @override
  String get episodesTitle => 'Episode archive';

  @override
  String get episodesDescription =>
      'Choose a transmission to inspect its complete character manifest.';

  @override
  String get loadingEpisodes => 'Loading episode archive...';

  @override
  String get loadingEpisode => 'Loading episode file...';

  @override
  String get loadingCharacter => 'Loading character dossier...';

  @override
  String get errorTitle => 'Transmission interrupted';

  @override
  String get genericError =>
      'The archive could not be reached. Check your connection and try again.';

  @override
  String get serviceUnavailable =>
      'The archive source is temporarily unavailable. Try again shortly.';

  @override
  String get retry => 'Retry';

  @override
  String get noEpisodes => 'No episode files were found.';

  @override
  String get noCharacters => 'No characters were recorded for this episode.';

  @override
  String get noAppearances => 'No episode appearances were recorded.';

  @override
  String get episodeFile => 'EPISODE FILE';

  @override
  String get characterDossier => 'CHARACTER DOSSIER';

  @override
  String get charactersTitle => 'Characters';

  @override
  String get appearancesTitle => 'Episode appearances';

  @override
  String get season => 'Season';

  @override
  String get episode => 'Episode';

  @override
  String get aired => 'Aired';

  @override
  String get characters => 'Characters';

  @override
  String get status => 'Status';

  @override
  String get species => 'Species';

  @override
  String get type => 'Type';

  @override
  String get gender => 'Gender';

  @override
  String get origin => 'Origin';

  @override
  String get location => 'Last known location';

  @override
  String get imageUnavailable => 'Portrait unavailable';

  @override
  String openEpisode(String code, String name) {
    return 'Open $code $name';
  }

  @override
  String openCharacter(String name) {
    return 'Open the dossier of $name';
  }

  @override
  String seasonEpisode(int seasonNumber, int episodeNumber) {
    return 'Season $seasonNumber · Episode $episodeNumber';
  }

  @override
  String episodeCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count episodes',
      one: '1 episode',
      zero: 'No episodes',
    );
    return '$_temp0';
  }

  @override
  String characterCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count characters',
      one: '1 character',
      zero: 'No characters',
    );
    return '$_temp0';
  }
}
