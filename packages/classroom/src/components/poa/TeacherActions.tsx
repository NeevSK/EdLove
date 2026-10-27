
import { SanctuaryGuard } from '@repo/ui';
import { History, MessageSquare, Plus, QrCode } from '@repo/ui/icons';
import { Icon, Pressable, Text } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import type React from 'react';

interface ActionProps {
  onCreateClassroom?: () => void;
}

export const TeacherCreateClassroomAction: React.FC<ActionProps> = ({ onCreateClassroom }) => (
  <SanctuaryGuard action="create" subject="Classroom" requirement={{ citizenshipRequired: 3 }}>
    <Pressable
      onPress={() => {
        hapticLight();
        onCreateClassroom?.();
      }}
      className="flex-row items-center gap-2.5 px-8 py-3 rounded-full bg-templeGold shadow-lg shadow-templeGold/20 active:opacity-85"
    >
      <Icon as={Plus} size="sm" className="text-black" />
      <Text className="text-black font-black uppercase text-[10px] tracking-[0.2em]">
        Create Sanctuary
      </Text>
    </Pressable>
  </SanctuaryGuard>
);

export const TeacherScanQRAction: React.FC = () => (
  <SanctuaryGuard action="manage" subject="Attendance" requirement={{ citizenshipRequired: 3 }}>
    <Pressable
      onPress={hapticLight}
      className="flex-row items-center gap-2.5 px-8 py-3 rounded-full bg-phase-surface/50 border border-phase-canvas shadow-sm active:bg-phase-canvas/20"
    >
      <Icon as={QrCode} size="sm" className="text-phaseText-primary" />
      <Text className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
        Scan Resonance
      </Text>
    </Pressable>
  </SanctuaryGuard>
);

export const TeacherPrincipalEchoAction: React.FC = () => (
  <SanctuaryGuard action="read" subject="Announcement" requirement={{ citizenshipRequired: 3 }}>
    <Pressable
      onPress={hapticLight}
      className="flex-row items-center gap-2.5 px-8 py-3 rounded-full bg-phase-surface/50 border border-phase-canvas shadow-sm active:bg-phase-canvas/20"
    >
      <Icon as={MessageSquare} size="sm" className="text-phaseText-primary" />
      <Text className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
        Principal's Echo
      </Text>
    </Pressable>
  </SanctuaryGuard>
);

export const TeacherMyEchoesAction: React.FC = () => (
  <SanctuaryGuard action="manage" subject="Announcement" requirement={{ citizenshipRequired: 3 }}>
    <Pressable
      onPress={hapticLight}
      className="flex-row items-center gap-2.5 px-8 py-3 rounded-full bg-phase-surface/50 border border-phase-canvas shadow-sm active:bg-phase-canvas/20"
    >
      <Icon as={History} size="sm" className="text-phaseText-primary" />
      <Text className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
        My Echoes
      </Text>
    </Pressable>
  </SanctuaryGuard>
);
