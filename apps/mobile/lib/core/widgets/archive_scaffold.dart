import 'package:damaged_code/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class ArchiveScaffold extends StatelessWidget {
  const ArchiveScaffold({
    required this.body,
    this.title,
    this.showBack = false,
    super.key,
  });

  final Widget body;
  final String? title;
  final bool showBack;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: showBack,
        titleSpacing: showBack ? 0 : 16,
        title: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: DamagedColors.acid,
                border: Border.all(color: DamagedColors.outline, width: 2),
                boxShadow: const [
                  BoxShadow(color: DamagedColors.outline, offset: Offset(2, 2)),
                ],
              ),
              child: const Text(
                'DC',
                style: TextStyle(
                  color: DamagedColors.outline,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title ?? 'DAMAGED CODE',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(top: false, child: body),
    );
  }
}
