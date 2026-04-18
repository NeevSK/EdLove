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
    Icon,
} from '@repo/ui';
import { Plus, Trash2, Edit, Bell, Droplet, Clock } from 'lucide-react-native';
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
        <VStack className="p-lg gap-lg">
            {/* Header */}
            <HStack className="justify-between items-center">
                <VStack className="gap-1 flex-1">
                    <Heading className="text-sacredWhite" size="lg">
                        {t('reminders.title') || 'Reminders'}
                    </Heading>
                    <Text className="text-mistGray text-sm">
                        Gentle nudges for self-care
                    </Text>
                </VStack>
                <Button
                    size="sm"
                    onPress={openCreateModal}
                    className="rounded-full bg-sanctuarySaffron px-4"
                >
                    <Icon as={Plus} className="text-sacredWhite" size={16} />
                    <ButtonText className="ml-1 text-sacredWhite">{t('reminders.addReminder') || 'Add'}</ButtonText>
                </Button>
            </HStack>

            {/* Reminders List */}
            <VStack className="gap-md">
                {reminders.length === 0 ? (
                    <Box className="p-xl bg-ink rounded-comfortable items-center">
                        <Text className="text-mistGray text-md text-center">
                            {t('reminders.noReminders') || 'No reminders set yet.'}
                        </Text>
                    </Box>
                ) : (
                    reminders.map((reminder) => {
                        const IconComponent = ICON_MAP[reminder.icon_type] || Bell;
                        return (
                            <Box
                                key={reminder.id}
                                className={`p-md rounded-comfortable border-l-[3px] ${
                                    reminder.is_active 
                                        ? 'bg-ink border-sanctuarySaffron opacity-100' 
                                        : 'bg-obsidian border-dimGray opacity-60'
                                }`}
                            >
                                <HStack className="gap-4 items-center">
                                    {/* Icon */}
                                    <Pressable onPress={() => toggleReminder(reminder)}>
                                        <Box className="w-10 h-10 rounded-full bg-obsidian items-center justify-center">
                                            <Icon
                                                as={IconComponent}
                                                className={reminder.is_active ? 'text-sanctuarySaffron' : 'text-dimGray'}
                                                size={20}
                                            />
                                        </Box>
                                    </Pressable>

                                    {/* Content */}
                                    <VStack className="gap-1 flex-1">
                                        <Text className="text-sacredWhite font-semibold text-md">
                                            {reminder.title}
                                        </Text>
                                        {reminder.description ? (
                                            <Text className="text-mistGray text-sm">
                                                {reminder.description}
                                            </Text>
                                        ) : null}
                                        {reminder.is_default && (
                                            <Text className="text-shadowViolet text-xs">
                                                💧 Default reminder
                                            </Text>
                                        )}
                                    </VStack>

                                    {/* Actions */}
                                    <HStack className="gap-2">
                                        {!reminder.is_default && (
                                            <>
                                                <Pressable onPress={() => openEditModal(reminder)}>
                                                    <Box className="w-9 h-9 rounded-full bg-obsidian items-center justify-center">
                                                        <Icon as={Edit} className="text-mistGray" size={16} />
                                                    </Box>
                                                </Pressable>
                                                <Pressable onPress={() => deleteReminder(reminder.id)}>
                                                    <Box className="w-9 h-9 rounded-full bg-obsidian items-center justify-center">
                                                        <Icon as={Trash2} className="text-emberRed" size={16} />
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
            <Box className="p-md bg-ink rounded-comfortable">
                <Text className="text-mistGray italic text-xs text-center">
                    🔔 Tap the icon to toggle reminders on/off
                </Text>
            </Box>

            {/* Create/Edit Modal */}
            <Modal isOpen={showCreateModal} onClose={closeModal}>
                <ModalBackdrop />
                <ModalContent className="bg-obsidian max-w-[400px]">
                    <ModalHeader>
                        <Heading className="text-sacredWhite" size="lg">
                            {editingReminder ? 'Edit Reminder' : 'New Reminder'}
                        </Heading>
                        <ModalCloseButton />
                    </ModalHeader>
                    <ModalBody>
                        <VStack className="gap-4">
                            {/* Title */}
                            <VStack className="gap-1">
                                <Text className="text-starlightGray text-sm">Title</Text>
                                <Input className="bg-ink border-obsidian">
                                    <InputField
                                        value={title}
                                        onChangeText={setTitle}
                                        placeholder="e.g., Take a break"
                                        className="text-sacredWhite"
                                        placeholderTextColor="#6A6358"
                                    />
                                </Input>
                            </VStack>

                            {/* Description */}
                            <VStack className="gap-1">
                                <Text className="text-starlightGray text-sm">Description (optional)</Text>
                                <Input className="bg-ink border-obsidian min-h-[80px]">
                                    <InputField
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholder="e.g., Every 2 hours during class"
                                        className="text-sacredWhite"
                                        placeholderTextColor="#6A6358"
                                        multiline
                                    />
                                </Input>
                            </VStack>

                            {/* Icon Type */}
                            <VStack className="gap-1">
                                <Text className="text-starlightGray text-sm">Icon</Text>
                                <HStack className="gap-4">
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
                                                    className={`w-12 h-12 rounded-full items-center justify-center ${
                                                        isSelected ? 'bg-sanctuarySaffron' : 'bg-ink'
                                                    }`}
                                                >
                                                    <Icon
                                                        as={IconComp}
                                                        className={isSelected ? 'text-white' : 'text-mistGray'}
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
                        <HStack className="gap-4 w-full">
                            <Button
                                className="flex-1 border-dimGray"
                                variant="outline"
                                onPress={closeModal}
                            >
                                <ButtonText className="text-mistGray">Cancel</ButtonText>
                            </Button>
                            <Button
                                className="flex-1 bg-sanctuarySaffron"
                                onPress={saveReminder}
                                isDisabled={!title.trim()}
                            >
                                <ButtonText className="text-white">
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
