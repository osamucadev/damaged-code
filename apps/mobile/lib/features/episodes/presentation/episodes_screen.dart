import 'package:damaged_code/core/theme/app_theme.dart';
import 'package:damaged_code/core/widgets/archive_scaffold.dart';
import 'package:damaged_code/core/widgets/async_panels.dart';
import 'package:damaged_code/core/widgets/machine_panel.dart';
import 'package:damaged_code/features/characters/data/character_repository.dart';
import 'package:damaged_code/features/episodes/data/episode_repository.dart';
import 'package:damaged_code/features/episodes/domain/episode.dart';
import 'package:damaged_code/features/episodes/presentation/episode_detail_screen.dart';
import 'package:damaged_code/l10n/app_localizations.dart';
import 'package:flutter/material.dart';

class EpisodesScreen extends StatefulWidget {
  const EpisodesScreen({
    required this.episodeRepository,
    required this.characterRepository,
    super.key,
  });

  final EpisodeRepository episodeRepository;
  final CharacterRepository characterRepository;

  @override
  State<EpisodesScreen> createState() => _EpisodesScreenState();
}

class _EpisodesScreenState extends State<EpisodesScreen> {
  late Future<List<Episode>> _episodes;

  @override
  void initState() {
    super.initState();
    _episodes = widget.episodeRepository.fetchEpisodes();
  }

  void _retry() {
    setState(() {
      _episodes = widget.episodeRepository.fetchEpisodes();
    });
  }

  Future<void> _refresh() async {
    final next = widget.episodeRepository.fetchEpisodes();
    setState(() => _episodes = next);
    await next;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return ArchiveScaffold(
      body: FutureBuilder<List<Episode>>(
        future: _episodes,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return LoadingPanel(message: l10n.loadingEpisodes);
          }
          if (snapshot.hasError) {
            return ErrorPanel(error: snapshot.error!, onRetry: _retry);
          }
          final episodes = snapshot.data ?? const <Episode>[];
          if (episodes.isEmpty) {
            return Center(child: Text(l10n.noEpisodes));
          }
          return _EpisodeArchive(
            episodes: episodes,
            onRefresh: _refresh,
            onOpen: _openEpisode,
          );
        },
      ),
    );
  }

  void _openEpisode(Episode episode) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (context) => EpisodeDetailScreen(
          episodeId: episode.id,
          episodeRepository: widget.episodeRepository,
          characterRepository: widget.characterRepository,
        ),
      ),
    );
  }
}

class _EpisodeArchive extends StatelessWidget {
  const _EpisodeArchive({
    required this.episodes,
    required this.onRefresh,
    required this.onOpen,
  });

  final List<Episode> episodes;
  final Future<void> Function() onRefresh;
  final ValueChanged<Episode> onOpen;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final seasons = <int, List<Episode>>{};
    for (final episode in episodes) {
      (seasons[episode.position?.season ?? 0] ??= []).add(episode);
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            sliver: SliverList.list(
              children: [
                MachinePanel(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const ScrewRow(),
                      const SizedBox(height: 18),
                      Text(
                        l10n.archiveEyebrow,
                        style: const TextStyle(
                          color: DamagedColors.cyan,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.6,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        l10n.episodesTitle.toUpperCase(),
                        style: Theme.of(context).textTheme.displaySmall,
                      ),
                      const SizedBox(height: 10),
                      Text(l10n.episodesDescription),
                      const SizedBox(height: 12),
                      _Stamp(text: l10n.episodeCount(episodes.length)),
                    ],
                  ),
                ),
                const SizedBox(height: 22),
                for (final entry in seasons.entries) ...[
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 10),
                    child: Text(
                      '${l10n.season.toUpperCase()} ${entry.key.toString().padLeft(2, '0')}',
                      style: const TextStyle(
                        color: DamagedColors.acidStrong,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  for (final episode in entry.value) ...[
                    _EpisodeCard(
                      episode: episode,
                      onTap: () => onOpen(episode),
                    ),
                    const SizedBox(height: 12),
                  ],
                  const SizedBox(height: 10),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EpisodeCard extends StatelessWidget {
  const _EpisodeCard({required this.episode, required this.onTap});

  final Episode episode;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final position = episode.position;
    return Semantics(
      button: true,
      label: l10n.openEpisode(episode.code, episode.name),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: MachinePanel(
            padding: EdgeInsets.zero,
            color: DamagedColors.raisedPanel,
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  _Stamp(text: episode.code),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          episode.name,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 5),
                        if (position != null)
                          Text(
                            l10n.seasonEpisode(
                              position.season,
                              position.episode,
                            ),
                            style: const TextStyle(
                              color: DamagedColors.cyanSoft,
                            ),
                          ),
                        const SizedBox(height: 4),
                        Text(
                          '${episode.airDate} · ${l10n.characterCount(episode.characterCount)}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.chevron_right, color: DamagedColors.acid),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Stamp extends StatelessWidget {
  const _Stamp({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: DamagedColors.acid,
        border: Border.all(color: DamagedColors.outline, width: 2),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: DamagedColors.outline,
          fontWeight: FontWeight.w900,
          letterSpacing: 0.8,
          fontSize: 12,
        ),
      ),
    );
  }
}
