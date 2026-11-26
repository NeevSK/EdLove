// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated from packages/ui/src/tokens/index.ts via scripts/gen-tokens-dart.mjs

import 'package:flutter/widgets.dart';

/// Design tokens matching @repo/ui strictly
/// Rules:
/// 1. Vellum-based surfaces (never pure white #FFFFFF)
/// 2. Warm Ink content (never pure black #000000)
/// 3. Saffron primary (#D4843A) & Dalu Green secondary (#8BBF7A)
class GuruColors {
  GuruColors._();

  // Core brand roles
  static const Color saffron = Color(0xFFD4843A);
  static const Color daluGreen = Color(0xFF8BBF7A);

  // Surface roles (Vellum-based, never pure white)
  static const Color vellum = Color(0xFFF5EDD6); // Base page background
  static const Color silk = Color(0xFFFAF7ED); // Raised card surface
  static const Color linen = Color(0xFFF0E8D0); // Recessed quiet surface
  static const Color elevated = Color(0xFFFDF0DC); // Warm raised surface
  static const Color surfaceInteractive = Color(0x80E8E2CF);

  // Content roles (Warm ink, never pure black)
  static const Color ink = Color(0xFF2A2318); // Primary Text
  static const Color inkSubtle = Color(0xFF5B5448); // Secondary Text
  static const Color textMuted = Color(0xFF72695E);
  static const Color textInverse = Color(0xFFF5EDD6);

  // Semantic status roles
  static const Color error = Color(0xFFC64F3E);
  static const Color errorSurface = Color(0xFFFBEBD8);
  static const Color success = Color(0xFF5B8C4F);
  static const Color warning = Color(0xFFD4A03A);
  static const Color info = Color(0xFF4F7DA3);

  // Atmospheric roles
  static const Color livingGreen = Color(0xFF8BBF7A);
  static const Color atmosphericTeal = Color(0xFF7DD4C0);
  static const Color depthViolet = Color(0xFFB8A9E0);
  static const Color border = Color(0xFFE8E2CF);
  static const Color borderSubtle = Color(0x1F2A2318);
  static const Color borderStrong = Color(0xFF544A3D);
  static const Color shadowViolet = Color(0x266B6480);
}

class GuruSpacing {
  GuruSpacing._();
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

class GuruRadii {
  GuruRadii._();
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 20.0;
  static const double full = 9999.0;
}

class GuruTouch {
  GuruTouch._();
  static const double minTouchTarget = 48.0;
  static const double minTouchTargetCompact = 44.0;
}
