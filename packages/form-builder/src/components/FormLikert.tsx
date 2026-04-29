import { HStack, Text } from '@repo/ui/primitives';
import { Pressable, View } from '@repo/ui/primitives';

interface FormLikertProps {
  label: string;
  value: any;
  onChange: (val: any) => void;
  scaleType?: 'numeric' | 'emoji' | 'text';
  options?: { label: string; value: any }[];
  error?: string;
}

const DEFAULT_EMOJI_SCALE = [
  { label: '😞', value: 1 },
  { label: '😐', value: 2 },
  { label: '🙂', value: 3 },
  { label: '😊', value: 4 },
  { label: '🤩', value: 5 },
];

const DEFAULT_NUMERIC_SCALE = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
];

export const FormLikert = ({
  label,
  value,
  onChange,
  scaleType = 'numeric',
  options,
  error,
}: FormLikertProps) => {
  const activeScale =
    options || (scaleType === 'emoji' ? DEFAULT_EMOJI_SCALE : DEFAULT_NUMERIC_SCALE);

  return (
    <View className="mb-6">
      <Text className="text-phaseText-primary font-semibold text-base mb-3">{label}</Text>

      <HStack className="justify-between items-center bg-phase-canvas p-2 rounded-2xl border border-phase-interactive/5">
        {activeScale.map((item) => {
          const isActive = value === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => onChange(item.value)}
              className={`flex-1 items-center justify-center p-3 rounded-xl transition-all ${
                isActive ? 'bg-phase-accent shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-xl font-bold ${
                  isActive ? 'text-white' : 'text-phaseText-secondary'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      {error && <Text className="text-phase-error text-xs mt-2">{error}</Text>}
    </View>
  );
};
