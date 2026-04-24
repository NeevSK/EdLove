import React from 'react';
import { View, Text, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Box } from '@repo/ui';

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
    error
}: FormSliderProps) => {
    // Calculate percentage for styling the filled track if needed
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-phaseText-primary font-semibold text-base">{label}</Text>
                <Text className="text-phase-accent font-bold text-lg">{value}</Text>
            </View>
            
            <Slider 
                className="my-2"
                //@ts-ignore - Slider logic will be handled by Native's standard slider if available, 
                // or we use our primitive mapping.
                // For simplicity in this sensing UI, we consolidate the primitives.
            >
                <SliderTrack className="h-2 bg-phase-canvas border-phase-interactive/10">
                    <SliderFilledTrack 
                        className="bg-phase-accent" 
                        style={{ width: `${percentage}%` }} 
                    />
                </SliderTrack>
                {/* We map the Thumb to the value position via standard RN logic or absolute % */}
                <SliderThumb 
                    className="w-6 h-6 shadow-md border-2 border-white bg-phase-accent"
                    style={{ left: `${percentage}%`, marginLeft: -12 }}
                />
            </Slider>

            <View className="flex-row justify-between mt-1">
                <Text className="text-phaseText-tertiary text-xs">{min}</Text>
                <Text className="text-phaseText-tertiary text-xs">{max}</Text>
            </View>

            {error && (
                <Text className="text-phase-error text-xs mt-1">{error}</Text>
            )}
        </View>
    );
};
