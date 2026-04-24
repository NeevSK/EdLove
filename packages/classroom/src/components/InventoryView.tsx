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
    Monitor,
    X
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
        <Box className="flex-1">
            <Box className="pb-4">
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
                                className={`px-4 py-1 rounded-full flex-row items-center gap-1.5 ${isActive ? 'bg-[--sanctuarySaffron] border-[--sanctuarySaffron]' : 'bg-transparent border-[--starlightGray]'}`}
                                style={{
                                    borderWidth: 1,
                                    borderColor: isActive ? Theme.colors.sanctuarySaffron : colors.border
                                }}
                            >
                                <IconComponent size={14} color={isActive ? Theme.colors.sacredWhite : colors.textSecondary} />
                                <Text 
                                    className={`text-[13px] ${isActive ? 'text-[--sacredWhite] font-bold' : 'text-[--starlightGray] font-normal'}`}
                                    style={{ color: isActive ? Theme.colors.sacredWhite : colors.textSecondary }}
                                >
                                    {t(cat.labelKey) || cat.id}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </Box>

            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack className="px-4 gap-4 pb-[100px]">
                    {!user ? (
                        <PositiveInvitation
                            type="guest"
                            title={t('classroom.inventory.guestTitle') || 'Limited Access'}
                            description={t('classroom.inventory.guestDesc') || 'Sign in to manage and report classroom inventory.'}
                        />
                    ) : filteredItems.length === 0 ? (
                        <Box className="p-10 items-center">
                            <Text className="text-[--starlightGray]">{t('common.noItemsFound') || 'No inventory items found'}</Text>
                        </Box>
                    ) : (
                        filteredItems.map(item => (
                            <Pressable
                                key={item.id}
                                onPress={() => handleReportIssue(item)}
                                className="bg-[--vellum] rounded-xl p-4"
                                style={{ backgroundColor: colors.secondary }}
                            >
                                <HStack className="justify-between items-center">
                                    <HStack className="gap-4 items-center">
                                        <Box className="w-10 h-10 rounded-xl items-center justify-center bg-[--silk]" style={{ backgroundColor: colors.tertiary }}>
                                            <Package size={20} color={colors.text} />
                                        </Box>
                                        <VStack>
                                            <Text className="font-bold" style={{ color: colors.text }}>{item.name}</Text>
                                            <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                                {t('classroom.inventory.quantity', { count: item.quantity }) || `${item.quantity} units`}
                                            </Text>
                                        </VStack>
                                    </HStack>

                                    <Box 
                                        className="px-2 py-0.5 rounded-sm"
                                        style={{ backgroundColor: getConditionColor(item.condition) }}
                                    >
                                        <Text className="text-[--sacredWhite] text-xs capitalize font-bold">
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
                className="absolute bottom-5 right-5 rounded-full bg-[--sanctuarySaffron] shadow-lg h-14 px-6"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 8,
                }}
            >
                <HStack className="gap-2 items-center">
                    <ButtonText className="text-[--sacredWhite]">
                        {t('classroom.inventory.requestSupplies') || 'Request Supplies'}
                    </ButtonText>
                    <Icon as={Plus} className="text-[--sacredWhite]" size={20} />
                </HStack>
            </Button>

            {/* Report Issue Modal */}
            <Modal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            >
                <ModalBackdrop />
                <ModalContent className="bg-[--vellum]" style={{ backgroundColor: colors.primary }}>
                    <ModalHeader>
                        <Heading className="text-xl" style={{ color: colors.text }}>
                            {t('classroom.inventory.reportIssue') || 'Report Condition'}
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={X} style={{ color: colors.textSecondary }} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack className="gap-4">
                            <Text style={{ color: colors.textSecondary }}>
                                {t('classroom.inventory.reportIssueDesc') || 'Updating condition for:'} <Text className="font-bold" style={{ color: colors.text }}>{selectedItem?.name}</Text>
                            </Text>
                            
                            <Text className="text-[13px] font-bold" style={{ color: colors.text }}>{t('classroom.inventory.condition') || 'Condition'}</Text>
                            <HStack className="gap-2 flex-wrap">
                                {(['good', 'fair', 'poor', 'broken'] as const).map(cond => (
                                    <Pressable
                                        key={cond}
                                        onPress={() => {
                                            if (selectedItem) {
                                                reportMutation.mutate({ id: selectedItem.id, condition: cond });
                                                setShowReportModal(false);
                                            }
                                        }}
                                        className={`px-3 py-2 rounded-2xl ${cond === 'broken' ? 'bg-[--emberRed]' : 'bg-[--silk] border border-[--starlightGray]'}`}
                                        style={{
                                            backgroundColor: cond === 'broken' ? Theme.colors.emberRed : colors.tertiary,
                                            opacity: reportMutation.isLoading ? 0.5 : 1,
                                            borderColor: colors.border
                                        }}
                                        disabled={reportMutation.isLoading}
                                    >
                                        <Text 
                                            className={`text-xs capitalize font-semibold ${cond === 'broken' ? 'text-white' : ''}`}
                                            style={{ color: cond === 'broken' ? 'white' : colors.text }}
                                        >
                                            {cond}
                                        </Text>
                                    </Pressable>
                                ))}
                            </HStack>

                            <Text className="text-[13px] mt-2 font-bold" style={{ color: colors.text }}>{t('classroom.inventory.notes') || 'Notes'}</Text>
                            <Textarea>
                                <TextareaInput 
                                    placeholder={t('classroom.inventory.damagePlaceholder') || 'Describe any wear or damage...'} 
                                    style={{ color: colors.text }} 
                                />
                            </Textarea>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            action="secondary"
                            className="mr-2"
                            onPress={() => setShowReportModal(false)}
                        >
                            <ButtonText style={{ color: colors.text }}>{t('common.cancel') || 'Cancel'}</ButtonText>
                        </Button>
                        <Button
                            action="primary"
                            onPress={() => setShowReportModal(false)}
                            className="bg-[--sanctuarySaffron]"
                            style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                        >
                            <ButtonText className="text-[--sacredWhite]">{t('common.done') || 'Done'}</ButtonText>
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
                <ModalContent className="bg-[--vellum]" style={{ backgroundColor: colors.primary }}>
                    <ModalHeader>
                        <Heading className="text-xl" style={{ color: colors.text }}>
                            {t('classroom.inventory.requestSupplies') || 'Request Supplies'}
                        </Heading>
                        <ModalCloseButton>
                            <Icon as={X} style={{ color: colors.textSecondary }} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack className="gap-4">
                            <VStack className="gap-1">
                                <Text className="text-[13px] font-bold" style={{ color: colors.text }}>{t('classroom.inventory.itemName') || 'Item Name'}</Text>
                                <Input className="h-12 bg-[--silk]" style={{ backgroundColor: colors.secondary }}>
                                    <InputField
                                        placeholder={t('classroom.inventory.itemNamePlaceholder') || 'e.g. Chalk, Notebooks'}
                                        style={{ color: colors.text }}
                                        value={requestName}
                                        onChangeText={setRequestName}
                                    />
                                </Input>
                            </VStack>
                            <VStack className="gap-1">
                                <Text className="text-[13px] font-bold" style={{ color: colors.text }}>
                                    {t('classroom.inventory.quantityLabel') || 'Quantity'}
                                </Text>
                                <Input className="h-12 bg-[--silk]" style={{ backgroundColor: colors.secondary }}>
                                    <InputField
                                        placeholder="e.g. 1 Box"
                                        style={{ color: colors.text }}
                                        value={requestQty}
                                        onChangeText={setRequestQty}
                                    />
                                </Input>
                            </VStack>
                            <VStack className="gap-1">
                                <Text className="text-[13px] font-bold" style={{ color: colors.text }}>{t('classroom.inventory.reason') || 'Reason for Request'}</Text>
                                <Input className="h-12 bg-[--silk]" style={{ backgroundColor: colors.secondary }}>
                                    <InputField
                                        placeholder={t('classroom.inventory.reasonPlaceholder') || 'e.g. Out of stock, New academic year'}
                                        style={{ color: colors.text }}
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
                            className="mr-2"
                            onPress={() => setShowRequestModal(false)}
                        >
                            <ButtonText style={{ color: colors.text }}>{t('common.cancel') || 'Cancel'}</ButtonText>
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
                            className="bg-[--sanctuarySaffron]"
                            style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
                            disabled={!requestName || !requestQty || requestMutation.isLoading}
                        >
                            <ButtonText className="text-[--sacredWhite]">
                                {requestMutation.isLoading ? t('classroom.inventory.sending') : t('classroom.inventory.submit')}
                            </ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
