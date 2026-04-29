import type { PerspectiveViewProps } from '@repo/core';
import { CheckCircle2, Circle as CircleIcon, Lock } from 'lucide-react-native';
import type React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Box, HStack, ScrollView, Text, VStack } from '../../primitives';

export const DharmaView: React.FC<PerspectiveViewProps> = ({ data }) => {
  const theme = useTheme();
  const actionColor = theme.accent.action;

  const steps = data.nodes.map((node, index) => ({
    id: node.id,
    label: node.label,
    type: node.type,
    completed: index < 2,
    locked: index > 5,
  }));

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <VStack className="gap-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <HStack key={step.id} className="items-start gap-4">
              <VStack className="items-center w-8">
                <Box
                  className="w-8 h-8 rounded-full items-center justify-center z-10"
                  style={{
                    backgroundColor: step.completed ? actionColor : 'rgba(255,255,255,0.05)',
                    borderColor: step.completed ? actionColor : 'rgba(255,255,255,0.2)',
                    borderWidth: 1,
                  }}
                >
                  {step.completed ? (
                    <CheckCircle2 size={16} color="white" />
                  ) : step.locked ? (
                    <Lock size={14} color="rgba(255,255,255,0.3)" />
                  ) : (
                    <CircleIcon size={14} color="white" />
                  )}
                </Box>
                {!isLast && <Box className="w-0.5 flex-1 bg-white/10" />}
              </VStack>
              <Box className="flex-1 pb-8">
                <Text
                  className={`text-md font-bold ${step.completed ? 'text-phaseText-primary' : 'text-phaseText-secondary'}`}
                >
                  {step.label}
                </Text>
                <Text className="text-xs text-phaseText-tertiary uppercase mt-1">{step.type}</Text>
              </Box>
            </HStack>
          );
        })}
      </VStack>
    </ScrollView>
  );
};
