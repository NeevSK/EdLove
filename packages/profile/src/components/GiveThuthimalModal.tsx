import { thuthimalAPI } from '@repo/core/api/client';

import { useLotusToast } from '@repo/ui/hooks';
import { X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticError, hapticSuccess } from '@repo/ui/utils/haptics';
import { useCallback, useState } from 'react';
import { Modal } from 'react-native';

interface GiveThuthimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  /** Role of the recipient - used to attribute the gift correctly. Defaults to 'teacher'. */
  recipientTier?: string;
  /** ID of the giver. */
  giverId: string;
  /** Name of the giver. */
  giverName: string;
}

/**
 * GIVE THUTHIMAL MODAL
 * Sanctuary V3 standard for gifting gratitude (Pro subscriptions).
 * Features premium glassmorphism and standardized Sanctuary primitives.
 */
export function GiveThuthimalModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientTier = 'teacher',
  giverId,
  giverName,
}: GiveThuthimalModalProps) {
  const { showToast } = useLotusToast();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = useCallback(async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      await thuthimalAPI.createGift({
        gifter_id: giverId,
        gifterName: giverName,
        recipientTier: recipientTier as 'teacher' | 'principal',
        recipientId: recipientId,
        message: message.trim() || undefined,
      });
      hapticSuccess();
      showToast({
        message: 'Your gift of gratitude has been sent 🎁',
        type: 'sanctuary',
      });
      setMessage('');
      onClose();
    } catch (e: any) {
      hapticError();
      showToast({
        message: e?.message ?? 'Could not send gift. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  }, [isSending, giverId, giverName, recipientTier, recipientId, message, showToast, onClose]);

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Box className="flex-1 justify-end bg-black/60">
        <Box className="bg-phase-canvas rounded-t-[48px] p-10 pb-16 border-t border-phase-surface shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
          <VStack space="xl">
            <HStack className="justify-between items-center px-1">
              <VStack>
                <Heading className="text-2xl text-phase-text-primary font-bold tracking-tight">
                  🎁 Give Gratitude
                </Heading>
                <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest mt-1">
                  THUTHIMAL GIFT
                </Text>
              </VStack>
              <Pressable
                onPress={onClose}
                accessibilityLabel="Close"
                className="w-10 h-10 rounded-full bg-phase-surface items-center justify-center active:scale-95 transition-all"
              >
                <Icon as={X} size={24} color="#E67E22" />
              </Pressable>
            </HStack>

            <Box className="bg-phase-surface/30 p-5 rounded-3xl border border-phase-surface/50">
              <Text className="text-sm text-phase-text-secondary leading-6 font-medium">
                Send a Thuthimal gift to{' '}
                <Text className="text-phase-text-primary font-bold">{recipientName}</Text>. They
                will receive a notification when the gift is claimed.
              </Text>
            </Box>

            {/* Optional personal message */}
            <VStack space="xs">
              <Text className="text-phase-text-tertiary text-[10px] font-bold uppercase tracking-widest ml-1 mb-1">
                PERSONAL MESSAGE
              </Text>
              <Input
                className="h-32 rounded-[32px] bg-phase-surface/20 border-phase-surface/50 p-2"
                isDisabled={isSending}
              >
                <InputField
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Tell them why you're grateful..."
                  placeholderTextColor="#9DA1A3"
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                  className="text-phase-text-primary p-4 font-medium"
                  style={{ textAlignVertical: 'top' }}
                  accessibilityLabel="Personal message"
                />
              </Input>
            </VStack>

            <Button
              size="lg"
              className="mt-4 bg-phase-interactive rounded-3xl h-16 shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
              isDisabled={isSending}
              onPress={handleSend}
              accessibilityLabel="Send gift of gratitude"
            >
              <ButtonText className="text-white font-bold text-lg">
                {isSending ? 'Sending Gratitude...' : 'Send Gift of Gratitude'}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}
