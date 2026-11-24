import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../auth/auth_session_notifier.dart';
import '../routing/landing_policy.dart';
import '../../features/shell/app_shell.dart';
import '../../features/auth/welcome_screen.dart';
import '../../features/auth/onboarding_screen.dart';
import '../../features/library/library_screen.dart';
import '../../features/workspace/workspace_screen.dart';
import '../../features/workspace/sub_modules/peers_screen.dart';
import '../../features/workspace/sub_modules/events_screen.dart';
import '../../features/workspace/sub_modules/inventory_screen.dart';
import '../../features/workspace/sub_modules/welfare_screen.dart';
import '../../features/workspace/sub_modules/commercial_screen.dart';
import '../../features/workspace/sub_modules/workforce_screen.dart';
import '../../features/workspace/sub_modules/atlas_screen.dart';
import '../../features/self/self_screen.dart';
import '../../features/self/wisdom_screen.dart';
import '../../features/community/community_screen.dart';
import '../../features/profile/profile_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

GoRouter createAppRouter({
  required AuthSessionNotifier authNotifier,
  required LandingPolicy landingPolicy,
  String? initialLocation,
}) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: initialLocation ?? '/workspace',
    refreshListenable: authNotifier,
    redirect: (BuildContext context, GoRouterState state) {
      final session = authNotifier.state;
      if (session.isLoading) return null;

      final loc = state.matchedLocation;
      final isAuthFlow = loc == '/welcome' || loc == '/auth';
      final isOnboarding = loc == '/onboarding';

      // 1. Unauthenticated -> force Welcome
      if (session.isUnauthenticated) {
        return isAuthFlow ? null : '/welcome';
      }

      // 2. Authenticated but not onboarded -> force Onboarding
      if (!session.onboardingCompleted) {
        return isOnboarding ? null : '/onboarding';
      }

      // 3. Authenticated and onboarded, but still sitting in auth flow -> send to workspace
      if (isAuthFlow || isOnboarding) {
        return '/workspace';
      }

      return null; // Admitted to requested route
    },
    routes: [
      GoRoute(
        path: '/',
        redirect: (context, state) => '/workspace',
      ),
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // StatefulShellRoute maintains persistent bottom-tab branch state across all 5 rooms
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShell(navigationShell: navigationShell);
        },
        branches: [
          // Branch 0: Library
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/library',
                builder: (context, state) => const LibraryScreen(),
              ),
            ],
          ),

          // Branch 1: Workspace + 8 Domain Sub-Routes
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/workspace',
                builder: (context, state) => const WorkspaceScreen(),
                routes: [
                  GoRoute(
                    path: 'peers',
                    builder: (context, state) => const PeersScreen(),
                  ),
                  GoRoute(
                    path: 'events',
                    builder: (context, state) => const EventsScreen(),
                  ),
                  GoRoute(
                    path: 'inventory',
                    builder: (context, state) => const InventoryScreen(),
                  ),
                  GoRoute(
                    path: 'welfare',
                    builder: (context, state) => const WelfareScreen(),
                  ),
                  GoRoute(
                    path: 'commercial',
                    builder: (context, state) => const CommercialScreen(),
                    routes: [
                      GoRoute(
                        path: ':batchId',
                        builder: (context, state) => CommercialScreen(
                          batchId: state.pathParameters['batchId'],
                        ),
                      ),
                    ],
                  ),
                  GoRoute(
                    path: 'workforce-role',
                    builder: (context, state) => const WorkforceScreen(),
                  ),
                  GoRoute(
                    path: 'atlas',
                    builder: (context, state) => const AtlasScreen(),
                  ),
                ],
              ),
            ],
          ),

          // Branch 2: Self + Wisdom Sub-Route
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/self',
                builder: (context, state) => const SelfScreen(),
                routes: [
                  GoRoute(
                    path: 'wisdom/:id',
                    builder: (context, state) => WisdomScreen(
                      id: state.pathParameters['id'] ?? '1',
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Branch 3: Community
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/community',
                builder: (context, state) => const CommunityScreen(),
              ),
            ],
          ),

          // Branch 4: Profile
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

final landingPolicyProvider = Provider<LandingPolicy>((ref) {
  return const LandingPolicy(mode: LandingStrategyMode.lastActiveTab);
});

final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authSessionProvider);
  final policy = ref.watch(landingPolicyProvider);
  return createAppRouter(
    authNotifier: auth,
    landingPolicy: policy,
  );
});
