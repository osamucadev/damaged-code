class Episode {
  const Episode({
    required this.id,
    required this.code,
    required this.name,
    required this.airDate,
    required this.characterCount,
  });

  factory Episode.fromJson(Map<String, Object?> json) {
    return Episode(
      id: _integer(json, 'id'),
      code: _string(json, 'code'),
      name: _string(json, 'name'),
      airDate: _string(json, 'airDate'),
      characterCount: _integer(json, 'characterCount'),
    );
  }

  final int id;
  final String code;
  final String name;
  final String airDate;
  final int characterCount;

  EpisodePosition? get position {
    final match = RegExp(r'^S(\d+)E(\d+)$').firstMatch(code);
    if (match == null) return null;
    return EpisodePosition(
      season: int.parse(match.group(1)!),
      episode: int.parse(match.group(2)!),
    );
  }
}

class EpisodeReference {
  const EpisodeReference({
    required this.id,
    required this.code,
    required this.name,
  });

  factory EpisodeReference.fromJson(Map<String, Object?> json) {
    return EpisodeReference(
      id: _integer(json, 'id'),
      code: _string(json, 'code'),
      name: _string(json, 'name'),
    );
  }

  final int id;
  final String code;
  final String name;
}

class EpisodePosition {
  const EpisodePosition({required this.season, required this.episode});

  final int season;
  final int episode;
}

String _string(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! String) throw FormatException('Invalid $key');
  return value;
}

int _integer(Map<String, Object?> json, String key) {
  final value = json[key];
  if (value is! int) throw FormatException('Invalid $key');
  return value;
}
