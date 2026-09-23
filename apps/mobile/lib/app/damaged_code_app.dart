import 'package:damaged_code/core/theme/app_theme.dart';
import 'package:damaged_code/features/characters/data/character_repository.dart';
import 'package:damaged_code/features/episodes/data/episode_repository.dart';
import 'package:damaged_code/features/episodes/presentation/episodes_screen.dart';
import 'package:damaged_code/l10n/app_localizations.dart';
import 'package:flutter/material.dart';

class DamagedCodeApp extends StatelessWidget {
  const DamagedCodeApp({
    required this.episodeRepository,
    required this.characterRepository,
    this.locale,
    super.key,
  });

  final EpisodeRepository episodeRepository;
  final CharacterRepository characterRepository;
  final Locale? locale;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Damaged Code',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.build(),
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      localeResolutionCallback: (locale, supportedLocales) {
        if (locale?.languageCode == 'pt') return const Locale('pt', 'BR');
        return const Locale('en');
      },
      home: EpisodesScreen(
        episodeRepository: episodeRepository,
        characterRepository: characterRepository,
      ),
    );
  }
}
