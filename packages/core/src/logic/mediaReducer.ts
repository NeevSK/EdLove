/**
 * Shared media state machine logic for video and audio players.
 */

export type MediaState = {
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  showControls: boolean;
  hasError: boolean;
};

export type MediaAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_PROGRESS'; position: number; duration: number }
  | { type: 'TOGGLE_CONTROLS' }
  | { type: 'SET_CONTROLS_VISIBLE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: boolean };

export const mediaInitialState: MediaState = {
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  showControls: true,
  hasError: false,
};

export function mediaReducer(state: MediaState, action: MediaAction): MediaState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_PROGRESS':
      return { ...state, positionMillis: action.position, durationMillis: action.duration };
    case 'TOGGLE_CONTROLS':
      return { ...state, showControls: !state.showControls };
    case 'SET_CONTROLS_VISIBLE':
      return { ...state, showControls: action.payload };
    case 'SET_ERROR':
      return { ...state, hasError: action.payload };
    default:
      return state;
  }
}
