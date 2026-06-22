import { CreateGroupModal } from '@repo/community';
import { safeBack } from '@repo/ui/utils/navigation';
import { useCallback } from 'react';

export default function CreateGroupRoute() {
  const handleClose = useCallback(() => safeBack('/community'), []);
  const handleCreated = useCallback(() => safeBack('/community'), []);

  return <CreateGroupModal isOpen onClose={handleClose} onCreated={handleCreated} />;
}
