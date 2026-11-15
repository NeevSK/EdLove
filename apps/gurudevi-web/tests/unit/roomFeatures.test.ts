import { describe, expect, it } from 'vitest';
import { registerWebAppCatalog } from '../../lib/appCatalog';
import { presentationShows, webRoomFeatures } from '../../lib/roomFeatures';

registerWebAppCatalog();

describe('web rooms read their features from the catalog', () => {
  it('Community opens the catalog entries that have a web route, in catalog order', () => {
    const ids = webRoomFeatures('community').map((feature) => feature.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'hearth',
        'circles',
        'messages',
        'community-notices',
        'community-forest',
      ]),
    );
    // No web screen draws these yet, so the web does not offer them.
    expect(ids).not.toContain('trust');
    expect(ids).not.toContain('community-explore');
  });

  it('every listed feature opens a web route', () => {
    for (const room of ['community', 'library', 'self'] as const) {
      for (const feature of webRoomFeatures(room)) {
        expect(feature.href.startsWith('/')).toBe(true);
      }
    }
  });

  it('the server’s decisions decide what a room lists', () => {
    const presentation = { hearth: 'available', messages: 'hidden', circles: 'locked' } as const;
    expect(presentationShows(presentation, 'hearth')).toBe(true);
    expect(presentationShows(presentation, 'circles')).toBe(true);
    expect(presentationShows(presentation, 'messages')).toBe(false);
    expect(presentationShows(presentation, 'community-forest')).toBe(false);
    expect(presentationShows(undefined, 'messages')).toBe(true);
  });
});
