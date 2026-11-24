import 'package:flutter/material.dart';
import '../../theme/tokens.g.dart';
import '../guru_badge.dart';

class MarkedLine extends StatelessWidget {
  final String title;
  final String? detail;
  final String? markLabel;
  final GuruBadgeVariant markTone;
  final VoidCallback? onTap;

  const MarkedLine({
    super.key,
    required this.title,
    this.detail,
    this.markLabel,
    this.markTone = GuruBadgeVariant.neutral,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(GuruRadii.md),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: GuruSpacing.sm),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                      color: GuruColors.ink,
                    ),
                  ),
                  if (detail != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      detail!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: GuruColors.inkSubtle,
                        height: 1.3,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (markLabel != null) ...[
              const SizedBox(width: GuruSpacing.sm),
              GuruBadge(label: markLabel!, variant: markTone),
            ],
          ],
        ),
      ),
    );
  }
}
