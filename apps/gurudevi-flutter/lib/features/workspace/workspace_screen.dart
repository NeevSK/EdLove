import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/auth/auth_session_notifier.dart';
import '../../core/auth/perspective_notifier.dart';
import '../../core/database/powersync_manager.dart';
import '../../core/models/perspective.dart';
import '../../core/theme/tokens.g.dart';
import '../../core/ui/guru_badge.dart';
import '../../core/ui/guru_button.dart';
import '../../core/ui/guru_card.dart';
import 'models/workspace_state.dart';

class WorkspaceScreen extends ConsumerWidget {
  const WorkspaceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final perspective = ref.watch(perspectiveProvider).activePerspective;
    final session = ref.watch(authSessionProvider).state;
    final isGuest = session.isLocalGuest;

    final studentsAsync = ref.watch(classroomStudentsStreamProvider('cls-10a'));
    final db = ref.watch(databaseProvider);

    // Derive typed Dart 3 sealed UI state
    final WorkspaceUiState uiState = studentsAsync.when(
      data: (students) => WorkspaceReady(
        students: students,
        perspective: perspective,
        presentCount:
            students.where((s) => s.status.toLowerCase() == 'present').length,
        totalCount: students.length,
        isGuest: isGuest,
      ),
      loading: () => const WorkspaceLoading(),
      error: (e, _) => WorkspaceError(e.toString()),
    );

    // Exhaustive Dart 3 pattern match
    return Scaffold(
      backgroundColor: GuruColors.vellum,
      body: switch (uiState) {
        WorkspaceLoading() => const Center(
            child: CircularProgressIndicator(color: GuruColors.saffron),
          ),
        WorkspaceError(:final message) => Center(
            child: GuruCard(
              backgroundColor: GuruColors.errorSurface,
              child: Text(
                'Database Error: $message',
                style: const TextStyle(color: GuruColors.error),
              ),
            ),
          ),
        WorkspaceReady(
          :final students,
          :final perspective,
          :final presentCount,
          :final totalCount,
          :final presentPercentage,
          :final isGuest,
        ) =>
          CustomScrollView(
            slivers: [
              // 1. Operational Context Banner
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    GuruSpacing.md,
                    GuruSpacing.md,
                    GuruSpacing.md,
                    GuruSpacing.sm,
                  ),
                  child: GuruCard(
                    backgroundColor: GuruColors.silk,
                    elevated: true,
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: GuruColors.saffron.withAlpha(30),
                            borderRadius: BorderRadius.circular(GuruRadii.md),
                          ),
                          child: const Icon(Icons.school, color: GuruColors.saffron),
                        ),
                        const SizedBox(width: GuruSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                perspective.kind == PerspectiveKind.institutional
                                    ? (perspective.schoolName ?? 'Institutional Workspace')
                                    : 'Personal Practice Sanctuary',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15,
                                  color: GuruColors.ink,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                isGuest
                                    ? 'Local Offline Guest Trial'
                                    : 'Active as ${perspective.capacity ?? "Educator"}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: GuruColors.inkSubtle,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const GuruBadge(
                          label: 'DRIFT SQLITE',
                          variant: GuruBadgeVariant.success,
                          icon: Icons.check_circle_outline,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // 1b. Domain Module Navigation Strip
              SliverToBoxAdapter(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: GuruSpacing.md),
                  child: Row(
                    children: [
                      _ModulePill(
                        label: 'Nutrition & Events',
                        icon: Icons.event_available,
                        onTap: () => context.push('/workspace/events'),
                      ),
                      _ModulePill(
                        label: 'Peer Mesh',
                        icon: Icons.hub,
                        onTap: () => context.push('/workspace/peers'),
                      ),
                      _ModulePill(
                        label: 'Assets & Lab',
                        icon: Icons.inventory_2_outlined,
                        onTap: () => context.push('/workspace/inventory'),
                      ),
                      _ModulePill(
                        label: 'Student Welfare',
                        icon: Icons.health_and_safety_outlined,
                        onTap: () => context.push('/workspace/welfare'),
                      ),
                      _ModulePill(
                        label: 'Fee Batches',
                        icon: Icons.receipt_long_outlined,
                        onTap: () => context.push('/workspace/commercial'),
                      ),
                      _ModulePill(
                        label: 'Roles & Staff',
                        icon: Icons.badge_outlined,
                        onTap: () => context.push('/workspace/workforce-role'),
                      ),
                      _ModulePill(
                        label: 'Campus Atlas',
                        icon: Icons.map_outlined,
                        onTap: () => context.push('/workspace/atlas'),
                      ),
                    ],
                  ),
                ),
              ),

              // 2. Roster Section Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    GuruSpacing.md,
                    GuruSpacing.md,
                    GuruSpacing.md,
                    GuruSpacing.xs,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Grade 10-A Attendance',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: GuruColors.ink,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: GuruColors.linen,
                          borderRadius: BorderRadius.circular(GuruRadii.full),
                          border: Border.all(color: GuruColors.border),
                        ),
                        child: Text(
                          '$presentCount/$totalCount Present ($presentPercentage%)',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: GuruColors.ink,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 4. Viewport-Virtualised Student Roster
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: GuruSpacing.md),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final student = students[index];
                      final isPresent =
                          student.status.toLowerCase() == 'present';

                      return Padding(
                        padding: const EdgeInsets.only(top: GuruSpacing.sm),
                        child: GuruCard(
                          backgroundColor: GuruColors.silk,
                          padding: const EdgeInsets.symmetric(
                            horizontal: GuruSpacing.md,
                            vertical: GuruSpacing.sm,
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: isPresent
                                    ? GuruColors.daluGreen.withAlpha(40)
                                    : GuruColors.linen,
                                child: Text(
                                  student.fullName.isNotEmpty
                                      ? student.fullName[0]
                                      : 'S',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: isPresent
                                        ? GuruColors.success
                                        : GuruColors.inkSubtle,
                                  ),
                                ),
                              ),
                              const SizedBox(width: GuruSpacing.md),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      student.fullName,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 15,
                                        color: GuruColors.ink,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Row(
                                      children: [
                                        GuruBadge(
                                          label: student.status.toUpperCase(),
                                          variant: isPresent
                                              ? GuruBadgeVariant.success
                                              : GuruBadgeVariant.error,
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          student.rollNumber != null
                                              ? 'Roll #${student.rollNumber}'
                                              : 'Roll #${index + 1}',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: GuruColors.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              GuruButton(
                                label: isPresent ? 'Mark Absent' : 'Mark Present',
                                variant: isPresent
                                    ? GuruButtonVariant.subtle
                                    : GuruButtonVariant.primary,
                                onPressed: () {
                                  db.toggleAttendance(
                                    student.id,
                                    isPresent ? 'absent' : 'present',
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                    childCount: students.length,
                  ),
                ),
              ),

              // 5. Timetable Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(GuruSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Today's Timetable",
                        style: TextStyle(
                          fontSize: 17,
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
                                color: GuruColors.atmosphericTeal.withAlpha(30),
                                borderRadius: BorderRadius.circular(GuruRadii.md),
                              ),
                              child: const Icon(
                                Icons.schedule,
                                color: GuruColors.info,
                                size: 22,
                              ),
                            ),
                            const SizedBox(width: GuruSpacing.md),
                            const Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Period 3: Physics (Room 102)',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                      color: GuruColors.ink,
                                    ),
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    '10:15 AM - 11:00 AM • Next Up',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: GuruColors.inkSubtle,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const GuruBadge(
                              label: 'IN 20 MIN',
                              variant: GuruBadgeVariant.warning,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
      },
    );
  }
}

class _ModulePill extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _ModulePill({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: GuruSpacing.sm),
      child: Material(
        color: GuruColors.silk,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(GuruRadii.full),
          side: const BorderSide(color: GuruColors.border),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(GuruRadii.full),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 15, color: GuruColors.saffron),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: GuruColors.ink,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
