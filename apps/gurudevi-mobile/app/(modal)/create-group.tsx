import { CreateGroupModal } from '@repo/community';
import { useCallback } from 'react';
import { safeBack } from '@repo/ui/utils/navigation';

export default function CreateGroupRoute() {
  const handleClose = useCallback(() => safeBack('/community'), []);
  const handleCreated = useCallback(() => safeBack('/community'), []);

  return <CreateGroupModal isOpen onClose={handleClose} onCreated={handleCreated} />;
}
