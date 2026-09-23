import 'package:damaged_code/core/theme/app_theme.dart';
import 'package:damaged_code/l10n/app_localizations.dart';
import 'package:flutter/material.dart';

class NetworkPortrait extends StatelessWidget {
  const NetworkPortrait({
    required this.url,
    required this.name,
    this.aspectRatio = 1,
    super.key,
  });

  final String url;
  final String name;
  final double aspectRatio;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: aspectRatio,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: ColoredBox(
          color: DamagedColors.recess,
          child: Image.network(
            url,
            fit: BoxFit.cover,
            semanticLabel: name,
            loadingBuilder: (context, child, progress) {
              if (progress == null) return child;
              return const Center(
                child: SizedBox(
                  width: 26,
                  height: 26,
                  child: CircularProgressIndicator(strokeWidth: 3),
                ),
              );
            },
            errorBuilder: (context, error, stackTrace) => Semantics(
              label: AppLocalizations.of(context).imageUnavailable,
              child: const Center(
                child: Icon(
                  Icons.person_off_outlined,
                  color: DamagedColors.muted,
                  size: 42,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
