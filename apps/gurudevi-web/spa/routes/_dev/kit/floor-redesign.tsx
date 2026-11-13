import { createFileRoute } from '@tanstack/react-router';
import { FloorRedesignClient } from '../../../../app/(sanctuary)/kit/floor-redesign/FloorRedesignClient';

export const Route = createFileRoute('/_dev/kit/floor-redesign')({
  head: () => ({ meta: [{ title: 'Floor Redesign Prototype | Gurudevi Dev' }] }),
  component: KitFloorRedesignScreen,
});

function KitFloorRedesignScreen() {
  return <FloorRedesignClient />;
}
