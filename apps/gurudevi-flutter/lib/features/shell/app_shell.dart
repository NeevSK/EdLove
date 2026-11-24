import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/auth/perspective_notifier.dart';
import '../../core/models/perspective.dart';
import '../../core/theme/tokens.g.dart';

class AppShell extends ConsumerWidget {
  final StatefulNavigationShell navigationShell;

  const AppShell({
    super.key,
    required this.navigationShell,
  });

  void _onTap(BuildContext context, int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  void _showPerspectiveSwitcher(BuildContext context, WidgetRef ref) {
    final perspectiveState = ref.read(perspectiveProvider);
    final active = perspectiveState.activePerspective;
    final available = perspectiveState.availablePerspectives;

    showModalBottomSheet(
      context: context,
      backgroundColor: GuruColors.silk,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(GuruRadii.lg)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              vertical: GuruSpacing.lg,
              horizontal: GuruSpacing.md,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Switch Operating Perspective',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GuruColors.ink,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Choose the institutional school or personal space you wish to act within.',
                  style: TextStyle(fontSize: 13, color: GuruColors.inkSubtle),
                ),
                const SizedBox(height: GuruSpacing.md),
                ...available.map((p) {
                  final isSelected = p.id == active.id;
                  return Container(
                    margin: const EdgeInsets.only(bottom: GuruSpacing.xs),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? GuruColors.saffron.withAlpha(25)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(GuruRadii.md),
                      border: Border.all(
                        color: isSelected
                            ? GuruColors.saffron.withAlpha(80)
                            : Colors.transparent,
                      ),
                    ),
                    child: ListTile(
                      leading: Icon(
                        p.kind == PerspectiveKind.personal
                            ? Icons.spa_outlined
                            : Icons.school_outlined,
                        color: isSelected ? GuruColors.saffron : GuruColors.inkSubtle,
                      ),
                      title: Text(
                        p.label,
                        style: TextStyle(
                          color: GuruColors.ink,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                      trailing: isSelected
                          ? const Icon(Icons.check_circle, color: GuruColors.saffron)
                          : null,
                      onTap: () {
                        ref.read(perspectiveProvider).switchPerspective(p.id);
                        Navigator.pop(ctx);
                      },
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final perspective = ref.watch(perspectiveProvider).activePerspective;

    return Scaffold(
      backgroundColor: GuruColors.vellum,
      appBar: AppBar(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: GuruColors.vellum,
        title: GestureDetector(
          onTap: () => _showPerspectiveSwitcher(context, ref),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: GuruColors.silk,
              borderRadius: BorderRadius.circular(GuruRadii.full),
              border: Border.all(color: GuruColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  perspective.kind == PerspectiveKind.personal
                      ? Icons.spa
                      : Icons.school,
                  size: 16,
                  color: GuruColors.saffron,
                ),
                const SizedBox(width: 8),
                Text(
                  perspective.label,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: GuruColors.ink,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  Icons.keyboard_arrow_down,
                  size: 16,
                  color: GuruColors.inkSubtle,
                ),
              ],
            ),
          ),
        ),
      ),
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: GuruColors.border, width: 1)),
        ),
        child: NavigationBar(
          backgroundColor: GuruColors.vellum,
          elevation: 0,
          indicatorColor: GuruColors.saffron.withAlpha(40),
          selectedIndex: navigationShell.currentIndex,
          onDestinationSelected: (index) => _onTap(context, index),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.local_library_outlined),
              selectedIcon: Icon(Icons.local_library, color: GuruColors.saffron),
              label: 'Library',
            ),
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard, color: GuruColors.saffron),
              label: 'Workspace',
            ),
            NavigationDestination(
              icon: Icon(Icons.spa_outlined),
              selectedIcon: Icon(Icons.spa, color: GuruColors.saffron),
              label: 'Self',
            ),
            NavigationDestination(
              icon: Icon(Icons.groups_outlined),
              selectedIcon: Icon(Icons.groups, color: GuruColors.saffron),
              label: 'Community',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: GuruColors.saffron),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
