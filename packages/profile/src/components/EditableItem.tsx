import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    Theme,
    Input,
    InputField,
} from '@repo/ui';
import { Edit2, Check, X } from 'lucide-react-native';
import { ProfileValidator } from '../lib/validator';
import { hapticLight } from '@repo/ui';

interface EditableItemProps {
    icon: any;
    label: string;
    value?: string;
    field: string;
    placeholder: string;
    onSave: (field: string, value: any) => Promise<any>;
    multiline?: boolean;
}

export const EditableItem = ({
    icon: Icon,
    label,
    value = '',
    field,
    placeholder,
    onSave,
}: EditableItemProps) => {
    const colors = useThemedColors();
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
        } catch (err) {
            // Error is handled by the hook's reversion logic and global handler
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <HStack space="md" alignItems="center">
            <Box
                sx={{
                    padding: 10,
                    borderRadius: Theme.corners.full,
                    backgroundColor: colors.tertiary
                }}
            >
                <Icon size={20} color={colors.action} />
            </Box>
            <VStack flex={1}>
                <Text size="xs" color={colors.textSecondary}>
                    {label}
                </Text>
                {isEditing ? (
                    <VStack space="xs">
                        <HStack space="sm" alignItems="center">
                            <Input
                                sx={{
                                    flex: 1,
                                    borderColor: error ? colors.error : colors.action
                                }}
                            >
                                <InputField
                                    value={editValue}
                                    onChangeText={setEditValue}
                                    placeholder={placeholder}
                                    autoFocus
                                    color={colors.text}
                                />
                            </Input>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={isSaving || !!error}
                                style={{ opacity: (isSaving || !!error) ? 0.3 : 1 }}
                            >
                                <Check size={20} color={colors.success} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCancel}>
                                <X size={20} color={colors.error} />
                            </TouchableOpacity>
                        </HStack>
                        {error && (
                            <Text size="xs" color={colors.error}>
                                {error}
                            </Text>
                        )}
                    </VStack>
                ) : (
                    <TouchableOpacity
                        onPress={handleStartEdit}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <Text size="md" color={value ? colors.text : colors.textTertiary} bold>
                            {value || placeholder}
                        </Text>
                        <Edit2 size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </VStack>
        </HStack>
    );
};
