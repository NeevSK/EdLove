import { Dialog } from '@repo/ui/components/native';
import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { ContainedModalOverContent } from 'react-native-screens';
import { useWorld } from '@repo/ui/theme/native';

export interface ContainedColumnModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  targetContainerId?: string;
  /** When true (e.g. tablet split column on iOS), confines modal to the target column. */
  contained?: boolean;
  children: ReactNode;
}

/**
 * Column-scoped native modal (`ContainedModalOverContent` from `react-native-screens` v5) on iOS
 * regular-width split columns, falling back to the world's `Dialog` on compact phones and Android.
 */
export function ContainedColumnModal({
  open,
  onClose,
  title,
  targetContainerId = 'workspace-detail',
  contained = false,
  children,
}: ContainedColumnModalProps) {
  const t = useWorld().tokens;

  if (contained && Platform.OS === 'ios') {
    return (
      <ContainedModalOverContent
        isOpen={open}
        targetContainerId={targetContainerId}
        onDidDisappear={onClose}
        onPresentationRejected={onClose}
      >
        <View style={{ flex: 1, backgroundColor: t.ground, padding: 20 }}>{children}</View>
      </ContainedModalOverContent>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      {children}
    </Dialog>
  );
}
