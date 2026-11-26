import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/auth_session.dart';

const _kSessionKey = 'gurudevi_auth_session';

class AuthSessionNotifier extends ChangeNotifier {
  AuthSessionState _state = const AuthSessionState.initial();
  AuthSessionState get state => _state;

  AuthSessionNotifier() {
    hydrateSession();
  }

  Future<void> hydrateSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_kSessionKey);
      if (raw != null) {
        final map = jsonDecode(raw) as Map<String, dynamic>;
        final mode = map['mode'] as String?;
        if (mode == 'authenticated') {
          final userMap = map['user'] as Map<String, dynamic>;
          final user = UserProfile(
            id: userMap['id'] as String,
            displayName: userMap['displayName'] as String,
            email: userMap['email'] as String?,
            onboardingCompleted: userMap['onboardingCompleted'] as bool? ?? false,
            capacity: userMap['capacity'] as String?,
            schoolId: userMap['schoolId'] as String?,
          );
          _state = AuthSessionState.authenticated(
            profile: user,
            token: map['token'] as String,
          );
        } else if (mode == 'localGuest') {
          _state = AuthSessionState.guest(
            guestId: map['guestId'] as String,
            onboardingCompleted: map['onboardingCompleted'] as bool? ?? false,
          );
        } else {
          _state = const AuthSessionState.unauthenticated();
        }
      } else {
        _state = const AuthSessionState.unauthenticated();
      }
    } catch (e) {
      debugPrint('[AuthSessionNotifier] Hydration failed: $e');
      _state = const AuthSessionState.unauthenticated();
    }
    notifyListeners();
  }

  Future<void> startGuestTrial() async {
    final guestId = const Uuid().v4();
    _state = AuthSessionState.guest(guestId: guestId, onboardingCompleted: false);
    await _persist();
    notifyListeners();
  }

  Future<void> signInWithCredentials({
    required String email,
    required String displayName,
    String? capacity,
  }) async {
    final user = UserProfile(
      id: const Uuid().v4(),
      displayName: displayName,
      email: email,
      capacity: capacity ?? 'teacher',
      onboardingCompleted: true,
    );
    _state = AuthSessionState.authenticated(
      profile: user,
      token: 'jwt_${const Uuid().v4()}',
    );
    await _persist();
    notifyListeners();
  }

  Future<void> completeOnboarding({
    required String displayName,
    required String capacity,
    String? schoolId,
  }) async {
    if (_state.isAuthenticated && _state.user != null) {
      final updated = _state.user!.copyWith(
        displayName: displayName,
        capacity: capacity,
        schoolId: schoolId,
        onboardingCompleted: true,
      );
      _state = AuthSessionState.authenticated(
        profile: updated,
        token: _state.accessToken ?? 'jwt_active',
      );
      await _persist();
      notifyListeners();
    } else if (_state.isLocalGuest) {
      // Local guest completing trial onboarding
      _state = AuthSessionState.guest(
        guestId: _state.localGuestId!,
        onboardingCompleted: true,
      );
      await _persist();
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    _state = const AuthSessionState.unauthenticated();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kSessionKey);
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    if (_state.isAuthenticated && _state.user != null) {
      final payload = {
        'mode': 'authenticated',
        'token': _state.accessToken,
        'user': {
          'id': _state.user!.id,
          'displayName': _state.user!.displayName,
          'email': _state.user!.email,
          'onboardingCompleted': _state.user!.onboardingCompleted,
          'capacity': _state.user!.capacity,
          'schoolId': _state.user!.schoolId,
        },
      };
      await prefs.setString(_kSessionKey, jsonEncode(payload));
    } else if (_state.isLocalGuest) {
      final payload = {
        'mode': 'localGuest',
        'guestId': _state.localGuestId,
        'onboardingCompleted': _state.onboardingCompleted,
      };
      await prefs.setString(_kSessionKey, jsonEncode(payload));
    } else {
      await prefs.remove(_kSessionKey);
    }
  }
}

final authSessionProvider = ChangeNotifierProvider<AuthSessionNotifier>((ref) {
  return AuthSessionNotifier();
});
