import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/auth/auth_session_notifier.dart';
import '../../core/auth/perspective_notifier.dart';
import '../../core/models/perspective.dart';
import '../../core/theme/tokens.g.dart';
import '../../core/ui/guru_button.dart';

class WelcomeScreen extends ConsumerWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: GuruColors.vellum,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Center(
                child: Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    color: GuruColors.saffron.withAlpha(35),
                    borderRadius: BorderRadius.circular(GuruRadii.lg),
                  ),
                  child: const Icon(
                    Icons.auto_stories,
                    size: 48,
                    color: GuruColors.saffron,
                  ),
                ),
              ),
              const SizedBox(height: GuruSpacing.lg),
              const Text(
                'Gurudevi Flagship',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: GuruColors.ink,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: GuruSpacing.sm),
              const Text(
                'The daily operational haven for teachers, students, and school leaders.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: GuruColors.inkSubtle,
                  height: 1.4,
                ),
              ),
              const Spacer(),
              GuruButton(
                label: 'Sign In as Teacher',
                variant: GuruButtonVariant.primary,
                icon: Icons.login,
                onPressed: () async {
                  await ref.read(perspectiveProvider).setAvailableBonds([
                    const Bond(
                      id: 'bond-school-1',
                      entityType: 'SCHOOL',
                      entityId: 'school-stmarys',
                      entityName: "St. Mary's Academy",
                      capacity: 'Teacher',
                    ),
                    const Bond(
                      id: 'bond-school-2',
                      entityType: 'SCHOOL',
                      entityId: 'school-royal',
                      entityName: 'Royal College',
                      capacity: 'Parent',
                    ),
                  ]);

                  await ref.read(authSessionProvider).signInWithCredentials(
                        email: 'teacher@gurudevi.app',
                        displayName: 'Priya Fernando',
                        capacity: 'Teacher',
                      );

                  if (context.mounted) {
                    context.go('/workspace');
                  }
                },
              ),
              const SizedBox(height: GuruSpacing.sm),
              GuruButton(
                label: 'Try as Local Guest (Offline Trial)',
                variant: GuruButtonVariant.outline,
                icon: Icons.explore_outlined,
                onPressed: () async {
                  await ref.read(authSessionProvider).startGuestTrial();
                  if (context.mounted) {
                    context.go('/onboarding');
                  }
                },
              ),
              const SizedBox(height: GuruSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }
}
