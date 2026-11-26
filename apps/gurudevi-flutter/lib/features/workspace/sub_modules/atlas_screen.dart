import 'package:flutter/material.dart';
import '../../../core/theme/tokens.g.dart';
import '../../../core/ui/guru_badge.dart';
import '../../../core/ui/guru_card.dart';
import '../../../core/ui/sanctuary/marked_line.dart';
import '../../../core/ui/sanctuary/room_page.dart';

class AtlasScreen extends StatelessWidget {
  const AtlasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RoomPage(
      title: 'Campus Spatial Atlas',
      intro: 'Geographical building locators, evacuation routes, and facility zoning.',
      markLabel: 'CAMPUS MAP',
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
                  title: 'Senior Science Wing (Block C)',
                  detail: 'Ground Floor: Biology Labs • First Floor: Chemistry & Physics • Room 102',
                  markLabel: 'ACADEMIC ZONE',
                  markTone: GuruBadgeVariant.info,
                ),
                Divider(),
                MarkedLine(
                  title: 'Main Quadrangle & Assembly Grounds',
                  detail: 'Primary gathering zone, Flagmast, and Morning Assembly shelter',
                  markLabel: 'OPEN COMMONS',
                  markTone: GuruBadgeVariant.success,
                ),
                Divider(),
                MarkedLine(
                  title: 'Technical Vocational Workshops',
                  detail: 'Carpentry, Metalwork, Technical Drawing Studio, and Agro-Lab',
                  markLabel: 'TECHNICAL ZONE',
                  markTone: GuruBadgeVariant.warning,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
