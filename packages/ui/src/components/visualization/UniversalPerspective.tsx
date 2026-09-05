import type { PerspectiveViewProps } from '@repo/core/types';
import { AstroView } from '@repo/ui/components/visualization/AstroView';
import { DharmaView } from '@repo/ui/components/visualization/DharmaView';
import { JyotiView } from '@repo/ui/components/visualization/JyotiView';
import { TerraView } from '@repo/ui/components/visualization/TerraView';
import { VastuView } from '@repo/ui/components/visualization/VastuView';
import { VatyaView } from '@repo/ui/components/visualization/VatyaView';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Box, HStack, Pressable, Text } from '@repo/ui/primitives';
import type React from 'react';
import { useState } from 'react';

type PerspectiveType = 'Astro' | 'Dharma' | 'Terra' | 'Vastu' | 'Vatya' | 'Jyoti';

/**
 * UniversalPerspective - The 2026 "Fluid Discovery" Engine.
 * Orchestrates all promoted visualization perspectives from @repo/ui.
 */
export const UniversalPerspective: React.FC<PerspectiveViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<PerspectiveType>('Astro');
  const _theme = useTheme();

  const tabs: PerspectiveType[] = ['Astro', 'Dharma', 'Terra', 'Vastu', 'Vatya', 'Jyoti'];

  const renderContent = () => {
    switch (activeTab) {
      case 'Astro':
        return <AstroView {...props} />;
      case 'Dharma':
        return <DharmaView {...props} />;
      case 'Terra':
        return <TerraView {...props} />;
      case 'Vastu':
        return <VastuView {...props} />;
      case 'Vatya':
        return <VatyaView {...props} />;
      case 'Jyoti':
        return <JyotiView {...props} />;
      default:
        return <AstroView {...props} />;
    }
  };

  return (
    <Box className="flex-1 bg-phase-surface">
      <Box className="flex-1">{renderContent()}</Box>

      {/* Perspective Navigator */}
      <Box className="absolute bottom-10 left-6 right-6 h-14 bg-phase-canvas/80 backdrop-blur-xl rounded-full border border-phase-border shadow-2xl overflow-hidden">
        <HStack className="flex-1">
          {tabs.map((tab) => (
            <Pressable
              accessibilityRole="button"
              key={tab}
              className={`flex-1 items-center justify-center ${activeTab === tab ? 'bg-phase-accent/10' : ''}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-[10px] font-black uppercase tracking-tighter ${activeTab === tab ? 'text-phase-accent' : 'text-phaseText-tertiary'}`}
              >
                {tab}
              </Text>
              {activeTab === tab && (
                <Box className="absolute bottom-1 w-1 h-1 rounded-full bg-phase-accent" />
              )}
            </Pressable>
          ))}
        </HStack>
      </Box>
    </Box>
  );
};
