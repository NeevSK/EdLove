import { Plus } from '@repo/ui/icons';
import { Icon, Pressable, Text } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

export function CreateClassroomAction({ onCreateClassroom }: { onCreateClassroom: () => void }) {
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onCreateClassroom();
      }}
      className="flex-row items-center gap-2.5 px-6 py-3 rounded-full bg-sanctuarySaffron shadow-sm active:opacity-85"
    >
      <Icon as={Plus} size="sm" className="text-sacredWhite" />
      <Text className="text-sacredWhite font-black uppercase text-[10px] tracking-[0.2em]">
        Create Classroom
      </Text>
    </Pressable>
  );
}
