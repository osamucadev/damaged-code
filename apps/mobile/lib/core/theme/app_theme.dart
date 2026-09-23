import 'package:flutter/material.dart';

abstract final class DamagedColors {
  static const machine = Color(0xFF211A13);
  static const panel = Color(0xFF2F2D28);
  static const raisedPanel = Color(0xFF3D3A33);
  static const recess = Color(0xFF1B1A17);
  static const screen = Color(0xFF06232B);
  static const paper = Color(0xFFEFE3C8);
  static const bone = Color(0xFFF2ECE0);
  static const muted = Color(0xFFB9AE9A);
  static const cyan = Color(0xFF4FD4EE);
  static const cyanSoft = Color(0xFFA8ECFA);
  static const acid = Color(0xFF97CE4C);
  static const acidStrong = Color(0xFFB6E84F);
  static const amber = Color(0xFFE8912A);
  static const danger = Color(0xFFF4796A);
  static const outline = Color(0xFF0F0E0C);
  static const hairline = Color(0xFF4D493F);
}

abstract final class AppTheme {
  static ThemeData build() {
    final scheme = ColorScheme.fromSeed(
      seedColor: DamagedColors.acid,
      brightness: Brightness.dark,
      primary: DamagedColors.acid,
      onPrimary: DamagedColors.outline,
      secondary: DamagedColors.cyan,
      onSecondary: DamagedColors.outline,
      surface: DamagedColors.panel,
      onSurface: DamagedColors.bone,
      error: DamagedColors.danger,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: scheme,
      scaffoldBackgroundColor: DamagedColors.machine,
      fontFamily: 'monospace',
      appBarTheme: const AppBarTheme(
        backgroundColor: DamagedColors.machine,
        foregroundColor: DamagedColors.bone,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      textTheme: const TextTheme(
        displaySmall: TextStyle(
          color: DamagedColors.bone,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
          height: 1.05,
        ),
        headlineSmall: TextStyle(
          color: DamagedColors.bone,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
        titleLarge: TextStyle(
          color: DamagedColors.bone,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
        bodyMedium: TextStyle(color: DamagedColors.bone, height: 1.45),
        bodySmall: TextStyle(color: DamagedColors.muted, height: 1.35),
        labelLarge: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 0.8),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(48, 48),
          foregroundColor: DamagedColors.outline,
          backgroundColor: DamagedColors.acid,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
            side: const BorderSide(color: DamagedColors.outline, width: 2),
          ),
        ),
      ),
      dividerColor: DamagedColors.hairline,
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: DamagedColors.acid,
      ),
    );
  }
}
