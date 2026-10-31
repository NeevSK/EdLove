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
  // Answer marks are words on raised paper; the result line sits on the page.
  add('answer correct', r.question.mark.correct, raised, TEXT);
  add('answer incorrect', r.question.mark.incorrect, raised, TEXT);
  add('answer missed', r.question.mark.missed, raised, TEXT);
  add('result right', r.question.result.right, t.ground, TEXT);
  add('result wrong', r.question.result.wrong, t.ground, TEXT);
  add('chosen option edge', r.question.chosenEdge, raised, MARK);
  const m = r.message;
  add('own message', m.self.ink, m.self.fill, TEXT);
  add('reply message', m.other.ink, m.other.fill, TEXT);
  add('message meta', m.meta.color, t.ground, TEXT);
  for (const [k, c] of Object.entries(m.state)) add(`agent ${k}`, c, m.card.fill, TEXT);
  add('agent card text', t.ink, m.card.fill, TEXT);
  add('agent card soft text', t.inkSoft, m.card.fill, TEXT);
  add('approval edge', m.approval.edge.color, m.approval.fill, MARK);
  for (const [where, bg] of [
    ['ground', t.ground],
    ['lamp', t.lamp],
  ] as const) {
    const p = r.prose[where];
    add(`prose ${where} body`, p.body.color, bg, TEXT);
    add(`prose ${where} heading`, p.h1.color, bg, TEXT);
    add(`prose ${where} link`, p.link.ink, bg, TEXT);
    add(`prose ${where} quote`, p.quote.ink, p.quote.fill, TEXT);
    add(`prose ${where} code`, p.code.ink, p.code.fill, TEXT);
    add(`prose ${where} code block`, p.codeBlock.ink, p.codeBlock.fill, TEXT);
  }
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
