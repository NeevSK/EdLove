import { createContext, type ReactNode, useContext } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { FireflyMascot } from './FireflyMascot';
import type { MascotPodVariant } from './MascotPod';
import {
  type MascotAppearance,
  type MascotMode,
  type MascotRole,
  type MascotState,
  type MascotTheme,
  stateFromMascotMode,
} from './mascotTypes';

export type { MascotMode } from './mascotTypes';

export type MascotId = 'firefly';

export type MascotArtworkSource = {
  source: ImageSourcePropType;
  accessibilityLabel: string;
};

export type MascotConfig = {
  id: MascotId;
  name: string;
  role?: MascotRole;
  theme?: MascotTheme;
  artwork?: MascotArtworkSource;
  artworkByState?: Partial<Record<MascotState, MascotArtworkSource>>;
  artworkByRole?: Partial<Record<MascotRole, MascotArtworkSource>>;
  artworkByRoleAndState?: Partial<
    Record<MascotRole, Partial<Record<MascotState, MascotArtworkSource>>>
  >;
};

const DEFAULT_MASCOT: MascotConfig = { id: 'firefly', name: 'Tutii' };
const MascotContext = createContext<MascotConfig>(DEFAULT_MASCOT);

export function MascotProvider({
  config,
  children,
}: {
  config?: MascotConfig;
  children: ReactNode;
}) {
  return (
    <MascotContext.Provider value={config ?? DEFAULT_MASCOT}>{children}</MascotContext.Provider>
  );
}

export function useMascot() {
  return useContext(MascotContext);
}

export function Mascot({
  size,
  mode,
  glowColor,
  role,
  state,
  theme,
  artwork,
  podVariant,
}: {
  size: number;
  mode: MascotMode;
  glowColor?: string;
  role?: MascotRole;
  state?: MascotAppearance['state'];
  theme?: MascotTheme;
  artwork?: MascotArtworkSource;
  podVariant?: MascotPodVariant;
}) {
  const mascot = useMascot();
  const resolvedState = state ?? stateFromMascotMode(mode);
  const resolvedRole = role ?? mascot.role ?? 'guide';
  const roleStateArtwork = mascot.artworkByRoleAndState?.[resolvedRole]?.[resolvedState];
  const roleArtwork = mascot.artworkByRole?.[resolvedRole];
  const stateArtwork = mascot.artworkByState?.[resolvedState];
  switch (mascot.id) {
    case 'firefly':
      return (
        <FireflyMascot
          glowColor={glowColor}
          mode={mode}
          podVariant={podVariant}
          role={resolvedRole}
          size={size}
          state={state}
          theme={theme ?? mascot.theme}
          artwork={artwork ?? roleStateArtwork ?? roleArtwork ?? stateArtwork ?? mascot.artwork}
        />
      );
  }
}
