import { createFileRoute } from '@tanstack/react-router';
import { KitComponentsDirectory } from '../../../../app/(sanctuary)/kit/components/KitComponentsDirectory';

export const Route = createFileRoute('/kit/components/')({
  component: KitComponentsDirectory,
});
