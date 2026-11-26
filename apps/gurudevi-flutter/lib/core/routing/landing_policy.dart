enum LandingStrategyMode {
  alwaysWorkspace,   // Simple uniform rule: always /workspace
  lastActiveTab,     // Resume where they left off (default)
  contextualRhythm,  // Time-of-day (School hours vs Evening wind-down in /self)
}

class LandingPolicy {
  final LandingStrategyMode mode;

  const LandingPolicy({this.mode = LandingStrategyMode.lastActiveTab});

  String resolveInitialPath({
    required String? lastActiveTabPath,
    required bool isNewUser,
    String? eveningWindDownTime, // e.g. "19:00:00"
    DateTime? currentTime,
  }) {
    // 1. New users always go straight to workspace orientation
    if (isNewUser) {
      return '/workspace';
    }

    switch (mode) {
      case LandingStrategyMode.alwaysWorkspace:
        return '/workspace';

      case LandingStrategyMode.lastActiveTab:
        return lastActiveTabPath ?? '/workspace';

      case LandingStrategyMode.contextualRhythm:
        final now = currentTime ?? DateTime.now();
        // If it's evening past wind-down time (e.g. 7 PM), offer the calm /self space
        if (now.hour >= 19 || now.hour < 6) {
          return '/self';
        }
        // During day/work hours, resume their last workspace tab or fallback to /workspace
        return lastActiveTabPath ?? '/workspace';
    }
  }
}
