import 'package:flutter/material.dart';
import '../../theme/tokens.g.dart';
import '../guru_badge.dart';

class RoomPage extends StatelessWidget {
  final String title;
  final String? intro;
  final String? markLabel;
  final GuruBadgeVariant markTone;
  final Widget child;
  final List<Widget>? actions;

  const RoomPage({
    super.key,
    required this.title,
    this.intro,
    this.markLabel,
    this.markTone = GuruBadgeVariant.success,
    required this.child,
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GuruColors.vellum,
      appBar: AppBar(
        backgroundColor: GuruColors.vellum,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(
          title,
          style: const TextStyle(
            color: GuruColors.ink,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        actions: [
          if (markLabel != null)
            Padding(
              padding: const EdgeInsets.only(right: GuruSpacing.md),
              child: Center(
                child: GuruBadge(
                  label: markLabel!,
                  variant: markTone,
                ),
              ),
            ),
          ...?actions,
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(GuruSpacing.md),
          children: [
            if (intro != null) ...[
              Text(
                intro!,
                style: const TextStyle(
                  fontSize: 14,
                  color: GuruColors.inkSubtle,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: GuruSpacing.md),
            ],
            child,
          ],
        ),
      ),
    );
  }
}
