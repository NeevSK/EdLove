import React from 'react';
import { View, Text, Pressable, type ViewProps, type PressableProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(View, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(Text, { className: 'style' });

export const Select = ({ children, ...props }: any) => {
    return (
        <View {...props}>
            {children}
        </View>
    );
};

export const SelectTrigger = React.forwardRef<View, PressableProps & { className?: string }>(
    ({ children, className, ...props }, ref) => (
        <Pressable
            {...props}
            ref={ref as any}
            className={`flex-row items-center justify-between p-4 border rounded-xl bg-phase-canvas border-phase-interactive/10 ${className || ''}`}
        >
            {children}
        </Pressable>
    )
);

export const SelectInput = ({ className, placeholder, value, ...props }: any) => (
    <Text 
        className={`text-phaseText-primary flex-1 ${!value ? 'opacity-40' : ''} ${className || ''}`}
        {...props}
    >
        {value || placeholder}
    </Text>
);

export const SelectIcon = ({ as: Icon, className, size = 18, ...props }: any) => {
    if (!Icon) return null;
    return <Icon {...props} size={size} className={`text-phaseText-secondary ${className || ''}`} />;
};

export const SelectPortal = ({ children }: any) => children;
export const SelectBackdrop = ({ className }: any) => (
    <View className={`absolute inset-0 bg-black/60 ${className || ''}`} />
);
export const SelectContent = ({ children, className }: any) => (
    <View className={`bg-phase-elevated rounded-t-3xl p-4 pb-12 ${className || ''}`}>
        {children}
    </View>
);
export const SelectDragIndicatorWrapper = ({ children, className }: any) => (
    <View className={`items-center py-4 ${className || ''}`}>
        {children}
    </View>
);
export const SelectDragIndicator = ({ className }: any) => (
    <View className={`w-12 h-1.5 bg-phase-interactive/20 rounded-full ${className || ''}`} />
);
export const SelectItem = ({ label, value, className, ...props }: any) => (
    <Pressable 
        className={`py-4 border-b border-phase-interactive/5 ${className || ''}`}
        {...props}
    >
        <Text className="text-phaseText-primary text-lg font-medium">{label}</Text>
    </Pressable>
);

Select.displayName = 'Select';
SelectTrigger.displayName = 'SelectTrigger';
SelectInput.displayName = 'SelectInput';
SelectItem.displayName = 'SelectItem';

export {  };
