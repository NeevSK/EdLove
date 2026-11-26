import 'package:flutter/material.dart';
import '../theme/tokens.g.dart';

class GuruCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final Color? borderColor;
  final bool elevated;

  const GuruCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(GuruSpacing.md),
    this.onTap,
    this.backgroundColor,
    this.borderColor,
    this.elevated = false,
  });

  @override
  Widget build(BuildContext context) {
    final cardContent = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor ?? GuruColors.silk,
        borderRadius: BorderRadius.circular(GuruRadii.md),
        border: Border.all(
          color: borderColor ?? GuruColors.border,
          width: 1,
        ),
        boxShadow: elevated
            ? const [
                BoxShadow(
                  color: GuruColors.shadowViolet,
                  blurRadius: 10,
                  offset: Offset(0, 4),
                )
              ]
            : null,
      ),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(GuruRadii.md),
          child: cardContent,
        ),
      );
    }

    return cardContent;
  }
}
