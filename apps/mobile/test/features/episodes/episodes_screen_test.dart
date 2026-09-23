import 'dart:async';

import 'package:damaged_code/app/damaged_code_app.dart';
import 'package:damaged_code/core/network/api_exception.dart';
import 'package:damaged_code/features/characters/data/character_repository.dart';
import 'package:damaged_code/features/characters/domain/character.dart';
import 'package:damaged_code/features/episodes/data/episode_repository.dart';
import 'package:damaged_code/features/episodes/domain/episode.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows a deliberate loading state', (tester) async {
    final pending = Completer<List<Episode>>();
    await tester.pumpWidget(
      DamagedCodeApp(
        episodeRepository: _EpisodeRepository(() => pending.future),
        characterRepository: const _CharacterRepository(),
      ),
    );

    expect(find.text('Loading episode archive...'), findsOneWidget);
  });

  testWidgets('uses Brazilian Portuguese for a Portuguese device locale', (
    tester,
  ) async {
    final pending = Completer<List<Episode>>();

    await tester.pumpWidget(
      DamagedCodeApp(
        locale: const Locale('pt', 'BR'),
        episodeRepository: _EpisodeRepository(() => pending.future),
        characterRepository: const _CharacterRepository(),
      ),
    );

    expect(find.text('Carregando arquivo de episódios...'), findsOneWidget);
  });

  testWidgets('shows a safe error and retries the episode request', (
    tester,
  ) async {
    var calls = 0;
    final repository = _EpisodeRepository(() {
      calls += 1;
      if (calls == 1) {
        return Future<List<Episode>>.error(
          const ApiException('UPSTREAM_UNAVAILABLE'),
        );
      }
      return Future.value([pilot]);
    });

    await tester.pumpWidget(
      DamagedCodeApp(
        episodeRepository: repository,
        characterRepository: const _CharacterRepository(),
      ),
    );
    await tester.pump();

    expect(find.text('Transmission interrupted'), findsOneWidget);
    expect(find.textContaining('temporarily unavailable'), findsOneWidget);
    expect(find.byType(FilledButton), findsOneWidget);

    await tester.tap(find.text('Retry'));
    await tester.pumpAndSettle();

    expect(calls, 2);
    expect(find.text('Pilot'), findsOneWidget);
  });
}

const pilot = Episode(
  id: 1,
  code: 'S01E01',
  name: 'Pilot',
  airDate: 'December 2, 2013',
  characterCount: 1,
);

class _EpisodeRepository implements EpisodeRepository {
  const _EpisodeRepository(this._fetchEpisodes);

  final Future<List<Episode>> Function() _fetchEpisodes;

  @override
  Future<List<Episode>> fetchEpisodes() => _fetchEpisodes();

  @override
  Future<List<CharacterSummary>> fetchCharacters(int episodeId) =>
      Future.value(const []);

  @override
  Future<Episode> fetchEpisode(int episodeId) => Future.value(pilot);
}

class _CharacterRepository implements CharacterRepository {
  const _CharacterRepository();

  @override
  Future<CharacterDetail> fetchCharacter(int characterId) =>
      throw UnimplementedError();
}
