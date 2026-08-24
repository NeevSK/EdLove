import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { Plus } from '@repo/ui/icons';

interface SchoolJoinPromptProps {
  onAction?: () => void;
}

export function SchoolJoinPrompt({ onAction }: SchoolJoinPromptProps) {
  return (
    <PositiveInvitation
      title="Join a School"
      description="You need to join or create a school structure to access this area."
      type="empty"
      context="classroom"
      icon={Plus}
      actionLabel="Join School"
      onAction={onAction ?? (() => {})}
    />
  );
}
