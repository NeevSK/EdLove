import { FileText, Layers, Map as MapIcon, Play } from '@repo/ui/icons';
import {
  AnimatedView,
  Box,
  HStack,
  Icon,
  LinearGradient,
  Pressable,
  Text,
  useTheme,
  VStack,
} from '@repo/ui/primitives';
import { memo } from 'react';
import { FadeInDown } from 'react-native-reanimated';

export type ToolsInvitationProps = Readonly<{
  onPress: () => void;
}>;

export const ToolsInvitation = memo(({ onPress }: ToolsInvitationProps) => {
  const theme = useTheme();

  return (
    <AnimatedView entering={FadeInDown.delay(250).springify()}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Knowledge Tools Hub"
        accessibilityHint="Open offline-ready utilities: document scanner, OCR, spreadsheet viewer, and study packet export"
        className="mx-4 my-2 rounded-[24px] overflow-hidden bg-phase-surface border border-phase-border"
      >
        <Box className="absolute inset-0">
          <LinearGradient
            colors={[`${theme.accent.reward}14`, `${theme.accent.action}0A`]}
            className="flex-1"
          />
        </Box>
        <HStack className="p-4 gap-4 items-center">
          <Box className="w-12 h-12 rounded-2xl bg-phase-accent/10 justify-center items-center">
            <Icon as={Layers} size={24} color={theme.accent.action} />
          </Box>
          <VStack className="flex-1 gap-0.5">
            <Text className="text-[10px] font-extrabold text-phaseText-secondary uppercase tracking-widest">
              Knowledge utilities
            </Text>
            <Text className="text-base font-extrabold text-phaseText-primary">
              Knowledge Tools Hub
            </Text>
            <Text className="text-[13px] text-phaseText-secondary leading-5">
              OCR vision scanning, CSV dataset reader, study packets, and local exports.
            </Text>
          </VStack>
          <Box className="p-2 bg-phase-accent/20 rounded-xl">
            <Icon as={Play} size={14} color={theme.accent.action} />
          </Box>
        </HStack>
      </Pressable>
    </AnimatedView>
  );
});
ToolsInvitation.displayName = 'ToolsInvitation';

export type MapInvitationProps = Readonly<{
  onPress: () => void;
}>;

export const MapInvitation = memo(({ onPress }: MapInvitationProps) => {
  const theme = useTheme();

  return (
    <AnimatedView entering={FadeInDown.delay(200).springify()}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Enter the Cosmos"
        accessibilityHint="Shift from shelves into constellation-style discovery when you want relationships, not just a list"
        className="mx-4 my-4 rounded-[24px] overflow-hidden bg-phase-surface border border-phase-border"
      >
        <Box className="absolute inset-0">
          <LinearGradient
            colors={[`${theme.accent.action}16`, `${theme.accent.reward}0D`]}
            className="flex-1"
          />
        </Box>
        <HStack className="p-5 gap-4 items-center">
          <Box className="w-[60px] h-[60px] rounded-[30px] bg-white/10 justify-center items-center">
            <Icon as={MapIcon} size={32} color={theme.accent.action} />
          </Box>
          <VStack className="flex-1 gap-1">
            <Text className="text-[10px] font-extrabold text-phaseText-secondary uppercase tracking-widest">
              Knowledge map
            </Text>
            <Text className="text-lg font-extrabold text-phaseText-primary">Enter the Cosmos</Text>
            <Text className="text-[13px] text-phaseText-secondary leading-5">
              Shift from shelves into constellation-style discovery when you want relationships, not
              just a list.
            </Text>
          </VStack>
          <Box className="p-2.5 bg-phase-accent rounded-xl">
            <Icon as={Play} size={16} color="white" fill="white" />
          </Box>
        </HStack>
      </Pressable>
    </AnimatedView>
  );
});
MapInvitation.displayName = 'MapInvitation';

export type CuratorInvitationProps = Readonly<{
  onPress: () => void;
}>;

export const CuratorInvitation = memo(({ onPress }: CuratorInvitationProps) => {
  const theme = useTheme();

  return (
    <AnimatedView entering={FadeInDown.delay(300).springify()}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Curator Dashboard"
        accessibilityHint="Review, polish, and publish new knowledge streams without leaving the sanctuary shell"
        className="mx-4 mt-0 mb-4 rounded-[24px] overflow-hidden bg-phase-surface border border-phase-accent/20"
      >
        <Box className="absolute inset-0">
          <LinearGradient
            colors={[`${theme.accent.action}14`, 'rgba(255,255,255,0.2)']}
            className="flex-1"
          />
        </Box>
        <HStack className="p-4 gap-4 items-center">
          <Box className="w-12 h-12 rounded-full bg-phase-accent/10 justify-center items-center">
            <Icon as={FileText} size={24} color={theme.accent.action} />
          </Box>
          <VStack className="flex-1 gap-0.5">
            <Text className="text-[10px] font-extrabold text-phaseText-secondary uppercase tracking-widest">
              Curator pathway
            </Text>
            <Text className="text-base font-extrabold text-phaseText-primary">
              Curator Dashboard
            </Text>
            <Text className="text-[13px] text-phaseText-secondary leading-5">
              Review, polish, and publish new knowledge streams without leaving the sanctuary
              shell.
            </Text>
          </VStack>
        </HStack>
      </Pressable>
    </AnimatedView>
  );
});
CuratorInvitation.displayName = 'CuratorInvitation';
