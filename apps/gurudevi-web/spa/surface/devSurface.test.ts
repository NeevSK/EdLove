import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { accountHome, commands, sources } from './devSurface';

describe('development surface dispatcher (G1 / Vitest)', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  function setWindowHost(host: string, search = '') {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        host,
        hostname: host.split(':')[0],
        port: host.split(':')[1] ?? '',
        search,
        protocol: 'http:',
        href: `http://${host}/${search}`,
        pathname: '/',
      },
    });
  }

  it('routes to explore guest showroom on explore.localhost:3000', async () => {
    setWindowHost('explore.localhost:3000');
    expect(accountHome.kind).toBe('elsewhere');
    expect((accountHome as { kind: 'elsewhere'; origin: string }).origin).toContain('sanctuary.localhost');

    const announcements = await sources.announcements().queryFn();
    expect(announcements.length).toBeGreaterThan(0);

    await expect(commands.requestAccountDeletion()).rejects.toThrow('Explore has no account.');
  });

  it('routes to sanctuary account surface on sanctuary.localhost:3000', () => {
    setWindowHost('sanctuary.localhost:3000');
    expect(accountHome.kind).toBe('here');
  });

  it('routes to sanctuary account surface on default localhost:3000', () => {
    setWindowHost('localhost:3000');
    expect(accountHome.kind).toBe('here');
  });

  it('routes to explore guest showroom via query parameter preview', async () => {
    setWindowHost('localhost:3000', '?mode=explore');
    expect(accountHome.kind).toBe('elsewhere');
  });
});
