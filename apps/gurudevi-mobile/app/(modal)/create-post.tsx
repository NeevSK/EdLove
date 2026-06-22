import { CreatePostModal } from '@repo/community';
import { safeBack } from '@repo/ui/utils/navigation';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

export default function CreatePostRoute() {
  const params = useLocalSearchParams<{ groupId?: string }>();
  const handleClose = useCallback(() => safeBack('/community'), []);
  const handleSuccess = useCallback(() => safeBack('/community'), []);
  return (
    <CreatePostModal
      isOpen
      groupId={params.groupId}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}
