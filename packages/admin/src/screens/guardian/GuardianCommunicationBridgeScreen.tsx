import { View, Text, Pressable } from 'react-native';
import { BookOpenText, MessagesSquare, School } from '@repo/ui/icons';
import { useNavigator } from '@repo/ui/components/native/navigation';

import type React from 'react';
import { GuardianRoomShell } from '@repo/admin/screens/guardian/GuardianRoomShell';

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
      <View className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4">
        <View className="flex-row items-center items-start gap-3">
          <View className="rounded-2xl bg-phase-warning/10 p-3">
            <Icon size={18} color="#2A2318" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-[14px] font-bold text-phaseText-primary">{title}</Text>
            <Text className="text-[12px] text-phaseText-secondary">{copy}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function GuardianCommunicationBridgeScreen() {
  const router = useNavigator();

  return (
    <GuardianRoomShell
      eyebrow="School-Home Bridge"
      title="Communication Bridge"
      description="This room helps the guardian move from awareness into the right school, community, and resource spaces without losing context."
      onBack={() => router.back('/workspace')}
    >
      <View className="gap-3">
        <BridgeCard
          icon={MessagesSquare}
          title="Open Community Commons"
          copy="Step into family-safe community space for school conversation, groups, and shared updates."
          onPress={() => router.push('/community')}
        />
        <BridgeCard
          icon={BookOpenText}
          title="Open Learning Resources"
          copy="Move from school signal into study support and resource discovery."
          onPress={() => router.push('/library')}
        />
        <BridgeCard
          icon={School}
          title="Return to Family Workspace"
          copy="Come back to the guardian canvas after checking the broader school ecosystem."
          onPress={() => router.push('/workspace')}
        />
      </View>
    </GuardianRoomShell>
  );
}
