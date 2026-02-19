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
import { useInventory } from '../hooks/classroom/useInventory';
import {
    InventoryItem,
    InventoryCategory,
    InventoryCondition,
    api,
    useStore,
    useSafeMutation
} from '@repo/core';

const CATEGORIES: { id: InventoryCategory; label: string; icon: any }[] = [
    { id: 'furniture', label: 'Furniture', icon: Sofa },
    { id: 'supplies', label: 'Supplies', icon: PenTool },
    { id: 'equipment', label: 'Equipment', icon: Monitor },
];

interface InventoryViewProps {
    classroomId: string;
}

export default function InventoryView({ classroomId }: InventoryViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
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
                showToast('Condition updated successfully', 'success');
            }
        }
    );

    const requestMutation = useSafeMutation(
        (variables: { item_name: string; quantity: string; reason: string }) =>
            api.inventory.createRequest({
                classroom_id: classroomId,
                teacher_id: 'current-teacher-id', // TODO: Get from store
                item_name: variables.item_name,
                quantity: variables.quantity,
                reason: variables.reason
            }),
        {
            onSuccess: () => {
                hapticSuccess();
                showToast('Supply request sent', 'success');
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
            default: return Theme.colors.slateGray;
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
                    <Text color={selectedCategory === 'all' ? Theme.colors.white : colors.textSecondary} sx={{ fontSize: 13 }}>
                        All
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
                        <cat.icon size={14} color={selectedCategory === cat.id ? Theme.colors.white : colors.textSecondary} />
                        <Text color={selectedCategory === cat.id ? Theme.colors.white : colors.textSecondary} sx={{ fontSize: 13 }}>
                            {cat.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Inventory List */}
            <VStack sx={{ paddingHorizontal: Theme.spacing.md, gap: Theme.spacing.md }}>
                {filteredItems.map(item => (
                    <Pressable
                        key={item.id}
                        onPress={() => handleReportIssue(item)}
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.md,
                        }}
                    >
                        <HStack justifyContent="space-between" alignItems="center">
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
                                    <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>Quantity: {item.quantity}</Text>
                                </VStack>
                            </HStack>

                            <Box
                                px="$2"
                                py="$1"
                                sx={{
                                    backgroundColor: getConditionColor(item.condition),
                                    borderRadius: Theme.corners.tight,
                                }}
                            >
                                <Text color={Theme.colors.white} sx={{ fontSize: 12, textTransform: 'capitalize', fontWeight: 'bold' }}>
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
                <ButtonText color={Theme.colors.white} mr="$2">Request Supplies</ButtonText>
                <Plus color={Theme.colors.white} size={20} />
            </Button>

            {/* Report Issue Modal */}
            <Modal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            >
                <ModalBackdrop />
                <ModalContent bg={colors.primary}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 20 }}>Report Issue</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Text color={colors.textSecondary} mb="$4">
                            Reporting issue for: <Text color={colors.text} sx={{ fontWeight: 'bold' }}>{selectedItem?.name}</Text>
                        </Text>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <Text color={colors.text} sx={{ fontSize: 13 }}>Condition</Text>
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

                            <Text color={colors.text} sx={{ fontSize: 13, marginTop: 8 }}>Notes</Text>
                            <Textarea>
                                <TextareaInput placeholder="Describe the damage..." color={colors.text} />
                            </Textarea>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            action="secondary"
                            mr="$3"
                            onPress={() => setShowReportModal(false)}
                        >
                            <ButtonText>Cancel</ButtonText>
                        </Button>
                        <Button
                            action="negative"
                            onPress={() => {
                                setShowReportModal(false);
                                // Show toast logic here
                            }}
                        >
                            <ButtonText>Report Damage</ButtonText>
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
                <ModalContent bg={colors.primary}>
                    <ModalHeader>
                        <Heading color={colors.text} sx={{ fontSize: 20 }}>Request Supplies</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <VStack sx={{ gap: 4 }}>
                                <Text color={colors.text} sx={{ fontSize: 13 }}>Item Name</Text>
                                <Input>
                                    <InputField
                                        placeholder="e.g. Chalk, Markers"
                                        color={colors.text}
                                        value={requestName}
                                        onChangeText={setRequestName}
                                    />
                                </Input>
                            </VStack>
                            <VStack sx={{ gap: 4 }}>
                                <Text color={colors.text} sx={{ fontSize: 13 }}>Quantity</Text>
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
                                <Text color={colors.text} sx={{ fontSize: 13 }}>Reason (Optional)</Text>
                                <Input>
                                    <InputField
                                        placeholder="Classroom supply ran out"
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
                            mr="$3"
                            onPress={() => setShowRequestModal(false)}
                        >
                            <ButtonText>Cancel</ButtonText>
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
                            <ButtonText>{requestMutation.isLoading ? 'Sending...' : 'Submit Request'}</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    );
}
