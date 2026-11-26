import 'package:flutter/material.dart';
import '../../theme/tokens.g.dart';
import '../guru_card.dart';

class SanctuaryStatsCard extends StatelessWidget {
  final String label;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? accentColor;

  const SanctuaryStatsCard({
    super.key,
    required this.label,
    required this.value,
    this.subtitle,
    this.icon,
    this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = accentColor ?? GuruColors.saffron;

    return GuruCard(
      backgroundColor: GuruColors.silk,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: GuruColors.inkSubtle,
                ),
              ),
              if (icon != null)
                Icon(icon, size: 16, color: activeColor),
            ],
          ),
          const SizedBox(height: GuruSpacing.xs),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: activeColor,
              letterSpacing: -0.5,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(
              subtitle!,
              style: const TextStyle(
                fontSize: 12,
                color: GuruColors.textMuted,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
