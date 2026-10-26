import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FACES } from '@repo/ui/world';

const ROOT = join(__dirname, '../../..');
const FOLDER = join(ROOT, 'src/assets/fonts/world');

const onDisk = readdirSync(FOLDER)
  .filter((f) => f.endsWith('.ttf'))
  .map((f) => f.replace(/\.ttf$/, ''))
  .sort();

describe('world fonts', () => {
  it('app.json embeds exactly the fonts in the folder', () => {
    const app = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8'));
    const plugin = app.expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-font');
    const embedded = (plugin[1].fonts as string[])
      .map((f) =>
        f
          .split('/')
          .pop()
          ?.replace(/\.ttf$/, ''),
      )
      .sort();
    expect(embedded).toEqual(onDisk);
  });

  it('the web map lists exactly the fonts in the folder', () => {
    const web = readFileSync(join(ROOT, 'src/boot/worldFontFiles.web.ts'), 'utf8');
    const listed = [...web.matchAll(/^ {2}'([^']+)': require/gm)].map((m) => m[1]).sort();
    expect(listed).toEqual(onDisk);
  });

  it('every face a world names is a font in the folder', () => {
    const missing: string[] = [];
    for (const [world, faces] of Object.entries(FACES)) {
      const all = [
        faces.serif,
        faces.sans,
        faces.si.serif,
        faces.si.sans,
        faces.ta.serif,
        faces.ta.sans,
      ];
      for (const face of all) {
        const names = [face.upright, face.italic, ...Object.values(face.weights)].filter(
          (n): n is string => typeof n === 'string',
        );
        for (const n of names) if (!onDisk.includes(n)) missing.push(`${world}: ${n}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
