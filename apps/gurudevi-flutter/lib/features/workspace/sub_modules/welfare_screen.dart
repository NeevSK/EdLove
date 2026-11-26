import 'package:flutter/material.dart';
import '../../../core/theme/tokens.g.dart';
import '../../../core/ui/guru_badge.dart';
import '../../../core/ui/guru_card.dart';
import '../../../core/ui/sanctuary/marked_line.dart';
import '../../../core/ui/sanctuary/room_page.dart';

class WelfareScreen extends StatelessWidget {
  const WelfareScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoomPage(
      title: 'Student Welfare & Support',
      intro: 'Pastoral interventions, hardship grants, and attendance alerts.',
      markLabel: 'PASTORAL CARE',
      markTone: GuruBadgeVariant.info,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GuruCard(
            backgroundColor: GuruColors.silk,
            elevated: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                MarkedLine(
                  title: 'Prolonged Absence Notice (5+ Days)',
                  detail: 'Student: Dinithi Silva • Grade 10-A • SDS Welfare Officer follow-up assigned',
                  markLabel: 'ACTION REQUIRED',
                  markTone: GuruBadgeVariant.error,
                ),
                Divider(),
                MarkedLine(
                  title: 'Stationery & Uniform Support Subsidy',
                  detail: 'Beneficiary: Sahan Wickramasinghe • MoE Welfare Voucher issued',
                  markLabel: 'DISBURSED',
                  markTone: GuruBadgeVariant.success,
                ),
                Divider(),
                MarkedLine(
                  title: 'Midday Meal Nutrition Health Monitoring',
                  detail: 'Regular dietary screening by Public Health Inspector (PHI)',
                  markLabel: 'ACTIVE RECORD',
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
