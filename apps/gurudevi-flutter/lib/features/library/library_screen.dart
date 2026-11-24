import 'package:flutter/material.dart';
import '../../core/theme/tokens.g.dart';
import '../../core/ui/guru_card.dart';
import '../../core/ui/sanctuary/room_page.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return RoomPage(
      title: 'The Library',
      intro: 'Curated learning documents, curriculum lesson guides, and audio-visual archives.',
      markLabel: 'ARCHIVES ACTIVE',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GuruCard(
            backgroundColor: GuruColors.silk,
            elevated: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: GuruColors.saffron.withAlpha(35),
                        borderRadius: BorderRadius.circular(GuruRadii.md),
                      ),
                      child: const Icon(
                        Icons.auto_stories,
                        color: GuruColors.saffron,
                      ),
                    ),
                    const SizedBox(width: GuruSpacing.md),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Curriculum Resource Center',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: GuruColors.ink,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'National Syllabus Grades 6-11 (Sinhala / Tamil / English)',
                            style: TextStyle(
                              fontSize: 13,
                              color: GuruColors.inkSubtle,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: GuruSpacing.md),
                const Divider(),
                const SizedBox(height: GuruSpacing.sm),
                const Text(
                  'Featured Collections:',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: GuruColors.ink,
                  ),
                ),
                const SizedBox(height: GuruSpacing.sm),
                const _ResourceTile(
                  title: 'Grade 10 Science Practice Lab Handbook',
                  subtitle: 'PDF Document • 4.2 MB • Offline Cached',
                  icon: Icons.picture_as_pdf_outlined,
                ),
                const _ResourceTile(
                  title: 'Mathematics Geometry Axioms & Proofs',
                  subtitle: 'Interactive Reader • 1.8 MB',
                  icon: Icons.menu_book_outlined,
                ),
                const _ResourceTile(
                  title: 'Sinhala Literature Classical Anthologies',
                  subtitle: 'Audio Narrations • 12 Tracks',
                  icon: Icons.headphones_outlined,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ResourceTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;

  const _ResourceTile({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          Icon(icon, size: 20, color: GuruColors.saffron),
          const SizedBox(width: GuruSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: GuruColors.ink,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: GuruColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios, size: 12, color: GuruColors.textMuted),
        ],
      ),
    );
  }
}
