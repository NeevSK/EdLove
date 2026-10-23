/**
 * World -> CSS custom properties, for the web.
 *
 * The web app renders the same generic components as plain DOM with classes
 * (`gd-button`, `gd-surface` ...). Every look-related value comes from the
 * variables produced here, from the same recipes the native renderer reads.
 *
 * `worldStylesheet()` returns one stylesheet with every world and mode, so the
 * server can inline it and switching worlds is a single attribute change on
 * <html> (`data-world`, `data-mode`, optional `data-phase`). No flash, no JS.
 */

import { alpha, rgbTriple } from './color';
import { phaseTokens, resolveWorld } from './resolve';
import type {
  BoundaryKind,
  Edge,
  Glow,
  Paint,
  Radius,
  ResolvedWorld,
  SectionDensity,
  Shadow,
  TextRole,
  TypeStyle,
  WorldId,
  WorldMode,
  WorldPhase,
} from './types';
import { DEFAULT_WORLD, WORLD_IDS, WORLDS } from './worlds';

export function radiusCss(r: Radius): string {
  return typeof r === 'number' ? `${r}px` : r.map((v) => `${v}px`).join(' ');
}

export function paintCss(p: Paint | null): string {
  if (!p) return 'transparent';
  return typeof p === 'string' ? p : `linear-gradient(180deg, ${p.from}, ${p.to})`;
}

function px(n: number): string {
  return `${Number(n.toFixed(2))}px`;
}

interface ShadowParts {
  edge?: Edge | null;
  innerEdge?: Edge | null;
  /** Colour painted in the gap of a double frame (usually the fill). */
  gapColor?: string;
  underline?: Edge | null;
  top?: Edge | null;
  bottom?: Edge | null;
  glow?: Glow | null;
  shadow?: Shadow | null;
}

/** Compose edges, frames, underlines, glows and shadows into one box-shadow. */
export function boxShadowCss(parts: ShadowParts): string {
  const out: string[] = [];
  if (parts.edge) out.push(`inset 0 0 0 ${px(parts.edge.width)} ${parts.edge.color}`);
  if (parts.innerEdge) {
    const gap = parts.innerEdge.inset ?? 0;
    const outer = (parts.edge?.width ?? 0) + gap;
    if (gap > 0) out.push(`inset 0 0 0 ${px(outer)} ${parts.gapColor ?? 'transparent'}`);
    out.push(`inset 0 0 0 ${px(outer + parts.innerEdge.width)} ${parts.innerEdge.color}`);
  }
  if (parts.underline) out.push(`inset 0 -${px(parts.underline.width)} 0 ${parts.underline.color}`);
  if (parts.top) out.push(`inset 0 ${px(parts.top.width)} 0 ${parts.top.color}`);
  if (parts.bottom) out.push(`inset 0 -${px(parts.bottom.width)} 0 ${parts.bottom.color}`);
  if (parts.glow)
    out.push(`0 0 ${px(parts.glow.radius)} ${alpha(parts.glow.color, parts.glow.opacity)}`);
  if (parts.shadow) {
    out.push(
      `0 ${px(parts.shadow.offsetY)} ${px(parts.shadow.radius)} -${px(parts.shadow.radius / 2)} ${alpha(parts.shadow.color, parts.shadow.opacity)}`,
    );
  }
  return out.length ? out.join(', ') : 'none';
}

function typeVars(prefix: string, t: TypeStyle | Omit<TypeStyle, 'color'>): Record<string, string> {
  const v: Record<string, string> = {
    [`${prefix}-font`]: `var(--w-font-${t.family})`,
    [`${prefix}-size`]: px(t.size),
    [`${prefix}-lh`]: px(t.lineHeight),
    [`${prefix}-weight`]: t.weight,
    [`${prefix}-ls`]: `${t.letterSpacing}px`,
    [`${prefix}-style`]: t.italic ? 'italic' : 'normal',
    [`${prefix}-case`]: t.uppercase ? 'uppercase' : 'none',
  };
  if ('color' in t) v[`${prefix}-color`] = t.color;
  return v;
}

const TEXT_ROLES: TextRole[] = ['display', 'title', 'body', 'label', 'caption', 'value'];

/** Every variable for one resolved world. */
export function worldCssVariables(w: ResolvedWorld): Record<string, string> {
  const t = w.tokens;
  const r = w.recipes;
  const v: Record<string, string> = {};

  // Semantic tokens.
  for (const [k, value] of Object.entries(t)) {
    v[`--w-${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }
  v['--w-glow-rgb'] = rgbTriple(t.glow);
  v['--w-lamp-rgb'] = rgbTriple(t.lamp);

  // Bridge to the web app's existing variable names, so current screens follow
  // the world. Sanctuary keeps the web's hand-tuned palette untouched.
  if (w.id !== DEFAULT_WORLD)
    Object.assign(v, {
      '--paper': t.ground,
      '--paper-light': t.raised,
      '--line': t.line,
      '--ink': t.ink,
      '--ink-soft': t.inkSoft,
      '--color-background': t.ground,
      '--color-cream-silence': t.ground,
      '--color-sacred-white': t.raised,
      '--color-charcoal-truth': t.ink,
      '--color-mud-brown': t.inkSoft,
      '--color-primary': t.lampDeep,
      '--color-sanctuary-saffron': t.lampDeep,
    });

  for (const role of TEXT_ROLES) Object.assign(v, typeVars(`--w-text-${role}`, r.text[role]));

  // Button.
  v['--w-button-radius'] = radiusCss(r.button.radius);
  v['--w-button-gap'] = px(r.button.gap);
  v['--w-button-pressed-opacity'] = String(r.button.pressedOpacity);
  v['--w-button-disabled-opacity'] = String(r.button.disabledOpacity);
  Object.assign(v, typeVars('--w-button-label', r.button.label));
  for (const [size, s] of Object.entries(r.button.sizes)) {
    v[`--w-button-${size}-height`] = px(s.height);
    v[`--w-button-${size}-px`] = px(s.paddingX);
    v[`--w-button-${size}-size`] = px(s.fontSize);
  }
  for (const [name, b] of Object.entries(r.button.variants)) {
    const p = `--w-button-${name}`;
    const isText = b.form === 'text';
    v[`${p}-bg`] = paintCss(b.fill);
    v[`${p}-ink`] = b.ink;
    v[`${p}-shadow`] = boxShadowCss({
      edge: b.edge,
      innerEdge: b.innerEdge,
      gapColor: b.fill ? (typeof b.fill === 'string' ? b.fill : b.fill.to) : 'transparent',
      underline: b.underline,
      glow: b.glow,
    });
    v[`${p}-radius`] = isText ? '0' : 'var(--w-button-radius)';
    v[`${p}-px`] = isText ? '0' : '';
    v[`${p}-height`] = isText ? 'auto' : '';
    v[`${p}-py`] = isText ? '4px' : '0';
    v[`${p}-underline`] = b.underline ? b.underline.color : 'transparent';
    v[`${p}-underline-w`] = b.underline ? px(Math.max(1, b.underline.width)) : '0px';
  }

  // Surface.
  for (const [tone, s] of Object.entries(r.surface)) {
    const p = `--w-surface-${tone}`;
    v[`${p}-bg`] = s.fill ?? 'transparent';
    v[`${p}-radius`] = radiusCss(s.radius);
    v[`${p}-pad`] = `${px(s.padding)} ${px(s.paddingX)}`;
    v[`${p}-shadow`] = boxShadowCss({
      edge: s.edge,
      innerEdge: s.innerEdge,
      gapColor: s.fill ?? 'transparent',
      top: s.ruleTop,
      bottom: s.ruleBottom,
      shadow: s.shadow,
    });
  }

  // TextField.
  const f = r.field;
  Object.assign(v, typeVars('--w-field-label', f.label));
  Object.assign(v, typeVars('--w-field-value', f.value));
  Object.assign(v, typeVars('--w-field-hint', f.hint));
  Object.assign(v, typeVars('--w-field-error', f.error));
  v['--w-field-placeholder'] = f.placeholder.color;
  v['--w-field-placeholder-style'] = f.placeholder.italic ? 'italic' : 'normal';
  v['--w-field-min-height'] = px(f.minHeight);
  v['--w-field-px'] = px(f.paddingX);
  v['--w-field-radius'] = radiusCss(f.radius);
  v['--w-field-bg'] = f.fill ?? 'transparent';
  for (const [state, s] of Object.entries(f.states)) {
    v[`--w-field-${state}-shadow`] =
      f.form === 'underline'
        ? boxShadowCss({
            underline: s.edge,
            glow: s.glow ? { ...s.glow, radius: s.glow.radius } : null,
          })
        : boxShadowCss({ edge: s.edge, glow: s.glow });
  }

  // Chip.
  const c = r.chip;
  Object.assign(v, typeVars('--w-chip-label', c.label));
  v['--w-chip-radius'] = radiusCss(c.radius);
  v['--w-chip-pad'] = `${px(c.paddingY)} ${px(c.paddingX)}`;
  v['--w-chip-gap'] = px(c.gap);
  for (const state of ['rest', 'selected'] as const) {
    const s = c[state];
    v[`--w-chip-${state}-bg`] = s.fill ?? 'transparent';
    v[`--w-chip-${state}-ink`] = s.ink;
    v[`--w-chip-${state}-shadow`] = boxShadowCss({
      edge: s.edge,
      underline: s.underline,
      glow: s.glow,
    });
  }

  // Row.
  const row = r.row;
  Object.assign(v, typeVars('--w-row-label', row.label));
  Object.assign(v, typeVars('--w-row-detail', row.detail));
  Object.assign(v, typeVars('--w-row-note', row.note));
  v['--w-row-min-height'] = px(row.minHeight);
  v['--w-row-py'] = px(row.paddingY);
  v['--w-row-gap'] = px(row.gap);
  v['--w-row-chevron'] = row.chevron;
  v['--w-row-signal'] = row.signal.color;
  v['--w-row-signal-size'] = px(row.signal.size);
  v['--w-row-signal-glow'] = boxShadowCss({ glow: row.signal.glow });

  // Section (both densities).
  for (const density of ['dense', 'calm'] as SectionDensity[]) {
    const s = r.section[density];
    const p = `--w-section-${density}`;
    Object.assign(v, typeVars(`${p}-title`, s.title));
    Object.assign(v, typeVars(`${p}-voice`, s.voice));
    v[`${p}-px`] = px(s.paddingX);
    v[`${p}-py`] = px(s.paddingY);
    v[`${p}-margin`] = px(s.marginWidth);
    v[`${p}-rule`] = `${px(s.rule.width)} solid ${s.rule.color}`;
    v[`${p}-divider`] = s.rowDivider
      ? `${px(s.rowDivider.width)} solid ${s.rowDivider.color}`
      : '0 solid transparent';
    v[`${p}-thread`] = s.thread.color;
    v[`${p}-knot`] = px(s.thread.knot);
    v[`${p}-knot-lit`] = s.thread.knotLit;
    v[`${p}-leaf-bg`] = s.leaf.fill;
    v[`${p}-leaf-radius`] = radiusCss(s.leaf.radius);
    v[`${p}-leaf-shadow`] = boxShadowCss({ shadow: s.leaf.shadow });
    v[`${p}-leaf-hole`] = s.leaf.hole;
    v[`${p}-wash`] = alpha(s.wash.color, s.wash.opacity);
    v[`${p}-wash-lit`] = alpha(s.wash.color, s.wash.litOpacity);
    v[`${p}-box-bg`] = s.box.fill ?? 'transparent';
    v[`${p}-box-radius`] = radiusCss(s.box.radius);
    v[`${p}-box-shadow`] = boxShadowCss({
      edge: s.box.edge,
      innerEdge: s.box.innerEdge,
      gapColor: s.box.fill ?? 'transparent',
      shadow: s.box.shadow,
    });
  }

  v['--w-settle'] = `${r.motion.settleMs}ms`;
  return v;
}

function block(selector: string, vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .filter(([, value]) => value !== '')
    .map(([k, value]) => `${k}:${value}`)
    .join(';');
  return `${selector}{${body}}`;
}

/** Representative phase per mode for the base block; `data-phase` refines it. */
const BASE_PHASE: Record<WorldMode, WorldPhase> = { light: 'morning', dark: 'night' };
const PHASES: WorldPhase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];

/**
 * A world applies to the whole page (`<html data-world data-mode>`) or to a
 * subtree (`<div class="gd-world" data-world data-mode>`, used by previews).
 * `:root` lifts page rules above the web app's own `data-theme` palettes.
 */
function worldSelector(id: WorldId, mode: WorldMode, extra = ''): string {
  const page = `html[data-world="${id}"][data-mode="${mode}"]${extra}:root`;
  // Doubled class: a preview must beat the page's own world rules.
  const scope = `.gd-world.gd-world[data-world="${id}"][data-mode="${mode}"]${extra}`;
  const list = [page, scope];
  if (id === DEFAULT_WORLD) list.push(`html:not([data-world])[data-mode="${mode}"]${extra}:root`);
  return list.join(',');
}

/** Structural rules for each boundary kind, scoped to a world and density. */
function boundaryCss(scope: string, density: SectionDensity, kind: BoundaryKind): string {
  const p = `--w-section-${density}`;
  const sec = `${scope} .gd-section[data-density="${density}"]`;
  // Inside a preview, clear whatever the page's own boundary set first.
  const reset = scope.startsWith('.gd-world')
    ? `${sec}{display:block;position:static;margin:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none}${sec}::before,${sec}::after{content:none}${sec} .gd-row+.gd-row{border-top:0}${sec} .gd-section-title{padding-top:0}`
    : '';
  return reset + boundaryRules(sec, p, density, kind);
}

function boundaryRules(
  sec: string,
  p: string,
  density: SectionDensity,
  kind: BoundaryKind,
): string {
  switch (kind) {
    case 'margin':
      return [
        `${sec}{display:grid;grid-template-columns:var(${p}-margin) minmax(0,1fr);column-gap:12px;padding:var(${p}-py) var(${p}-px);border-top:var(${p}-rule)}`,
        `${sec}+.gd-section[data-density="${density}"]{border-top:var(${p}-rule)}`,
        `${sec}:last-of-type{border-bottom:var(${p}-rule)}`,
        `${sec} .gd-section-title{padding-top:2px}`,
        `${sec} .gd-row+.gd-row{border-top:var(${p}-divider)}`,
        `@container gd-page (max-width:339px){${sec}{grid-template-columns:minmax(0,1fr)}}`,
      ].join('');
    case 'thread':
      return [
        `${sec}{position:relative;padding:0 var(${p}-px) 26px calc(var(${p}-px) + 32px)}`,
        `${sec}::before{content:"";position:absolute;left:calc(var(${p}-px) + 9px);top:0;bottom:0;width:1px;background:var(${p}-thread)}`,
        `${sec}::after{content:"";position:absolute;left:calc(var(${p}-px) + 4px);top:7px;width:var(${p}-knot);height:var(${p}-knot);border-radius:50%;background:var(--w-ground);box-shadow:inset 0 0 0 1.25px var(${p}-thread)}`,
        `${sec}[data-signal="true"]::after{background:var(${p}-knot-lit);box-shadow:0 0 0 4px rgba(var(--w-glow-rgb),.25),0 0 16px 4px rgba(var(--w-glow-rgb),.5)}`,
      ].join('');
    case 'leaves':
      return [
        `${sec}{position:relative;margin:0 14px 14px;padding:16px 18px 14px 38px;background:var(${p}-leaf-bg);border-radius:var(${p}-leaf-radius);box-shadow:var(${p}-leaf-shadow)}`,
        `${sec}::before,${sec}::after{content:"";position:absolute;left:15px;width:8px;height:8px;border-radius:50%;background:var(${p}-leaf-hole);box-shadow:inset 0 1px 2px rgba(0,0,0,.3)}`,
        `${sec}::before{top:18px}${sec}::after{bottom:18px}`,
      ].join('');
    case 'light':
      return [
        `${sec}{padding:22px var(${p}-px) 24px;background:radial-gradient(120% 90% at 0% 0%,var(${p}-wash) 0%,transparent 70%)}`,
        `${sec}[data-signal="true"]{background:radial-gradient(120% 90% at 0% 0%,var(${p}-wash-lit) 0%,transparent 70%)}`,
      ].join('');
    case 'boxes':
      return [
        `${sec}{margin:0 16px 16px;padding:16px;background:var(${p}-box-bg);border-radius:var(${p}-box-radius);box-shadow:var(${p}-box-shadow)}`,
        `${sec} .gd-row+.gd-row{border-top:var(${p}-divider)}`,
      ].join('');
  }
}

/** Component rules: they only read variables, so they are the same for every world. */
const COMPONENT_CSS = `
:root{--w-font-serif:"Newsreader","Noto Serif Sinhala","Noto Serif Tamil",Georgia,serif;--w-font-sans:"Inter","Noto Sans Sinhala","Noto Sans Tamil",system-ui,sans-serif}
.gd-page{container:gd-page/inline-size;background:var(--w-ground);color:var(--w-ink)}
.gd-text{margin:0}
${TEXT_ROLES.map(
  (role) =>
    `.gd-text[data-kind="${role}"]{font-family:var(--w-text-${role}-font);font-size:var(--w-text-${role}-size);line-height:var(--w-text-${role}-lh);font-weight:var(--w-text-${role}-weight);letter-spacing:var(--w-text-${role}-ls);font-style:var(--w-text-${role}-style);text-transform:var(--w-text-${role}-case);color:var(--w-text-${role}-color)}`,
).join('\n')}
.gd-text[data-tone="ink"]{color:var(--w-ink)}.gd-text[data-tone="soft"]{color:var(--w-ink-soft)}.gd-text[data-tone="faint"]{color:var(--w-ink-faint)}.gd-text[data-tone="lamp"]{color:var(--w-lamp-deep)}.gd-text[data-tone="danger"]{color:var(--w-danger)}.gd-text[data-tone="onLamp"]{color:var(--w-on-lamp)}
:lang(si) .gd-text,:lang(ta) .gd-text,.gd-text:lang(si),.gd-text:lang(ta){font-style:normal;text-transform:none;letter-spacing:0;line-height:1.6}
.gd-button{appearance:none;border:0;margin:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:var(--w-button-gap);font-family:var(--w-button-label-font);font-weight:var(--w-button-label-weight);letter-spacing:var(--w-button-label-ls);text-transform:var(--w-button-label-case);white-space:nowrap;transition:opacity var(--w-settle),transform var(--w-settle);-webkit-tap-highlight-color:transparent}
${['sm', 'md', 'lg'].map((s) => `.gd-button[data-size="${s}"]{height:var(--w-button-${s}-height);padding:0 var(--w-button-${s}-px);font-size:var(--w-button-${s}-size)}`).join('')}
${['primary', 'secondary', 'quiet', 'danger']
  .map(
    (n) =>
      `.gd-button[data-variant="${n}"]{background:var(--w-button-${n}-bg);color:var(--w-button-${n}-ink);box-shadow:var(--w-button-${n}-shadow);border-radius:var(--w-button-${n}-radius)}`,
  )
  .join('\n')}
.gd-button:active{opacity:var(--w-button-pressed-opacity)}
.gd-button-pulse{width:1em;height:1em;border-radius:50%;background:currentColor;opacity:.5;animation:gd-breathe 1.6s ease-in-out infinite}
@keyframes gd-breathe{50%{opacity:.15;transform:scale(.8)}}
.gd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.gd-section-body{min-width:0}
.gd-button:disabled,.gd-button[aria-disabled="true"]{opacity:var(--w-button-disabled-opacity);cursor:default}
.gd-button[data-full="true"]{width:100%}
.gd-button:focus-visible,.gd-chip:focus-visible,.gd-row[data-pressable]:focus-visible{outline:2px solid var(--w-focus);outline-offset:3px}
${['plain', 'raised', 'inset'].map((tone) => `.gd-surface[data-tone="${tone}"]{background:var(--w-surface-${tone}-bg);border-radius:var(--w-surface-${tone}-radius);padding:var(--w-surface-${tone}-pad);box-shadow:var(--w-surface-${tone}-shadow)}`).join('\n')}
.gd-field{display:grid;gap:6px}
.gd-field-label{font-family:var(--w-field-label-font);font-size:var(--w-field-label-size);line-height:var(--w-field-label-lh);font-weight:var(--w-field-label-weight);letter-spacing:var(--w-field-label-ls);font-style:var(--w-field-label-style);text-transform:var(--w-field-label-case);color:var(--w-field-label-color)}
.gd-field-input{appearance:none;border:0;outline:0;width:100%;min-height:var(--w-field-min-height);padding:6px var(--w-field-px);border-radius:var(--w-field-radius);background:var(--w-field-bg);box-shadow:var(--w-field-rest-shadow);font-family:var(--w-field-value-font);font-size:var(--w-field-value-size);line-height:var(--w-field-value-lh);color:var(--w-field-value-color);transition:box-shadow var(--w-settle)}
.gd-field-input::placeholder{color:var(--w-field-placeholder);font-style:var(--w-field-placeholder-style)}
.gd-field-input:focus{box-shadow:var(--w-field-focus-shadow)}
.gd-field[data-state="error"] .gd-field-input{box-shadow:var(--w-field-error-shadow)}
.gd-field-input:disabled{box-shadow:var(--w-field-disabled-shadow);opacity:.6}
.gd-field-hint{font-family:var(--w-field-hint-font);font-size:var(--w-field-hint-size);line-height:var(--w-field-hint-lh);color:var(--w-field-hint-color)}
.gd-field-error{font-family:var(--w-field-error-font);font-size:var(--w-field-error-size);line-height:var(--w-field-error-lh);color:var(--w-field-error-color)}
.gd-chips{display:flex;flex-wrap:wrap;gap:var(--w-chip-gap)}
.gd-chip{appearance:none;border:0;margin:0;cursor:pointer;padding:var(--w-chip-pad);border-radius:var(--w-chip-radius);font-family:var(--w-chip-label-font);font-size:var(--w-chip-label-size);line-height:var(--w-chip-label-lh);font-weight:var(--w-chip-label-weight);background:var(--w-chip-rest-bg);color:var(--w-chip-rest-ink);box-shadow:var(--w-chip-rest-shadow);transition:box-shadow var(--w-settle),background var(--w-settle)}
.gd-chip[aria-pressed="true"],.gd-chip[aria-checked="true"]{background:var(--w-chip-selected-bg);color:var(--w-chip-selected-ink);box-shadow:var(--w-chip-selected-shadow)}
.gd-row{display:grid;gap:3px;padding:var(--w-row-py) 0;min-height:var(--w-row-min-height);align-content:center}
.gd-row[data-pressable]{cursor:pointer;background:none;border:0;width:100%;text-align:inherit;color:inherit;font:inherit}
.gd-row-line{display:flex;align-items:center;justify-content:space-between;gap:var(--w-row-gap)}
.gd-row-label{font-family:var(--w-row-label-font);font-size:var(--w-row-label-size);line-height:var(--w-row-label-lh);color:var(--w-row-label-color)}
.gd-row-detail{display:inline-flex;align-items:center;gap:6px;text-align:right;font-family:var(--w-row-detail-font);font-size:var(--w-row-detail-size);line-height:var(--w-row-detail-lh);font-style:var(--w-row-detail-style);color:var(--w-row-detail-color)}
.gd-row-note{font-family:var(--w-row-note-font);font-size:var(--w-row-note-size);line-height:var(--w-row-note-lh);color:var(--w-row-note-color)}
.gd-row-chevron{color:var(--w-row-chevron);font-style:normal}
.gd-row-signal{width:var(--w-row-signal-size);height:var(--w-row-signal-size);border-radius:50%;background:var(--w-row-signal);box-shadow:var(--w-row-signal-glow);flex:none}
.gd-row[data-signal="true"] .gd-row-detail{color:var(--w-lamp-deep)}
${(['dense', 'calm'] as SectionDensity[])
  .map(
    (d) =>
      `.gd-section[data-density="${d}"] .gd-section-title{margin:0;font-family:var(--w-section-${d}-title-font);font-size:var(--w-section-${d}-title-size);line-height:var(--w-section-${d}-title-lh);font-weight:var(--w-section-${d}-title-weight);letter-spacing:var(--w-section-${d}-title-ls);font-style:var(--w-section-${d}-title-style);text-transform:var(--w-section-${d}-title-case);color:var(--w-section-${d}-title-color)}` +
      `.gd-section[data-density="${d}"] .gd-section-voice{margin:2px 0 10px;font-family:var(--w-section-${d}-voice-font);font-size:var(--w-section-${d}-voice-size);line-height:var(--w-section-${d}-voice-lh);color:var(--w-section-${d}-voice-color)}`,
  )
  .join('\n')}
.gd-section[data-signal="true"] .gd-section-title{color:var(--w-lamp-deep)}
@media (prefers-reduced-motion:reduce){.gd-button,.gd-chip,.gd-field-input{transition:none}.gd-button-pulse{animation:none}}
`;

let stylesheetCache: string | null = null;

/**
 * Every world, both modes, per-phase ground refinements, component rules and
 * boundary rules. Inline it once in the document head.
 */
export function worldStylesheet(): string {
  if (stylesheetCache) return stylesheetCache;
  const parts: string[] = [COMPONENT_CSS];
  for (const id of WORLD_IDS) {
    for (const mode of ['light', 'dark'] as WorldMode[]) {
      const resolved = resolveWorld(id, BASE_PHASE[mode], mode);
      parts.push(block(worldSelector(id, mode), worldCssVariables(resolved)));

      for (const phase of PHASES) {
        if (phase === BASE_PHASE[mode]) continue;
        const t = phaseTokens(WORLDS[id].palette[mode], mode, phase);
        if (t === WORLDS[id].palette[mode]) continue;
        parts.push(
          block(worldSelector(id, mode, `[data-phase="${phase}"]`), {
            '--w-ground': t.ground,
            '--w-raised': t.raised,
            '--w-sunken': t.sunken,
            '--paper': t.ground,
            '--paper-light': t.raised,
            '--color-background': t.ground,
          }),
        );
      }

      const scope = worldSelector(id, mode)
        .split(',')
        .map((s) => s.trim());
      // Variants this world draws as an underlined word rather than a shape.
      for (const [name, b] of Object.entries(resolved.recipes.button.variants)) {
        if (b.form !== 'text') continue;
        parts.push(
          scope.map((s) => `${s} .gd-button[data-variant="${name}"]`).join(',') +
            `{height:auto;min-height:44px;padding:4px 0;background:none;box-shadow:none;border-radius:0;text-decoration:underline;text-decoration-color:var(--w-button-${name}-underline);text-decoration-thickness:var(--w-button-${name}-underline-w);text-underline-offset:5px}`,
        );
      }
      for (const density of ['dense', 'calm'] as SectionDensity[]) {
        const kind = resolved.recipes.section[density].kind;
        parts.push(...scope.map((s) => boundaryCss(s, density, kind)));
      }
    }
  }
  stylesheetCache = parts.join('\n');
  return stylesheetCache;
}

/** Inline style object (React DOM) that scopes one world to a subtree, e.g. a preview. */
export function worldScopeStyle(
  id: WorldId,
  phase: WorldPhase,
  mode: WorldMode,
): Record<string, string> {
  return worldCssVariables(resolveWorld(id, phase, mode));
}
