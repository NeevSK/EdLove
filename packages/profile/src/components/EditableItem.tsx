import React, { useState, useEffect } from 'react';
import { 
    Box,
    VStack,
    HStack,
    Text,
    Input,
    InputField,
    Pressable,
} from '@repo/ui';
import { Edit2, Check, X } from 'lucide-react-native';
import { ProfileValidator } from '../lib/validator';
import { hapticLight } from '@repo/ui';

interface EditableItemProps {
    icon: any;
    label: string;
    value?: string;
    field: string;
    placeholder?: string;
    onSave: (field: string, value: any) => Promise<any>;
    multiline?: boolean;
    disabled?: boolean;
    helperText?: string;
    transform?: (value: string) => string;
}

/**
 * EDITABLE ITEM
 * Sanctuary V3 standard for in-place profile field editing.
 * Features ultra-responsive feedback and standardized primitives.
 */
export const EditableItem = ({
    icon: Icon,
    label,
    value = '',
    field,
    placeholder,
    onSave,
    disabled = false,
    multiline = false,
    helperText,
    transform,
}: EditableItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    // Pre-emptive Validation check on every keystroke
    useEffect(() => {
        if (isEditing) {
            const result = ProfileValidator.validate(field, editValue);
            setError(result.isValid ? null : (result.error || 'Invalid input'));
        } else {
            setError(null);
        }
    }, [editValue, field, isEditing]);

    const handleStartEdit = () => {
        if (disabled) return;
        hapticLight();
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(value);
        setError(null);
    };

    const handleSave = async () => {
        if (error) return;

        setIsSaving(true);
        try {
            await onSave(field, editValue);
            setIsEditing(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <HStack space="md" className="items-center py-1">
            <Box className="w-10 h-10 rounded-2xl bg-phase-surface/50 items-center justify-center border border-phase-surface/30 shadow-sm">
                <Icon size={18} color="#4A90E2" strokeWidth={2.5} />
            </Box>
            <VStack className="flex-1">
                <Text className="text-[10px] text-phase-text-tertiary uppercase font-bold tracking-[1.5px] mb-0.5">
                    {label}
                </Text>
                {isEditing ? (
                    <VStack space="xs">
                        <HStack space="sm" className="items-center">
                            <Input
                                className={`flex-1 h-11 rounded-xl bg-phase-canvas transition-colors border-2 ${
                                    error 
                                        ? 'border-phase-error' 
                                        : 'border-phase-interactive'
                                }`}
                            >
                                <InputField
                                    value={editValue}
                                    onChangeText={(text: string) => {
                                        const nextValue = transform ? transform(text) : text;
                                        setEditValue(nextValue);
                                    }}
                                    placeholder={placeholder}
                                    autoFocus
                                    className="text-phase-text-primary text-sm font-bold"
                                    placeholderTextColor="#9DA1A3"
                                    multiline={multiline}
                                />
                            </Input>
                            <HStack space="xs">
                                <Pressable
                                    onPress={handleSave}
                                    disabled={isSaving || !!error}
                                    className={`w-9 h-9 rounded-xl bg-phase-interactive items-center justify-center shadow-md active:scale-90 transition-all ${
                                        isSaving || !!error ? 'opacity-30' : 'opacity-100'
                                    }`}
                                >
                                    <Check size={18} color="white" strokeWidth={3} />
                                </Pressable>
                                <Pressable 
                                    onPress={handleCancel}
                                    className="w-9 h-9 rounded-xl bg-phase-surface items-center justify-center active:scale-90 transition-all"
                                >
                                    <X size={18} color="#FF6B6B" strokeWidth={2.5} />
                                </Pressable>
                            </HStack>
                        </HStack>
                        {error && (
                            <Text className="text-[10px] font-bold text-phase-error ml-1 uppercase tracking-wider">
                                {error}
                            </Text>
                        )}
                    </VStack>
                ) : (
                    <Pressable
                        onPress={handleStartEdit}
                        className="flex-row items-center justify-between py-1 group active:opacity-60 transition-opacity"
                    >
                        <Text className={`text-base font-bold tracking-tight ${
                            value ? 'text-phase-text-primary' : 'text-phase-text-tertiary italic'
                        }`}>
                            {value || placeholder}
                        </Text>
                        {!disabled && (
                            <Box className="opacity-40 group-hover:opacity-100 transition-opacity">
                                <Edit2 size={12} color="#9DA1A3" />
                            </Box>
                        )}
                    </Pressable>
                )}
                {helperText && !isEditing && (
                    <Text className="text-[10px] text-phase-text-tertiary mt-1 opacity-70 font-medium tracking-wide">
                        {helperText}
                    </Text>
                )}
            </VStack>
        </HStack>
    );
};
