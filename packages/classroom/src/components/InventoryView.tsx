import { api } from '@repo/core/api';
import { useSafeMutation } from '@repo/core/hooks';
import { CLASSROOM_RESOURCE_SCOPE } from '@repo/core/lib';
import { useStore } from '@repo/core/logic';
import type { InventoryCategory, InventoryCondition, InventoryItem } from '@repo/core/types';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { useThemedColors } from '@repo/ui/hooks';
import { Monitor, Package, PenTool, Plus, Sofa, X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  ScrollView,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import type React from 'react';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../hooks/useInventory';

const CATEGORIES: {
  id: InventoryCategory | 'all';
  labelKey: string;
  icon: React.ElementType;
}[] = [
  { id: 'all', labelKey: 'classroom.inventory.all', icon: Package },
  { id: 'furniture', labelKey: 'classroom.inventory.furniture', icon: Sofa },
  { id: 'supplies', labelKey: 'classroom.inventory.supplies', icon: PenTool },
  { id: 'equipment', labelKey: 'classroom.inventory.equipment', icon: Monitor },
];

interface InventoryViewProps {
  classroomId: string;
}

// ─── Type definitions for Reducer ───────────────────────────────────────────

type InventoryState = {
  selectedCategory: InventoryCategory | 'all';
  showReportModal: boolean;
  showRequestModal: boolean;
  selectedItem: InventoryItem | null;
  requestName: string;
  requestQty: string;
  requestReason: string;
};

type InventoryAction =
  | { type: 'SET_CATEGORY'; category: InventoryCategory | 'all' }
  | { type: 'OPEN_REPORT'; item: InventoryItem }
  | { type: 'CLOSE_REPORT' }
  | { type: 'OPEN_REQUEST' }
  | { type: 'CLOSE_REQUEST' }
  | { type: 'SET_REQUEST_NAME'; name: string }
  | { type: 'SET_REQUEST_QTY'; qty: string }
  | { type: 'SET_REQUEST_REASON'; reason: string }
  | { type: 'RESET_REQUEST_FORM' };

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'OPEN_REPORT':
      return { ...state, showReportModal: true, selectedItem: action.item };
    case 'CLOSE_REPORT':
      return { ...state, showReportModal: false, selectedItem: null };
    case 'OPEN_REQUEST':
      return { ...state, showRequestModal: true };
    case 'CLOSE_REQUEST':
      return { ...state, showRequestModal: false };
    case 'SET_REQUEST_NAME':
      return { ...state, requestName: action.name };
    case 'SET_REQUEST_QTY':
      return { ...state, requestQty: action.qty };
    case 'SET_REQUEST_REASON':
      return { ...state, requestReason: action.reason };
    case 'RESET_REQUEST_FORM':
      return { ...state, requestName: '', requestQty: '', requestReason: '' };
    default:
      return state;
  }
}

interface InventoryAPIProxy {
  createRequest(params: {
    classroom_id: string;
    school_id: string;
    teacher_id: string;
    item_name: string;
    quantity: number;
    reason: string;
  }): Promise<unknown>;
}

export default function InventoryView({ classroomId }: InventoryViewProps) {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const { user } = useStore();
  const showToast = useStore((state) => state.showToast);
  const { items, isLoading, setItems } = useInventory(classroomId);

  const [state, dispatch] = useReducer(inventoryReducer, {
    selectedCategory: 'all',
    showReportModal: false,
    showRequestModal: false,
    selectedItem: null,
    requestName: '',
    requestQty: '',
    requestReason: '',
  });

  const reportMutation = useSafeMutation(
    async (variables: { id: string; condition: InventoryCondition }) => {
      return api.inventory.update(variables.id, {
        condition: variables.condition,
      });
    },
    {
      onMutate: async ({ id, condition }) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, condition } : item)));
      },
      onSuccess: () => {
        hapticSuccess();
        showToast(t('classroom.inventory.updateSuccess') || 'Condition updated', 'success');
      },
    },
  );

  const requestMutation = useSafeMutation(
    async (variables: { item_name: string; quantity: string; reason: string }) => {
      const inventoryService = api.inventory as unknown as InventoryAPIProxy;
      return inventoryService.createRequest({
        classroom_id: classroomId,
        school_id: user?.school_id || '',
        teacher_id: user?.id || '',
        ...CLASSROOM_RESOURCE_SCOPE,
        item_name: variables.item_name,
        quantity: parseInt(variables.quantity, 10) || 0,
        reason: variables.reason,
      });
    },
    {
      onSuccess: () => {
        hapticSuccess();
        showToast(t('classroom.inventory.requestSent') || 'Request sent', 'success');
        dispatch({ type: 'RESET_REQUEST_FORM' });
      },
    },
  );

  const filteredItems =
    state.selectedCategory === 'all'
      ? items
      : items.filter((item) => item.category === state.selectedCategory);

  const getConditionColor = (condition: InventoryCondition) => {
    switch (condition) {
      case 'good':
        return Theme.colors.sageGreen;
      case 'fair':
        return Theme.colors.templeGold;
      case 'poor':
        return Theme.colors.sanctuarySaffron;
      case 'broken':
        return Theme.colors.emberRed;
      default:
        return Theme.colors.starlightGray;
    }
  };

  const handleReportIssue = (item: InventoryItem) => {
    dispatch({ type: 'OPEN_REPORT', item });
  };

  return (
    <Box className="flex-1">
      <Box className="pb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Theme.spacing.md,
            gap: 8,
          }}
        >
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = state.selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  hapticLight();
                  dispatch({ type: 'SET_CATEGORY', category: cat.id });
                }}
                className={`px-4 py-1 rounded-full flex-row items-center gap-1.5 ${isActive ? 'bg-[--sanctuarySaffron] border-[--sanctuarySaffron]' : 'bg-transparent border-[--starlightGray]'}`}
                style={{
                  borderWidth: 1,
                  borderColor: isActive ? Theme.colors.sanctuarySaffron : colors.border,
                }}
                accessibilityRole="button"
                accessibilityLabel={t(cat.labelKey) || cat.id}
              >
                <IconComponent
                  size={14}
                  color={isActive ? Theme.colors.sacredWhite : colors.textSecondary}
                />
                <Text
                  className={`text-[13px] ${isActive ? 'text-[--sacredWhite] font-bold' : 'text-[--starlightGray] font-normal'}`}
                  style={{
                    color: isActive ? Theme.colors.sacredWhite : colors.textSecondary,
                  }}
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
              type="anonymous"
              title={t('classroom.inventory.guestTitle') || 'Limited Access'}
              description={
                t('classroom.inventory.guestDesc') ||
                'Sign in to manage and report classroom inventory.'
              }
            />
          ) : filteredItems.length === 0 ? (
            <Box className="p-10 items-center">
              <Text className="text-[--starlightGray]">
                {t('common.noItemsFound') || 'No inventory items found'}
              </Text>
            </Box>
          ) : (
            filteredItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleReportIssue(item)}
                className="bg-[--vellum] rounded-xl p-4"
                style={{ backgroundColor: colors.secondary }}
                accessibilityRole="button"
                accessibilityLabel={
                  t('classroom.inventory.reportIssueFor', { name: item.name }) ||
                  `Report issue for ${item.name}`
                }
              >
                <HStack className="justify-between items-center">
                  <HStack className="gap-4 items-center">
                    <Box
                      className="w-10 h-10 rounded-xl items-center justify-center bg-[--silk]"
                      style={{ backgroundColor: colors.tertiary }}
                    >
                      <Icon as={Package} size={20} color={colors.text} />
                    </Box>
                    <VStack>
                      <Text className="font-bold" style={{ color: colors.text }}>
                        {item.name}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {t('classroom.inventory.quantity', {
                          count: item.quantity,
                        }) || `${item.quantity} units`}
                      </Text>
                    </VStack>
                  </HStack>

                  <Box
                    className="px-2 py-0.5 rounded-sm"
                    style={{
                      backgroundColor: getConditionColor(item.condition),
                    }}
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
        onPress={() => {
          hapticLight();
          dispatch({ type: 'OPEN_REQUEST' });
        }}
        className="absolute bottom-5 right-5 rounded-full bg-[--sanctuarySaffron] shadow-lg h-14 px-6"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
        accessibilityRole="button"
        accessibilityLabel={t('classroom.inventory.requestSupplies') || 'Request Supplies'}
      >
        <HStack className="gap-2 items-center">
          <ButtonText className="text-[--sacredWhite]">
            {t('classroom.inventory.requestSupplies') || 'Request Supplies'}
          </ButtonText>
          <Icon as={Plus} className="text-[--sacredWhite]" size={20} />
        </HStack>
      </Button>

      {/* Report Issue Modal */}
      <Modal isOpen={state.showReportModal} onClose={() => dispatch({ type: 'CLOSE_REPORT' })}>
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
                {t('classroom.inventory.reportIssueDesc') || 'Updating condition for:'}{' '}
                <Text className="font-bold" style={{ color: colors.text }}>
                  {state.selectedItem?.name}
                </Text>
              </Text>

              <Text className="text-[13px] font-bold" style={{ color: colors.text }}>
                {t('classroom.inventory.condition') || 'Condition'}
              </Text>
              <HStack className="gap-2 flex-wrap">
                {(['good', 'fair', 'poor', 'broken'] as const).map((cond) => (
                  <Pressable
                    key={cond}
                    onPress={() => {
                      if (state.selectedItem) {
                        void reportMutation.mutate({
                          id: state.selectedItem.id,
                          condition: cond,
                        });
                        dispatch({ type: 'CLOSE_REPORT' });
                      }
                    }}
                    className={`px-3 py-2 rounded-2xl ${cond === 'broken' ? 'bg-[--emberRed]' : 'bg-[--silk] border border-[--starlightGray]'}`}
                    style={{
                      backgroundColor: cond === 'broken' ? Theme.colors.emberRed : colors.tertiary,
                      opacity: reportMutation.isLoading ? 0.5 : 1,
                      borderColor: colors.border,
                    }}
                    disabled={reportMutation.isLoading}
                    accessibilityRole="button"
                    accessibilityLabel={cond}
                  >
                    <Text
                      className={`text-xs capitalize font-semibold ${cond === 'broken' ? 'text-white' : ''}`}
                      style={{
                        color: cond === 'broken' ? 'white' : colors.text,
                      }}
                    >
                      {cond}
                    </Text>
                  </Pressable>
                ))}
              </HStack>

              <Text className="text-[13px] mt-2 font-bold" style={{ color: colors.text }}>
                {t('classroom.inventory.notes') || 'Notes'}
              </Text>
              <Textarea>
                <TextareaInput
                  placeholder={
                    t('classroom.inventory.damagePlaceholder') || 'Describe any wear or damage...'
                  }
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
              onPress={() => dispatch({ type: 'CLOSE_REPORT' })}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel') || 'Cancel'}
            >
              <ButtonText style={{ color: colors.text }}>
                {t('common.cancel') || 'Cancel'}
              </ButtonText>
            </Button>
            <Button
              action="primary"
              onPress={() => dispatch({ type: 'CLOSE_REPORT' })}
              className="bg-[--sanctuarySaffron]"
              style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
              accessibilityRole="button"
              accessibilityLabel={t('common.done') || 'Done'}
            >
              <ButtonText className="text-[--sacredWhite]">{t('common.done') || 'Done'}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Request Supplies Modal */}
      <Modal isOpen={state.showRequestModal} onClose={() => dispatch({ type: 'CLOSE_REQUEST' })}>
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
                <Text className="text-[13px] font-bold" style={{ color: colors.text }}>
                  {t('classroom.inventory.itemName') || 'Item Name'}
                </Text>
                <Input className="h-12 bg-[--silk]" style={{ backgroundColor: colors.secondary }}>
                  <InputField
                    placeholder={
                      t('classroom.inventory.itemNamePlaceholder') || 'e.g. Chalk, Notebooks'
                    }
                    style={{ color: colors.text }}
                    value={state.requestName}
                    onChangeText={(val) => dispatch({ type: 'SET_REQUEST_NAME', name: val })}
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
                    value={state.requestQty}
                    onChangeText={(val) => dispatch({ type: 'SET_REQUEST_QTY', qty: val })}
                  />
                </Input>
              </VStack>
              <VStack className="gap-1">
                <Text className="text-[13px] font-bold" style={{ color: colors.text }}>
                  {t('classroom.inventory.reason') || 'Reason for Request'}
                </Text>
                <Input className="h-12 bg-[--silk]" style={{ backgroundColor: colors.secondary }}>
                  <InputField
                    placeholder={
                      t('classroom.inventory.reasonPlaceholder') ||
                      'e.g. Out of stock, New academic year'
                    }
                    style={{ color: colors.text }}
                    value={state.requestReason}
                    onChangeText={(val) => dispatch({ type: 'SET_REQUEST_REASON', reason: val })}
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
              onPress={() => dispatch({ type: 'CLOSE_REQUEST' })}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel') || 'Cancel'}
            >
              <ButtonText style={{ color: colors.text }}>
                {t('common.cancel') || 'Cancel'}
              </ButtonText>
            </Button>
            <Button
              action="primary"
              onPress={() => {
                void requestMutation.mutate({
                  item_name: state.requestName,
                  quantity: state.requestQty,
                  reason: state.requestReason,
                });
                dispatch({ type: 'CLOSE_REQUEST' });
              }}
              className="bg-[--sanctuarySaffron]"
              style={{ backgroundColor: Theme.colors.sanctuarySaffron }}
              disabled={!state.requestName || !state.requestQty || requestMutation.isLoading}
              accessibilityRole="button"
              accessibilityLabel={t('classroom.inventory.submit') || 'Submit'}
            >
              <ButtonText className="text-[--sacredWhite]">
                {requestMutation.isLoading
                  ? t('classroom.inventory.sending')
                  : t('classroom.inventory.submit')}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
