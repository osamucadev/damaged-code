import 'package:damaged_code/features/episodes/domain/episode.dart';

class CharacterSummary {
  const CharacterSummary({
    required this.id,
    required this.name,
    required this.image,
    required this.status,
    required this.species,
    required this.type,
    required this.gender,
    required this.origin,
    required this.location,
  });

  factory CharacterSummary.fromJson(Map<String, Object?> json) {
    return CharacterSummary(
      id: _integer(json, 'id'),
      name: _string(json, 'name'),
      image: _string(json, 'image'),
      status: _string(json, 'status'),
      species: _string(json, 'species'),
      type: _string(json, 'type'),
      gender: _string(json, 'gender'),
      origin: _string(json, 'origin'),
      location: _string(json, 'location'),
    );
  }

  final int id;
  final String name;
  final String image;
  final String status;
  final String species;
  final String type;
  final String gender;
  final String origin;
  final String location;
}

class CharacterDetail extends CharacterSummary {
  const CharacterDetail({
    required super.id,
    required super.name,
    required super.image,
    required super.status,
    required super.species,
    required super.type,
    required super.gender,
    required super.origin,
    required super.location,
    required this.episodes,
  });

  factory CharacterDetail.fromJson(Map<String, Object?> json) {
    final summary = CharacterSummary.fromJson(json);
    final rawEpisodes = json['episodes'];
    if (rawEpisodes is! List<Object?>) {
      throw const FormatException('Invalid episodes');
    }

    return CharacterDetail(
      id: summary.id,
      name: summary.name,
      image: summary.image,
      status: summary.status,
      species: summary.species,
      type: summary.type,
      gender: summary.gender,
      origin: summary.origin,
      location: summary.location,
      episodes: rawEpisodes
          .map((entry) {
            if (entry is! Map<String, Object?>) {
              throw const FormatException('Invalid episode reference');
            }
            return EpisodeReference.fromJson(entry);
          })
          .toList(growable: false),
    );
  }

  final List<EpisodeReference> episodes;
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
