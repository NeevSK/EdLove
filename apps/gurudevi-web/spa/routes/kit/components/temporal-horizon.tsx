import { createFileRoute } from '@tanstack/react-router';
import { TemporalHorizonComparison } from '../../../../app/(sanctuary)/kit/components/temporal-horizon/TemporalHorizonComparison';

export const Route = createFileRoute('/kit/components/temporal-horizon')({
  component: TemporalHorizonComparison,
});
