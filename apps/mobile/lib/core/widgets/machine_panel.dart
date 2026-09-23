import 'package:damaged_code/core/theme/app_theme.dart';
import 'package:flutter/material.dart';

class MachinePanel extends StatelessWidget {
  const MachinePanel({
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color = DamagedColors.panel,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color,
        border: Border.all(color: DamagedColors.outline, width: 2),
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [
          BoxShadow(color: DamagedColors.outline, offset: Offset(0, 5)),
        ],
      ),
      child: Padding(padding: padding, child: child),
    );
  }
}

class ScrewRow extends StatelessWidget {
  const ScrewRow({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [_Screw(), _Screw()],
    );
  }
}

class _Screw extends StatelessWidget {
  const _Screw();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: DamagedColors.hairline,
        shape: BoxShape.circle,
        border: Border.all(color: DamagedColors.outline),
      ),
    );
  }
}
