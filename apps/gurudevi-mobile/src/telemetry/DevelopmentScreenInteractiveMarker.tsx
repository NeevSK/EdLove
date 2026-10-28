import { useEffect } from 'react';
import { recordDevelopmentScreenInteractive } from '@/boot/startupTelemetry';

export function DevelopmentScreenInteractiveMarker({
  screen,
}: {
  readonly screen: 'welcome' | 'self';
}) {
  useEffect(() => {
    recordDevelopmentScreenInteractive(screen);
  }, [screen]);

  return null;
}
