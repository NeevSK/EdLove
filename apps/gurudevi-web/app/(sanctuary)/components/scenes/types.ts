import type { Landscape, LandscapeColours, SkyPalette } from '@repo/ui/theme/scene';

export interface SceneLayerProps {
  readonly id: string;
  readonly W: number;
  readonly H: number;
  readonly hy: number;
  readonly day: boolean;
  readonly light: number;
  readonly veil: number;
  readonly palette: SkyPalette;
  readonly groundColor: string;
  readonly ornamentColor: string;
  readonly lampColor: string;
  readonly inkColor: string;
  readonly effectiveGlow: string;
  readonly landscape?: Landscape | null;
  readonly colours?: LandscapeColours | null;
}
