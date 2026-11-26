import 'package:flutter/material.dart';
import '../../core/theme/tokens.g.dart';
import '../../core/ui/guru_card.dart';
import '../../core/ui/sanctuary/room_page.dart';

class WisdomScreen extends StatelessWidget {
  final String id;

  const WisdomScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    return RoomPage(
      title: 'Mindful Wisdom Reflection',
      intro: 'Contemplative lessons on teacher patience, equanimity, and cognitive grounding.',
      markLabel: 'WISDOM ARCHIVE',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GuruCard(
            backgroundColor: GuruColors.silk,
            elevated: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Lesson #$id: The Equanimous Classroom Presence',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GuruColors.ink,
                  ),
                ),
                const SizedBox(height: GuruSpacing.sm),
                const Text(
                  'When classroom energy becomes chaotic or restless, the educator serves as the grounding anchor. Rather than meeting reactivity with tension, return to the breath for 3 intentional cycles. Your stillness establishes the ambient calm.',
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.5,
                    color: GuruColors.inkSubtle,
                  ),
                ),
                const SizedBox(height: GuruSpacing.lg),
                Container(
                  padding: const EdgeInsets.all(GuruSpacing.md),
                  decoration: BoxDecoration(
                    color: GuruColors.linen,
                    borderRadius: BorderRadius.circular(GuruRadii.md),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.format_quote, color: GuruColors.saffron),
                      SizedBox(width: GuruSpacing.sm),
                      Expanded(
                        child: Text(
                          '"Quiet the mind, and the classroom finds its balance."',
                          style: TextStyle(
                            fontStyle: FontStyle.italic,
                            fontSize: 13,
                            color: GuruColors.ink,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
