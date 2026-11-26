import 'package:flutter/material.dart';
import '../../../core/theme/tokens.g.dart';
import '../../../core/ui/guru_badge.dart';
import '../../../core/ui/guru_card.dart';
import '../../../core/ui/sanctuary/marked_line.dart';
import '../../../core/ui/sanctuary/room_page.dart';

class WorkforceScreen extends StatelessWidget {
  const WorkforceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoomPage(
      title: 'Workforce & Delegations',
      intro: 'Staff capacities, institutional authority chains, and exam duty rosters.',
      markLabel: 'ROLES ACTIVE',
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
                  title: 'Sectional Head (Grade 10)',
                  detail: 'Educator: S. Bandara • Authority: Academic curricula and timetable approval',
                  markLabel: 'ACTIVE DELEGATION',
                  markTone: GuruBadgeVariant.success,
                ),
                Divider(),
                MarkedLine(
                  title: 'Term Examination Chief Supervisor',
                  detail: 'Educator: Priya Fernando • Authority: Hall security and paper custodianship',
                  markLabel: 'APPOINTED',
                  markTone: GuruBadgeVariant.info,
                ),
                Divider(),
                MarkedLine(
                  title: 'Disciplinary Committee Member',
                  detail: 'Educator: H. Silva • Authority: Pastoral and code-of-conduct reviews',
                  markLabel: 'ACTIVE',
                  markTone: GuruBadgeVariant.neutral,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
