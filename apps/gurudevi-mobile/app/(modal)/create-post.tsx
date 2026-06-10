import { CreatePostModal } from '@repo/community';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';

export default function CreatePostRoute() {
  const params = useLocalSearchParams<{ groupId?: string }>();
  const handleClose = useCallback(() => router.back(), []);
  const handleSuccess = useCallback(() => router.back(), []);
  return (
    <CreatePostModal
      isOpen
      groupId={params.groupId}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
}
