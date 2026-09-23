import 'package:damaged_code/core/theme/app_theme.dart';
import 'package:damaged_code/core/widgets/archive_scaffold.dart';
import 'package:damaged_code/core/widgets/async_panels.dart';
import 'package:damaged_code/core/widgets/machine_panel.dart';
import 'package:damaged_code/core/widgets/network_portrait.dart';
import 'package:damaged_code/features/characters/data/character_repository.dart';
import 'package:damaged_code/features/characters/domain/character.dart';
import 'package:damaged_code/features/episodes/data/episode_repository.dart';
import 'package:damaged_code/features/episodes/domain/episode.dart';
import 'package:damaged_code/features/episodes/presentation/episode_detail_screen.dart';
import 'package:damaged_code/l10n/app_localizations.dart';
import 'package:flutter/material.dart';

class CharacterDetailScreen extends StatefulWidget {
  const CharacterDetailScreen({
    required this.characterId,
    required this.episodeRepository,
    required this.characterRepository,
    super.key,
  });

  final int characterId;
  final EpisodeRepository episodeRepository;
  final CharacterRepository characterRepository;

  @override
  State<CharacterDetailScreen> createState() => _CharacterDetailScreenState();
}

class _CharacterDetailScreenState extends State<CharacterDetailScreen> {
  late Future<CharacterDetail> _character;

  @override
  void initState() {
    super.initState();
    _character = widget.characterRepository.fetchCharacter(widget.characterId);
  }

  void _retry() {
    setState(() {
      _character = widget.characterRepository.fetchCharacter(
        widget.characterId,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return ArchiveScaffold(
      showBack: true,
      title: l10n.characterDossier,
      body: FutureBuilder<CharacterDetail>(
        future: _character,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return LoadingPanel(message: l10n.loadingCharacter);
          }
          if (snapshot.hasError) {
            return ErrorPanel(error: snapshot.error!, onRetry: _retry);
          }
          return _CharacterContent(
            character: snapshot.data!,
            onEpisode: _openEpisode,
          );
        },
      ),
    );
  }

  void _openEpisode(EpisodeReference episode) {
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

class _CharacterContent extends StatelessWidget {
  const _CharacterContent({required this.character, required this.onEpisode});

  final CharacterDetail character;
  final ValueChanged<EpisodeReference> onEpisode;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MachinePanel(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final compact = constraints.maxWidth < 520;
                    final portrait = SizedBox(
                      width: compact ? double.infinity : 230,
                      child: NetworkPortrait(
                        url: character.image,
                        name: character.name,
                      ),
                    );
                    final details = _Details(character: character);
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const ScrewRow(),
                        const SizedBox(height: 16),
                        Text(
                          l10n.characterDossier,
                          style: const TextStyle(
                            color: DamagedColors.cyan,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.4,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 7),
                        Text(
                          character.name.toUpperCase(),
                          style: Theme.of(context).textTheme.displaySmall,
                        ),
                        const SizedBox(height: 18),
                        if (compact) ...[
                          portrait,
                          const SizedBox(height: 18),
                          details,
                        ] else
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              portrait,
                              const SizedBox(width: 22),
                              Expanded(child: details),
                            ],
                          ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: 26),
              Text(
                l10n.appearancesTitle.toUpperCase(),
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),
              if (character.episodes.isEmpty)
                MachinePanel(child: Text(l10n.noAppearances))
              else
                for (final episode in character.episodes) ...[
                  _AppearanceCard(
                    episode: episode,
                    onTap: () => onEpisode(episode),
                  ),
                  const SizedBox(height: 10),
                ],
            ],
          ),
        ),
      ),
    );
  }
}

class _Details extends StatelessWidget {
  const _Details({required this.character});
  final CharacterDetail character;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final rows = <(String, String)>[
      (l10n.status, character.status),
      (l10n.species, character.species),
      if (character.type.trim().isNotEmpty) (l10n.type, character.type),
      (l10n.gender, character.gender),
      (l10n.origin, character.origin),
      (l10n.location, character.location),
    ];
    return Container(
      decoration: BoxDecoration(
        color: DamagedColors.paper,
        border: Border.all(color: DamagedColors.outline, width: 2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        children: [
          for (var index = 0; index < rows.length; index++)
            _PropertyRow(
              label: rows[index].$1,
              value: rows[index].$2,
              showDivider: index < rows.length - 1,
            ),
        ],
      ),
    );
  }
}

class _PropertyRow extends StatelessWidget {
  const _PropertyRow({
    required this.label,
    required this.value,
    required this.showDivider,
  });

  final String label;
  final String value;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        border: showDivider
            ? const Border(bottom: BorderSide(color: Color(0xFFC8B184)))
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFF5A4529),
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(
              color: DamagedColors.machine,
              fontWeight: FontWeight.w700,
              fontFamily: 'sans-serif',
            ),
          ),
        ],
      ),
    );
  }
}

class _AppearanceCard extends StatelessWidget {
  const _AppearanceCard({required this.episode, required this.onTap});
  final EpisodeReference episode;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Semantics(
      button: true,
      label: l10n.openEpisode(episode.code, episode.name),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: MachinePanel(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            color: DamagedColors.raisedPanel,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: DamagedColors.cyan,
                    border: Border.all(color: DamagedColors.outline, width: 2),
                  ),
                  child: Text(
                    episode.code,
                    style: const TextStyle(
                      color: DamagedColors.outline,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Text(
                    episode.name,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
                const Icon(Icons.arrow_forward, color: DamagedColors.acid),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
