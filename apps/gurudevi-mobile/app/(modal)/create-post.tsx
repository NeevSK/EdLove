import { CreatePostModal } from '@repo/community';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { safeBack } from '@repo/ui/utils/navigation';

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
