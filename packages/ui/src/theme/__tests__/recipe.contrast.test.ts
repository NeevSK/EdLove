import { contrastRatio, mix } from '../color';
import { resolveWorld } from '../resolve';
import type { Paint, Phase, ResolvedWorld, WorldMode } from '../types';
import { WORLD_IDS } from '../worlds';

const PHASES: Phase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
const MODES: WorldMode[] = ['light', 'dark'];

/** WCAG 2.2: 4.5 for text, 3 for large text and the marks that make a control visible. */
const TEXT = 4.5;
const MARK = 3;

interface Pair {
  what: string;
  fg: string;
  bg: string;
  min: number;
}

const ends = (p: Paint): string[] => (typeof p === 'string' ? [p] : [p.from, p.to]);

/** Every colour pair a recipe puts on screen, as it is drawn. */
function pairs(w: ResolvedWorld): Pair[] {
  const { tokens: t, recipes: r } = w;
  const out: Pair[] = [];
  const add = (what: string, fg: string, bg: string, min: number) =>
    out.push({ what, fg, bg, min });

  for (const role of ['display', 'title', 'body', 'label', 'caption', 'value'] as const)
    add(`text ${role}`, r.text[role].color, t.ground, TEXT);

  for (const [name, v] of Object.entries(r.button.variants))
    for (const bg of v.fill ? ends(v.fill) : [t.ground])
      add(`button ${name} label`, v.ink, bg, TEXT);

  for (const [state, s] of Object.entries({ rest: r.chip.rest, selected: r.chip.selected }))
    add(`chip ${state} label`, s.ink, s.fill ?? t.ground, TEXT);

  const fieldBg = r.field.fill ?? t.ground;
  add('field value', r.field.value.color, fieldBg, TEXT);
  add('field placeholder', r.field.placeholder.color, fieldBg, MARK);
  add('field error text', r.field.error.color, t.ground, TEXT);
  add('field focus edge', r.field.states.focus.edge.color, t.ground, MARK);
  add('field error edge', r.field.states.error.edge.color, t.ground, MARK);

  add('row label', r.row.label.color, t.ground, TEXT);
  add('row detail', r.row.detail.color, t.ground, TEXT);

  add('checkbox mark', r.toggle.on.mark, r.toggle.on.fill, MARK);
  add('checkbox edge', r.toggle.edge.color, t.ground, MARK);

  for (const [tone, b] of Object.entries(r.status.badge)) add(`badge ${tone}`, b.ink, b.fill, TEXT);
  add('avatar initials', r.status.avatar.ink, r.status.avatar.fill, TEXT);
  add('tooltip', r.overlay.tip.ink, r.overlay.tip.fill, TEXT);

  const raised = r.surface.raised.fill ?? t.ground;
  add('group label', r.group.label.color, t.ground, TEXT);
  add('group footer', r.group.footer.color, t.ground, TEXT);
  add('card title', r.card.title.color, raised, TEXT);
  add('card meta', r.card.meta.color, raised, TEXT);
  add('card selected ring', r.card.selectedEdge.color, raised, MARK);
  add('carousel current dot', r.card.dot.on, t.ground, MARK);
  // Words over media sit on a veil; check them over the lightest and darkest photo.
  const veilOpacity = r.card.veilOpacity;
  for (const photo of ['#FFFFFF', '#000000'])
    add(`card veil over ${photo}`, r.card.veilInk, mix(photo, t.ink, veilOpacity), TEXT);
  return out;
}

describe('recipe contrast: every pair a component draws', { tags: ['a11y', 'unit'] }, () => {
  for (const id of WORLD_IDS)
    for (const mode of MODES)
      for (const phase of PHASES)
        it(`${id} ${mode} ${phase}`, () => {
          const failures = pairs(resolveWorld(id, phase, mode))
            .map((p) => ({ ...p, ratio: contrastRatio(p.fg, p.bg) }))
            .filter((p) => p.ratio < p.min)
            .map((p) => `${p.what}: ${p.ratio.toFixed(2)} < ${p.min} (${p.fg} on ${p.bg})`);
          expect(failures).toEqual([]);
        });
});
