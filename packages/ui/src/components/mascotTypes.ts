export type MascotRole = 'guide' | 'student' | 'teacher' | 'guardian' | 'host' | 'librarian';

export type MascotState = 'resting' | 'curious' | 'guiding' | 'interrupted' | 'complete';

export type MascotTheme = 'light' | 'dark';

export type MascotScale = 'inline' | 'card' | 'scene';

export type MascotMode = 'glowing' | 'resting' | 'offline';

export type MascotAppearance = {
  role?: MascotRole;
  state?: MascotState;
  theme?: MascotTheme;
  scale?: MascotScale;
};

export function stateFromMascotMode(mode: MascotMode): MascotState {
  switch (mode) {
    case 'resting':
      return 'resting';
    case 'offline':
      return 'interrupted';
    case 'glowing':
      return 'guiding';
  }
}
