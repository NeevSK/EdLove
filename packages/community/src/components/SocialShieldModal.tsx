import { SocialShieldModal as UISocialShieldModal } from '@repo/ui/components/social/SocialShieldModal';
import { useLotusToast } from '@repo/ui/hooks';
import { hapticError, hapticSuccess } from '@repo/ui/utils';
import { useCallback, useState } from 'react';
import { type ReportTarget, useSocialShield } from '../hooks/useSocialShield';

interface SocialShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  groupId?: string;
  targetUserId?: string;
  targetUserName?: string;
}

export default function SocialShieldModal({
  isOpen,
  onClose,
  postId,
  groupId,
  targetUserId,
  targetUserName = 'this user',
}: SocialShieldModalProps) {
  const { submitReport, blockUser } = useSocialShield();
  const { showToast } = useLotusToast();
  const [reason, setReason] = useState('');
  const [target, setTarget] = useState<ReportTarget>('platform');
  const [shouldBlock, setShouldBlock] = useState(false);
  const [step, setStep] = useState<'reason' | 'target'>('reason');

  const handleClose = useCallback(() => {
    onClose();
    setReason('');
    setTarget('platform');
    setShouldBlock(false);
    setStep('reason');
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!reason || !target) return;

    const result = await submitReport({
      postId,
      groupId,
      targetUserId,
      reason,
      target,
    });

    if (!result?.success) {
      hapticError();
      showToast({
        message: 'Failed to submit report. Please try again.',
        type: 'error',
      });
      return;
    }

    if (shouldBlock && targetUserId) {
      const blockResult = await blockUser(targetUserId);
      if (!blockResult?.success) {
        hapticError();
        showToast({
          message: 'Report submitted, but blocking failed.',
          type: 'error',
        });
        handleClose();
        return;
      }
    }

    hapticSuccess();
    showToast({
      message: 'Thank you for sharing your concern. Our guardians will review this shortly.',
      type: 'success',
    });
    handleClose();
  }, [
    blockUser,
    groupId,
    handleClose,
    postId,
    reason,
    shouldBlock,
    showToast,
    submitReport,
    target,
    targetUserId,
  ]);

  return (
    <UISocialShieldModal
      isOpen={isOpen}
      onClose={handleClose}
      postId={postId}
      groupId={groupId}
      targetUserId={targetUserId}
      targetUserName={targetUserName}
      reason={reason}
      target={target}
      shouldBlock={shouldBlock}
      step={step}
      onSetReason={setReason}
      onSetTarget={setTarget}
      onToggleBlock={() => setShouldBlock((prev) => !prev)}
      onSetStep={setStep}
      onSubmit={handleSubmit}
    />
  );
}
