import 'package:flutter/material.dart';
import '../../core/theme/tokens.g.dart';
import '../../core/ui/guru_card.dart';
import '../../core/ui/sanctuary/marked_line.dart';
import '../../core/ui/sanctuary/room_page.dart';

class CommunityScreen extends StatelessWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return RoomPage(
      title: 'Community Presence',
      intro: 'Regional educator circles, verified parent inquiries, and school announcements.',
      markLabel: 'COMMUNITY ACTIVE',
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
                        color: GuruColors.livingGreen.withAlpha(35),
                        borderRadius: BorderRadius.circular(GuruRadii.md),
                      ),
                      child: const Icon(
                        Icons.groups,
                        color: GuruColors.livingGreen,
                      ),
                    ),
                    const SizedBox(width: GuruSpacing.md),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Institutional Circles',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: GuruColors.ink,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Central Province Science Educators Network',
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
                const MarkedLine(
                  title: 'Grade 10 Lab Syllabus Alignment',
                  detail: 'Teacher Bandara: "Shared updated term test practical questions for Review 2."',
                  markLabel: '20 MIN AGO',
                ),
                const MarkedLine(
                  title: 'School Development Society Meeting',
                  detail: 'Principal: "Quarterly facility upgrade proposals scheduled for Friday 3:00 PM."',
                  markLabel: 'YESTERDAY',
                ),
                const MarkedLine(
                  title: 'Annual Sports Meet Audio Setup',
                  detail: 'Physical Education Dept: "Equipment request submitted for PA audio speaker hire."',
                  markLabel: 'RESOLVED',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
