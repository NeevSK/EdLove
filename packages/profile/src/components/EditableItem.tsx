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
        <HStack space="md" className="items-center">
            <Box className="p-2.5 rounded-full bg-phase-surface">
                <Icon size={20} color="#4A90E2" />
            </Box>
            <VStack className="flex-1">
                <Text className="text-[10px] text-phase-text-tertiary uppercase font-bold tracking-tighter">
                    {label}
                </Text>
                {isEditing ? (
                    <VStack space="xs">
                        <HStack space="sm" className="items-center">
                            <Input
                                className={`flex-1 ${error ? 'border-phase-error' : 'border-phase-interactive'}`}
                            >
                                <InputField
                                    value={editValue}
                                    onChangeText={(text: string) => {
                                        const nextValue = transform ? transform(text) : text;
                                        setEditValue(nextValue);
                                    }}
                                    placeholder={placeholder}
                                    autoFocus
                                    className="text-phase-text-primary text-sm"
                                    placeholderTextColor="#9DA1A3"
                                    multiline={multiline}
                                />
                            </Input>
                            <Pressable
                                onPress={handleSave}
                                disabled={isSaving || !!error}
                                className={isSaving || !!error ? 'opacity-30' : 'opacity-100'}
                            >
                                <Check size={20} color="#00C853" />
                            </Pressable>
                            <Pressable onPress={handleCancel}>
                                <X size={20} color="#FF6B6B" />
                            </Pressable>
                        </HStack>
                        {error && (
                            <Text className="text-xs text-phase-error">
                                {error}
                            </Text>
                        )}
                    </VStack>
                ) : (
                    <Pressable
                        onPress={handleStartEdit}
                        className="flex-row items-center justify-between"
                    >
                        <Text className={`text-base font-bold ${value ? 'text-phase-text-primary' : 'text-phase-text-tertiary'}`}>
                            {value || placeholder}
                        </Text>
                        {!disabled && <Edit2 size={14} color="#9DA1A3" />}
                    </Pressable>
                )}
                {helperText && (
                    <Text className="text-xs text-phase-text-tertiary mt-1 opacity-80">
                        {helperText}
                    </Text>
                )}
            </VStack>
        </HStack>
    );
};
