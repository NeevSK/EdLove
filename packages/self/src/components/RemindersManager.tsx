/**
 * REMINDERS MANAGER
 * CRUD functionality for gentle reminders
 * Default: "Drink water intermittently while teaching"
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Input,
    InputField,
    Button,
    ButtonText,
    Pressable,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
} from '@repo/ui';
import { Plus, Trash2, Edit, Bell, Droplet, Clock } from 'lucide-react-native';
import { Theme, typography } from '@repo/ui';
import { hapticLight, hapticMedium } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import {
    createReminder,
    deleteReminder as removeReminderRecord,
    fetchReminders as fetchReminderRecords,
    type ReminderRecord,
    updateReminder,
} from '../api/selfFeatureRepository';

type Reminder = ReminderRecord;

interface RemindersManagerProps {
    userId?: string;
}

const DEFAULT_REMINDER = {
    title: 'Stay Hydrated',
    description: 'Drink water intermittently while teaching',
    icon_type: 'droplet',
    is_default: true,
};

const ICON_MAP: Record<string, any> = {
    droplet: Droplet,
    bell: Bell,
    clock: Clock,
};

export default function RemindersManager({ userId }: RemindersManagerProps) {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const { t } = useTranslation();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [iconType, setIconType] = useState('bell');

    useEffect(() => {
        if (userId) {
            fetchReminders();
        }
    }, [userId]);

    const fetchReminders = async () => {
        try {
            if (!userId) return;
            const data = await fetchReminderRecords(userId);
            setReminders(data || []);

            if (!data || data.length === 0) {
                await createDefaultReminder();
            }
        } catch (error) {
            console.error('Error fetching reminders:', error);
            await createDefaultReminder();
        } finally {
            setIsLoading(false);
        }
    };

    const createDefaultReminder = async () => {
        if (!userId) return;

        try {
            const data = await createReminder(userId, {
                ...DEFAULT_REMINDER,
                is_active: true,
            });
            setReminders([data]);
        } catch (error) {
            console.error('Error creating default reminder:', error);
        }
    };

    const openCreateModal = () => {
        setEditingReminder(null);
        setTitle('');
        setDescription('');
        setIconType('bell');
        setShowCreateModal(true);
        hapticLight();
    };

    const openEditModal = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setTitle(reminder.title);
        setDescription(reminder.description || '');
        setIconType(reminder.icon_type);
        setShowCreateModal(true);
        hapticLight();
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingReminder(null);
        setTitle('');
        setDescription('');
        setIconType('bell');
    };

    const saveReminder = async () => {
        if (!userId || !title.trim()) return;

        hapticMedium();

        try {
            if (editingReminder) {
                await updateReminder(editingReminder.id, {
                    title: title.trim(),
                    description: description.trim(),
                    icon_type: iconType,
                });
                await fetchReminders();
                closeModal();
            } else {
                await createReminder(userId, {
                    title: title.trim(),
                    description: description.trim(),
                    icon_type: iconType,
                    is_default: false,
                    is_active: true,
                });
                await fetchReminders();
                closeModal();
            }
        } catch (error) {
            console.error('Error saving reminder:', error);
        }
    };

    const toggleReminder = async (reminder: Reminder) => {
        hapticLight();

        try {
            await updateReminder(reminder.id, { is_active: !reminder.is_active });
            setReminders(reminders.map(r => 
                r.id === reminder.id ? { ...r, is_active: !r.is_active } : r
            ));
        } catch (error) {
            console.error('Error toggling reminder:', error);
        }
    };

    const deleteReminder = async (reminderId: string) => {
        hapticMedium();

        try {
            await removeReminderRecord(reminderId);
            setReminders(reminders.filter(r => r.id !== reminderId));
        } catch (error) {
            console.error('Error deleting reminder:', error);
        }
    };

    if (isLoading) {
        return null;
    }

    return (
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
            {/* Header */}
            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <VStack space="xs" sx={{ flex: 1 }}>
                    <Heading sx={{ color: Theme.colors.sacredWhite }} size="lg">
                        {t('reminders.title') || 'Reminders'}
                    </Heading>
                    <Text sx={{ color: Theme.colors.mistGray }} size="sm">
                        Gentle nudges for self-care
                    </Text>
                </VStack>
                <Button
                    size="sm"
                    onPress={openCreateModal}
                    sx={{
                        borderRadius: Theme.corners.full,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        paddingHorizontal: Theme.spacing.md,
                    }}
                >
                    <Plus color={Theme.colors.sacredWhite} size={16} />
                    <ButtonText sx={{ marginLeft: 4 }}>{t('reminders.addReminder') || 'Add'}</ButtonText>
                </Button>
            </HStack>

            {/* Reminders List */}
            <VStack space="md">
                {reminders.length === 0 ? (
                    <Box
                        sx={{
                            padding: Theme.spacing.xl,
                            backgroundColor: Theme.colors.ink,
                            borderRadius: Theme.corners.comfortable,
                            alignItems: 'center',
                        }}
                    >
                        <Text sx={{ color: Theme.colors.mistGray }} size="md" textAlign="center">
                            {t('reminders.noReminders') || 'No reminders set yet.'}
                        </Text>
                    </Box>
                ) : (
                    reminders.map((reminder) => {
                        const IconComponent = ICON_MAP[reminder.icon_type] || Bell;
                        return (
                            <Box
                                key={reminder.id}
                                sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: reminder.is_active
                                        ? Theme.colors.ink
                                        : Theme.colors.obsidian,
                                    borderRadius: Theme.corners.comfortable,
                                    borderLeftWidth: 3,
                                    borderLeftColor: reminder.is_active
                                        ? Theme.colors.sanctuarySaffron
                                        : Theme.colors.dimGray,
                                    opacity: reminder.is_active ? 1 : 0.6,
                                }}
                            >
                                <HStack space="md" sx={{ alignItems: 'center' }}>
                                    {/* Icon */}
                                    <Pressable onPress={() => toggleReminder(reminder)}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                backgroundColor: Theme.colors.obsidian,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <IconComponent
                                                color={reminder.is_active ? Theme.colors.sanctuarySaffron : Theme.colors.dimGray}
                                                size={20}
                                            />
                                        </Box>
                                    </Pressable>

                                    {/* Content */}
                                    <VStack space="xs" sx={{ flex: 1 }}>
                                        <Text
                                            sx={{ 
                                                color: Theme.colors.sacredWhite,
                                                fontWeight: typography.fontWeight.semibold 
                                            }}
                                            size="md"
                                        >
                                            {reminder.title}
                                        </Text>
                                        {reminder.description ? (
                                            <Text sx={{ color: Theme.colors.mistGray }} size="sm">
                                                {reminder.description}
                                            </Text>
                                        ) : null}
                                        {reminder.is_default && (
                                            <Text sx={{ color: Theme.colors.shadowViolet }} size="xs">
                                                💧 Default reminder
                                            </Text>
                                        )}
                                    </VStack>

                                    {/* Actions */}
                                    <HStack space="xs">
                                        {!reminder.is_default && (
                                            <>
                                                <Pressable onPress={() => openEditModal(reminder)}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 18,
                                                            backgroundColor: Theme.colors.obsidian,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Edit color={Theme.colors.mistGray} size={16} />
                                                    </Box>
                                                </Pressable>
                                                <Pressable onPress={() => deleteReminder(reminder.id)}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 18,
                                                            backgroundColor: Theme.colors.obsidian,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Trash2 color={Theme.colors.emberRed} size={16} />
                                                    </Box>
                                                </Pressable>
                                            </>
                                        )}
                                    </HStack>
                                </HStack>
                            </Box>
                        );
                    })
                )}
            </VStack>

            {/* Info */}
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                }}
            >
                <Text
                    sx={{ color: Theme.colors.mistGray, fontStyle: 'italic' }}
                    size="xs"
                    textAlign="center"
                >
                    🔔 Tap the icon to toggle reminders on/off
                </Text>
            </Box>

            {/* Create/Edit Modal */}
            <Modal isOpen={showCreateModal} onClose={closeModal}>
                <ModalBackdrop />
                <ModalContent
                    sx={{
                        backgroundColor: Theme.colors.obsidian,
                        maxWidth: 400,
                    }}
                >
                    <ModalHeader>
                        <Heading sx={{ color: Theme.colors.sacredWhite }} size="lg">
                            {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                        </Heading>
                        <ModalCloseButton />
                    </ModalHeader>
                    <ModalBody>
                        <VStack space="md">
                            {/* Title */}
                            <VStack space="xs">
                                <Text sx={{ color: Theme.colors.starlightGray }} size="sm">
                                    Title
                                </Text>
                                <Input
                                    variant="outline"
                                    size="md"
                                    sx={{
                                        backgroundColor: Theme.colors.ink,
                                        borderColor: Theme.colors.obsidian,
                                    }}
                                >
                                    <InputField
                                        value={title}
                                        onChangeText={setTitle}
                                        placeholder="e.g., Take a break"
                                        sx={{ color: Theme.colors.sacredWhite }}
                                        placeholderTextColor={Theme.colors.dimGray}
                                    />
                                </Input>
                            </VStack>

                            {/* Description */}
                            <VStack space="xs">
                                <Text sx={{ color: Theme.colors.starlightGray }} size="sm">
                                    Description (optional)
                                </Text>
                                <Input
                                    variant="outline"
                                    size="md"
                                    sx={{
                                        backgroundColor: Theme.colors.ink,
                                        borderColor: Theme.colors.obsidian,
                                    }}
                                >
                                    <InputField
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholder="e.g., Every 2 hours during class"
                                        sx={{ color: Theme.colors.sacredWhite }}
                                        placeholderTextColor={Theme.colors.dimGray}
                                        multiline
                                    />
                                </Input>
                            </VStack>

                            {/* Icon Type */}
                            <VStack space="xs">
                                <Text sx={{ color: Theme.colors.starlightGray }} size="sm">
                                    Icon
                                </Text>
                                <HStack space="md">
                                    {Object.keys(ICON_MAP).map((type) => {
                                        const IconComp = ICON_MAP[type];
                                        const isSelected = iconType === type;
                                        return (
                                            <Pressable
                                                key={type}
                                                onPress={() => {
                                                    setIconType(type);
                                                    hapticLight();
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 24,
                                                        backgroundColor: isSelected
                                                            ? Theme.colors.sanctuarySaffron
                                                            : Theme.colors.ink,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <IconComp
                                                        color={isSelected ? Theme.colors.white : Theme.colors.mistGray}
                                                        size={24}
                                                    />
                                                </Box>
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </VStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <HStack space="md" sx={{ width: '100%' }}>
                            <Button
                                flex={1}
                                variant="outline"
                                onPress={closeModal}
                                sx={{
                                    borderColor: Theme.colors.dimGray,
                                }}
                            >
                                <ButtonText sx={{ color: Theme.colors.mistGray }}>Cancel</ButtonText>
                            </Button>
                            <Button
                                flex={1}
                                onPress={saveReminder}
                                isDisabled={!title.trim()}
                                sx={{
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                            >
                                <ButtonText>
                                    {editingReminder ? 'Update' : 'Create'}
                                </ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
}
