import 'package:flutter_test/flutter_test.dart';
import 'package:gurudevi_flutter/core/routing/landing_policy.dart';

void main() {
  group('LandingPolicy Engine', () {
    test('New users always route directly to /workspace', () {
      const policy = LandingPolicy(mode: LandingStrategyMode.lastActiveTab);
      final destination = policy.resolveInitialPath(
        lastActiveTabPath: '/self',
        isNewUser: true,
      );
      expect(destination, '/workspace');
    });

    test('alwaysWorkspace mode always routes to /workspace', () {
      const policy = LandingPolicy(mode: LandingStrategyMode.alwaysWorkspace);
      final destination = policy.resolveInitialPath(
        lastActiveTabPath: '/self',
        isNewUser: false,
      );
      expect(destination, '/workspace');
    });

    test('lastActiveTab mode restores remembered tab', () {
      const policy = LandingPolicy(mode: LandingStrategyMode.lastActiveTab);
      final destination = policy.resolveInitialPath(
        lastActiveTabPath: '/self',
        isNewUser: false,
      );
      expect(destination, '/self');
    });

    test('lastActiveTab mode falls back to /workspace if no prior tab exists', () {
      const policy = LandingPolicy(mode: LandingStrategyMode.lastActiveTab);
      final destination = policy.resolveInitialPath(
        lastActiveTabPath: null,
        isNewUser: false,
      );
      expect(destination, '/workspace');
    });

    test('contextualRhythm routes to /self in the evening', () {
      const policy = LandingPolicy(mode: LandingStrategyMode.contextualRhythm);
      final eveningTime = DateTime(2026, 11, 24, 20, 30); // 8:30 PM
      final destination = policy.resolveInitialPath(
        lastActiveTabPath: '/workspace',
        isNewUser: false,
        currentTime: eveningTime,
      );
      expect(destination, '/self');
    });

    test('contextualRhythm routes to lastActiveTab/workspace during work hours', () {
      const policy = LandingPolicy(mode: LandingStrategyMode.contextualRhythm);
      final morningWorkTime = DateTime(2026, 11, 24, 9, 0); // 9:00 AM
      final destination = policy.resolveInitialPath(
        lastActiveTabPath: '/workspace',
        isNewUser: false,
        currentTime: morningWorkTime,
      );
      expect(destination, '/workspace');
    });
  });
}
