import { WorldLoading } from '../world/native/Waiting';

interface LotusLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

/** Kept for existing screens: waiting now shows the active world's own sign. */
export default function LotusLoader({
  size = 'md',
  text = 'Loading...',
  fullscreen = false,
}: LotusLoaderProps) {
  return <WorldLoading label={text} size={size} fullscreen={fullscreen} />;
}
