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
    CloseIcon,
    Theme,
    useThemedColors,
    hapticLight,
    hapticSuccess,
    PositiveInvitation,
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
import { useInventory } from '../hooks/useInventory';
import {
    InventoryCategory,
    InventoryCondition,
    InventoryItem,
    CLASSROOM_RESOURCE_SCOPE,
    api,
    useStore,
    useSafeMutation,
} from '@repo/core';

const CATEGORIES: { id: InventoryCategory | 'all'; labelKey: string; icon: any }[] = [
    { id: 'all', labelKey: 'classroom.inventory.all', icon: Package },
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

    const { items, isLoading, setItems } = useInventory(classroomId);

    const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'all'>('all');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const [requestName, setRequestName] = useState('');
    const [requestQty, setRequestQty] = useState('');
    const [requestReason, setRequestReason] = useState('');

    const reportMutation = useSafeMutation(
        async (variables: { id: string; condition: InventoryCondition }) => {
            return api.inventory.update(variables.id, { condition: variables.condition });
        },
        {
            onMutate: async ({ id, condition }) => {
                setItems(prev => prev.map(item =>
                    item.id === id ? { ...item, condition } : item
                ));
            },
            onSuccess: () => {
                hapticSuccess();
                showToast(t('classroom.inventory.updateSuccess') || 'Condition updated', 'success');
            }
        }
    );

    const requestMutation = useSafeMutation(
        async (variables: { item_name: string; quantity: string; reason: string }) => {
            return (api.inventory as any).createRequest({
                classroom_id: classroomId,
                school_id: user?.school_id || '',
                teacher_id: user?.id || '',
                ...CLASSROOM_RESOURCE_SCOPE,
                item_name: variables.item_name,
                quantity: parseInt(variables.quantity, 10) || 0,
                reason: variables.reason
            });
        },
        {
            onSuccess: () => {
                hapticSuccess();
                showToast(t('classroom.inventory.requestSent') || 'Request sent', 'success');
                setRequestName('');
                setRequestQty('');
                setRequestReason('');
            }
        }
    );

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
            <Box sx={{ paddingBottom: Theme.spacing.md }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 8 }}
                >
                    {CATEGORIES.map(cat => {
                        const IconComponent = cat.icon;
                        const isActive = selectedCategory === cat.id;
                        return (
                            <Pressable
                                key={cat.id}
                                onPress={() => { hapticLight(); setSelectedCategory(cat.id); }}
                                sx={{
                                    paddingHorizontal: Theme.spacing.md,
                                    paddingVertical: Theme.spacing.xs,
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: isActive ? Theme.colors.sanctuarySaffron : 'transparent',
                                    borderWidth: 1,
                                    borderColor: isActive ? Theme.colors.sanctuarySaffron : colors.border,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6
                                }}
                            >
                                <IconComponent size={14} color={isActive ? Theme.colors.sacredWhite : colors.textSecondary} />
                                <Text sx={{ 
                                    color: isActive ? Theme.colors.sacredWhite : colors.textSecondary, 
                                    fontSize: 13,
                                    fontWeight: isActive ? '700' : '400' as any
                                }}>
                                    {t(cat.labelKey) || cat.id}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </Box>

            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack sx={{ paddingHorizontal: Theme.spacing.md, gap: Theme.spacing.md, paddingBottom: 100 }}>
                    {!user ? (
                        <PositiveInvitation
                            type="guest"
                            title={t('classroom.inventory.guestTitle') || 'Limited Access'}
                            description={t('classroom.inventory.guestDesc') || 'Sign in to manage and report classroom inventory.'}
                        />
                    ) : filteredItems.length === 0 ? (
                        <Box sx={{ padding: 40, alignItems: 'center' }}>
                            <Text sx={{ color: colors.textSecondary }}>{t('common.noItemsFound') || 'No inventory items found'}</Text>
                        </Box>
                    ) : (
                        filteredItems.map(item => (
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
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: Theme.corners.comfortable,
                                            backgroundColor: colors.tertiary,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Package size={20} color={colors.text} />
                                        </Box>
                                        <VStack>
                                            <Text sx={{ color: colors.text, fontWeight: '700' as any }}>{item.name}</Text>
                                            <Text sx={{ color: colors.textSecondary, fontSize: 12 }}>
                                                {t('classroom.inventory.quantity', { count: item.quantity }) || `${item.quantity} units`}
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <Box sx={{
                                        paddingHorizontal: Theme.spacing.sm,
                                        paddingVertical: Theme.spacing.xs,
                                        backgroundColor: getConditionColor(item.condition),
                                        borderRadius: Theme.corners.tight,
                                    }}>
                                        <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 12, textTransform: 'capitalize', fontWeight: 'bold' as any }}>
                                            {item.condition}
                                        </Text>
                                    </Box>
                                </HStack>
                            </Pressable>
                        ))
                    )}
                </VStack>
            </ScrollView>

            <Button
                size="lg"
                variant="solid"
                action="primary"
                onPress={() => { hapticLight(); setShowRequestModal(true); }}
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
                    height: 56,
                    paddingHorizontal: 24,
                }}
            >
                <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                    <ButtonText sx={{ color: Theme.colors.sacredWhite }}>
                        {t('classroom.inventory.requestSupplies') || 'Request Supplies'}
                    </ButtonText>
                    <Icon as={Plus} color={Theme.colors.sacredWhite} size={20} />
                </HStack>
            </Button>

            {/* Report Issue Modal */}
            <Modal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            >
                <ModalBackdrop />
                <ModalContent sx={{ backgroundColor: colors.primary }}>
                    <ModalHeader>
                        <Heading sx={{ color: colors.text, fontSize: 20 }}>
                            {t('classroom.inventory.reportIssue') || 'Report Condition'}
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} color={colors.textSecondary} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <Text sx={{ color: colors.textSecondary }}>
                                {t('classroom.inventory.reportIssueDesc') || 'Updating condition for:'} <Text sx={{ color: colors.text, fontWeight: 'bold' as any }}>{selectedItem?.name}</Text>
                            </Text>
                            
                            <Text sx={{ color: colors.text, fontSize: 13, fontWeight: '700' as any }}>{t('classroom.inventory.condition') || 'Condition'}</Text>
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
                                            paddingVertical: 8,
                                            borderRadius: 16,
                                            backgroundColor: cond === 'broken' ? Theme.colors.emberRed : colors.tertiary,
                                            opacity: reportMutation.isLoading ? 0.5 : 1,
                                            borderWidth: 1,
                                            borderColor: colors.border
                                        }}
                                        disabled={reportMutation.isLoading}
                                    >
                                        <Text sx={{ 
                                            color: cond === 'broken' ? 'white' : colors.text, 
                                            fontSize: 12, 
                                            textTransform: 'capitalize',
                                            fontWeight: '600' as any
                                        }}>
                                            {cond}
                                        </Text>
                                    </Pressable>
                                ))}
                            </HStack>

                            <Text sx={{ color: colors.text, fontSize: 13, marginTop: 8, fontWeight: '700' as any }}>{t('classroom.inventory.notes') || 'Notes'}</Text>
                            <Textarea>
                                <TextareaInput 
                                    placeholder={t('classroom.inventory.damagePlaceholder') || 'Describe any wear or damage...'} 
                                    color={colors.text} 
                                />
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
                            <ButtonText sx={{ color: colors.text }}>{t('common.cancel') || 'Cancel'}</ButtonText>
                        </Button>
                        <Button
                            action="primary"
                            onPress={() => setShowReportModal(false)}
                            sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                        >
                            <ButtonText sx={{ color: Theme.colors.sacredWhite }}>{t('common.done') || 'Done'}</ButtonText>
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
                        <Heading sx={{ color: colors.text, fontSize: 20 }}>
                            {t('classroom.inventory.requestSupplies') || 'Request Supplies'}
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} color={colors.textSecondary} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <VStack sx={{ gap: 4 }}>
                                <Text sx={{ color: colors.text, fontSize: 13, fontWeight: '700' as any }}>{t('classroom.inventory.itemName') || 'Item Name'}</Text>
                                <Input sx={{ height: 48, backgroundColor: colors.secondary }}>
                                    <InputField
                                        placeholder={t('classroom.inventory.itemNamePlaceholder') || 'e.g. Chalk, Notebooks'}
                                        color={colors.text}
                                        value={requestName}
                                        onChangeText={setRequestName}
                                    />
                                </Input>
                            </VStack>
                            <VStack sx={{ gap: 4 }}>
                                <Text sx={{ color: colors.text, fontSize: 13, fontWeight: '700' as any }}>
                                    {t('classroom.inventory.quantityLabel') || 'Quantity'}
                                </Text>
                                <Input sx={{ height: 48, backgroundColor: colors.secondary }}>
                                    <InputField
                                        placeholder="e.g. 1 Box"
                                        color={colors.text}
                                        value={requestQty}
                                        onChangeText={setRequestQty}
                                    />
                                </Input>
                            </VStack>
                            <VStack sx={{ gap: 4 }}>
                                <Text sx={{ color: colors.text, fontSize: 13, fontWeight: '700' as any }}>{t('classroom.inventory.reason') || 'Reason for Request'}</Text>
                                <Input sx={{ height: 48, backgroundColor: colors.secondary }}>
                                    <InputField
                                        placeholder={t('classroom.inventory.reasonPlaceholder') || 'e.g. Out of stock, New academic year'}
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
                            <ButtonText sx={{ color: colors.text }}>{t('common.cancel') || 'Cancel'}</ButtonText>
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
                            <ButtonText sx={{ color: Theme.colors.sacredWhite }}>
                                {requestMutation.isLoading ? t('classroom.inventory.sending') : t('classroom.inventory.submit')}
                            </ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
