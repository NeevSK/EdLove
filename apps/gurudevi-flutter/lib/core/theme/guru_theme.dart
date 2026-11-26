import 'package:flutter/material.dart';
import 'tokens.g.dart';

class GuruTheme {
  GuruTheme._();

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: GuruColors.vellum,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: GuruColors.saffron,
        onPrimary: Colors.white,
        primaryContainer: GuruColors.elevated,
        onPrimaryContainer: GuruColors.ink,
        secondary: GuruColors.daluGreen,
        onSecondary: GuruColors.ink,
        secondaryContainer: GuruColors.linen,
        onSecondaryContainer: GuruColors.ink,
        surface: GuruColors.silk,
        onSurface: GuruColors.ink,
        surfaceContainerHighest: GuruColors.linen,
        onSurfaceVariant: GuruColors.inkSubtle,
        outline: GuruColors.border,
        outlineVariant: GuruColors.borderSubtle,
        error: GuruColors.error,
        onError: Colors.white,
        errorContainer: GuruColors.errorSurface,
        onErrorContainer: GuruColors.error,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: GuruColors.vellum,
        foregroundColor: GuruColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: GuruColors.ink,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.2,
        ),
      ),
      cardTheme: CardThemeData(
        color: GuruColors.silk,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(GuruRadii.md),
          side: const BorderSide(color: GuruColors.border, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: GuruColors.saffron,
          foregroundColor: Colors.white,
          minimumSize: const Size(88, GuruTouch.minTouchTarget),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(GuruRadii.md),
          ),
          elevation: 0,
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: GuruColors.ink,
          minimumSize: const Size(88, GuruTouch.minTouchTarget),
          side: const BorderSide(color: GuruColors.borderStrong, width: 1.2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(GuruRadii.md),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: GuruColors.border,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
