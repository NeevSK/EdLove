import { CreateGroupModal } from '@repo/community';
import { router } from 'expo-router';
import { useCallback } from 'react';

export default function CreateGroupRoute() {
  const handleClose = useCallback(() => router.back(), []);
  const handleCreated = useCallback(() => router.back(), []);

  return <CreateGroupModal isOpen onClose={handleClose} onCreated={handleCreated} />;
}
