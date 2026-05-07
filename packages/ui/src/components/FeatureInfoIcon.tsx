import { Info } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable } from '../primitives';
import FeatureDiscoveryModal from './FeatureDiscoveryModal';

export interface FeatureInfoIconProps {
  title: string;
  discoveryInfo?: {
    whatIsIt: string;
    whereToFind: string;
  };
  color?: string;
}

/**
 * FeatureInfoIcon - A subtle info icon that triggers the discovery modal.
 * Uses a soft ripple effect and identity-aware coloring.
 */
export default function FeatureInfoIcon({
  title,
  discoveryInfo,
  color = 'text-phase-text-secondary opacity-60',
}: FeatureInfoIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!discoveryInfo) return null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        className="p-1 rounded-full active:scale-90 hover:bg-phase-surface/10"
      >
        <Info
          size={16}
          className={color.startsWith('text-') ? color : 'text-phase-text-secondary'}
        />
      </Pressable>
      <FeatureDiscoveryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        whatIsIt={discoveryInfo.whatIsIt}
        whereToFind={discoveryInfo.whereToFind}
      />
    </>
  );
}
