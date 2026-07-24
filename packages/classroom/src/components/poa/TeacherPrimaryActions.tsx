import { } from '@repo/core/logic';
import { SanctuaryGuard } from '@repo/ui';
import { Plus, ScanLine } from '@repo/ui/icons';
import { Button, ButtonText, HStack, Icon } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

export function TeacherPrimaryActions({ onCreateClassroom }: { onCreateClassroom: () => void }) {
  return (
    <HStack className="gap-4 flex-wrap items-center">
      <SanctuaryGuard action="create" subject="Classroom" requirement={{ citizenshipRequired: 3 }}>
        <Button
          action="primary"
          onPress={() => {
            hapticLight();
            onCreateClassroom();
          }}
          className="bg-templeGold rounded-full px-8 h-14 shadow-lg shadow-templeGold/20 active:opacity-85"
        >
          <HStack className="items-center gap-2.5">
            <Icon as={Plus} size="sm" className="text-black" />
            <ButtonText className="text-black font-black uppercase text-[10px] tracking-[0.2em]">
              Create Classroom
            </ButtonText>
          </HStack>
        </Button>
      </SanctuaryGuard>
      <SanctuaryGuard action="read" subject="Classroom" requirement={{ citizenshipRequired: 3 }}>
        <Button
          variant="outline"
          className="rounded-full px-8 h-14 border-phase-canvas bg-phase-surface/50 shadow-sm active:bg-phase-canvas/20"
          onPress={hapticLight}
        >
          <HStack className="items-center gap-2.5">
            <Icon as={ScanLine} size="sm" className="text-phaseText-primary" />
            <ButtonText className="text-phaseText-primary font-black uppercase text-[10px] tracking-[0.2em]">
              Scan QR
            </ButtonText>
          </HStack>
        </Button>
      </SanctuaryGuard>
    </HStack>
  );
}
