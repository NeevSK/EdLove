import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { Sparkles } from '@repo/ui/icons';

interface UpgradePromptProps {
  requiredTier?: string;
  currentTier?: string;
  onAction?: () => void;
}

export function UpgradePrompt({
  requiredTier = 'PRO',
  currentTier = 'FREE',
  onAction,
}: UpgradePromptProps) {
  return (
    <PositiveInvitation
      title="Upgrade Required"
      description={`This feature requires the ${requiredTier} entitlement tier. Your current tier is ${currentTier}.`}
      type="empty"
      icon={Sparkles}
      actionLabel="Upgrade Now"
      onAction={onAction ?? (() => {})}
    />
  );
}
