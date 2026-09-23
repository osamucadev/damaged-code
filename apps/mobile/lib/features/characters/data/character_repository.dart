import 'package:damaged_code/core/network/api_client.dart';
import 'package:damaged_code/core/network/api_exception.dart';
import 'package:damaged_code/features/characters/domain/character.dart';

abstract interface class CharacterRepository {
  Future<CharacterDetail> fetchCharacter(int characterId);
}

class HttpCharacterRepository implements CharacterRepository {
  const HttpCharacterRepository(this._client);

  final ApiClient _client;

  @override
  Future<CharacterDetail> fetchCharacter(int characterId) async {
    final body = await _client.get('/v1/characters/$characterId');
    try {
      final data = body['data'];
      if (data is! JsonMap) throw const FormatException('Invalid data');
      return CharacterDetail.fromJson(data);
    } on FormatException {
      throw const ApiException('INVALID_RESPONSE');
    }
  }
}
