import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_pt.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('pt', 'BR'),
    Locale('pt'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Damaged Code'**
  String get appTitle;

  /// No description provided for @archiveEyebrow.
  ///
  /// In en, this message translates to:
  /// **'INTERDIMENSIONAL ARCHIVE'**
  String get archiveEyebrow;

  /// No description provided for @episodesTitle.
  ///
  /// In en, this message translates to:
  /// **'Episode archive'**
  String get episodesTitle;

  /// No description provided for @episodesDescription.
  ///
  /// In en, this message translates to:
  /// **'Choose a transmission to inspect its complete character manifest.'**
  String get episodesDescription;

  /// No description provided for @loadingEpisodes.
  ///
  /// In en, this message translates to:
  /// **'Loading episode archive...'**
  String get loadingEpisodes;

  /// No description provided for @loadingEpisode.
  ///
  /// In en, this message translates to:
  /// **'Loading episode file...'**
  String get loadingEpisode;

  /// No description provided for @loadingCharacter.
  ///
  /// In en, this message translates to:
  /// **'Loading character dossier...'**
  String get loadingCharacter;

  /// No description provided for @errorTitle.
  ///
  /// In en, this message translates to:
  /// **'Transmission interrupted'**
  String get errorTitle;

  /// No description provided for @genericError.
  ///
  /// In en, this message translates to:
  /// **'The archive could not be reached. Check your connection and try again.'**
  String get genericError;

  /// No description provided for @serviceUnavailable.
  ///
  /// In en, this message translates to:
  /// **'The archive source is temporarily unavailable. Try again shortly.'**
  String get serviceUnavailable;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @noEpisodes.
  ///
  /// In en, this message translates to:
  /// **'No episode files were found.'**
  String get noEpisodes;

  /// No description provided for @noCharacters.
  ///
  /// In en, this message translates to:
  /// **'No characters were recorded for this episode.'**
  String get noCharacters;

  /// No description provided for @noAppearances.
  ///
  /// In en, this message translates to:
  /// **'No episode appearances were recorded.'**
  String get noAppearances;

  /// No description provided for @episodeFile.
  ///
  /// In en, this message translates to:
  /// **'EPISODE FILE'**
  String get episodeFile;

  /// No description provided for @characterDossier.
  ///
  /// In en, this message translates to:
  /// **'CHARACTER DOSSIER'**
  String get characterDossier;

  /// No description provided for @charactersTitle.
  ///
  /// In en, this message translates to:
  /// **'Characters'**
  String get charactersTitle;

  /// No description provided for @appearancesTitle.
  ///
  /// In en, this message translates to:
  /// **'Episode appearances'**
  String get appearancesTitle;

  /// No description provided for @season.
  ///
  /// In en, this message translates to:
  /// **'Season'**
  String get season;

  /// No description provided for @episode.
  ///
  /// In en, this message translates to:
  /// **'Episode'**
  String get episode;

  /// No description provided for @aired.
  ///
  /// In en, this message translates to:
  /// **'Aired'**
  String get aired;

  /// No description provided for @characters.
  ///
  /// In en, this message translates to:
  /// **'Characters'**
  String get characters;

  /// No description provided for @status.
  ///
  /// In en, this message translates to:
  /// **'Status'**
  String get status;

  /// No description provided for @species.
  ///
  /// In en, this message translates to:
  /// **'Species'**
  String get species;

  /// No description provided for @type.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get type;

  /// No description provided for @gender.
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get gender;

  /// No description provided for @origin.
  ///
  /// In en, this message translates to:
  /// **'Origin'**
  String get origin;

  /// No description provided for @location.
  ///
  /// In en, this message translates to:
  /// **'Last known location'**
  String get location;

  /// No description provided for @imageUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Portrait unavailable'**
  String get imageUnavailable;

  /// No description provided for @openEpisode.
  ///
  /// In en, this message translates to:
  /// **'Open {code} {name}'**
  String openEpisode(String code, String name);

  /// No description provided for @openCharacter.
  ///
  /// In en, this message translates to:
  /// **'Open the dossier of {name}'**
  String openCharacter(String name);

  /// No description provided for @seasonEpisode.
  ///
  /// In en, this message translates to:
  /// **'Season {seasonNumber} · Episode {episodeNumber}'**
  String seasonEpisode(int seasonNumber, int episodeNumber);

  /// No description provided for @episodeCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =0{No episodes} =1{1 episode} other{{count} episodes}}'**
  String episodeCount(int count);

  /// No description provided for @characterCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =0{No characters} =1{1 character} other{{count} characters}}'**
  String characterCount(int count);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'pt'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when language+country codes are specified.
  switch (locale.languageCode) {
    case 'pt':
      {
        switch (locale.countryCode) {
          case 'BR':
            return AppLocalizationsPtBr();
        }
        break;
      }
  }

  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'pt':
      return AppLocalizationsPt();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
