import React, { useState } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Heading,
    ScrollView,
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
    Input,
    InputField,
    Textarea,
    TextareaInput,
    Icon,
    CloseIcon
} from '@repo/ui';
import {
    Package,
    AlertTriangle,
    Plus,
    CheckCircle,
    Clipboard,
    Sofa,
    PenTool,
    Monitor
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { useInventory } from '../hooks/useInventory';
import {
    InventoryCategory,
    InventoryCondition,
    InventoryItem,
    api,
    useStore,
    useSafeMutation,
    supabase,
    initPostHog,
    trackEvent
} from '@repo/core';
import { PositiveInvitation } from '@repo/ui';

const CATEGORIES: { id: InventoryCategory; labelKey: string; icon: any }[] = [
    { id: 'furniture', labelKey: 'classroom.inventory.furniture', icon: Sofa },
    { id: 'supplies', labelKey: 'classroom.inventory.supplies', icon: PenTool },
    { id: 'equipment', labelKey: 'classroom.inventory.equipment', icon: Monitor },
];

interface InventoryViewProps {
    classroomId: string;
}

export default function InventoryView({ classroomId }: InventoryViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { user } = useStore();
    const showToast = useStore(state => state.showToast);

    // Resilient Data Hook
    const { items, isLoading, setItems } = useInventory(classroomId);

    const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'all'>('all');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    // Form states
    const [requestName, setRequestName] = useState('');
    const [requestQty, setRequestQty] = useState('');
    const [requestReason, setRequestReason] = useState('');

    // Mutations
    const reportMutation = useSafeMutation(
        (variables: { id: string; condition: InventoryCondition }) =>
            api.inventory.update(variables.id, { condition: variables.condition }),
        {
            onMutate: ({ id, condition }) => {
                setItems(prev => prev.map(item =>
                    item.id === id ? { ...item, condition } : item
                ));
            },
            onSuccess: () => {
                hapticSuccess();
                showToast(t('classroom.inventory.updateSuccess'), 'success');
            }
        }
    );

    const requestMutation = useSafeMutation(
        (variables: { item_name: string; quantity: string; reason: string }) =>
            api.inventory.createRequest({
                classroom_id: classroomId,
                school_id: user?.school_id || '', // Provided by store
                teacher_id: user?.id || '',       // Provided by store
                item_name: variables.item_name,
                quantity: variables.quantity,
                reason: variables.reason
            }),
        {
            onSuccess: () => {
                hapticSuccess();
                showToast(t('classroom.inventory.requestSent'), 'success');
                setRequestName('');
                setRequestQty('');
                setRequestReason('');
            }
        }
    );

    // Filter items
    const filteredItems = selectedCategory === 'all'
        ? items
        : items.filter(item => item.category === selectedCategory);

    const getConditionColor = (condition: InventoryCondition) => {
        switch (condition) {
            case 'good': return Theme.colors.sageGreen;
            case 'fair': return Theme.colors.templeGold;
            case 'poor': return Theme.colors.sanctuarySaffron;
            case 'broken': return Theme.colors.emberRed;
            default: return Theme.colors.starlightGray;
        }
    };

    const handleReportIssue = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowReportModal(true);
    };

    return (
        <Box sx={{ flex: 1 }}>
            {/* Category Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 8, paddingBottom: Theme.spacing.md }}
            >
                <Pressable
                    onPress={() => setSelectedCategory('all')}
                    sx={{
                        paddingHorizontal: Theme.spacing.md,
                        paddingVertical: Theme.spacing.xs,
                        borderRadius: Theme.corners.full,
                        backgroundColor: selectedCategory === 'all' ? Theme.colors.sanctuarySaffron : 'transparent',
                        borderWidth: 1,
                        borderColor: selectedCategory === 'all' ? Theme.colors.sanctuarySaffron : colors.border,
                    }}
                >
                    <Text color={selectedCategory === 'all' ? Theme.colors.sacredWhite : colors.textSecondary} sx={{ fontSize: 13 }}>
                        {t('classroom.inventory.all')}
                    </Text>
                </Pressable>
                {CATEGORIES.map(cat => (
                    <Pressable
                        key={cat.id}
                        onPress={() => setSelectedCategory(cat.id)}
                        sx={{
                            paddingHorizontal: Theme.spacing.md,
                            paddingVertical: Theme.spacing.xs,
                            borderRadius: Theme.corners.full,
                            backgroundColor: selectedCategory === cat.id ? Theme.colors.sanctuarySaffron : 'transparent',
                            borderWidth: 1,
                            borderColor: selectedCategory === cat.id ? Theme.colors.sanctuarySaffron : colors.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        <cat.icon size={14} color={selectedCategory === cat.id ? Theme.colors.sacredWhite : colors.textSecondary} />
                        <Text color={selectedCategory === cat.id ? Theme.colors.sacredWhite : colors.textSecondary} sx={{ fontSize: 13 }}>
                            {t(cat.labelKey)}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Inventory List */}
            <VStack sx={{ paddingHorizontal: Theme.spacing.md, gap: Theme.spacing.md }}>
                {!user ? (
                    <PositiveInvitation
                        type="guest"
                        title={t('classroom.inventory.guestTitle', 'A Glimpse into the Sanctuary')}
                        description={t('classroom.inventory.guestDesc', 'Explore the tools teachers use to manage their sacred spaces.')}
                    />
                ) : filteredItems.length === 0 ? (
                    <Box sx={{ padding: 40, alignItems: 'center' }}>
                        <Text color={colors.textSecondary}>{t('common.noItemsFound')}</Text>
                    </Box>
                ) : filteredItems.map(item => (
                    <Pressable
                        key={item.id}
                        onPress={() => handleReportIssue(item)}
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.md,
                        }}
                    >
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                            <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors.tertiary,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Package size={20} color={colors.text} />
                                </Box>
                                <VStack>
                                    <Text color={colors.text} sx={{ fontWeight: 'bold' }}>{item.name}</Text>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>{t('classroom.inventory.quantity', { count: item.quantity })}</Text>
                                </VStack>
                            </HStack>

                            <Box
                                sx={{
                                    paddingHorizontal: Theme.spacing.sm,
                                    paddingVertical: Theme.spacing.xs,
                                    backgroundColor: getConditionColor(item.condition),
                                    borderRadius: Theme.corners.tight,
                                }}
                            >
                                <Text color={Theme.colors.sacredWhite} sx={{ fontSize: 12, textTransform: 'capitalize', fontWeight: 'bold' }}>
                                    {item.condition}
                                </Text>
                            </Box>
                        </HStack>
                    </Pressable>
                ))}
            </VStack>

            {/* Request Supplies FAB */}
            <Button
                size="lg"
                variant="solid"
                action="primary"
                onPress={() => setShowRequestModal(true)}
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    borderRadius: Theme.corners.full,
                    backgroundColor: Theme.colors.sanctuarySaffron,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                }}
            >
                <ButtonText color={Theme.colors.sacredWhite} sx={{ marginRight: Theme.spacing.sm }}>{t('classroom.inventory.requestSupplies')}</ButtonText>
                <Plus color={Theme.colors.sacredWhite} size={20} />
            </Button>

            {/* Report Issue Modal */}
            <Modal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            >
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.primary }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 20 }}>{t('classroom.inventory.reportIssue')}</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Text color={colors.textSecondary} sx={{ marginBottom: Theme.spacing.md }}>
                            {t('classroom.inventory.reportIssue')} for: <Text color={colors.text} sx={{ fontWeight: 'bold' }}>{selectedItem?.name}</Text>
                        </Text>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <Text color={colors.text} sx={{ fontSize: 13 }}>{t('classroom.inventory.condition')}</Text>
                            <HStack sx={{ gap: Theme.spacing.sm, flexWrap: 'wrap' }}>
                                {(['good', 'fair', 'poor', 'broken'] as const).map(cond => (
                                    <Pressable
                                        key={cond}
                                        onPress={() => {
                                            if (selectedItem) {
                                                reportMutation.mutate({ id: selectedItem.id, condition: cond });
                                                setShowReportModal(false);
                                            }
                                        }}
                                        sx={{
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 16,
                                            backgroundColor: cond === 'broken' ? Theme.colors.emberRed : colors.tertiary,
                                            opacity: reportMutation.isLoading ? 0.5 : 1
                                        }}
                                        disabled={reportMutation.isLoading}
                                    >
                                        <Text color={cond === 'broken' ? 'white' : colors.text} sx={{ fontSize: 12, textTransform: 'capitalize' }}>
                                            {cond}
                                        </Text>
                                    </Pressable>
                                ))}
                            </HStack>

                            <Text color={colors.text} sx={{ fontSize: 13, marginTop: 8 }}>{t('classroom.inventory.notes')}</Text>
                            <Textarea>
                                <TextareaInput placeholder={t('classroom.inventory.damagePlaceholder')} color={colors.text} />
                            </Textarea>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            action="secondary"
                            sx={{ marginRight: Theme.spacing.sm }}
                            onPress={() => setShowReportModal(false)}
                        >
                            <ButtonText>{t('common.cancel')}</ButtonText>
                        </Button>
                        <Button
                            action="negative"
                            onPress={() => {
                                setShowReportModal(false);
                                // Show toast logic here
                            }}
                        >
                            <ButtonText>{t('classroom.inventory.reportDamage')}</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Request Supplies Modal */}
            <Modal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            >
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.primary }}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 20 }}>{t('classroom.inventory.requestSupplies')}</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <VStack sx={{ gap: 4 }}>
                                <Text color={colors.text} sx={{ fontSize: 13 }}>{t('classroom.inventory.itemName')}</Text>
                                <Input>
                                    <InputField
                                        placeholder={t('classroom.inventory.itemNamePlaceholder')}
                                        color={colors.text}
                                        value={requestName}
                                        onChangeText={setRequestName}
                                    />
                                </Input>
                            </VStack>
                            <VStack sx={{ gap: 4 }}>
                                <Text color={colors.text} sx={{ fontSize: 13 }}>
                                    {String(t('classroom.inventory.quantity', { count: 0 }) || '').split(':')[0]?.trim() || ''}
                                </Text>
                                <Input>
                                    <InputField
                                        placeholder="e.g. 1 Box"
                                        keyboardType="numeric"
                                        color={colors.text}
                                        value={requestQty}
                                        onChangeText={setRequestQty}
                                    />
                                </Input>
                            </VStack>
                            <VStack sx={{ gap: 4 }}>
                                <Text color={colors.text} sx={{ fontSize: 13 }}>{t('classroom.inventory.reason')}</Text>
                                <Input>
                                    <InputField
                                        placeholder={t('classroom.inventory.reasonPlaceholder')}
                                        color={colors.text}
                                        value={requestReason}
                                        onChangeText={setRequestReason}
                                    />
                                </Input>
                            </VStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            action="secondary"
                            sx={{ marginRight: Theme.spacing.sm }}
                            onPress={() => setShowRequestModal(false)}
                        >
                            <ButtonText>{t('common.cancel')}</ButtonText>
                        </Button>
                        <Button
                            action="primary"
                            onPress={() => {
                                requestMutation.mutate({
                                    item_name: requestName,
                                    quantity: requestQty,
                                    reason: requestReason
                                });
                                setShowRequestModal(false);
                            }}
                            sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                            disabled={!requestName || !requestQty || requestMutation.isLoading}
                        >
                            <ButtonText>{requestMutation.isLoading ? t('classroom.inventory.sending') : t('classroom.inventory.submit')}</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    );
}
