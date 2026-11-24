import 'package:flutter/material.dart';
import '../../core/theme/tokens.g.dart';
import '../../core/ui/guru_badge.dart';
import '../../core/ui/guru_card.dart';

class SelfScreen extends StatefulWidget {
  const SelfScreen({super.key});

  @override
  State<SelfScreen> createState() => _SelfScreenState();
}

class _SelfScreenState extends State<SelfScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _breathController;
  String _selectedMood = 'Grounded';

  @override
  void initState() {
    super.initState();
    // 8-second rhythmic breathing loop (4s expand, 4s contract)
    _breathController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _breathController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GuruColors.vellum,
      appBar: AppBar(
        title: const Text('The Personal Sanctuary'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: GuruSpacing.md),
            child: Center(
              child: GuruBadge(
                label: 'WELLBEING',
                variant: GuruBadgeVariant.success,
                icon: Icons.spa,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(GuruSpacing.md),
        children: [
          // Subtitle
          const Text(
            'A quiet space for educator wellbeing, mindful reflection, and energy calibration.',
            style: TextStyle(
              fontSize: 14,
              color: GuruColors.inkSubtle,
              height: 1.4,
            ),
          ),
          const SizedBox(height: GuruSpacing.lg),

          // 1. Mindful Breathing Guide with Impeller-Optimized CustomPainter
          GuruCard(
            backgroundColor: GuruColors.silk,
            elevated: true,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      '2-Minute Coherent Breath',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        color: GuruColors.ink,
                      ),
                    ),
                    AnimatedBuilder(
                      animation: _breathController,
                      builder: (context, _) {
                        final isInhale = _breathController.status ==
                                AnimationStatus.forward;
                        return GuruBadge(
                          label: isInhale ? 'INHALE' : 'EXHALE',
                          variant: isInhale
                              ? GuruBadgeVariant.info
                              : GuruBadgeVariant.success,
                        );
                      },
                    ),
                  ],
                ),
                const SizedBox(height: GuruSpacing.lg),

                // Animated Orb
                SizedBox(
                  height: 180,
                  child: Center(
                    child: AnimatedBuilder(
                      animation: _breathController,
                      builder: (context, _) {
                        return CustomPaint(
                          size: const Size(180, 180),
                          painter: BreathingOrbPainter(
                            progress: _breathController.value,
                          ),
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: GuruSpacing.md),
                const Text(
                  'Inhale ease... Exhale tension',
                  style: TextStyle(
                    fontSize: 13,
                    fontStyle: FontStyle.italic,
                    color: GuruColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: GuruSpacing.md),

          // 2. Midday Energy Check-in
          GuruCard(
            backgroundColor: GuruColors.silk,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.self_improvement, color: GuruColors.saffron),
                    SizedBox(width: GuruSpacing.sm),
                    Text(
                      'Midday Energy Check-in',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: GuruColors.ink,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: GuruSpacing.sm),
                const Text(
                  'How are you feeling in this classroom moment?',
                  style: TextStyle(fontSize: 13, color: GuruColors.inkSubtle),
                ),
                const SizedBox(height: GuruSpacing.md),
                Wrap(
                  spacing: GuruSpacing.sm,
                  runSpacing: GuruSpacing.sm,
                  children: ['Calm', 'Grounded', 'Restless', 'Fatigued'].map((mood) {
                    final isSelected = _selectedMood == mood;
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _selectedMood = mood;
                        });
                      },
                      borderRadius: BorderRadius.circular(GuruRadii.full),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? GuruColors.saffron
                              : GuruColors.linen,
                          borderRadius: BorderRadius.circular(GuruRadii.full),
                          border: Border.all(
                            color: isSelected
                                ? GuruColors.saffron
                                : GuruColors.border,
                          ),
                        ),
                        child: Text(
                          mood,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isSelected ? Colors.white : GuruColors.ink,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Impeller-accelerated GPU canvas painter for smooth 120Hz breath orb
class BreathingOrbPainter extends CustomPainter {
  final double progress;

  BreathingOrbPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final baseRadius = size.width * 0.22;
    final currentRadius = baseRadius + (progress * 26);

    // Outer atmospheric aura
    final auraPaint = Paint()
      ..color = GuruColors.atmosphericTeal.withAlpha((35 + (progress * 25)).toInt())
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, currentRadius + 18, auraPaint);

    // Mid living-green ring
    final midPaint = Paint()
      ..color = GuruColors.livingGreen.withAlpha((60 + (progress * 30)).toInt())
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, currentRadius + 8, midPaint);

    // Inner core orb
    final coreGradient = RadialGradient(
      colors: [
        GuruColors.saffron.withAlpha(200),
        GuruColors.saffron,
      ],
    );
    final corePaint = Paint()
      ..shader = coreGradient.createShader(
        Rect.fromCircle(center: center, radius: currentRadius),
      );
    canvas.drawCircle(center, currentRadius, corePaint);

    // Center focal light
    final focalPaint = Paint()
      ..color = Colors.white.withAlpha(160)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, 6, focalPaint);
  }

  @override
  bool shouldRepaint(covariant BreathingOrbPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
