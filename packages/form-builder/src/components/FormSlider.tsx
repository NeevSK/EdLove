import { Slider } from '@repo/ui/primitives';
import { Text } from '@repo/ui/primitives';
import { View } from '@repo/ui/primitives';

interface FormSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}

export const FormSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  error,
}: FormSliderProps) => {
  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-phaseText-primary font-semibold text-base">{label}</Text>
        <Text className="text-phase-accent font-bold text-lg">{value}</Text>
      </View>

      <Slider
        className="my-2"
        value={value}
        minValue={min}
        maxValue={max}
        step={step}
        onValueChange={onChange}
      />

      <View className="flex-row justify-between mt-1">
        <Text className="text-phaseText-tertiary text-xs">{min}</Text>
        <Text className="text-phaseText-tertiary text-xs">{max}</Text>
      </View>

      {error && <Text className="text-phase-error text-xs mt-1">{error}</Text>}
    </View>
  );
};
