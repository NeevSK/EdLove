import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FACES, MOTION } from '../faces';
import { PERCHES } from '../perches';
import { SIGNS } from '../signs';
import { WORLD_IDS, WORLDS } from '../worlds';

const DIR = join(__dirname, '..', 'worlds');
const MANIFEST = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  'scripts',
  'fonts',
  'world-fonts.json',
);

describe('worlds: one folder each, one registry', { tags: ['unit'] }, () => {
  it('every world folder is registered, and every registered world has a folder', () => {
    const folders = readdirSync(DIR).filter(
      (name) => name !== 'shared' && statSync(join(DIR, name)).isDirectory(),
    );
    expect(folders.sort()).toEqual([...WORLD_IDS].sort());
  });

  it("each world's id is its registry key", () => {
    for (const id of WORLD_IDS) expect(WORLDS[id].id).toBe(id);
  });

  it('the per-world tables are views of the folders', () => {
    for (const id of WORLD_IDS) {
      expect(FACES[id]).toBe(WORLDS[id].faces);
      expect(MOTION[id]).toBe(WORLDS[id].motion);
      expect(SIGNS[id]).toBe(WORLDS[id].sign);
      expect(PERCHES[id]).toBe(WORLDS[id].perch);
    }
  });

  it('the font manifest builds fonts for every world', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as {
      families: { worlds: string[] }[];
    };
    const covered = new Set(manifest.families.flatMap((f) => f.worlds));
    for (const id of WORLD_IDS) expect(covered.has(id), id).toBe(true);
  });
});
