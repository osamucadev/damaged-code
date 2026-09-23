import 'package:damaged_code/app/damaged_code_app.dart';
import 'package:damaged_code/core/config/app_config.dart';
import 'package:damaged_code/core/network/api_client.dart';
import 'package:damaged_code/features/characters/data/character_repository.dart';
import 'package:damaged_code/features/episodes/data/episode_repository.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;

void main() {
  final client = ApiClient(
    baseUrl: AppConfig.apiBaseUrl,
    httpClient: http.Client(),
  );

  runApp(
    DamagedCodeApp(
      episodeRepository: HttpEpisodeRepository(client),
      characterRepository: HttpCharacterRepository(client),
    ),
  );
}
