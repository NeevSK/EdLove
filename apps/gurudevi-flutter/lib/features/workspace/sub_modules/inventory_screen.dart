import 'package:flutter/material.dart';
import '../../../core/theme/tokens.g.dart';
import '../../../core/ui/guru_badge.dart';
import '../../../core/ui/guru_card.dart';
import '../../../core/ui/sanctuary/marked_line.dart';
import '../../../core/ui/sanctuary/room_page.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  String _activeTab = 'durable';

  @override
  Widget build(BuildContext context) {
    return RoomPage(
      title: 'Institutional Assets',
      intro: 'Durable equipment survey (Survey General 47) and consumable supplies.',
      markLabel: 'SURVEY 2026',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Segmented Switcher
          Row(
            children: [
              _SegmentButton(
                label: 'Durable Equipment',
                isSelected: _activeTab == 'durable',
                onTap: () => setState(() => _activeTab = 'durable'),
              ),
              const SizedBox(width: GuruSpacing.sm),
              _SegmentButton(
                label: 'Consumable Supplies',
                isSelected: _activeTab == 'consumable',
                onTap: () => setState(() => _activeTab = 'consumable'),
              ),
            ],
          ),
          const SizedBox(height: GuruSpacing.md),

          if (_activeTab == 'durable') ...[
            const GuruCard(
              backgroundColor: GuruColors.silk,
              elevated: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MarkedLine(
                    title: 'Compound Optical Microscope (Lab #2)',
                    detail: 'Location: Senior Bio Lab A • Custodian: P. Jayawardena • Survey: General 47',
                    markLabel: 'SERVICEABLE',
                    markTone: GuruBadgeVariant.success,
                  ),
                  Divider(),
                  MarkedLine(
                    title: 'Yamaha PA Portable Audio System',
                    detail: 'Location: Main Auditorium • Custodian: W. Perera (Music Dept)',
                    markLabel: 'SERVICEABLE',
                    markTone: GuruBadgeVariant.success,
                  ),
                  Divider(),
                  MarkedLine(
                    title: 'Mechanical Bench Lathe (Metalwork)',
                    detail: 'Location: Technical Workshop • Custodian: H. Silva (Workshop Head)',
                    markLabel: 'REPAIRABLE',
                    markTone: GuruBadgeVariant.warning,
                  ),
                ],
              ),
            ),
          ] else ...[
            const GuruCard(
              backgroundColor: GuruColors.silk,
              elevated: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  MarkedLine(
                    title: 'A4 Printing & Exam Paper',
                    detail: 'Remaining: 18 Reams • Reorder Threshold: 5 Reams • Store Room B',
                    markLabel: 'IN STOCK',
                    markTone: GuruBadgeVariant.success,
                  ),
                  Divider(),
                  MarkedLine(
                    title: 'Dilute Hydrochloric Acid (0.1M)',
                    detail: 'Remaining: 2.5 Liters • Reorder Threshold: 4.0 Liters • Fume Cabinet',
                    markLabel: 'LOW STOCK',
                    markTone: GuruBadgeVariant.error,
                  ),
                  Divider(),
                  MarkedLine(
                    title: 'First Aid Antiseptic Bandages',
                    detail: 'Remaining: 45 Packs • Reorder Threshold: 10 Packs • Sick Bay',
                    markLabel: 'IN STOCK',
                    markTone: GuruBadgeVariant.success,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SegmentButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _SegmentButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(GuruRadii.md),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? GuruColors.saffron : GuruColors.linen,
            borderRadius: BorderRadius.circular(GuruRadii.md),
            border: Border.all(
              color: isSelected ? GuruColors.saffron : GuruColors.border,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: isSelected ? Colors.white : GuruColors.ink,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
