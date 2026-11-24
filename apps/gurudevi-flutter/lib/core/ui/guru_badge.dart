import 'package:flutter/material.dart';
import '../theme/tokens.g.dart';

enum GuruBadgeVariant { success, error, warning, info, neutral }

class GuruBadge extends StatelessWidget {
  final String label;
  final GuruBadgeVariant variant;
  final IconData? icon;

  const GuruBadge({
    super.key,
    required this.label,
    this.variant = GuruBadgeVariant.neutral,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    Color border;

    switch (variant) {
      case GuruBadgeVariant.success:
        bg = GuruColors.daluGreen.withAlpha(40);
        fg = GuruColors.success;
        border = GuruColors.success.withAlpha(80);
        break;
      case GuruBadgeVariant.error:
        bg = GuruColors.errorSurface;
        fg = GuruColors.error;
        border = GuruColors.error.withAlpha(80);
        break;
      case GuruBadgeVariant.warning:
        bg = GuruColors.warning.withAlpha(40);
        fg = GuruColors.warning;
        border = GuruColors.warning.withAlpha(80);
        break;
      case GuruBadgeVariant.info:
        bg = GuruColors.atmosphericTeal.withAlpha(40);
        fg = GuruColors.info;
        border = GuruColors.atmosphericTeal.withAlpha(80);
        break;
      case GuruBadgeVariant.neutral:
        bg = GuruColors.linen;
        fg = GuruColors.inkSubtle;
        border = GuruColors.border;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(GuruRadii.full),
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: fg,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
