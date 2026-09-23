import 'package:damaged_code/core/network/api_exception.dart';
import 'package:damaged_code/core/theme/app_theme.dart';
import 'package:damaged_code/core/widgets/machine_panel.dart';
import 'package:damaged_code/l10n/app_localizations.dart';
import 'package:flutter/material.dart';

class LoadingPanel extends StatelessWidget {
  const LoadingPanel({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Semantics(
          liveRegion: true,
          label: message,
          child: MachinePanel(
            color: DamagedColors.screen,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(strokeWidth: 3),
                ),
                const SizedBox(width: 14),
                Flexible(
                  child: Text(
                    message,
                    style: const TextStyle(color: DamagedColors.cyanSoft),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ErrorPanel extends StatelessWidget {
  const ErrorPanel({required this.error, required this.onRetry, super.key});

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final message =
        error is ApiException &&
            (error as ApiException).code == 'UPSTREAM_UNAVAILABLE'
        ? l10n.serviceUnavailable
        : l10n.genericError;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: MachinePanel(
          color: DamagedColors.screen,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.warning_amber_rounded,
                color: DamagedColors.danger,
                size: 36,
              ),
              const SizedBox(height: 12),
              Text(
                l10n.errorTitle,
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                message,
                style: const TextStyle(color: DamagedColors.cyanSoft),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: Text(l10n.retry),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
