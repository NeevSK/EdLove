/**
 * Renders the shared sound recipes (packages/ui/src/sensory/cues.ts) to small
 * WAV files for the phone. Run after changing a recipe:
 *
 *   npx tsx scripts/sounds/build-cues.ts
 *
 * 16 kHz mono 16-bit: the cues are soft bells and knocks well under 4 kHz,
 * and a low-end phone loads each in a blink.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUES, renderCue } from '../../packages/ui/src/sensory/cues';
import type { SoundCue } from '../../packages/ui/src/theme/feedback';

const RATE = 16000;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../apps/gurudevi-mobile/src/assets/sounds');

function wav(samples: Float32Array): Buffer {
  const data = Buffer.alloc(samples.length * 2);
  // Normalise only if a cue would clip; otherwise keep the recipe's loudness.
  const peak = Math.max(1, ...Array.from(samples, Math.abs));
  samples.forEach((v, i) => data.writeInt16LE(Math.round((v / peak) * 32767), i * 2));
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write('WAVEfmt ', 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

for (const cue of Object.keys(CUES) as SoundCue[]) {
  const file = join(OUT, `${cue}.wav`);
  writeFileSync(file, wav(renderCue(cue, RATE)));
  console.log(file);
}
