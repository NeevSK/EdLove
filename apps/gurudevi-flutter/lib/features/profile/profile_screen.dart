import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/auth/auth_session_notifier.dart';
import '../../core/auth/perspective_notifier.dart';
import '../../core/theme/tokens.g.dart';
import '../../core/ui/guru_badge.dart';
import '../../core/ui/guru_button.dart';
import '../../core/ui/guru_card.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authSessionProvider).state;
    final user = session.user;
    final perspective = ref.watch(perspectiveProvider).activePerspective;

    return Scaffold(
      backgroundColor: GuruColors.vellum,
      appBar: AppBar(
        title: const Text('Account Profile'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: GuruSpacing.md),
            child: Center(
              child: GuruBadge(
                label: 'SECURE',
                variant: GuruBadgeVariant.success,
                icon: Icons.shield_outlined,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(GuruSpacing.md),
        children: [
          // Profile Avatar Card
          GuruCard(
            backgroundColor: GuruColors.silk,
            elevated: true,
            child: Column(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: GuruColors.saffron.withAlpha(35),
                  child: Text(
                    (user?.displayName ?? 'G')[0].toUpperCase(),
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: GuruColors.saffron,
                    ),
                  ),
                ),
                const SizedBox(height: GuruSpacing.sm),
                Text(
                  user?.displayName ??
                      (session.isLocalGuest ? 'Guest Educator' : 'Gurudevi Member'),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GuruColors.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  session.isLocalGuest
                      ? 'Local Offline Sanctuary Mode'
                      : (user?.email ?? 'Verified Account'),
                  style: const TextStyle(
                    fontSize: 13,
                    color: GuruColors.inkSubtle,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: GuruSpacing.lg),

          const Text(
            'Operational Lens & Capacity',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: GuruColors.ink,
            ),
          ),
          const SizedBox(height: GuruSpacing.sm),

          GuruCard(
            backgroundColor: GuruColors.silk,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: GuruColors.linen,
                    borderRadius: BorderRadius.circular(GuruRadii.md),
                  ),
                  child: const Icon(
                    Icons.badge_outlined,
                    color: GuruColors.ink,
                    size: 20,
                  ),
                ),
                const SizedBox(width: GuruSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Active Operating Lens',
                        style: TextStyle(
                          fontSize: 12,
                          color: GuruColors.inkSubtle,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        perspective.label,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: GuruColors.ink,
                        ),
                      ),
                    ],
                  ),
                ),
                GuruBadge(
                  label: perspective.capacity ?? 'MEMBER',
                  variant: GuruBadgeVariant.info,
                ),
              ],
            ),
          ),
          const SizedBox(height: GuruSpacing.xl),

          // Sign Out Button
          GuruButton(
            label: 'Sign Out Session',
            variant: GuruButtonVariant.outline,
            icon: Icons.logout,
            onPressed: () async {
              await ref.read(authSessionProvider).signOut();
            },
          ),
        ],
      ),
    );
  }
}
