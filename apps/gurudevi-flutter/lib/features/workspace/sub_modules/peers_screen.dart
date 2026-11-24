import 'package:flutter/material.dart';
import '../../../core/theme/tokens.g.dart';
import '../../../core/ui/guru_badge.dart';
import '../../../core/ui/guru_button.dart';
import '../../../core/ui/guru_card.dart';
import '../../../core/ui/sanctuary/marked_line.dart';
import '../../../core/ui/sanctuary/room_page.dart';

class PeersScreen extends StatefulWidget {
  const PeersScreen({super.key});

  @override
  State<PeersScreen> createState() => _PeersScreenState();
}

class _PeersScreenState extends State<PeersScreen> {
  bool _isScanning = false;

  @override
  Widget build(BuildContext context) {
    return RoomPage(
      title: 'Sanctuary Peer Mesh',
      intro: 'Decentralized local peer-to-peer sync via Wi-Fi LAN, BLE Gossip, and Optical QR.',
      markLabel: 'MESH ONLINE',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Available Transports Grid
          const GuruCard(
            backgroundColor: GuruColors.silk,
            elevated: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Active Sync Bearers',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: GuruColors.ink,
                  ),
                ),
                SizedBox(height: GuruSpacing.sm),
                Row(
                  children: [
                    _TransportChip(
                      label: 'Wi-Fi LAN',
                      speed: '54 Mbps',
                      variant: GuruBadgeVariant.success,
                    ),
                    SizedBox(width: GuruSpacing.sm),
                    _TransportChip(
                      label: 'BLE Gossip',
                      speed: 'BitChat',
                      variant: GuruBadgeVariant.info,
                    ),
                    SizedBox(width: GuruSpacing.sm),
                    _TransportChip(
                      label: 'Nostr DTN',
                      speed: 'Store-Fwd',
                      variant: GuruBadgeVariant.neutral,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: GuruSpacing.md),

          // 2. Discovered Local Peers
          GuruCard(
            backgroundColor: GuruColors.silk,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Discovered Peers (Nearby)',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: GuruColors.ink,
                      ),
                    ),
                    GuruButton(
                      label: _isScanning ? 'Scanning...' : 'Scan Mesh',
                      variant: GuruButtonVariant.subtle,
                      isLoading: _isScanning,
                      onPressed: () async {
                        setState(() => _isScanning = true);
                        await Future.delayed(const Duration(seconds: 1));
                        if (mounted) setState(() => _isScanning = false);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: GuruSpacing.md),
                const MarkedLine(
                  title: 'Central Kitchen Terminal',
                  detail: 'Role: Midday Meal Dispensary • School Hotspot (54 Mbps)',
                  markLabel: '2 PENDING',
                  markTone: GuruBadgeVariant.warning,
                ),
                const Divider(),
                const MarkedLine(
                  title: 'Teacher S. Bandara',
                  detail: 'Role: Grade 10 Section Head • BitChat BLE Gossip (-64 dBm)',
                  markLabel: '1 PENDING',
                  markTone: GuruBadgeVariant.info,
                ),
                const Divider(),
                const MarkedLine(
                  title: 'Administrative Bursar Office',
                  detail: 'Role: SDS Fee Reconciliation • Air-Gap Optical QR',
                  markLabel: 'SYNCED',
                  markTone: GuruBadgeVariant.success,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TransportChip extends StatelessWidget {
  final String label;
  final String speed;
  final GuruBadgeVariant variant;

  const _TransportChip({
    required this.label,
    required this.speed,
    required this.variant,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(GuruSpacing.sm),
        decoration: BoxDecoration(
          color: GuruColors.linen,
          borderRadius: BorderRadius.circular(GuruRadii.md),
          border: Border.all(color: GuruColors.border),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: GuruColors.ink,
              ),
            ),
            const SizedBox(height: 2),
            GuruBadge(label: speed, variant: variant),
          ],
        ),
      ),
    );
  }
}
