enum SessionMode {
  unauthenticated,
  localGuest,
  authenticated,
}

class UserProfile {
  final String id;
  final String displayName;
  final String? email;
  final bool onboardingCompleted;
  final String? capacity;
  final String? schoolId;

  const UserProfile({
    required this.id,
    required this.displayName,
    this.email,
    this.onboardingCompleted = false,
    this.capacity,
    this.schoolId,
  });

  UserProfile copyWith({
    String? id,
    String? displayName,
    String? email,
    bool? onboardingCompleted,
    String? capacity,
    String? schoolId,
  }) {
    return UserProfile(
      id: id ?? this.id,
      displayName: displayName ?? this.displayName,
      email: email ?? this.email,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      capacity: capacity ?? this.capacity,
      schoolId: schoolId ?? this.schoolId,
    );
  }
}

class AuthSessionState {
  final SessionMode mode;
  final UserProfile? user;
  final String? accessToken;
  final String? localGuestId;
  final bool isGuestOnboarded;
  final bool isLoading;

  const AuthSessionState({
    required this.mode,
    this.user,
    this.accessToken,
    this.localGuestId,
    this.isGuestOnboarded = false,
    this.isLoading = false,
  });

  const AuthSessionState.initial()
      : mode = SessionMode.unauthenticated,
        user = null,
        accessToken = null,
        localGuestId = null,
        isGuestOnboarded = false,
        isLoading = true;

  const AuthSessionState.unauthenticated()
      : mode = SessionMode.unauthenticated,
        user = null,
        accessToken = null,
        localGuestId = null,
        isGuestOnboarded = false,
        isLoading = false;

  const AuthSessionState.guest({
    required String guestId,
    bool onboardingCompleted = false,
  })  : mode = SessionMode.localGuest,
        user = null,
        accessToken = null,
        localGuestId = guestId,
        isGuestOnboarded = onboardingCompleted,
        isLoading = false;

  const AuthSessionState.authenticated({
    required UserProfile profile,
    required String token,
  })  : mode = SessionMode.authenticated,
        user = profile,
        accessToken = token,
        localGuestId = null,
        isGuestOnboarded = false,
        isLoading = false;

  bool get isAuthenticated => mode == SessionMode.authenticated;
  bool get isLocalGuest => mode == SessionMode.localGuest;
  bool get isUnauthenticated => mode == SessionMode.unauthenticated;
  bool get onboardingCompleted =>
      mode == SessionMode.authenticated
          ? (user?.onboardingCompleted ?? false)
          : (mode == SessionMode.localGuest ? isGuestOnboarded : false);
}
