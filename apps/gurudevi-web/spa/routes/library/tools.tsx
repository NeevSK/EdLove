import { createFileRoute } from '@tanstack/react-router';
import { ToolsWorkbenchDesk } from '../../../app/(sanctuary)/library/tools/ToolsWorkbenchDesk';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/library/tools')({
  component: LibraryToolsScreen,
});

function LibraryToolsScreen() {
  const { displayName } = useSession();
  return <ToolsWorkbenchDesk displayName={displayName} />;
}
