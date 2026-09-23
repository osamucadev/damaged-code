import 'package:damaged_code/core/network/api_client.dart';
import 'package:damaged_code/features/characters/data/character_repository.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  test('parses character detail and normalized episode appearances', () async {
    final repository = HttpCharacterRepository(
      ApiClient(
        baseUrl: 'https://api.example.test',
        httpClient: MockClient((request) async {
          expect(request.url.path, '/v1/characters/1');
          return http.Response(
            '{"data":{"id":1,"name":"Rick Sanchez",'
            '"image":"https://images.test/1.jpg","status":"Alive",'
            '"species":"Human","type":"","gender":"Male",'
            '"origin":"Earth (C-137)","location":"Citadel of Ricks",'
            '"episodes":[{"id":1,"code":"S01E01","name":"Pilot"}]}}',
            200,
          );
        }),
      ),
    );

    final character = await repository.fetchCharacter(1);

    expect(character.name, 'Rick Sanchez');
    expect(character.origin, 'Earth (C-137)');
    expect(character.episodes.single.code, 'S01E01');
    expect(character.episodes.single.name, 'Pilot');
  });
}
