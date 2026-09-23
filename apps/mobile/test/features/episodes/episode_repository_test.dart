import 'package:damaged_code/core/network/api_client.dart';
import 'package:damaged_code/core/network/api_exception.dart';
import 'package:damaged_code/features/episodes/data/episode_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  test('parses the episode list contract and production code', () async {
    final repository = HttpEpisodeRepository(
      ApiClient(
        baseUrl: 'https://api.example.test',
        httpClient: MockClient((request) async {
          expect(request.url.path, '/v1/episodes');
          return http.Response(
            '{"data":[{"id":1,"code":"S01E01","name":"Pilot",'
            '"airDate":"December 2, 2013","characterCount":19}],'
            '"meta":{"total":1}}',
            200,
          );
        }),
      ),
    );

    final episodes = await repository.fetchEpisodes();

    expect(episodes, hasLength(1));
    expect(episodes.single.name, 'Pilot');
    expect(episodes.single.position?.season, 1);
    expect(episodes.single.position?.episode, 1);
    expect(episodes.single.characterCount, 19);
  });

  test('parses characters in the order published by the BFF', () async {
    final repository = HttpEpisodeRepository(
      ApiClient(
        baseUrl: 'https://api.example.test',
        httpClient: MockClient(
          (_) async => http.Response(
            '{"data":['
            '{"id":2,"name":"Morty Smith","image":"https://images.test/2.jpg",'
            '"status":"Alive","species":"Human","type":"","gender":"Male",'
            '"origin":"unknown","location":"Citadel of Ricks"},'
            '{"id":1,"name":"Rick Sanchez","image":"https://images.test/1.jpg",'
            '"status":"Alive","species":"Human","type":"","gender":"Male",'
            '"origin":"Earth (C-137)","location":"Citadel of Ricks"}'
            '],"meta":{"total":2,"episodeId":1}}',
            200,
          ),
        ),
      ),
    );

    final characters = await repository.fetchCharacters(1);

    expect(characters.map((character) => character.name), [
      'Morty Smith',
      'Rick Sanchez',
    ]);
  });

  test('rejects a response that drifts from the project contract', () async {
    final repository = HttpEpisodeRepository(
      ApiClient(
        baseUrl: 'https://api.example.test',
        httpClient: MockClient(
          (_) async => http.Response('{"data":[{"id":"one"}]}', 200),
        ),
      ),
    );

    await expectLater(
      repository.fetchEpisodes(),
      throwsA(
        isA<ApiException>().having(
          (error) => error.code,
          'code',
          'INVALID_RESPONSE',
        ),
      ),
    );
  });
}
