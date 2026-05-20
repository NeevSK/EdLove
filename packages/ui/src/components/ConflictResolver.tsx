import type React from 'react';
import { AlertTriangle, ArrowLeftRight, Check, X } from '../icons';
import { Box, Heading, HStack, Icon, Pressable, Text, VStack } from '../primitives';
import { Theme } from '../theme/Theme';
import { hapticLight, hapticSuccess } from '../utils/haptics';

interface ConflictResolverProps {
  conflict: {
    id: string;
    name: string;
    localData: any;
    remoteData: any;
  };
  onResolve: (decision: 'local' | 'remote') => void;
}

/**
 * ConflictResolver
 *
 * A 2026-standard "Resonance Resolver" for data conflicts.
 * Features:
 * - Glassmorphic overlay
 * - Semantic differentiation (Mine vs. Theirs)
 * - Atomic resolution actions
 */
export const ConflictResolver: React.FC<ConflictResolverProps> = ({ conflict, onResolve }) => {
  return (
    <Box
      className="m-4 p-6 rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl overflow-hidden"
      style={{
        shadowColor: Theme.colors.templeGold,
        shadowOpacity: 0.1,
        shadowRadius: 20,
      }}
    >
      <VStack className="gap-4">
        <HStack className="items-center gap-3">
          <Box className="p-3 rounded-2xl bg-amberGlow/20">
            <Icon as={AlertTriangle} size="sm" className="text-amberGlow" />
          </Box>
          <VStack>
            <Heading className="text-lg font-black text-phase-text-primary">
              Sync Conflict Detected
            </Heading>
            <Text className="text-xs text-phase-text-secondary font-medium uppercase tracking-widest">
              Action: {conflict.name}
            </Text>
          </VStack>
        </HStack>

        <Text className="text-sm text-phase-text-secondary leading-relaxed">
          The server has a newer version of this data. How should we proceed?
        </Text>

        <HStack className="gap-3 mt-2">
          <Pressable
            onPress={() => {
              hapticSuccess();
              onResolve('local');
            }}
            className="flex-1 p-5 rounded-[24px] bg-gurudeviBlue border border-gurudeviBlue/20 active:scale-95 transition-all"
          >
            <VStack className="items-center gap-2">
              <Icon as={Check} size="sm" className="text-white" />
              <Text className="text-xs font-black text-white uppercase tracking-tighter">
                Keep Mine
              </Text>
            </VStack>
          </Pressable>

          <Pressable
            onPress={() => {
              hapticLight();
              onResolve('remote');
            }}
            className="flex-1 p-5 rounded-[24px] bg-phase-surface-secondary border border-phase-border/40 active:scale-95 transition-all"
          >
            <VStack className="items-center gap-2">
              <Icon as={ArrowLeftRight} size="sm" className="text-phase-text-primary" />
              <Text className="text-xs font-black text-phase-text-primary uppercase tracking-tighter">
                Accept Theirs
              </Text>
            </VStack>
          </Pressable>
        </HStack>

        <Pressable
          onPress={() => {
            // Future: Implement Diff View
            hapticLight();
          }}
          className="items-center py-2"
        >
          <Text className="text-[10px] font-black text-phase-text-tertiary uppercase tracking-widest">
            Inspect Differences
          </Text>
        </Pressable>
      </VStack>
    </Box>
  );
};
