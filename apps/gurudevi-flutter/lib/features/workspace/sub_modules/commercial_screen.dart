import 'package:flutter/material.dart';
import '../../../core/theme/tokens.g.dart';
import '../../../core/ui/guru_badge.dart';
import '../../../core/ui/guru_card.dart';
import '../../../core/ui/sanctuary/marked_line.dart';
import '../../../core/ui/sanctuary/room_page.dart';
import '../../../core/ui/sanctuary/sanctuary_stats_card.dart';

class CommercialScreen extends StatelessWidget {
  final String? batchId;

  const CommercialScreen({super.key, this.batchId});

  @override
  Widget build(BuildContext context) {
    return RoomPage(
      title: 'Commercial & Fee Batches',
      intro: 'School Development Society (SDS) facility fees and tuition reconciliation.',
      markLabel: 'SDS BATCH',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Row(
            children: [
              Expanded(
                child: SanctuaryStatsCard(
                  label: 'Total Collected',
                  value: 'Rs. 248,500',
                  subtitle: 'Term 1 SDS Facility',
                  accentColor: GuruColors.success,
                ),
              ),
              SizedBox(width: GuruSpacing.sm),
              Expanded(
                child: SanctuaryStatsCard(
                  label: 'Outstanding',
                  value: 'Rs. 32,000',
                  subtitle: '8 Unreconciled',
                  accentColor: GuruColors.error,
                ),
              ),
            ],
          ),
          const SizedBox(height: GuruSpacing.md),

          GuruCard(
            backgroundColor: GuruColors.silk,
            elevated: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  batchId != null ? 'Batch: $batchId' : 'Recent Facility Receipts',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: GuruColors.ink,
                  ),
                ),
                const SizedBox(height: GuruSpacing.sm),
                const MarkedLine(
                  title: 'Receipt #SDS-2026-0891 (Grade 10-A)',
                  detail: 'Student: Aarav Sharma • Amount: Rs. 4,000 • Paid via Bank Slip',
                  markLabel: 'RECONCILED',
                  markTone: GuruBadgeVariant.success,
                ),
                const Divider(),
                const MarkedLine(
                  title: 'Receipt #SDS-2026-0892 (Grade 10-A)',
                  detail: 'Student: Priya Patel • Amount: Rs. 4,000 • Paid via Cash Counter',
                  markLabel: 'RECONCILED',
                  markTone: GuruBadgeVariant.success,
                ),
                const Divider(),
                const MarkedLine(
                  title: 'Invoice #SDS-2026-0893 (Grade 10-A)',
                  detail: 'Student: Rohan Iyer • Amount: Rs. 4,000 • Installment Requested',
                  markLabel: 'PENDING',
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
