import { useNavigation } from '@react-navigation/native';
import { BookOpenText, MessagesSquare, School } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';

import type React from 'react';
import { GuardianRoomShell } from './GuardianRoomShell';

function BridgeCard({
  icon: Icon,
  title,
  copy,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  copy: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4">
        <HStack className="items-start gap-3">
          <Box className="rounded-2xl bg-phase-warning/10 p-3">
            <Icon size={18} color="#2A2318" />
          </Box>
          <VStack className="flex-1 gap-1">
            <Text className="text-[14px] font-bold text-phaseText-primary">{title}</Text>
            <Text className="text-[12px] text-phaseText-secondary">{copy}</Text>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
}

export default function GuardianCommunicationBridgeScreen() {
  const navigation = useNavigation<any>();

  return (
    <GuardianRoomShell
      eyebrow="School-home, bridge"
      title="Communication, bridge"
      description="This, room, helps, the, guardian, move from awareness, into, the, right, school, community, and, resource, spaces, without, losing, context."
      onBack={() => navigation.goBack()}
    >
      <VStack className="gap-3">
        <BridgeCard
          icon={MessagesSquare}
          title="Open, community commons"
          copy="Step, into family-safe, community space for school, conversation, groups, and, shared updates."
          onPress={() => navigation.getParent()?.navigate('Community' as never)}
        />
        <BridgeCard
          icon={BookOpenText}
          title="Open, learning resources"
          copy="Move from school, signal into, study support, and resource, discovery."
          onPress={() => navigation.getParent()?.navigate('Library' as never)}
        />
        <BridgeCard
          icon={School}
          title="Return, to family, workspace"
          copy="Come, back to, the guardian, canvas after, checking the, broader school, ecosystem."
          onPress={() => navigation.navigate('GuardianDashboard')}
        />
      </VStack>
    </GuardianRoomShell>
  );
}
