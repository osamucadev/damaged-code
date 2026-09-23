import 'package:damaged_code/app/damaged_code_app.dart';
import 'package:damaged_code/features/characters/data/character_repository.dart';
import 'package:damaged_code/features/characters/domain/character.dart';
import 'package:damaged_code/features/episodes/data/episode_repository.dart';
import 'package:damaged_code/features/episodes/domain/episode.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('navigates episode to character to appearance and back', (
    tester,
  ) async {
    await tester.pumpWidget(
      DamagedCodeApp(
        episodeRepository: const _FlowEpisodeRepository(),
        characterRepository: const _FlowCharacterRepository(),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Pilot'));
    await tester.pumpAndSettle();
    expect(find.text('PILOT'), findsOneWidget);
    expect(find.text('RICK SANCHEZ'), findsOneWidget);

    await tester.tap(find.text('RICK SANCHEZ'));
    await tester.pumpAndSettle();
    expect(find.text('CHARACTER DOSSIER'), findsWidgets);
    expect(find.text('Lawnmower Dog'), findsOneWidget);

    await tester.ensureVisible(find.text('Lawnmower Dog'));
    await tester.tap(find.text('Lawnmower Dog'));
    await tester.pumpAndSettle();
    expect(find.text('LAWNMOWER DOG'), findsOneWidget);

    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('RICK SANCHEZ'), findsOneWidget);

    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('PILOT'), findsOneWidget);
  });
}

const pilot = Episode(
  id: 1,
  code: 'S01E01',
  name: 'Pilot',
  airDate: 'December 2, 2013',
  characterCount: 1,
);

const lawnmowerDog = Episode(
  id: 2,
  code: 'S01E02',
  name: 'Lawnmower Dog',
  airDate: 'December 9, 2013',
  characterCount: 0,
);

const rick = CharacterSummary(
  id: 1,
  name: 'Rick Sanchez',
  image: 'https://images.example.test/rick.jpg',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: 'Earth (C-137)',
  location: 'Citadel of Ricks',
);

class _FlowEpisodeRepository implements EpisodeRepository {
  const _FlowEpisodeRepository();

  @override
  Future<List<Episode>> fetchEpisodes() => Future.value(const [pilot]);

  @override
  Future<Episode> fetchEpisode(int episodeId) =>
      Future.value(episodeId == 1 ? pilot : lawnmowerDog);

  @override
  Future<List<CharacterSummary>> fetchCharacters(int episodeId) =>
      Future.value(episodeId == 1 ? const [rick] : const []);
}

class _FlowCharacterRepository implements CharacterRepository {
  const _FlowCharacterRepository();

  @override
  Future<CharacterDetail> fetchCharacter(int characterId) => Future.value(
    const CharacterDetail(
      id: 1,
      name: 'Rick Sanchez',
      image: 'https://images.example.test/rick.jpg',
      status: 'Alive',
      species: 'Human',
      type: '',
      gender: 'Male',
      origin: 'Earth (C-137)',
      location: 'Citadel of Ricks',
      episodes: [
        EpisodeReference(id: 2, code: 'S01E02', name: 'Lawnmower Dog'),
      ],
    ),
  );
}
