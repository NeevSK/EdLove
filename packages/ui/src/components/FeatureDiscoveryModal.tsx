import React from 'react';
import { VStack, Text, Heading, Box } from '../gluestack';
import SanctuaryModal from './SanctuaryModal';
import { Info } from 'lucide-react-native';

export interface FeatureDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  whatIsIt: string;
  whereToFind: string;
}

/**
 * FeatureDiscoveryModal - A premium modal explaining a feature to the user.
 * Hardened v3 implementation.
 */
export default function FeatureDiscoveryModal({
  isOpen,
  onClose,
  title,
  whatIsIt,
  whereToFind,
}: FeatureDiscoveryModalProps) {
  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Feature Discovery"
      icon={<Info className="text-phase-accent" size={24} />}
    >
      <VStack className="gap-6 py-2">
        <Box>
          <Heading className="uppercase tracking-[1.5px] text-phase-text-secondary text-[10px] mb-2">
            What is it?
          </Heading>
          <Text className="text-phase-text-primary text-base leading-relaxed">{whatIsIt}</Text>
        </Box>

        <Box className="p-4 rounded-xl bg-phase-accent/5 border-l-4 border-phase-accent">
          <Heading className="uppercase tracking-[1.5px] text-phase-accent text-[10px] mb-2">
            Where to find it?
          </Heading>
          <Text className="text-phase-text-secondary font-medium text-sm">{whereToFind}</Text>
        </Box>
      </VStack>
    </SanctuaryModal>
  );
}
