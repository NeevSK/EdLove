import 'package:flutter/material.dart';
import '../../../core/theme/tokens.g.dart';
import '../../../core/ui/guru_badge.dart';
import '../../../core/ui/guru_card.dart';
import '../../../core/ui/sanctuary/marked_line.dart';
import '../../../core/ui/sanctuary/room_page.dart';
import '../../../core/ui/sanctuary/sanctuary_stats_card.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  int _headcount = 120;

  @override
  Widget build(BuildContext context) {
    // Dynamic math matching gurudevi-mobile/app/(tabs)/workspace/events.tsx
    final double riceKg = _headcount * 0.08; // 80g per child
    final double dhalKg = _headcount * 0.02; // 20g per child
    final int estimatedMealCostLkr = _headcount * 110; // 110 LKR statutory rate

    return RoomPage(
      title: 'Institutional Programs',
      intro: 'Daily nutritional programs, excursions, and facility schedules.',
      markLabel: 'QUIET SANCTUARY',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Daily Midday Nutrition
          GuruCard(
            backgroundColor: GuruColors.silk,
            elevated: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const MarkedLine(
                  title: 'Daily Midday Nutrition',
                  detail:
                      'Ministry of Education School Nutrition Grant allocation based on morning classroom attendance headcount.',
                  markLabel: 'DAILY CADENCE',
                  markTone: GuruBadgeVariant.warning,
                ),
                const SizedBox(height: GuruSpacing.md),

                // Headcount Stepper
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Present Students',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: GuruColors.inkSubtle,
                          ),
                        ),
                        Text(
                          '$_headcount Students',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: GuruColors.ink,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          color: GuruColors.saffron,
                          onPressed: () {
                            if (_headcount > 10) {
                              setState(() => _headcount -= 5);
                            }
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          color: GuruColors.saffron,
                          onPressed: () {
                            setState(() => _headcount += 5);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: GuruSpacing.md),

                // 3 Statutory Stats Cards
                Row(
                  children: [
                    Expanded(
                      child: SanctuaryStatsCard(
                        label: 'Rice Required',
                        value: '${riceKg.toStringAsFixed(1)} kg',
                        subtitle: '80g / child',
                        accentColor: GuruColors.saffron,
                      ),
                    ),
                    const SizedBox(width: GuruSpacing.sm),
                    Expanded(
                      child: SanctuaryStatsCard(
                        label: 'Dhal Required',
                        value: '${dhalKg.toStringAsFixed(1)} kg',
                        subtitle: '20g / child',
                        accentColor: GuruColors.livingGreen,
                      ),
                    ),
                    const SizedBox(width: GuruSpacing.sm),
                    Expanded(
                      child: SanctuaryStatsCard(
                        label: 'Budget (LKR)',
                        value: 'Rs. $estimatedMealCostLkr',
                        subtitle: '@ 110 LKR',
                        accentColor: GuruColors.info,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: GuruSpacing.md),

          // 2. Institutional Excursions & Events
          const GuruCard(
            backgroundColor: GuruColors.silk,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Upcoming Field Excursions',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: GuruColors.ink,
                  ),
                ),
                SizedBox(height: GuruSpacing.sm),
                MarkedLine(
                  title: 'Grade 10 Botanical & Geography Excursion',
                  detail:
                      'Peradeniya Botanical Gardens | 3 buses reserved | Parental consent active',
                  markLabel: 'CONFIRMED',
                  markTone: GuruBadgeVariant.success,
                ),
                Divider(),
                MarkedLine(
                  title: 'Inter-House Track & Field Meet',
                  detail:
                      'Main Athletic Grounds | Equipment: Starting blocks, hurdles, PA audio',
                  markLabel: 'GROUNDS RESERVED',
                  markTone: GuruBadgeVariant.info,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
