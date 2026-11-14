import { SanctuaryGuard } from '@repo/ui';
import { History, MessageSquare, Plus, QrCode } from '@repo/ui/icons';
import { useWorld } from '@repo/ui/theme/native';
import { hapticLight } from '@repo/ui/utils/haptics';
import type React from 'react';
import { Pressable, Text } from 'react-native';

interface ActionProps {
  onCreateClassroom?: () => void;
}

export const TeacherCreateClassroomAction: React.FC<ActionProps> = ({ onCreateClassroom }) => {
  const { tokens } = useWorld();
  return (
    <SanctuaryGuard action="create" subject="Classroom" requirement={{ citizenshipRequired: 3 }}>
      <Pressable
        onPress={() => {
          hapticLight();
          onCreateClassroom?.();
        }}
        className="flex-row items-center gap-2.5 px-8 py-3 rounded-full bg-templeGold shadow-lg shadow-templeGold/20 active:opacity-85"
      >
        <Plus size={16} color={tokens.onLamp} />
        <Text className="text-black font-black uppercase text-[10px] tracking-[0.2em]">
          Create Sanctuary
        </Text>
      </Pressable>
    </SanctuaryGuard>
  );
};

export const TeacherScanQRAction: React.FC = () => {
  const { tokens } = useWorld();
  return (
    <SanctuaryGuard action="manage" subject="Attendance" requirement={{ citizenshipRequired: 3 }}>
      <Pressable
        onPress={hapticLight}
        className="flex-row items-center gap-2.5 px-8 py-3 rounded-full bg-phase-surface/50 border border-phase-canvas shadow-sm active:bg-phase-canvas/20"
      >
        <QrCode size={16} color={tokens.ink} />
        <Text className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
          Scan Resonance
        </Text>
      </Pressable>
    </SanctuaryGuard>
  );
};

export const TeacherPrincipalEchoAction: React.FC = () => {
  const { tokens } = useWorld();
  return (
    <SanctuaryGuard action="read" subject="Announcement" requirement={{ citizenshipRequired: 3 }}>
      <Pressable
        onPress={hapticLight}
        className="flex-row items-center gap-2.5 px-8 py-3 rounded-full bg-phase-surface/50 border border-phase-canvas shadow-sm active:bg-phase-canvas/20"
      >
        <MessageSquare size={16} color={tokens.ink} />
        <Text className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
          Principal's Echo
        </Text>
      </Pressable>
    </SanctuaryGuard>
  );
};

export const TeacherMyEchoesAction: React.FC = () => {
  const { tokens } = useWorld();
  return (
    <SanctuaryGuard action="manage" subject="Announcement" requirement={{ citizenshipRequired: 3 }}>
      <Pressable
        onPress={hapticLight}
        className="flex-row items-center gap-2.5 px-8 py-3 rounded-full bg-phase-surface/50 border border-phase-canvas shadow-sm active:bg-phase-canvas/20"
      >
        <History size={16} color={tokens.ink} />
        <Text className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
          My Echoes
        </Text>
      </Pressable>
    </SanctuaryGuard>
  );
};
