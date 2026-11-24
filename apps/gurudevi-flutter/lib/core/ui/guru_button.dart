import 'package:flutter/material.dart';
import '../theme/tokens.g.dart';

enum GuruButtonVariant { primary, secondary, subtle, outline }

class GuruButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final GuruButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final double? width;

  const GuruButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = GuruButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    BorderSide side = BorderSide.none;

    switch (variant) {
      case GuruButtonVariant.primary:
        bg = GuruColors.saffron;
        fg = Colors.white;
        break;
      case GuruButtonVariant.secondary:
        bg = GuruColors.daluGreen;
        fg = GuruColors.ink;
        break;
      case GuruButtonVariant.subtle:
        bg = GuruColors.linen;
        fg = GuruColors.ink;
        break;
      case GuruButtonVariant.outline:
        bg = Colors.transparent;
        fg = GuruColors.ink;
        side = const BorderSide(color: GuruColors.borderStrong, width: 1.2);
        break;
    }

    Widget content = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(fg),
            ),
          ),
          const SizedBox(width: 8),
        ] else if (icon != null) ...[
          Icon(icon, size: 18, color: fg),
          const SizedBox(width: 8),
        ],
        Text(
          label,
          style: TextStyle(
            color: fg,
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ],
    );

    return SizedBox(
      width: width,
      height: GuruTouch.minTouchTarget,
      child: Material(
        color: onPressed == null ? bg.withAlpha(120) : bg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(GuruRadii.md),
          side: side,
        ),
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(GuruRadii.md),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: GuruSpacing.md),
            child: Center(child: content),
          ),
        ),
      ),
    );
  }
}
