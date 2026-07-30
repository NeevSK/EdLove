import type { RadarStatus, TopologyLayer } from '@rn-terrain/core/types';

export interface VendorPrior {
  vendor: string;
  default_topology_layer: TopologyLayer;
  default_radar_status: RadarStatus;
  lindy_credit_months: number; // artificial lindy to avoid HOLD on launch
  confidence_boost: boolean; // vendor backing increases confidence
}

export const VENDOR_PRIORS: VendorPrior[] = [
  {
    vendor: 'expo',
    default_topology_layer: 'L3',
    default_radar_status: 'TRIAL',
    lindy_credit_months: 12, // Expo's own credibility = 12mo credit
    confidence_boost: true,
  },
  {
    vendor: 'software-mansion',
    default_topology_layer: 'L3',
    default_radar_status: 'TRIAL',
    lindy_credit_months: 12,
    confidence_boost: true,
  },
  {
    vendor: 'callstack',
    default_topology_layer: 'L3',
    default_radar_status: 'TRIAL',
    lindy_credit_months: 12,
    confidence_boost: true,
  },
  {
    vendor: 'meta',
    default_topology_layer: 'L2',
    default_radar_status: 'ADOPT',
    lindy_credit_months: 24,
    confidence_boost: true,
  },
  {
    vendor: 'independent',
    default_topology_layer: 'L4',
    default_radar_status: 'ASSESS',
    lindy_credit_months: 0, // no credit — earn your Lindy
    confidence_boost: false,
  },
];

export function applyVendorPrior(
  rawScore: number,
  lindyMonths: number,
  vendor: string,
): { adjustedScore: number; adjustedLindy: number; note: string } {
  const prior = VENDOR_PRIORS.find((p) => p.vendor.toLowerCase() === vendor.toLowerCase());
  if (!prior) {
    return { adjustedScore: rawScore, adjustedLindy: lindyMonths, note: '' };
  }

  const adjustedLindy = lindyMonths + prior.lindy_credit_months;

  // Never boost above the vendor's default ceiling
  const vendorFloor =
    prior.default_radar_status === 'ADOPT' ? 80 : prior.default_radar_status === 'TRIAL' ? 60 : 40;

  const adjustedScore = Math.max(rawScore, vendorFloor);

  return {
    adjustedScore,
    adjustedLindy,
    note:
      prior.lindy_credit_months > 0
        ? `+${prior.lindy_credit_months}mo Lindy credit (${vendor} vendor)`
        : '',
  };
}
