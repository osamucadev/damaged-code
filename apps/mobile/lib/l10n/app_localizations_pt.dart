// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Portuguese (`pt`).
class AppLocalizationsPt extends AppLocalizations {
  AppLocalizationsPt([String locale = 'pt']) : super(locale);

  @override
  String get appTitle => 'Damaged Code';

  @override
  String get archiveEyebrow => 'ARQUIVO INTERDIMENSIONAL';

  @override
  String get episodesTitle => 'Arquivo de episódios';

  @override
  String get episodesDescription =>
      'Escolha uma transmissão para inspecionar o manifesto completo de personagens.';

  @override
  String get loadingEpisodes => 'Carregando arquivo de episódios...';

  @override
  String get loadingEpisode => 'Carregando ficha do episódio...';

  @override
  String get loadingCharacter => 'Carregando dossiê do personagem...';

  @override
  String get errorTitle => 'Transmissão interrompida';

  @override
  String get genericError =>
      'Não foi possível acessar o arquivo. Verifique sua conexão e tente novamente.';

  @override
  String get serviceUnavailable =>
      'A fonte do arquivo está temporariamente indisponível. Tente novamente em instantes.';

  @override
  String get retry => 'Tentar novamente';

  @override
  String get noEpisodes => 'Nenhuma ficha de episódio foi encontrada.';

  @override
  String get noCharacters =>
      'Nenhum personagem foi registrado para este episódio.';

  @override
  String get noAppearances => 'Nenhuma aparição em episódio foi registrada.';

  @override
  String get episodeFile => 'FICHA DO EPISÓDIO';

  @override
  String get characterDossier => 'DOSSIÊ DO PERSONAGEM';

  @override
  String get charactersTitle => 'Personagens';

  @override
  String get appearancesTitle => 'Aparições em episódios';

  @override
  String get season => 'Temporada';

  @override
  String get episode => 'Episódio';

  @override
  String get aired => 'Exibido em';

  @override
  String get characters => 'Personagens';

  @override
  String get status => 'Status';

  @override
  String get species => 'Espécie';

  @override
  String get type => 'Tipo';

  @override
  String get gender => 'Gênero';

  @override
  String get origin => 'Origem';

  @override
  String get location => 'Última localização conhecida';

  @override
  String get imageUnavailable => 'Retrato indisponível';

  @override
  String openEpisode(String code, String name) {
    return 'Abrir $code $name';
  }

  @override
  String openCharacter(String name) {
    return 'Abrir o dossiê de $name';
  }

  @override
  String seasonEpisode(int seasonNumber, int episodeNumber) {
    return 'Temporada $seasonNumber · Episódio $episodeNumber';
  }

  @override
  String episodeCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count episódios',
      one: '1 episódio',
      zero: 'Nenhum episódio',
    );
    return '$_temp0';
  }

  @override
  String characterCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count personagens',
      one: '1 personagem',
      zero: 'Nenhum personagem',
    );
    return '$_temp0';
  }
}

/// The translations for Portuguese, as used in Brazil (`pt_BR`).
class AppLocalizationsPtBr extends AppLocalizationsPt {
  AppLocalizationsPtBr() : super('pt_BR');

  @override
  String get appTitle => 'Damaged Code';

  @override
  String get archiveEyebrow => 'ARQUIVO INTERDIMENSIONAL';

  @override
  String get episodesTitle => 'Arquivo de episódios';

  @override
  String get episodesDescription =>
      'Escolha uma transmissão para inspecionar o manifesto completo de personagens.';

  @override
  String get loadingEpisodes => 'Carregando arquivo de episódios...';

  @override
  String get loadingEpisode => 'Carregando ficha do episódio...';

  @override
  String get loadingCharacter => 'Carregando dossiê do personagem...';

  @override
  String get errorTitle => 'Transmissão interrompida';

  @override
  String get genericError =>
      'Não foi possível acessar o arquivo. Verifique sua conexão e tente novamente.';

  @override
  String get serviceUnavailable =>
      'A fonte do arquivo está temporariamente indisponível. Tente novamente em instantes.';

  @override
  String get retry => 'Tentar novamente';

  @override
  String get noEpisodes => 'Nenhuma ficha de episódio foi encontrada.';

  @override
  String get noCharacters =>
      'Nenhum personagem foi registrado para este episódio.';

  @override
  String get noAppearances => 'Nenhuma aparição em episódio foi registrada.';

  @override
  String get episodeFile => 'FICHA DO EPISÓDIO';

  @override
  String get characterDossier => 'DOSSIÊ DO PERSONAGEM';

  @override
  String get charactersTitle => 'Personagens';

  @override
  String get appearancesTitle => 'Aparições em episódios';

  @override
  String get season => 'Temporada';

  @override
  String get episode => 'Episódio';

  @override
  String get aired => 'Exibido em';

  @override
  String get characters => 'Personagens';

  @override
  String get status => 'Status';

  @override
  String get species => 'Espécie';

  @override
  String get type => 'Tipo';

  @override
  String get gender => 'Gênero';

  @override
  String get origin => 'Origem';

  @override
  String get location => 'Última localização conhecida';

  @override
  String get imageUnavailable => 'Retrato indisponível';

  @override
  String openEpisode(String code, String name) {
    return 'Abrir $code $name';
  }

  @override
  String openCharacter(String name) {
    return 'Abrir o dossiê de $name';
  }

  @override
  String seasonEpisode(int seasonNumber, int episodeNumber) {
    return 'Temporada $seasonNumber · Episódio $episodeNumber';
  }

  @override
  String episodeCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count episódios',
      one: '1 episódio',
      zero: 'Nenhum episódio',
    );
    return '$_temp0';
  }

  @override
  String characterCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count personagens',
      one: '1 personagem',
      zero: 'Nenhum personagem',
    );
    return '$_temp0';
  }
}
