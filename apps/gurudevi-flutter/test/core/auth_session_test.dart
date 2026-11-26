import 'package:flutter_test/flutter_test.dart';
import 'package:gurudevi_flutter/core/models/auth_session.dart';

void main() {
  group('AuthSessionState Tri-State Transitions', () {
    test('Initial state is loading and unauthenticated', () {
      const state = AuthSessionState.initial();
      expect(state.isLoading, isTrue);
      expect(state.isUnauthenticated, isTrue);
      expect(state.isAuthenticated, isFalse);
      expect(state.isLocalGuest, isFalse);
    });

    test('Guest state has guestId and isLocalGuest=true', () {
      const state = AuthSessionState.guest(guestId: 'guest-1234');
      expect(state.isLoading, isFalse);
      expect(state.isLocalGuest, isTrue);
      expect(state.localGuestId, 'guest-1234');
      expect(state.isAuthenticated, isFalse);
      expect(state.onboardingCompleted, isFalse);
    });

    test('Authenticated state has user profile and token', () {
      const profile = UserProfile(
        id: 'user-001',
        displayName: 'Priya Fernando',
        onboardingCompleted: true,
        capacity: 'Teacher',
      );
      const state = AuthSessionState.authenticated(
        profile: profile,
        token: 'token-xyz',
      );

      expect(state.isLoading, isFalse);
      expect(state.isAuthenticated, isTrue);
      expect(state.onboardingCompleted, isTrue);
      expect(state.user?.displayName, 'Priya Fernando');
      expect(state.accessToken, 'token-xyz');
    });
  });
}
