import { GURUDEVI_MOBILE_HOST, UNKNOWN_CAPACITY, type VergerPlatform } from '@repo/core/governor';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import type { VisualCapabilities } from '@repo/ui/context/types';
import { VergerProvider } from '@repo/verger-react';
import { render } from '@testing-library/react-native';

const GIB = 1024 ** 3;

/** Never called: off mode starts nothing native. */
const platform = (): VergerPlatform => {
  throw new Error('the platform must not be touched while verger is off');
};

function Probe({ onRead }: { onRead: (capabilities: VisualCapabilities) => void }) {
  onRead(useVisualCapabilities());
  return null;
}

async function read(
  memoryBytes: number | null,
  withVerger: boolean,
  saver = false,
): Promise<VisualCapabilities> {
  let latest: VisualCapabilities | null = null;
  const probe = <Probe onRead={(c) => (latest = c)} />;
  await render(
    withVerger ? (
      <VergerProvider
        host={GURUDEVI_MOBILE_HOST}
        platform={platform}
        mode="off"
        facts={() => ({ ...UNKNOWN_CAPACITY, totalMemoryBytes: memoryBytes })}
        signals={(dispatch, now) => {
          dispatch({ type: 'power', at: now(), saver });
          return () => {};
        }}
        release="test"
      >
        {probe}
      </VergerProvider>
    ) : (
      probe
    ),
  );
  if (latest === null) throw new Error('the probe never rendered');
  return latest;
}

describe('useVisualCapabilities reads verger', () => {
  it('a 4 GB phone is low under verger, even with verger off (its floors)', async () => {
    const capabilities = await read(3.7 * GIB, true);
    expect(capabilities.deviceTier).toBe('low');
    expect(capabilities.allowAmbientEffects).toBe(false);
    expect(capabilities.imageDecodeFormat).toBe('rgb');
  });

  it('a 12 GB phone gets everything', async () => {
    const capabilities = await read(11.2 * GIB, true);
    expect(capabilities.deviceTier).toBe('high');
    expect(capabilities.quality).toBe('full');
    expect(capabilities.allowBlur).toBe(true);
  });

  it('battery saver fed in JavaScript reaches components while verger is off', async () => {
    const capabilities = await read(11.2 * GIB, true, true);
    expect(capabilities.allowAmbientEffects).toBe(false);
    expect(capabilities.shouldPrefetchAssets).toBe(false);
    expect(capabilities.experience.motion).toBe('essential');
  });

  it('outside a verger provider nothing is known: no floor, only the settings', async () => {
    const capabilities = await read(null, false);
    expect(capabilities.deviceTier).toBe('medium');
    expect(capabilities.quality).toBe('full');
  });
});
