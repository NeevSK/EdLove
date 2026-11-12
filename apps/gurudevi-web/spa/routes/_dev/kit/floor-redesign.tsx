import { createFileRoute } from '@tanstack/react-router';
import { FloorRedesignClient } from '../../../../app/(sanctuary)/kit/floor-redesign/FloorRedesignClient';

export const Route = createFileRoute('/_dev/kit/floor-redesign')({
  component: KitFloorRedesignScreen,
});

function KitFloorRedesignScreen() {
  return <FloorRedesignClient />;
}
