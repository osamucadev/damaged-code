import 'package:damaged_code/core/network/api_client.dart';
import 'package:damaged_code/core/network/api_exception.dart';
import 'package:damaged_code/features/characters/domain/character.dart';
import 'package:damaged_code/features/episodes/domain/episode.dart';

abstract interface class EpisodeRepository {
  Future<List<Episode>> fetchEpisodes();
  Future<Episode> fetchEpisode(int episodeId);
  Future<List<CharacterSummary>> fetchCharacters(int episodeId);
}

class HttpEpisodeRepository implements EpisodeRepository {
  const HttpEpisodeRepository(this._client);

  final ApiClient _client;

  @override
  Future<List<Episode>> fetchEpisodes() async {
    final body = await _client.get('/v1/episodes');
    return _parseList(body, Episode.fromJson);
  }

  @override
  Future<Episode> fetchEpisode(int episodeId) async {
    final body = await _client.get('/v1/episodes/$episodeId');
    return _parseData(body, Episode.fromJson);
  }

  @override
  Future<List<CharacterSummary>> fetchCharacters(int episodeId) async {
    final body = await _client.get('/v1/episodes/$episodeId/characters');
    return _parseList(body, CharacterSummary.fromJson);
  }
}

T _parseData<T>(JsonMap body, T Function(JsonMap) parse) {
  try {
    final data = body['data'];
    if (data is! JsonMap) throw const FormatException('Invalid data');
    return parse(data);
  } on FormatException {
    throw const ApiException('INVALID_RESPONSE');
  }
}

List<T> _parseList<T>(JsonMap body, T Function(JsonMap) parse) {
  try {
    final data = body['data'];
    if (data is! List<Object?>) throw const FormatException('Invalid data');
    return data
        .map((entry) {
          if (entry is! JsonMap) throw const FormatException('Invalid item');
          return parse(entry);
        })
        .toList(growable: false);
  } on FormatException {
    throw const ApiException('INVALID_RESPONSE');
  }
}
