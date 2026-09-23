import 'package:damaged_code/core/theme/app_theme.dart';
import 'package:damaged_code/core/widgets/archive_scaffold.dart';
import 'package:damaged_code/core/widgets/async_panels.dart';
import 'package:damaged_code/core/widgets/machine_panel.dart';
import 'package:damaged_code/core/widgets/network_portrait.dart';
import 'package:damaged_code/features/characters/data/character_repository.dart';
import 'package:damaged_code/features/characters/domain/character.dart';
import 'package:damaged_code/features/characters/presentation/character_detail_screen.dart';
import 'package:damaged_code/features/episodes/data/episode_repository.dart';
import 'package:damaged_code/features/episodes/domain/episode.dart';
import 'package:damaged_code/l10n/app_localizations.dart';
import 'package:flutter/material.dart';

class EpisodeDetailScreen extends StatefulWidget {
  const EpisodeDetailScreen({
    required this.episodeId,
    required this.episodeRepository,
    required this.characterRepository,
    super.key,
  });

  final int episodeId;
  final EpisodeRepository episodeRepository;
  final CharacterRepository characterRepository;

  @override
  State<EpisodeDetailScreen> createState() => _EpisodeDetailScreenState();
}

class _EpisodeDetailScreenState extends State<EpisodeDetailScreen> {
  late Future<_EpisodeBundle> _bundle;

  @override
  void initState() {
    super.initState();
    _bundle = _load();
  }

  Future<_EpisodeBundle> _load() async {
    final episodeFuture = widget.episodeRepository.fetchEpisode(
      widget.episodeId,
    );
    final charactersFuture = widget.episodeRepository.fetchCharacters(
      widget.episodeId,
    );
    return _EpisodeBundle(await episodeFuture, await charactersFuture);
  }

  void _retry() {
    setState(() {
      _bundle = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return ArchiveScaffold(
      showBack: true,
      title: l10n.episodeFile,
      body: FutureBuilder<_EpisodeBundle>(
        future: _bundle,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return LoadingPanel(message: l10n.loadingEpisode);
          }
          if (snapshot.hasError) {
            return ErrorPanel(error: snapshot.error!, onRetry: _retry);
          }
          return _EpisodeContent(
            bundle: snapshot.data!,
            onCharacter: _openCharacter,
          );
        },
      ),
    );
  }

  void _openCharacter(CharacterSummary character) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (context) => CharacterDetailScreen(
          characterId: character.id,
          episodeRepository: widget.episodeRepository,
          characterRepository: widget.characterRepository,
        ),
      ),
    );
  }
}

class _EpisodeBundle {
  const _EpisodeBundle(this.episode, this.characters);
  final Episode episode;
  final List<CharacterSummary> characters;
}

class _EpisodeContent extends StatelessWidget {
  const _EpisodeContent({required this.bundle, required this.onCharacter});

  final _EpisodeBundle bundle;
  final ValueChanged<CharacterSummary> onCharacter;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final episode = bundle.episode;
    final position = episode.position;
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = constraints.maxWidth >= 840
            ? 3
            : constraints.maxWidth >= 560
            ? 2
            : 1;
        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MachinePanel(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const ScrewRow(),
                        const SizedBox(height: 16),
                        Text(
                          episode.code,
                          style: const TextStyle(
                            color: DamagedColors.cyan,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          episode.name.toUpperCase(),
                          style: Theme.of(context).textTheme.displaySmall,
                        ),
                        const SizedBox(height: 18),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            if (position != null) ...[
                              _Metric(
                                label: l10n.season,
                                value: '${position.season}',
                              ),
                              _Metric(
                                label: l10n.episode,
                                value: '${position.episode}',
                              ),
                            ],
                            _Metric(label: l10n.aired, value: episode.airDate),
                            _Metric(
                              label: l10n.characters,
                              value: '${episode.characterCount}',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 26),
                  Text(
                    l10n.charactersTitle.toUpperCase(),
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 12),
                  if (bundle.characters.isEmpty)
                    MachinePanel(child: Text(l10n.noCharacters))
                  else
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: bundle.characters.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: columns,
                        mainAxisExtent: 150,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemBuilder: (context, index) {
                        final character = bundle.characters[index];
                        return _CharacterCard(
                          character: character,
                          onTap: () => onCharacter(character),
                        );
                      },
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: 120),
      padding: const EdgeInsets.fromLTRB(12, 9, 12, 10),
      decoration: const BoxDecoration(
        color: DamagedColors.recess,
        border: Border(left: BorderSide(color: DamagedColors.acid, width: 3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
        ],
      ),
    );
  }
}

class _CharacterCard extends StatelessWidget {
  const _CharacterCard({required this.character, required this.onTap});

  final CharacterSummary character;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Semantics(
      button: true,
      label: l10n.openCharacter(character.name),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: MachinePanel(
            padding: const EdgeInsets.all(10),
            color: DamagedColors.raisedPanel,
            child: Row(
              children: [
                SizedBox(
                  width: 102,
                  child: NetworkPortrait(
                    url: character.image,
                    name: character.name,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        character.name.toUpperCase(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        character.status.toUpperCase(),
                        style: TextStyle(
                          color: _statusColor(character.status),
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        character.species,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: DamagedColors.acid),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

Color _statusColor(String status) {
  switch (status.toLowerCase()) {
    case 'alive':
      return DamagedColors.acidStrong;
    case 'dead':
      return DamagedColors.danger;
    default:
      return DamagedColors.amber;
  }
}
