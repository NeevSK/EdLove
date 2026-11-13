/**
 * Web rules for the kit components added after the first set (`css.ts` holds
 * the first set). `WorldStyles` inlines both. Every colour, radius and pace
 * comes from the world's `--w-*` variables or from shared theme data, so a
 * world change on <html> restyles these with no JavaScript.
 *
 * Waiting signs port the native drawings (components/native/WaitingSign) to
 * keyframes over one loop at the world's tempo. A part's phase is a negative
 * animation-delay; a still sign is the same animation paused at its rest pose,
 * so it shows the pose native shows.
 */

import { FLOOR_CSS } from './floorCss';
import { radiusCss } from './css';
import { resolveMotion } from './motion';
import { resolveWorld } from './resolve';
import { SIGN_CYCLE_MS, SIGN_REST, SIGNS, type SignKind } from './signs';
import type { Radius, WorldId } from './types';
import { WORLD_IDS, WORLDS } from './worlds';

const SIGN_KINDS = Object.keys(SIGN_CYCLE_MS) as SignKind[];

/** Per kind: loop length and rest pose. */
function signTimingCss(): string {
  return SIGN_KINDS.map(
    (k) => `.gd-s[data-sign="${k}"]{--gd-base:${SIGN_CYCLE_MS[k]};--gd-rest:${SIGN_REST[k]}}`,
  ).join('');
}

/** Shape variables that follow a world's corners but not its mode or phase. */
function shapeVars(id: WorldId): string {
  const r = resolveWorld(id).recipes;
  const shrink = (x: Radius, by: number): Radius =>
    typeof x === 'number'
      ? Math.max(0, x - by)
      : [
          Math.max(0, x[0] - by),
          Math.max(0, x[1] - by),
          Math.max(0, x[2] - by),
          Math.max(0, x[3] - by),
        ];
  const press = resolveMotion(WORLDS[id].motion, 'refined').press;
  return `--w-toggle-radius:${radiusCss(r.toggle.radius)};--w-segment-radius:${radiusCss(shrink(r.surface.inset.radius, 3))};--w-press:${press};--w-group-indent:${r.group.indent}px;--w-group-divider-w:${r.group.divider.width}px`;
}

/** Per world: its tempo, and which sign and perch an auto sign or perch shows. */
function worldPickCss(): string {
  const parts: string[] = [];
  const defaultSign = SIGNS.sanctuary;
  parts.push(`.gd-sign{--gd-tempo:${WORLDS.sanctuary.motion.tempo}}`);
  parts.push(`:root{${shapeVars('sanctuary')}}`);
  parts.push(`.gd-sign[data-auto]>.gd-s:not([data-sign="${defaultSign}"]){display:none}`);
  parts.push('.gd-perch[data-auto]>g:not([data-perch="sanctuary"]){display:none}');
  parts.push('.gd-living-ground .gd-world-motif:not([data-world="kele"]){display:none}');
  for (const id of WORLD_IDS) {
    const scopes = [`html[data-world="${id}"]`, `.gd-world[data-world="${id}"]`];
    const sign = SIGNS[id];
    for (const s of scopes) {
      parts.push(`${s} .gd-sign{--gd-tempo:${WORLDS[id].motion.tempo}}`);
      parts.push(`${s}{${shapeVars(id)}}`);
      parts.push(`${s} .gd-sign[data-auto]>.gd-s{display:none}`);
      parts.push(`${s} .gd-sign[data-auto]>.gd-s[data-sign="${sign}"]{display:flex}`);
      parts.push(`${s} .gd-perch[data-auto]>g{display:none}`);
      parts.push(`${s} .gd-perch[data-auto]>g[data-perch="${id}"]{display:inline}`);
      parts.push(`${s} .gd-living-ground .gd-world-motif{display:none}`);
      parts.push(`${s} .gd-living-ground .gd-world-motif[data-world="${id}"]{display:inline}`);
    }
    parts.push(`.gd-living-ground[data-world="${id}"] .gd-world-motif{display:none}`);
    parts.push(
      `.gd-living-ground[data-world="${id}"] .gd-world-motif[data-world="${id}"]{display:inline}`,
    );
  }
  return parts.join('');
}

/** Charge segments: segment i is lit from i/5 of the loop until 95%. */
function chargeCss(): string {
  return [0, 1, 2, 3, 4]
    .map((i) => {
      const on = i * 20;
      const frames =
        i === 0
          ? '0%{opacity:1}95%,100%{opacity:.12}'
          : `0%{opacity:.12}${on}%{opacity:1}95%,100%{opacity:.12}`;
      return `@keyframes gd-s-seg${i}{${frames}}.gd-s-seg:nth-child(${i + 1}){animation-name:gd-s-seg${i}}`;
    })
    .join('');
}

const s = (k: number) => `calc(var(--s) * ${k})`;

const BASE_CSS = `
.gd-switch{appearance:none;border:0;margin:0;padding:0;cursor:pointer;position:relative;flex:none;width:48px;height:28px;border-radius:14px;background:var(--w-line);transition:background var(--w-settle);-webkit-tap-highlight-color:transparent}
.gd-switch[aria-checked="true"]{background:var(--w-toggle-on)}
.gd-switch-thumb{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:var(--w-raised);box-shadow:0 1px 2px color-mix(in srgb, var(--w-ink) 22%, transparent);transition:transform var(--w-settle)}
.gd-switch[aria-checked="true"] .gd-switch-thumb{transform:translateX(20px)}
.gd-switch:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-switch:disabled{opacity:var(--w-button-disabled-opacity);cursor:not-allowed}
.gd-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px 0}
.gd-loading[data-fullscreen]{position:fixed;inset:0;z-index:1000;padding:0;background:var(--w-ground)}
.gd-skeleton{position:relative;overflow:hidden;background:var(--w-sunken);border-radius:var(--w-surface-inset-radius)}
.gd-skeleton::after{content:"";position:absolute;inset:0;background:var(--w-lamp);opacity:0;animation:gd-skeleton 2100ms ease-in-out infinite alternate}
.gd-skeleton[data-still]::after{animation:none}
@keyframes gd-skeleton{to{opacity:.16}}
.gd-sign{position:relative;display:inline-flex;flex:none;width:var(--s);height:var(--s);pointer-events:none}
.gd-s{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;--gd-cycle:calc(var(--gd-base) * var(--gd-tempo) * 1ms)}
.gd-s *{animation-duration:var(--gd-cycle);animation-iteration-count:infinite;animation-timing-function:linear;animation-delay:calc(var(--gd-cycle) * -1 * var(--ph, 0))}
.gd-sign[data-still] .gd-s *{animation-play-state:paused;animation-delay:calc(var(--gd-cycle) * -1 * (var(--gd-rest) + var(--ph, 0)))}
@media (prefers-reduced-motion:reduce){.gd-s *{animation-play-state:paused!important;animation-delay:calc(var(--gd-cycle) * -1 * (var(--gd-rest) + var(--ph, 0)))!important}.gd-skeleton::after{animation:none}}
.gd-s-glow{position:absolute;width:${s(0.8)};height:${s(0.8)};border-radius:50%;background:var(--w-glow);animation-name:gd-s-glow;animation-timing-function:ease-in-out}
@keyframes gd-s-glow{0%,100%{opacity:.18}50%{opacity:.48}}
.gd-s-flame{width:${s(0.36)};height:${s(0.36)};margin-top:${s(0.08)};background:var(--w-lamp);border-radius:0 50% 50% 50%;animation-name:gd-s-flame;animation-timing-function:ease-in-out}
@keyframes gd-s-flame{0%,100%{transform:scaleY(.92) rotate(45deg)}50%{transform:scaleY(1.04) rotate(45deg)}}
.gd-s-ring{position:absolute;inset:0;border-radius:50%;border:1.5px solid var(--w-ornament);animation-name:gd-s-ring}
@keyframes gd-s-ring{0%{opacity:.85;transform:scale(.25)}100%{opacity:0;transform:scale(1)}}
.gd-s-core{width:${s(0.14)};height:${s(0.14)};border-radius:50%;background:var(--w-lamp)}
.gd-s-gem{position:relative;width:${s(0.6)};height:${s(0.6)};border:1.5px solid var(--w-ornament);overflow:hidden;display:flex;align-items:center;justify-content:center;transform:rotate(45deg)}
.gd-s-facet{width:${s(0.204)};height:${s(0.204)};background:var(--w-lamp);opacity:.85}
.gd-s-sweep{position:absolute;width:3px;height:${s(0.96)};background:var(--w-glow);animation-name:gd-s-sweep}
@keyframes gd-s-sweep{0%{transform:translateX(${s(-0.6)}) rotate(-45deg);opacity:0}50%{transform:translateX(0) rotate(-45deg);opacity:1}100%{transform:translateX(${s(0.6)}) rotate(-45deg);opacity:0}}
.gd-s-leaf{width:${s(0.5)};height:${s(0.5)};background:var(--w-lamp);border:1.5px solid var(--w-ornament);border-radius:${s(0.5)} 0 ${s(0.5)} 0;animation-name:gd-s-leaf;animation-timing-function:ease-in-out}
@keyframes gd-s-leaf{0%,50%,100%{transform:translateY(0) rotate(-45deg)}25%{transform:translateY(${s(0.04)}) rotate(-27deg)}75%{transform:translateY(${s(-0.04)}) rotate(-63deg)}}
.gd-s-rows{display:flex;flex-direction:column;align-items:center;gap:${s(0.12)}}
.gd-s-bar{position:relative;height:3px;border-radius:2px;background:var(--w-line);overflow:hidden}
.gd-s-bar:nth-child(1){width:${s(0.8)}}.gd-s-bar:nth-child(2){width:${s(0.68)}}.gd-s-bar:nth-child(3){width:${s(0.56)}}
.gd-s-fill{position:absolute;inset:0;border-radius:2px;background:var(--w-lamp);transform-origin:left center}
.gd-s-bar:nth-child(1) .gd-s-fill{animation-name:gd-s-row0}.gd-s-bar:nth-child(2) .gd-s-fill{animation-name:gd-s-row1}.gd-s-bar:nth-child(3) .gd-s-fill{animation-name:gd-s-row2}
@keyframes gd-s-row0{0%{transform:scaleX(0);opacity:1}25%,90%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
@keyframes gd-s-row1{0%,25%{transform:scaleX(0);opacity:1}50%,90%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
@keyframes gd-s-row2{0%,50%{transform:scaleX(0);opacity:1}75%,90%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
.gd-s-band{display:flex;flex-direction:column;align-items:center;gap:${s(0.14)}}
.gd-s-rule{width:${s(0.9)};height:2px;background:var(--w-ornament);transform-origin:left center;animation-name:gd-s-rule}
@keyframes gd-s-rule{0%{transform:scaleX(0);opacity:1}62.5%{transform:scaleX(1);opacity:1}80%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
.gd-s-diamond{width:${s(0.16)};height:${s(0.16)};background:var(--w-lamp);transform:rotate(45deg)}
.gd-s-lampstand{display:flex;flex-direction:column;align-items:center}
.gd-s-wick{width:${s(0.26)};height:${s(0.26)};border-radius:50%;background:var(--w-lamp);animation-name:gd-s-lamp}
@keyframes gd-s-lamp{0%{opacity:.25;transform:scale(.7)}25%,80%{opacity:1;transform:scale(1)}100%{opacity:.25;transform:scale(.7)}}
.gd-s-stem{width:${s(0.12)};height:${s(0.14)};background:var(--w-ornament)}
.gd-s-base{width:${s(0.56)};height:${s(0.08)};background:var(--w-ornament)}
.gd-s-dots{display:flex;align-items:center;gap:${s(0.1)}}
.gd-s-dots[data-square]{gap:${s(0.08)}}
.gd-s-dot{width:${s(0.18)};height:${s(0.18)};border-radius:50%;background:var(--w-lamp);animation-name:gd-s-dot}
.gd-s-dot[data-ink="ornament"]{background:var(--w-ornament)}
.gd-s-dots[data-square] .gd-s-dot{border-radius:2px}
@keyframes gd-s-dot{0%{opacity:.35;transform:scale(.8)}15%{opacity:1;transform:scale(1.15)}60%,100%{opacity:.35;transform:scale(.8)}}
.gd-s-bloom{position:relative;width:var(--s);height:var(--s);animation-name:gd-s-bloom;animation-timing-function:ease-in-out}
@keyframes gd-s-bloom{0%,100%{transform:scale(.62) rotate(0deg)}50%{transform:scale(1) rotate(24deg)}}
.gd-s-petal{position:absolute;inset:0;display:flex;justify-content:center;align-items:flex-start;transform:rotate(var(--turn))}
.gd-s-petal::before{content:"";width:${s(0.24)};height:${s(0.4)};margin-top:${s(0.06)};border-radius:${s(0.12)};background:var(--w-lamp);opacity:.82}
.gd-s-heart{position:absolute;width:${s(0.16)};height:${s(0.16)};border-radius:50%;background:var(--w-ornament)}
.gd-s-charge{display:flex;align-items:center}
.gd-s-cell{display:flex;gap:2px;padding:3px;border:1.5px solid var(--w-ink);border-radius:0 6px 0 6px;transform:skewX(-12deg)}
.gd-s-seg{width:${s(0.13)};height:${s(0.3)};background:var(--w-lamp);animation-timing-function:step-end}
.gd-s-tip{width:3px;height:${s(0.15)};margin-left:1px;background:var(--w-ink)}
.gd-perch{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.gd-dialog{padding:0;margin:auto;border:0;background:transparent;color:var(--w-ink);width:calc(100% - 48px);max-width:420px;overflow:visible}
/* The one scrim behind every modal, drawer and sheet; pages use var(--gd-scrim), never their own tint. */
:root{--gd-scrim:color-mix(in srgb, var(--w-ink) 42%, transparent)}[data-mode="dark"]{--gd-scrim:color-mix(in srgb, var(--w-ground) 72%, transparent)}
.gd-dialog::backdrop{background:color-mix(in srgb, var(--w-ink) 42%, transparent)}
[data-mode="dark"] .gd-dialog::backdrop,.gd-dialog[data-mode="dark"]::backdrop{background:color-mix(in srgb, var(--w-ground) 72%, transparent)}
.gd-overlay-panel{display:flex;flex-direction:column;gap:12px;padding:20px;background:var(--w-surface-raised-bg);border-radius:var(--w-surface-raised-radius);box-shadow:var(--w-surface-raised-shadow);color:var(--w-ink)}
.gd-overlay-panel>.gd-text{margin:0}
.gd-dialog-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:8px}
.gd-sheet{margin:auto auto 0;width:100%;max-width:640px;max-height:90vh}
.gd-sheet .gd-overlay-panel{border-bottom-left-radius:0;border-bottom-right-radius:0;padding-bottom:calc(24px + env(safe-area-inset-bottom));max-height:90vh;overflow:auto}
.gd-sheet-grabber{align-self:center;width:40px;height:4px;margin-bottom:4px;border-radius:2px;background:var(--w-line)}
@media (prefers-reduced-motion:no-preference){.gd-dialog[open]:not(.gd-sheet){animation:gd-overlay-in var(--w-settle) ease-out}.gd-sheet[open]{animation:gd-sheet-in 280ms cubic-bezier(.2,.8,.2,1)}}
@keyframes gd-overlay-in{from{opacity:0;transform:translateY(8px) scale(.98)}}
@keyframes gd-sheet-in{from{transform:translateY(100%)}}
.gd-toasts{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:1100;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.gd-toast-region{display:flex;flex-direction:column;align-items:center;gap:8px}
.gd-toast{pointer-events:auto;display:flex;align-items:center;gap:12px;width:100%;max-width:520px;padding:12px 16px;background:var(--w-surface-raised-bg);border-radius:var(--w-surface-raised-radius);box-shadow:var(--w-surface-raised-shadow);border-left:3px solid var(--w-line);color:var(--w-ink)}
.gd-toast[data-tone="success"]{border-left-color:var(--w-success)}
.gd-toast[data-tone="danger"]{border-left-color:var(--w-danger)}
.gd-toast>.gd-text{flex:1;margin:0}
@media (prefers-reduced-motion:no-preference){.gd-toast{animation:gd-overlay-in var(--w-settle) ease-out}}
.gd-tipwrap{position:relative;display:inline-flex}
.gd-tip{position:absolute;bottom:calc(100% + 6px);left:50%;z-index:1060;width:max-content;max-width:240px;padding:6px 10px;border-radius:var(--w-button-radius);background:var(--w-ink);color:var(--w-ground);font-size:.8125rem;line-height:1.35;pointer-events:none;opacity:0;visibility:hidden;transform:translateX(-50%);transition:opacity var(--w-settle),visibility var(--w-settle)}
.gd-tipwrap:hover>.gd-tip,.gd-tipwrap:focus-within>.gd-tip{opacity:1;visibility:visible}
.gd-tipwrap[data-dismissed]>.gd-tip{opacity:0;visibility:hidden}
.gd-popover{position:absolute;z-index:1050;outline:none}
.gd-choice{display:flex;align-items:flex-start;gap:12px;min-height:44px;padding:10px 0}
.gd-choice-words{display:flex;flex-direction:column;gap:2px;padding-top:1px}
.gd-choice-words>.gd-text{margin:0}
.gd-choice label{cursor:pointer}
.gd-check,.gd-radio{appearance:none;flex:none;display:grid;place-content:center;margin:0;width:22px;height:22px;cursor:pointer;background:transparent;border:1.5px solid color-mix(in srgb, var(--w-ink) 45%, var(--w-ground));border-radius:var(--w-toggle-radius);transition:background var(--w-settle),border-color var(--w-settle)}
.gd-radio{border-radius:50%}
.gd-check::before{content:"";width:12px;height:12px;background:var(--w-on-lamp);clip-path:polygon(12% 52%, 0 66%, 38% 100%, 100% 22%, 86% 8%, 38% 72%);transform:scale(0);transition:transform var(--w-settle)}
.gd-check:indeterminate::before{clip-path:inset(40% 8% 40% 8%)}
.gd-radio::before{content:"";width:11px;height:11px;border-radius:50%;background:var(--w-lamp);transform:scale(0);transition:transform var(--w-settle)}
.gd-check:checked,.gd-check:indeterminate{background:var(--w-lamp);border-color:var(--w-lamp)}
.gd-radio:checked{border-color:var(--w-lamp)}
.gd-check:checked::before,.gd-check:indeterminate::before,.gd-radio:checked::before{transform:scale(1)}
.gd-check:focus-visible,.gd-radio:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-check:disabled,.gd-radio:disabled{opacity:.5;cursor:not-allowed}
.gd-radios{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;border:0;min-width:0}
.gd-radios>legend{padding:0;margin:0 0 4px}
.gd-field-input.gd-select{appearance:none;cursor:pointer;padding-right:40px;background-image:linear-gradient(45deg, transparent 50%, var(--w-ink-soft) 50%),linear-gradient(135deg, var(--w-ink-soft) 50%, transparent 50%);background-position:calc(100% - 20px) 55%,calc(100% - 14px) 55%;background-size:6px 6px;background-repeat:no-repeat}
.gd-select[data-empty]{color:var(--w-field-placeholder);font-style:var(--w-field-placeholder-style)}
.gd-menu{display:flex;flex-direction:column}
.gd-menu-item{appearance:none;margin:0;border:0;background:none;font:inherit;text-align:start;min-height:44px;padding:0 10px;border-radius:var(--w-button-radius);color:var(--w-ink);cursor:pointer}
.gd-menu-item:hover,.gd-menu-item:focus-visible{background:color-mix(in srgb, var(--w-ink) 8%, transparent);outline:none}
.gd-menu-item[data-destructive]{color:var(--w-danger)}
.gd-menu-item[aria-disabled]{opacity:.5;cursor:not-allowed}
.gd-slider-field{display:flex;flex-direction:column;gap:6px}
.gd-slider-head{display:flex;justify-content:space-between;align-items:baseline}
.gd-slider-head>.gd-text{margin:0}
.gd-slider{appearance:none;width:100%;height:44px;margin:0;background:transparent;cursor:pointer}
.gd-slider::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:linear-gradient(to right, var(--w-lamp) var(--gd-fill), var(--w-line) var(--gd-fill))}
.gd-slider::-moz-range-track{height:4px;border-radius:2px;background:linear-gradient(to right, var(--w-lamp) var(--gd-fill), var(--w-line) var(--gd-fill))}
.gd-slider::-webkit-slider-thumb{appearance:none;width:24px;height:24px;margin-top:-10px;border-radius:50%;background:var(--w-raised);border:2px solid var(--w-lamp)}
.gd-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:var(--w-raised);border:2px solid var(--w-lamp)}
.gd-slider:focus-visible{outline:none}
.gd-slider:focus-visible::-webkit-slider-thumb{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-slider:focus-visible::-moz-range-thumb{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-slider:disabled{opacity:.5;cursor:not-allowed}
.gd-tabs{display:flex;flex-direction:column;gap:12px}
.gd-tablist{display:flex;gap:var(--w-chip-gap);overflow-x:auto;scrollbar-width:none;padding:4px 2px}
.gd-tablist::-webkit-scrollbar{display:none}
.gd-tab{flex:none;min-height:44px}
.gd-chip[aria-selected="true"]{background:var(--w-chip-selected-bg);color:var(--w-chip-selected-ink);box-shadow:var(--w-chip-selected-shadow)}
.gd-tab:disabled{opacity:.4;cursor:not-allowed}
.gd-tabpanel:focus-visible{outline:2px solid var(--w-focus);outline-offset:4px}
.gd-segmented{display:flex;gap:3px;padding:3px;background:var(--w-surface-inset-bg);border-radius:var(--w-surface-inset-radius)}
.gd-segment{appearance:none;flex:1;min-height:38px;margin:0;padding:0 10px;border:0;border-radius:var(--w-segment-radius);background:transparent;color:var(--w-ink-soft);font-family:var(--w-chip-label-font);font-size:var(--w-chip-label-size);font-weight:var(--w-chip-label-weight);cursor:pointer;white-space:nowrap;transition:background var(--w-settle),color var(--w-settle)}
.gd-segment[aria-checked="true"]{background:var(--w-surface-raised-bg);color:var(--w-ink);box-shadow:var(--w-surface-raised-shadow)}
.gd-segment:focus-visible{outline:2px solid var(--w-focus);outline-offset:1px}
.gd-segment:disabled{opacity:.4;cursor:not-allowed}
.gd-breadcrumb ol{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0;padding:0;list-style:none;font-size:.875rem;color:var(--w-ink-soft)}
.gd-breadcrumb li{display:inline-flex;align-items:center;gap:6px}
.gd-breadcrumb li+li::before{content:"/" / "";color:var(--w-ink-faint)}
.gd-breadcrumb a{color:var(--w-lamp-deep);text-underline-offset:3px}
.gd-breadcrumb [aria-current="page"]{color:var(--w-ink)}
.gd-icon-button{appearance:none;margin:0;padding:0;display:inline-flex;align-items:center;justify-content:center;flex:none;width:max(44px, var(--w-button-md-height));height:max(44px, var(--w-button-md-height));border:0;cursor:pointer;border-radius:var(--w-button-radius);transition:opacity var(--w-settle);-webkit-tap-highlight-color:transparent}
.gd-icon-button[data-size="sm"]{width:max(44px, var(--w-button-sm-height));height:max(44px, var(--w-button-sm-height))}
.gd-icon-button[data-size="lg"]{width:var(--w-button-lg-height);height:var(--w-button-lg-height)}
.gd-icon-button[data-variant="quiet"]{background:transparent;color:var(--w-ink);box-shadow:none;border-radius:50%}
.gd-icon-button[data-variant="quiet"]:hover{background:color-mix(in srgb, var(--w-ink) 8%, transparent)}
.gd-icon-button[data-variant="primary"]{background:var(--w-button-primary-bg);color:var(--w-button-primary-ink);box-shadow:var(--w-button-primary-shadow)}
.gd-icon-button[data-variant="secondary"]{background:var(--w-button-secondary-bg);color:var(--w-button-secondary-ink);box-shadow:var(--w-button-secondary-shadow)}
.gd-icon-button[data-variant="danger"]{background:var(--w-button-danger-bg);color:var(--w-button-danger-ink);box-shadow:var(--w-button-danger-shadow)}
.gd-icon-button:active{opacity:var(--w-button-pressed-opacity)}
.gd-icon-button:disabled{opacity:var(--w-button-disabled-opacity);cursor:not-allowed}
.gd-icon-button:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-link{color:var(--w-lamp-deep);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
.gd-link:hover{text-decoration-thickness:2px}
.gd-link:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px;border-radius:2px}
.gd-progress{position:relative;height:6px;border-radius:3px;background:var(--w-sunken);overflow:hidden}
.gd-progress-fill{position:absolute;top:0;bottom:0;left:0;width:var(--gd-progress);border-radius:3px;background:var(--w-lamp);transition:width var(--w-settle)}
.gd-progress[data-indeterminate] .gd-progress-fill{width:30%;animation:gd-progress 1.4s ease-in-out infinite}
@keyframes gd-progress{from{left:0}to{left:70%}}
@media (prefers-reduced-motion:reduce){.gd-progress[data-indeterminate] .gd-progress-fill{animation:none;left:35%}}
.gd-badge{display:inline-flex;align-items:center;min-height:20px;padding:2px 8px;border-radius:var(--w-chip-radius);font-size:.75rem;line-height:1.3;white-space:nowrap;background:var(--w-sunken);color:var(--w-ink-soft)}
.gd-badge[data-tone="lamp"]{background:var(--w-lamp);color:var(--w-on-lamp)}
.gd-badge[data-tone="success"]{background:var(--w-raised);color:var(--w-ink);box-shadow:inset 0 0 0 1px var(--w-success)}
.gd-badge[data-tone="danger"]{background:var(--w-danger);color:var(--w-on-danger)}
.gd-avatar{display:inline-flex;align-items:center;justify-content:center;flex:none;overflow:hidden;border-radius:50%;background:var(--w-raised);color:var(--w-ink);box-shadow:inset 0 0 0 1px var(--w-ornament);font-family:var(--w-chip-label-font);font-weight:600;line-height:1}
.gd-avatar>img{width:100%;height:100%;object-fit:cover}
.gd-divider{height:0;margin:0;border:0;border-top:1px solid var(--w-line)}
.gd-state{display:flex;flex-direction:column;align-items:center;gap:10px;padding:24px 16px;text-align:center}
.gd-state>.gd-text{margin:0}
.gd-state-scene{position:relative;width:176px;height:131px}
.gd-list{margin:0;padding:0;list-style:none}
.gd-list-item{content-visibility:auto;contain-intrinsic-size:auto 56px}
.gd-list-item+.gd-list-item{border-top:1px solid var(--w-line)}
.gd-list-loading{display:flex;flex-direction:column;gap:12px;padding:8px 0}
.gd-list-end{height:1px}
.gd-table-wrap{max-width:100%}
.gd-table-wrap:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-table{width:100%;border-collapse:collapse;color:var(--w-ink);font-size:.9375rem}
.gd-table caption{text-align:start;padding:0 0 6px;color:var(--w-ink-soft);font-size:.8125rem}
.gd-table th{text-align:start;font-weight:600;color:var(--w-ink-soft);padding:8px 10px;border-bottom:1.5px solid var(--w-line);white-space:nowrap}
.gd-table td{padding:10px;border-bottom:1px solid var(--w-line)}
.gd-table [data-align="end"]{text-align:end;font-variant-numeric:tabular-nums}
.gd-table-empty{text-align:center;color:var(--w-ink-soft);padding:16px}
.gd-swiperow{display:flex;align-items:center;gap:8px}
.gd-swiperow-body{flex:1;min-width:0}
.gd-swiperow-actions{display:flex;gap:4px;opacity:0;transition:opacity var(--w-settle)}
.gd-swiperow:hover .gd-swiperow-actions,.gd-swiperow:focus-within .gd-swiperow-actions{opacity:1}
@media (hover:none){.gd-swiperow-actions{opacity:1}}
.gd-button,.gd-chip,.gd-icon-button,.gd-segment{transition:opacity var(--w-settle),transform var(--w-settle),background var(--w-settle),box-shadow var(--w-settle)}
.gd-button:active:not(:disabled),.gd-chip:active:not(:disabled),.gd-icon-button:active:not(:disabled){transform:scale(var(--w-press))}
.gd-button{transition:opacity var(--w-settle),transform var(--w-settle),background var(--w-settle),box-shadow var(--w-settle),filter var(--w-light-ms)}
.gd-button:active:not(:disabled){filter:brightness(calc(1 + var(--w-light-press-lift)))}
.gd-field-input{transition:box-shadow var(--w-light-ms) ease-out}
.gd-stack{display:flex;flex-direction:column;min-width:0}.gd-inline{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;min-width:0}.gd-inline[data-wrap="no"]{flex-wrap:nowrap}
.gd-stack[data-gap="none"],.gd-inline[data-gap="none"]{gap:0}.gd-stack[data-gap="inside"],.gd-inline[data-gap="inside"]{gap:min(0.5rem, 12px)}.gd-stack[data-gap="inside"][data-density="compact"],.gd-inline[data-gap="inside"][data-density="compact"]{gap:min(0.25rem, 6px)}.gd-stack[data-gap="between"],.gd-inline[data-gap="between"]{gap:min(0.75rem, 18px)}.gd-stack[data-gap="between"][data-density="compact"],.gd-inline[data-gap="between"][data-density="compact"]{gap:min(0.5rem, 12px)}.gd-stack[data-gap="group"],.gd-inline[data-gap="group"]{gap:min(1.5rem, 36px)}.gd-stack[data-gap="group"][data-density="compact"],.gd-inline[data-gap="group"][data-density="compact"]{gap:min(1.25rem, 30px)}.gd-stack[data-gap="section"],.gd-inline[data-gap="section"]{gap:min(2.5rem, 60px)}.gd-stack[data-gap="section"][data-density="compact"],.gd-inline[data-gap="section"][data-density="compact"]{gap:min(2rem, 48px)}
.gd-stack[data-align="start"],.gd-inline[data-align="start"]{align-items:flex-start}.gd-stack[data-align="center"],.gd-inline[data-align="center"]{align-items:center}.gd-stack[data-align="end"],.gd-inline[data-align="end"]{align-items:flex-end}.gd-stack[data-align="stretch"],.gd-inline[data-align="stretch"]{align-items:stretch}
.gd-inline[data-justify="center"]{justify-content:center}.gd-inline[data-justify="end"]{justify-content:flex-end}.gd-inline[data-justify="between"]{justify-content:space-between}
.gd-group{display:flex;flex-direction:column;gap:min(0.5rem, 12px)}.gd-group-label,.gd-group>.gd-text{margin:0}
.gd-group-body{background:var(--w-surface-raised-bg);border-radius:var(--w-surface-raised-radius);box-shadow:var(--w-surface-raised-shadow);overflow:hidden}
.gd-grid{--gd-gap-inside:min(0.5rem, 12px);--gd-gap-between:min(0.75rem, 18px);--gd-gap-group:min(1.5rem, 36px);--gd-gap-section:min(2.5rem, 60px);--gd-grid-gap:var(--gd-gap-between);display:grid;gap:var(--gd-grid-gap);grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--gd-grid-min)),1fr))}.gd-grid[data-gap="inside"]{--gd-grid-gap:var(--gd-gap-inside)}.gd-grid[data-gap="between"]{--gd-grid-gap:var(--gd-gap-between)}.gd-grid[data-gap="group"]{--gd-grid-gap:var(--gd-gap-group)}.gd-grid[data-gap="section"]{--gd-grid-gap:var(--gd-gap-section)}
.gd-grid[data-max]{grid-template-columns:repeat(auto-fill,minmax(max(min(100%,var(--gd-grid-min)),calc((100% - (var(--gd-grid-max) - 1) * var(--gd-grid-gap)) / var(--gd-grid-max))),1fr))}
.gd-icon{display:inline-flex;flex:none;line-height:0}.gd-icon[data-tone="ink"]{color:var(--w-ink)}.gd-icon[data-tone="soft"]{color:var(--w-ink-soft)}.gd-icon[data-tone="faint"]{color:var(--w-ink-faint)}.gd-icon[data-tone="lamp"]{color:var(--w-lamp-deep)}.gd-icon[data-tone="danger"]{color:var(--w-danger)}.gd-icon[data-tone="onLamp"]{color:var(--w-on-lamp)}
.gd-move{display:inline-flex;align-items:center;gap:0}
.gd-split{display:inline-flex;align-items:center;gap:2px}
.gd-context{display:contents}
.gd-toolbar{display:flex;align-items:center;gap:4px;min-width:0}.gd-toolbar-more{margin-inline-start:auto}
.gd-autocomplete{position:relative}
.gd-autocomplete-list{list-style:none;margin:4px 0 0;padding:0;border-top:1px solid var(--w-line)}
.gd-autocomplete-option{display:flex;flex-direction:column;justify-content:center;min-height:44px;padding:4px 10px;cursor:pointer;color:var(--w-ink)}
.gd-autocomplete-option[aria-selected="true"],.gd-autocomplete-option:hover{background:color-mix(in srgb, var(--w-ink) 8%, transparent)}
.gd-autocomplete-option[aria-disabled]{opacity:.5;cursor:not-allowed}
.gd-autocomplete-hint,.gd-autocomplete-empty{color:var(--w-ink-soft);font-size:.875em}.gd-autocomplete-empty{min-height:44px;display:flex;align-items:center;padding:0 10px}
.gd-minichart{display:inline-block;vertical-align:middle;overflow:visible}
.gd-minichart-line{fill:none;stroke:var(--w-ink-soft);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.gd-minichart-bar{fill:var(--w-ink-soft)}.gd-minichart-mark{fill:var(--w-lamp)}
.gd-visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.gd-card{appearance:none;margin:0;padding:0;font:inherit;text-align:start;color:var(--w-ink);text-decoration:none;display:block;position:relative;overflow:hidden;background:var(--w-surface-raised-bg);box-shadow:var(--w-surface-raised-shadow);border:0;transition:transform var(--w-settle),filter var(--w-light-ms),box-shadow var(--w-light-ms);container-type:inline-size}
.gd-card[data-shape="tile"]{border-radius:var(--w-card-tile-radius)}.gd-card[data-shape="wide"]{border-radius:var(--w-card-wide-radius)}.gd-card[data-shape="square"]{border-radius:var(--w-card-square-radius)}.gd-card[data-shape="pill"]{border-radius:var(--w-card-pill-radius)}
.gd-card:is(a,button){cursor:pointer}.gd-card:is(a,button):active:not(:disabled):not([aria-disabled="true"]){transform:scale(var(--w-press));filter:brightness(calc(1 + var(--w-light-press-lift)))}
.gd-card:is(a,button):focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-card:disabled,.gd-card[aria-disabled="true"]{opacity:var(--w-button-disabled-opacity);cursor:default}
.gd-card[data-selected]::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 var(--w-card-selected-w) var(--w-card-selected);pointer-events:none}
.gd-card-body{display:flex;flex-direction:column}.gd-card-words{display:flex;flex-direction:column;gap:2px;padding:var(--w-card-pad);min-width:0}
.gd-card-title{font-family:var(--w-card-title-font);font-size:var(--w-card-title-size);line-height:var(--w-card-title-lh);font-weight:var(--w-card-title-weight);color:var(--w-card-title-color);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gd-card-meta{font-family:var(--w-card-meta-font);font-size:var(--w-card-meta-size);line-height:var(--w-card-meta-lh);color:var(--w-card-meta-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gd-card-media{display:block;aspect-ratio:4/3;overflow:hidden}.gd-card-media>*{width:100%;height:100%;object-fit:cover;display:block}
.gd-card-icon{display:inline-flex;padding:var(--w-card-pad) var(--w-card-pad) 0}
.gd-card[data-shape="wide"] .gd-card-body{flex-direction:row;align-items:center;gap:calc(var(--w-card-gap) * 1.5);padding:var(--w-card-pad)}.gd-card[data-shape="wide"] .gd-card-words{padding:0}.gd-card[data-shape="wide"] .gd-card-icon{padding:0}
.gd-card[data-shape="wide"] .gd-card-media{flex:none;width:88px;height:88px;aspect-ratio:1;border-radius:var(--w-card-tile-radius)}.gd-card[data-shape="wide"][data-size="sm"] .gd-card-media{width:64px;height:64px}.gd-card[data-shape="wide"][data-size="lg"] .gd-card-media{width:112px;height:112px}
@container (max-width: 359px){.gd-card[data-shape="wide"] .gd-card-body{flex-direction:column;align-items:stretch;padding:0}.gd-card[data-shape="wide"] .gd-card-media{width:auto;height:auto;aspect-ratio:4/3;border-radius:0}.gd-card[data-shape="wide"] .gd-card-words{padding:var(--w-card-pad)}}
.gd-card[data-shape="square"] .gd-card-body{aspect-ratio:1;justify-content:flex-end;position:relative}.gd-card[data-shape="square"] .gd-card-media{position:absolute;inset:0;aspect-ratio:auto}.gd-card[data-shape="square"] .gd-card-media~.gd-card-words{position:relative;background:var(--w-card-veil)}.gd-card[data-shape="square"] .gd-card-media~.gd-card-words :is(.gd-card-title,.gd-card-meta){color:var(--w-card-veil-ink)}
.gd-card[data-shape="pill"] .gd-card-body{flex-direction:row;align-items:center;gap:var(--w-card-gap);min-height:44px;padding:0 calc(var(--w-card-pad) * 1.25)}.gd-card[data-shape="pill"] .gd-card-words{padding:0}.gd-card[data-shape="pill"] .gd-card-icon{padding:0}.gd-card[data-shape="pill"] .gd-card-title{-webkit-line-clamp:1}
.gd-pebble{appearance:none;margin:0;font:inherit;text-align:center;color:var(--w-ink);text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:space-between;width:100%;aspect-ratio:1/1;border-radius:var(--w-surface-raised-radius,1.25rem);background:var(--w-surface-raised-bg);box-shadow:var(--w-surface-raised-shadow);border:1px solid var(--w-line);position:relative;overflow:hidden;user-select:none;-webkit-touch-callout:none;padding:1.1rem .75rem 1.15rem .75rem;cursor:pointer;box-sizing:border-box;container-type:inline-size;transition:transform var(--w-settle),border-color var(--w-light-ms),box-shadow var(--w-light-ms)}
.gd-pebble:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--w-lamp) 50%,var(--w-line));box-shadow:0 10px 28px -4px color-mix(in srgb,var(--w-ink) 12%,transparent)}
.gd-pebble:active:not(:disabled):not([aria-disabled="true"]){transform:scale(var(--w-press,0.96));filter:brightness(calc(1 + var(--w-light-press-lift,0.05)))}
.gd-pebble:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-pebble-top{display:flex;align-items:center;justify-content:center;flex:1;width:100%}
.gd-pebble-emoji{font-size:2.25rem;line-height:1;display:inline-flex;align-items:center;justify-content:center;transition:transform .2s cubic-bezier(.16,1,.3,1),filter .2s ease}
.gd-pebble:hover .gd-pebble-emoji{transform:scale(1.08);filter:drop-shadow(0 0 12px color-mix(in srgb,var(--w-lamp) 55%,transparent))}
.gd-pebble-bottom{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:100%;min-height:2.4rem;text-align:center}
.gd-pebble-title{margin:0;font-size:.92rem;font-weight:600;letter-spacing:-.015em;color:var(--w-ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;max-width:100%;line-height:1.15;word-break:normal;overflow-wrap:break-word;text-wrap:balance}
.gd-pebble-rhythm{display:inline-flex;align-items:center;justify-content:center;gap:.3rem;width:100%;max-width:96%;font-size:.68rem;color:var(--w-ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1}
@container (max-width: 120px){.gd-pebble-rhythm{display:none}}
.gd-pebble[data-gear="compact"] .gd-pebble-rhythm{display:none}
.gd-pebble-dot{width:5px;height:5px;border-radius:50%;background:var(--w-lamp);opacity:.85}
.gd-pebble-hitbox{position:absolute;top:0;right:0;width:2.75rem;height:2.75rem;display:flex;align-items:flex-start;justify-content:flex-end;cursor:pointer;z-index:10;background:transparent;border:none;padding:0;outline:none;-webkit-tap-highlight-color:transparent}
.gd-pebble-sticker{width:2.25rem;height:2.25rem;border-top-right-radius:var(--w-surface-raised-radius,1.25rem);border-bottom-left-radius:100%;border-top-left-radius:0;border-bottom-right-radius:0;background:color-mix(in srgb,var(--w-ground) 94%,transparent);border:1px solid var(--w-line);border-top:none;border-right:none;display:flex;align-items:center;justify-content:center;padding:0 0 .25rem .25rem;box-shadow:-1px 1px 4px color-mix(in srgb, var(--w-ink) 5%, transparent);transition:transform .14s cubic-bezier(.16,1,.3,1),background .2s ease,border-color .2s ease,box-shadow .2s ease,opacity .2s ease;user-select:none;opacity:.45}
.gd-pebble:hover .gd-pebble-sticker,.gd-pebble-hitbox:hover .gd-pebble-sticker,.gd-pebble-hitbox:focus-visible .gd-pebble-sticker{opacity:1;background:color-mix(in srgb,var(--w-lamp) 18%,var(--w-ground));border-color:color-mix(in srgb,var(--w-lamp) 45%,var(--w-line))}
.gd-pebble-hitbox[data-pressing="true"] .gd-pebble-sticker{transform:scale(.86);background:color-mix(in srgb,var(--w-lamp) 32%,var(--w-ground))!important;border-color:var(--w-lamp)!important}
.gd-pebble-sticker[data-active="true"]{opacity:1!important;background:color-mix(in srgb,var(--w-lamp) 22%,var(--w-ground));border-color:color-mix(in srgb,var(--w-lamp) 55%,var(--w-line));box-shadow:-2px 2px 10px -2px color-mix(in srgb,var(--w-lamp) 35%,transparent)}
.gd-pebble-glyph{font-size:.92rem;line-height:1;display:inline-flex;align-items:center;justify-content:center;transform:translate(2px,-2px);color:var(--w-ink-soft);transition:transform .18s cubic-bezier(.16,1,.3,1),color .15s ease}
.gd-pebble-hitbox:hover .gd-pebble-glyph{transform:translate(2px,-2px) scale(1.12);color:var(--w-ink)}
.gd-pebble-sticker[data-active="true"] .gd-pebble-glyph{color:var(--w-lamp)}
.gd-pebble-counter{font-size:.72rem;font-weight:700;font-variant-numeric:tabular-nums;transform:translate(2px,-2px);color:var(--w-lamp)}
.gd-pebble-status{width:7px;height:7px;border-radius:50%;transform:translate(2px,-2px);background:var(--w-success, var(--w-lamp));box-shadow:0 0 6px var(--w-success, var(--w-lamp))}
.gd-pebble-status[data-state="busy"]{background:var(--w-lamp);box-shadow:0 0 6px var(--w-lamp)}
.gd-pebble-status[data-state="syncing"]{background:var(--w-focus);box-shadow:0 0 6px var(--w-focus)}
.gd-pebble-menu{position:absolute;top:calc(100% - .2rem);right:0;min-width:155px;background:var(--w-ground);border:1px solid var(--w-line);box-shadow:0 10px 30px -4px color-mix(in srgb, var(--w-ink) 22%, transparent);border-radius:.85rem;padding:.35rem;display:flex;flex-direction:column;gap:.25rem;z-index:40;animation:gdPebblePop .14s cubic-bezier(.16,1,.3,1)}
@keyframes gdPebblePop{from{opacity:0;transform:translateY(-4px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
.gd-pebble-menu-item{display:flex;align-items:center;gap:.55rem;padding:.45rem .75rem;border-radius:.55rem;font-size:.76rem;font-weight:500;color:var(--w-ink);background:transparent;border:none;cursor:pointer;text-align:left;transition:background .12s ease,color .12s ease}
.gd-pebble-menu-item:hover{background:color-mix(in srgb,var(--w-lamp) 16%,var(--w-ground));color:var(--w-lamp)}
.gd-pebble-tooltip{position:absolute;bottom:calc(100% + 4px);right:0;background:var(--w-ink);color:var(--w-ground);font-size:.7rem;font-weight:500;padding:.25rem .6rem;border-radius:.45rem;white-space:nowrap;pointer-events:none;z-index:50;box-shadow:0 4px 14px color-mix(in srgb, var(--w-ink) 18%, transparent);animation:gdPebblePop .12s ease}
.gd-pebble[data-gear="compact"],@container (max-width: 114px){.gd-pebble{padding:.8rem .4rem .7rem .4rem}.gd-pebble-emoji{font-size:1.55rem}.gd-pebble-title{font-size:.78rem}.gd-pebble-rhythm{display:none!important}.gd-pebble-sticker{width:1.65rem;height:1.65rem;padding:0 0 .15rem .15rem}.gd-pebble-glyph{font-size:.78rem;transform:translate(1px,-1px)}.gd-pebble-counter{font-size:.65rem;transform:translate(1px,-1px)}.gd-pebble-status{width:6px;height:6px;transform:translate(1px,-1px)}}
.gd-rail{display:flex;flex-direction:column;gap:var(--gd-gap-inside,8px);min-width:0}.gd-rail-label{margin:0}.gd-rail-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.gd-rail-track{list-style:none;margin:0;padding:0 0 4px;display:flex;gap:min(0.75rem, 18px);overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:0;overscroll-behavior-x:contain;scrollbar-width:thin}
.gd-rail-item{flex:none;width:var(--gd-rail-item);scroll-snap-align:start}
.gd-carousel{display:flex;flex-direction:column;gap:8px;min-width:0}
.gd-carousel-track{list-style:none;margin:0;padding:0;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;overscroll-behavior-x:contain}.gd-carousel-track::-webkit-scrollbar{display:none}
.gd-carousel-page{flex:none;width:100%;scroll-snap-align:start}
.gd-carousel-controls{display:flex;align-items:center;justify-content:space-between;gap:8px}.gd-carousel-position{display:flex;flex-direction:column;align-items:center;gap:4px}.gd-carousel-dots{display:flex;gap:6px}
.gd-dot{width:6px;height:6px;border-radius:50%;background:var(--w-dot-off);transition:background var(--w-settle)}.gd-dot[data-on]{background:var(--w-dot-on)}
@media (prefers-reduced-motion:reduce){.gd-carousel-track{scroll-behavior:auto}.gd-card{transition:none}.gd-card:is(a,button):active{transform:none;filter:none}}
.gd-surface[data-tone="raised"],.gd-group-body,.gd-card{position:relative;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='cardPulp'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04 0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23cardPulp)'/%3E%3C/svg%3E"),radial-gradient(120% 100% at 50% 35%, var(--w-wash-centre), var(--w-wash-edge));background-blend-mode:overlay,normal;border-top:1px solid color-mix(in srgb, var(--w-lamp) 28%, var(--w-line));box-shadow:inset 0 1px 0 color-mix(in srgb, var(--w-lamp) 22%, transparent),inset 0 0 0 1px var(--w-line),var(--w-surface-raised-shadow)}
.gd-living-ground{position:relative;background-color:var(--w-ground);background-image:radial-gradient(ellipse at 50% -10%,color-mix(in srgb, var(--w-glow) 32%, transparent) 0%,transparent 65%),radial-gradient(circle at 100% 100%,color-mix(in srgb, var(--w-lamp) 15%, transparent) 0%,transparent 55%),radial-gradient(circle at 0% 80%,color-mix(in srgb, var(--w-lamp-deep, var(--w-lamp)) 10%, transparent) 0%,transparent 50%);min-height:100%;width:100%;isolation:isolate;overflow:hidden;display:flex;flex-direction:column}
[data-mode="dark"] .gd-living-ground{background-image:radial-gradient(ellipse at 50% -12%,color-mix(in srgb, var(--w-glow) 26%, transparent) 0%,transparent 70%),radial-gradient(circle at 100% 100%,color-mix(in srgb, var(--w-lamp) 14%, transparent) 0%,transparent 60%),radial-gradient(circle at 0% 85%,color-mix(in srgb, var(--w-lamp-deep, var(--w-lamp)) 10%, transparent) 0%,transparent 55%)}
.gd-living-ground[data-atmosphere="canopy"]::before{content:"";position:absolute;top:-20%;left:50%;transform:translateX(-50%);width:min(1400px,160vw);height:min(800px,85vh);border-radius:50%;background:radial-gradient(ellipse at 50% 30%,color-mix(in srgb, var(--w-glow) 30%, transparent) 0%,transparent 70%);opacity:0.75;filter:blur(60px);pointer-events:none;z-index:0}
.gd-living-ground[data-atmosphere="centered"]::before{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(1100px,140vw);height:min(1100px,140vh);border-radius:50%;background:radial-gradient(circle,color-mix(in srgb, var(--w-glow) 24%, transparent) 0%,transparent 65%);opacity:0.7;filter:blur(80px);pointer-events:none;z-index:0}
.gd-living-ground[data-atmosphere="ambient"]::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb, var(--w-glow) 15%, transparent) 0%,transparent 100%);opacity:0.55;pointer-events:none;z-index:0}
.gd-living-ground-surface{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}
.gd-living-ground-surface .gd-light-texture{display:block;opacity:var(--w-living-texture-opacity,0.48);mix-blend-mode:multiply}
.gd-living-ground-surface .gd-dark-texture{display:none}
.gd-living-ground-surface .gd-living-vein-group,.gd-living-ground-surface .gd-world-motif{opacity:var(--w-vein-opacity,0.38)}
.gd-living-ground-surface :is(.gd-vein-shadow,.gd-motif-shadow){stroke:color-mix(in srgb, var(--w-ink) 16%, transparent);fill:none}
.gd-living-ground-surface :is(.gd-vein-light,.gd-motif-light){stroke:color-mix(in srgb, var(--w-raised) 65%, transparent);fill:none}
[data-mode="dark"] .gd-living-ground-surface .gd-light-texture{display:none}
[data-mode="dark"] .gd-living-ground-surface .gd-dark-texture{display:block;opacity:var(--w-moon-milk-opacity,0.18);mix-blend-mode:screen}
[data-mode="dark"] .gd-living-ground-surface .gd-living-vein-group,[data-mode="dark"] .gd-living-ground-surface .gd-world-motif{opacity:var(--w-vein-opacity,0.32)}
[data-mode="dark"] .gd-living-ground-surface :is(.gd-vein-shadow,.gd-motif-shadow){stroke:color-mix(in srgb, var(--w-sunken) 70%, transparent)}
[data-mode="dark"] .gd-living-ground-surface :is(.gd-vein-light,.gd-motif-light){stroke:color-mix(in srgb, var(--w-lamp) 45%, transparent)}
.gd-living-ground-content{position:relative;z-index:2;min-height:100%;width:100%;display:flex;flex-direction:column;flex:1}
.gd-row{container-type:inline-size}@container (max-width: 299px){.gd-row-line{flex-direction:column;align-items:flex-start;gap:4px}.gd-row-detail{text-align:left}}
.gd-row[data-pressable]{transition:background-color var(--w-light-ms)}.gd-row[data-pressable]:active{background-color:color-mix(in srgb, var(--w-light-press-glow) calc(var(--w-light-press-lift) * 100%), transparent)}
@media (prefers-contrast:more){:root:root:root:root:root,.gd-world.gd-world.gd-world.gd-world.gd-world.gd-world{--w-ink-soft:color-mix(in srgb, var(--w-ink) 80%, var(--w-ground));--w-ink-faint:color-mix(in srgb, var(--w-ink) 62%, var(--w-ground));--w-line:color-mix(in srgb, var(--w-ink) 50%, var(--w-ground));--w-group-divider-w:1px}}
@media (prefers-reduced-transparency:reduce){:root:root:root:root:root,.gd-world.gd-world.gd-world.gd-world.gd-world.gd-world{--w-light-rest-glow-opacity:0;--w-light-focus-glow-opacity:0;--w-light-press-glow-opacity:0;--w-light-invalid-glow-opacity:0;--w-light-success-glow-opacity:0;--w-card-veil:color-mix(in srgb, var(--w-ink) 92%, transparent)}}
.gd-prose[data-tone="ground"]{font-family:var(--w-prose-ground-body-font);font-size:var(--w-prose-ground-body-size);line-height:var(--w-prose-ground-body-lh);font-weight:var(--w-prose-ground-body-weight);color:var(--w-prose-ground-body-color);display:flex;flex-direction:column;gap:var(--w-prose-ground-gap);overflow-wrap:anywhere}
.gd-prose[data-tone="ground"] :is(p,ul,ol,pre,blockquote,table,hr,h1,h2,h3){margin:0}
.gd-prose[data-tone="ground"] h1{font-family:var(--w-prose-ground-h1-font);font-size:var(--w-prose-ground-h1-size);line-height:var(--w-prose-ground-h1-lh);font-weight:var(--w-prose-ground-h1-weight);color:var(--w-prose-ground-h1-color)}.gd-prose[data-tone="ground"] h2{font-family:var(--w-prose-ground-h2-font);font-size:var(--w-prose-ground-h2-size);line-height:var(--w-prose-ground-h2-lh);font-weight:var(--w-prose-ground-h2-weight);color:var(--w-prose-ground-h2-color)}.gd-prose[data-tone="ground"] :is(h3,h4,h5,h6){font-family:var(--w-prose-ground-h3-font);font-size:var(--w-prose-ground-h3-size);line-height:var(--w-prose-ground-h3-lh);font-weight:var(--w-prose-ground-h3-weight);color:var(--w-prose-ground-h3-color)}
.gd-prose[data-tone="ground"] code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.88em;color:var(--w-prose-ground-code-ink);background:var(--w-prose-ground-code-fill);padding:.1em .35em;border-radius:4px}
.gd-prose[data-tone="ground"] pre{color:var(--w-prose-ground-pre-ink);background:var(--w-prose-ground-pre-fill);border:var(--w-prose-ground-pre-edge);border-radius:var(--w-prose-ground-pre-radius);padding:var(--w-prose-ground-gap);overflow-x:auto}.gd-prose[data-tone="ground"] pre code{background:none;padding:0;color:inherit}
.gd-prose[data-tone="ground"] blockquote{color:var(--w-prose-ground-quote-ink);background:var(--w-prose-ground-quote-fill);border-inline-start:var(--w-prose-ground-quote-edge);padding:calc(var(--w-prose-ground-gap) * .8)}
.gd-prose[data-tone="ground"] :is(ul,ol){padding-inline-start:1.25em}.gd-prose[data-tone="ground"] li::marker{color:var(--w-prose-ground-bullet)}
.gd-prose[data-tone="ground"] a{color:var(--w-prose-ground-link);text-decoration:underline;text-underline-offset:2px}
.gd-prose[data-tone="ground"] hr{border:0;border-top:var(--w-prose-ground-rule)}
.gd-prose[data-tone="ground"] table{border-collapse:collapse;display:block;overflow-x:auto}.gd-prose[data-tone="ground"] :is(th,td){border:var(--w-prose-ground-table-edge);padding:6px 10px;text-align:start}.gd-prose[data-tone="ground"] th{background:var(--w-prose-ground-table-head)}
.gd-prose[data-tone="lamp"]{font-family:var(--w-prose-lamp-body-font);font-size:var(--w-prose-lamp-body-size);line-height:var(--w-prose-lamp-body-lh);font-weight:var(--w-prose-lamp-body-weight);color:var(--w-prose-lamp-body-color);display:flex;flex-direction:column;gap:var(--w-prose-lamp-gap);overflow-wrap:anywhere}
.gd-prose[data-tone="lamp"] :is(p,ul,ol,pre,blockquote,table,hr,h1,h2,h3){margin:0}
.gd-prose[data-tone="lamp"] h1{font-family:var(--w-prose-lamp-h1-font);font-size:var(--w-prose-lamp-h1-size);line-height:var(--w-prose-lamp-h1-lh);font-weight:var(--w-prose-lamp-h1-weight);color:var(--w-prose-lamp-h1-color)}.gd-prose[data-tone="lamp"] h2{font-family:var(--w-prose-lamp-h2-font);font-size:var(--w-prose-lamp-h2-size);line-height:var(--w-prose-lamp-h2-lh);font-weight:var(--w-prose-lamp-h2-weight);color:var(--w-prose-lamp-h2-color)}.gd-prose[data-tone="lamp"] :is(h3,h4,h5,h6){font-family:var(--w-prose-lamp-h3-font);font-size:var(--w-prose-lamp-h3-size);line-height:var(--w-prose-lamp-h3-lh);font-weight:var(--w-prose-lamp-h3-weight);color:var(--w-prose-lamp-h3-color)}
.gd-prose[data-tone="lamp"] code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.88em;color:var(--w-prose-lamp-code-ink);background:var(--w-prose-lamp-code-fill);padding:.1em .35em;border-radius:4px}
.gd-prose[data-tone="lamp"] pre{color:var(--w-prose-lamp-pre-ink);background:var(--w-prose-lamp-pre-fill);border:var(--w-prose-lamp-pre-edge);border-radius:var(--w-prose-lamp-pre-radius);padding:var(--w-prose-lamp-gap);overflow-x:auto}.gd-prose[data-tone="lamp"] pre code{background:none;padding:0;color:inherit}
.gd-prose[data-tone="lamp"] blockquote{color:var(--w-prose-lamp-quote-ink);background:var(--w-prose-lamp-quote-fill);border-inline-start:var(--w-prose-lamp-quote-edge);padding:calc(var(--w-prose-lamp-gap) * .8)}
.gd-prose[data-tone="lamp"] :is(ul,ol){padding-inline-start:1.25em}.gd-prose[data-tone="lamp"] li::marker{color:var(--w-prose-lamp-bullet)}
.gd-prose[data-tone="lamp"] a{color:var(--w-prose-lamp-link);text-decoration:underline;text-underline-offset:2px}
.gd-prose[data-tone="lamp"] hr{border:0;border-top:var(--w-prose-lamp-rule)}
.gd-prose[data-tone="lamp"] table{border-collapse:collapse;display:block;overflow-x:auto}.gd-prose[data-tone="lamp"] :is(th,td){border:var(--w-prose-lamp-table-edge);padding:6px 10px;text-align:start}.gd-prose[data-tone="lamp"] th{background:var(--w-prose-lamp-table-head)}
.gd-file{display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--w-surface-raised-bg);border-radius:var(--w-surface-raised-radius);box-shadow:var(--w-surface-raised-shadow)}
.gd-file-summary{appearance:none;border:0;background:none;margin:0;padding:0;font:inherit;color:inherit;text-align:start;text-decoration:none;display:flex;align-items:center;gap:12px;min-height:44px;min-width:0}
.gd-file-summary:is(a,button){cursor:pointer}.gd-file-summary:is(a,button):focus-visible{outline:2px solid var(--w-focus);outline-offset:3px;border-radius:4px}
.gd-file-mark{flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:var(--w-toggle-radius);background:var(--w-sunken);color:var(--w-ink-soft);font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight);letter-spacing:var(--w-text-label-ls)}
.gd-file-words{display:flex;flex-direction:column;gap:2px;min-width:0}
.gd-file-name{font-family:var(--w-row-label-font);font-size:var(--w-row-label-size);line-height:var(--w-row-label-lh);color:var(--w-row-label-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gd-file-meta{font-family:var(--w-row-detail-font);font-size:var(--w-row-detail-size);color:var(--w-row-detail-color)}
.gd-file-error{margin:0;font-family:var(--w-field-error-font);font-size:var(--w-field-error-size);color:var(--w-field-error-color)}
.gd-file-actions{display:flex;gap:8px;justify-content:flex-end}
.gd-document-pdf{flex:1;display:flex;flex-direction:column;gap:8px}.gd-document{display:flex;min-height:60vh;border-radius:var(--w-surface-raised-radius);overflow:hidden;box-shadow:var(--w-surface-raised-shadow)}.gd-document-frame{flex:1;border:0;width:100%;min-height:60vh;background:var(--w-raised)}
.gd-scale,.gd-question{border:0;margin:0;padding:0;min-width:0;display:flex;flex-direction:column;gap:min(0.5rem, 12px)}
.gd-scale-label{padding:0;font-family:var(--w-field-label-font);font-size:var(--w-field-label-size);font-weight:var(--w-field-label-weight);letter-spacing:var(--w-field-label-ls);text-transform:var(--w-field-label-case);color:var(--w-field-label-color)}
.gd-scale-points{display:flex;gap:min(0.25rem, 6px)}
.gd-scale-point{flex:1;position:relative;display:grid;place-items:center;min-height:44px;cursor:pointer;border-radius:var(--w-chip-radius);background:var(--w-chip-rest-bg);color:var(--w-chip-rest-ink);box-shadow:var(--w-chip-rest-shadow);font-family:var(--w-chip-label-font);font-size:var(--w-chip-label-size);font-weight:var(--w-chip-label-weight);transition:background var(--w-light-ms),box-shadow var(--w-light-ms),color var(--w-light-ms)}
.gd-scale-point[data-on]{background:var(--w-chip-selected-bg);color:var(--w-chip-selected-ink);box-shadow:var(--w-chip-selected-shadow)}
.gd-scale-point input,.gd-answer input[type="radio"],.gd-answer input[type="checkbox"]{position:absolute;opacity:0;inset:0;margin:0;cursor:inherit}
.gd-scale-point:has(input:focus-visible),.gd-answer:has(input:focus-visible){outline:2px solid var(--w-focus);outline-offset:2px}
.gd-scale:disabled .gd-scale-point{opacity:var(--w-button-disabled-opacity);cursor:default}
.gd-scale-ends{display:flex;justify-content:space-between;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-text-caption-color)}
.gd-question-prompt{padding:0;margin-bottom:min(0.5rem, 12px);font-family:var(--w-text-title-font);font-size:var(--w-text-title-size);line-height:var(--w-text-title-lh);font-weight:var(--w-text-title-weight);color:var(--w-text-title-color)}
.gd-question-options{display:flex;flex-direction:column;gap:min(0.5rem, 12px)}
.gd-answer{position:relative;display:flex;align-items:center;gap:12px;min-height:52px;padding:12px;cursor:pointer;background:var(--w-raised);border-radius:var(--w-surface-raised-radius);box-shadow:inset 0 0 0 1px var(--w-line);transition:box-shadow var(--w-light-ms)}
.gd-answer[data-chosen]{box-shadow:inset 0 0 0 2px var(--w-q-chosen)}
.gd-answer[data-mark="correct"]{box-shadow:inset 0 0 0 2px var(--w-q-correct)}.gd-answer[data-mark="incorrect"]{box-shadow:inset 0 0 0 2px var(--w-q-incorrect)}.gd-answer[data-mark="missed"]{box-shadow:inset 0 0 0 2px var(--w-q-missed)}
.gd-answer::before{content:"";flex:none;width:22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--w-ink-soft);transition:background var(--w-light-ms)}
.gd-answer:has(input[type="checkbox"])::before{border-radius:var(--w-toggle-radius)}
.gd-answer[data-chosen]::before{background:var(--w-lamp);box-shadow:none}
.gd-answer-words{flex:1;display:flex;flex-direction:column;gap:2px}
.gd-answer-label{font-family:var(--w-text-body-font);font-size:var(--w-text-body-size);color:var(--w-text-body-color)}
.gd-answer-hint{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-text-caption-color)}
.gd-answer-mark{font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight)}
.gd-answer[data-mark="correct"] .gd-answer-mark{color:var(--w-q-correct)}.gd-answer[data-mark="incorrect"] .gd-answer-mark{color:var(--w-q-incorrect)}.gd-answer[data-mark="missed"] .gd-answer-mark{color:var(--w-q-missed)}
.gd-question[data-revealed] .gd-answer{cursor:default}
.gd-question-result{display:flex;flex-direction:column;gap:8px}.gd-question-result>p{margin:0;font-family:var(--w-text-body-font);font-size:var(--w-text-body-size);color:var(--w-q-wrong)}.gd-question-result>p[data-right]{color:var(--w-q-right)}
@media (prefers-reduced-motion:no-preference){.gd-question[data-revealed] .gd-answer[data-mark="incorrect"][data-chosen]{animation:gd-shake 320ms ease-out 1}}
.gd-message{display:flex;flex-direction:column;gap:4px;padding:6px 16px}
.gd-message[data-author="self"]{align-items:flex-end}.gd-message:not([data-author="self"]){align-items:flex-start}
.gd-message-bubble{max-width:min(86%, 40rem);display:flex;flex-direction:column;gap:8px;padding:var(--w-msg-pad);border-radius:var(--w-msg-radius);background:var(--w-msg-other-bg);color:var(--w-msg-other-ink);box-shadow:var(--w-msg-other-edge);border-top-left-radius:var(--w-msg-tucked)}
.gd-message[data-author="self"] .gd-message-bubble{background:var(--w-msg-self-bg);color:var(--w-msg-self-ink);box-shadow:none;border-top-left-radius:var(--w-msg-radius);border-top-right-radius:var(--w-msg-tucked)}
.gd-message-meta,.gd-message-interrupted p{margin:0;font-family:var(--w-msg-meta-font);font-size:var(--w-msg-meta-size);color:var(--w-msg-meta-color)}
.gd-message-interrupted{display:flex;align-items:center;gap:8px}.gd-message-interrupted[data-state="failed"] p{color:var(--w-agent-failed)}
.gd-message-list{flex:1;min-height:0;height:100%}
.gd-composer{display:flex;flex-direction:column;gap:8px;padding:12px}
.gd-composer-tray{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.gd-composer-row{display:flex;align-items:flex-end;gap:8px}
.gd-composer-input{flex:1;min-height:44px;max-height:10rem;resize:none;field-sizing:content}
.gd-composer-count{margin:0;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-text-caption-color)}.gd-composer-count[data-over]{color:var(--w-q-wrong)}
.gd-agent-card{display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--w-agent-bg);border-radius:var(--w-agent-radius);box-shadow:var(--w-agent-edge);color:var(--w-ink);font:inherit;text-align:start;border:0}
button.gd-agent-card{cursor:pointer}button.gd-agent-card:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-thinking summary{display:flex;align-items:center;gap:8px;min-height:44px;cursor:pointer;font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight);color:var(--w-text-label-color)}
.gd-agent-head{display:flex;align-items:center;gap:8px}.gd-agent-title{flex:1;font-family:var(--w-text-body-font);font-size:var(--w-text-body-size)}
.gd-agent-state{font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight)}
[data-state="running"] .gd-agent-state{color:var(--w-agent-running)}[data-state="done"] .gd-agent-state{color:var(--w-agent-done)}[data-state="failed"] .gd-agent-state{color:var(--w-agent-failed)}
.gd-agent-detail,.gd-agent-result{margin:0;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft)}.gd-agent-result{color:var(--w-ink);font-size:var(--w-text-body-size)}
.gd-agent-actions{display:flex;flex-wrap:wrap;gap:8px}
.gd-run-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}.gd-run-steps li{display:flex;align-items:center;gap:8px}.gd-run-steps li[data-state="pending"] .gd-agent-title{color:var(--w-ink-soft)}
.gd-approval{display:flex;flex-direction:column;gap:min(0.75rem, 18px);padding:16px;background:var(--w-approval-bg);border-radius:var(--w-surface-raised-radius);box-shadow:var(--w-approval-edge)}
.gd-approval-title{margin:0;font-family:var(--w-text-title-font);font-size:var(--w-text-title-size);font-weight:var(--w-text-title-weight)}
.gd-approval-outcome{margin:0;font-family:var(--w-text-body-font)}.gd-approval[data-state="accepted"] .gd-approval-outcome{color:var(--w-agent-done)}.gd-approval:is([data-state="failed"],[data-state="expired"]) .gd-approval-outcome{color:var(--w-agent-failed)}.gd-approval[data-state="discarded"] .gd-approval-outcome{color:var(--w-ink-soft)}
.gd-citation{appearance:none;border:0;background:none;padding:0 2px;margin:0;font:inherit;font-size:.85em;color:var(--w-lamp-deep);cursor:pointer;vertical-align:super}
.gd-privacy-state{margin:0;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft)}
.gd-fab{appearance:none;border:0;margin:0;position:relative;display:grid;place-items:center;width:56px;height:56px;border-radius:50%;cursor:pointer;background:var(--w-lamp);color:var(--w-on-lamp);box-shadow:var(--w-surface-raised-shadow),var(--w-button-primary-shadow);font-size:1.5rem;transition:transform var(--w-settle),filter var(--w-light-ms)}
.gd-fab:active{transform:scale(var(--w-press));filter:brightness(calc(1 + var(--w-light-press-lift)))}.gd-fab:focus-visible{outline:2px solid var(--w-focus);outline-offset:3px}
.gd-fab-signal{position:absolute;top:6px;right:6px;width:12px;height:12px;border-radius:50%;background:var(--w-row-signal);box-shadow:0 0 0 2px var(--w-lamp)}
.gd-fab-menu{display:flex;flex-direction:column;gap:16px}.gd-fab-danger .gd-row-label{color:var(--w-danger)}.gd-fab-lit .gd-row-label{color:var(--w-lamp-deep)}
.gd-rich-fallback{min-height:8rem;resize:vertical}
@media (prefers-reduced-motion:reduce){.gd-fab{transition:none}.gd-fab:active{transform:none;filter:none}}
.gd-media{margin:0;display:flex;flex-direction:column;gap:8px;min-width:0}
.gd-media-frame{display:block;width:100%;height:auto;object-fit:cover;border-radius:var(--w-surface-raised-radius);background:var(--w-sunken)}
video.gd-media-frame{object-fit:contain;background:var(--w-ink)}
.gd-media-audio{width:100%;min-height:44px}
.gd-media-caption,.gd-media-note{margin:0;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-text-caption-color)}
.gd-media-transcript summary{min-height:44px;display:flex;align-items:center;cursor:pointer;font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight);color:var(--w-lamp-deep)}
.gd-media-transcript p{margin:0;font-family:var(--w-text-body-font);font-size:var(--w-text-body-size);color:var(--w-ink)}
.gd-dropzone{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:16px;border-radius:var(--w-surface-raised-radius);background:var(--w-raised);outline:var(--w-line-weight, 1px) dashed var(--w-line);outline-offset:-1px;transition:outline-color var(--w-light-ms),background var(--w-light-ms)}
.gd-dropzone[data-over]{outline:2px solid var(--w-q-chosen);background:color-mix(in srgb, var(--w-glow) calc(var(--w-light-focus-lift) * 100%), var(--w-raised))}
.gd-dropzone[data-disabled]{opacity:var(--w-button-disabled-opacity)}
.gd-dropzone>.gd-field-hint{margin:0}.gd-dropzone>p.gd-field-hint{flex-basis:100%}
.gd-file-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.gd-capture-actions{display:flex;flex-wrap:wrap;gap:8px}
.gd-capture-messages p{margin:0;font-family:var(--w-field-error-font);font-size:var(--w-field-error-size);color:var(--w-field-error-color)}
.gd-image-capture,.gd-audio-record,.gd-file-field{display:flex;flex-direction:column;gap:8px}
.gd-image-capture>.gd-field-label,.gd-audio-record>.gd-field-label{margin:0}
.gd-app-header{position:sticky;top:0;z-index:20;display:flex;flex-direction:column;gap:10px;padding:10px 16px;padding-top:max(10px, env(safe-area-inset-top));background:var(--w-ground);color:var(--w-ink);box-shadow:0 0 0 0 transparent;transition:box-shadow var(--w-light-ms) ease-out}
.gd-app-header[data-ruled]{box-shadow:inset 0 -1px 0 var(--w-line)}
.gd-app-header[data-raised]{box-shadow:inset 0 -1px 0 var(--w-line),0 8px 18px -12px var(--w-shadow-tint)}
.gd-app-header[data-compact]{gap:6px;padding-block:6px}
.gd-app-header-row{display:flex;align-items:center;gap:8px;min-width:0}
.gd-app-header-identity{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.gd-app-header-eyebrow{margin:0;font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight);letter-spacing:var(--w-text-label-ls);text-transform:var(--w-text-label-case);color:var(--w-text-label-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gd-app-header-title{margin:0;font-family:var(--w-text-title-font);font-size:var(--w-text-title-size);line-height:var(--w-text-title-lh);font-weight:var(--w-text-title-weight);color:var(--w-text-title-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gd-app-header[data-compact] .gd-app-header-title{font-size:17px;line-height:22px}
.gd-app-header-avatar{appearance:none;border:0;background:none;padding:0;margin:0;border-radius:50%;cursor:pointer;min-width:44px;min-height:44px;display:grid;place-items:center;transition:transform var(--w-settle)}
.gd-app-header-avatar:active{transform:scale(var(--w-press))}.gd-app-header-avatar:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-app-header-beside{display:flex;align-items:center;gap:8px;min-width:0}.gd-app-header-beside .gd-app-header-title{flex:0 1 auto}
.gd-app-header-subtitle{margin:0;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gd-app-header-perspective{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;max-width:100%}
.gd-app-header-perspective span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gd-app-header-actions{display:flex;align-items:center;gap:4px;flex:none}
.gd-app-header-action{position:relative;display:inline-flex}
.gd-app-header-dot{position:absolute;top:8px;right:8px;width:10px;height:10px;border-radius:50%;background:var(--w-lamp);box-shadow:0 0 0 1.5px var(--w-ground),var(--w-row-signal-glow);pointer-events:none}
.gd-app-header-dot[data-tone="danger"]{background:var(--w-danger);box-shadow:0 0 0 1.5px var(--w-ground)}.gd-app-header-dot[data-tone="quiet"]{background:var(--w-ink-faint);box-shadow:0 0 0 1.5px var(--w-ground)}
.gd-app-header-count{position:absolute;top:4px;right:2px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;display:grid;place-items:center;background:var(--w-lamp);color:var(--w-on-lamp);font-family:var(--w-text-label-font);font-size:10px;font-weight:700;box-shadow:0 0 0 1.5px var(--w-ground);pointer-events:none}
.gd-app-header-count[data-tone="danger"]{background:var(--w-danger);color:var(--w-on-danger)}
.gd-app-header-search input{width:100%;min-height:44px;padding:10px 14px;background:var(--w-sunken)}
@media (prefers-reduced-motion:no-preference){.gd-app-header-search{animation:gd-header-search-in var(--w-settle) ease-out}}
@keyframes gd-header-search-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@media (min-width:1024px){.gd-app-header{padding-inline:24px}}
.gd-app-header-action{border-radius:999px;background:var(--w-sunken);transition:background-color var(--w-light-ms)}
.gd-app-header-action[data-expanded]{background:color-mix(in srgb, var(--w-sunken) 80%, var(--w-lamp))}
.gd-app-header-status{margin:0;display:flex;align-items:center;gap:6px;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gd-app-header-status::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;background:var(--w-lamp)}
.gd-app-header-status[data-tone="offline"]::before{background:var(--w-ink-faint)}.gd-app-header-status[data-tone="attention"]::before{background:var(--w-danger)}
@media (prefers-reduced-motion:no-preference){.gd-app-header-status[data-tone="syncing"]::before{animation:gd-status-breathe 1.6s ease-in-out infinite}}
@keyframes gd-status-breathe{50%{opacity:.35}}
.gd-task-tabs{display:flex;align-items:center;gap:2px;margin:6px 12px;padding:3px;overflow-x:auto;scrollbar-width:none;border-radius:999px;background:var(--w-sunken);scroll-padding-inline:48px}
.gd-task-tabs::-webkit-scrollbar{display:none}
.gd-task-tab-pill{position:relative;display:inline-flex;align-items:center;flex:none;max-width:14rem;border-radius:999px;transition:background-color var(--w-light-ms),box-shadow var(--w-light-ms)}
.gd-task-tab-pill[data-active],.gd-task-tabs>.gd-task-tab[aria-selected="true"]{background:var(--w-raised);box-shadow:var(--w-surface-raised-shadow)}
.gd-task-tab{appearance:none;border:0;margin:0;background:none;position:relative;min-height:38px;max-width:12rem;padding:0 14px;border-radius:999px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--w-chip-label-font, var(--w-text-label-font));font-size:var(--w-text-label-size);color:var(--w-ink-soft);transition:color var(--w-light-ms),background-color var(--w-light-ms),box-shadow var(--w-light-ms)}
.gd-task-tab[aria-selected="true"]{color:var(--w-ink);font-weight:600}.gd-task-tab:hover:not([aria-selected="true"]){color:var(--w-ink)}
.gd-task-tab-pill[data-active] .gd-task-tab{padding-right:4px}
.gd-task-tab:focus-visible,.gd-task-tab-close:focus-visible{outline:2px solid var(--w-focus);outline-offset:-2px}
.gd-task-tab-close{appearance:none;border:0;margin:0 6px 0 0;padding:0;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:transparent;color:var(--w-ink-soft);font-size:15px;line-height:1;opacity:0;width:0;margin-right:0;overflow:hidden;transition:opacity var(--w-light-ms),background-color var(--w-light-ms),transform var(--w-settle)}
.gd-task-tab-pill[data-active] .gd-task-tab-close,.gd-task-tab-pill:hover .gd-task-tab-close,.gd-task-tab-pill:focus-within .gd-task-tab-close{opacity:1;width:26px;margin-right:6px}
.gd-task-tab-close:hover{background:var(--w-sunken);color:var(--w-ink)}.gd-task-tab-close:active{transform:scale(var(--w-press))}
@media (prefers-reduced-motion:reduce){.gd-task-tab,.gd-task-tab-pill,.gd-task-tab-close,.gd-app-header-action{transition:none}.gd-task-tab-close:active{transform:none}}
.gd-notification{display:flex;align-items:center;gap:8px}
.gd-notification-main{appearance:none;border:0;margin:0;padding:10px 0;background:none;font:inherit;color:inherit;text-align:start;flex:1;min-width:0;min-height:56px;display:flex;align-items:flex-start;gap:10px;border-radius:8px}
button.gd-notification-main{cursor:pointer;transition:background-color var(--w-light-ms)}
button.gd-notification-main:active{background-color:color-mix(in srgb, var(--w-light-press-glow) calc(var(--w-light-press-lift) * 100%), transparent)}
button.gd-notification-main:focus-visible,.gd-notification-read:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-notification-mark{flex:none;width:8px;height:8px;margin:7px 1px 0;border-radius:50%;background:transparent}
.gd-notification[data-unread] .gd-notification-mark{background:var(--w-lamp);box-shadow:var(--w-row-signal-glow)}
.gd-notification[data-unread][data-tone="danger"] .gd-notification-mark{background:var(--w-danger);box-shadow:none}
.gd-notification-icon{flex:none;display:inline-flex;color:var(--w-ink-soft)}.gd-notification[data-unread] .gd-notification-icon{color:var(--w-ink)}.gd-notification[data-tone="danger"] .gd-notification-icon{color:var(--w-danger)}
.gd-notification-words{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.gd-notification-title{font-family:var(--w-text-body-font);font-size:var(--w-text-body-size);line-height:var(--w-text-body-lh);color:var(--w-ink-soft);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gd-notification[data-unread] .gd-notification-title{color:var(--w-ink);font-weight:600}
.gd-notification-body,.gd-notification-time{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-text-caption-color)}
.gd-notification-body{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gd-notification-time{flex:none;padding-top:2px;white-space:nowrap}
.gd-notification-read{appearance:none;border:0;background:none;margin:0;padding:0 8px;min-height:44px;font:inherit;font-size:var(--w-text-caption-size);color:var(--w-lamp-deep);cursor:pointer}
.gd-switch-row{appearance:none;border:0;margin:0;background:none;font:inherit;color:inherit;text-align:start;width:100%;min-height:var(--w-row-min-height);padding:var(--w-row-py) 0;display:flex;align-items:center;gap:12px;cursor:pointer;border-radius:8px}
.gd-switch-row:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}.gd-switch-row:disabled{opacity:.5;cursor:default}
.gd-switch-row-words{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.gd-switch-row-track{flex:none;position:relative;width:48px;height:28px;border-radius:14px;background:var(--w-toggle-edge);transition:background-color var(--w-light-ms)}
.gd-switch-row-thumb{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:var(--w-raised);box-shadow:0 1px 2px color-mix(in srgb, var(--w-shadow-tint) 30%, transparent);transition:transform var(--w-settle)}
.gd-switch-row[aria-checked="true"] .gd-switch-row-track{background:var(--w-toggle-on)}
.gd-switch-row[aria-checked="true"] .gd-switch-row-thumb{transform:translateX(20px)}
@media (prefers-reduced-motion:reduce){.gd-switch-row-track,.gd-switch-row-thumb{transition:none}}
.gd-group-row{position:relative;padding:0 var(--w-group-indent)}.gd-group-row+.gd-group-row::before{content:"";position:absolute;top:0;left:var(--w-group-indent);right:0;height:var(--w-group-divider-w);background:var(--w-line)}
.gd-field[data-state="error"] .gd-field-input{animation:gd-shake 320ms ease-out 1}
@keyframes gd-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
@media (prefers-reduced-motion:reduce){.gd-button:active,.gd-chip:active,.gd-icon-button:active{transform:none;filter:none}.gd-button,.gd-field-input{transition:none}.gd-field[data-state="error"] .gd-field-input{animation:none}}
.gd-picker{display:flex;flex-direction:column;gap:8px;padding:6px 0}
.gd-picker-choice{appearance:none;margin:0;font:inherit;text-align:start;cursor:pointer;display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:10px 14px;border-radius:14px;background:var(--w-ground);border:1px solid var(--w-line);color:var(--w-ink)}
.gd-picker-choice[aria-checked="true"]{border:2px solid var(--w-focus)}
.gd-picker-choice:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-picker-choice:active{opacity:.85}
.gd-picker-lamp{flex:none;width:26px;height:18px;border-radius:min(9px, var(--w-button-radius));background:var(--w-lamp)}
.gd-picker-name{flex:1;display:flex;flex-direction:column;gap:4px}
.gd-picker-name::after{content:"";width:44px;height:1px;background:var(--w-ornament);opacity:.7}
.gd-picker-mark{flex:none;width:8px;height:8px;border-radius:50%;background:var(--w-lamp)}
.gd-time-ago{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);line-height:var(--w-text-caption-lh);color:var(--w-time-today-ink)}.gd-time-ago[data-intent="past"]{color:var(--w-time-past-ink)}.gd-time-ago[data-intent="future"]{color:var(--w-time-future-ink)}
.gd-month{display:flex;flex-direction:column;gap:6px}.gd-month-head{display:flex;align-items:center;justify-content:space-between}
.gd-month-title{margin:0;flex:1;text-align:center;font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight);color:var(--w-ink)}
.gd-month-grid{width:100%;border-collapse:collapse;table-layout:fixed}.gd-month-grid th{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);font-weight:400;color:var(--w-ink-soft);padding:4px 0;text-align:center}.gd-month-grid td{padding:2px 0;text-align:center}
.gd-month-day{appearance:none;border:0;margin:0 auto;position:relative;display:grid;place-items:center;width:44px;height:44px;max-width:100%;border-radius:50%;background:transparent;cursor:pointer;font-family:var(--w-text-body-font);font-size:var(--w-text-body-size);color:var(--w-time-today-ink);transition:background-color var(--w-light-ms),color var(--w-light-ms),transform var(--w-settle)}
.gd-month-day[data-intent="past"]{color:var(--w-time-past-ink)}.gd-month-day[data-intent="future"]{color:var(--w-time-future-ink)}.gd-month-day[data-outside]{opacity:.5}
.gd-month-day[aria-current="date"]{font-weight:600;box-shadow:inset 0 0 0 1.5px var(--w-time-today-mark)}
.gd-month-day[aria-pressed="true"]{background:var(--w-time-selected);color:var(--w-time-on-selected);font-weight:600;box-shadow:none}
.gd-month-day[data-busy]::after{content:"";position:absolute;bottom:6px;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:var(--w-time-dot)}.gd-month-day[aria-pressed="true"][data-busy]::after{background:var(--w-time-on-selected)}
.gd-month-day[aria-disabled="true"]{opacity:.3;cursor:default}.gd-month-day:hover:not([aria-disabled="true"]):not([aria-pressed="true"]){background:color-mix(in srgb, var(--w-lamp) 12%, transparent)}.gd-month-day:active:not([aria-disabled="true"]){transform:scale(.94)}
.gd-month-day:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-date-travel{display:flex;flex-direction:column;gap:4px;padding:6px 4px;border-radius:var(--w-agent-radius);background:var(--w-time-today-wash);transition:background-color var(--w-light-ms)}.gd-date-travel[data-intent="past"]{background:var(--w-time-past-wash)}.gd-date-travel[data-intent="future"]{background:var(--w-time-future-wash)}
.gd-date-travel-row{display:flex;align-items:center}.gd-date-travel-day{appearance:none;border:0;margin:0;background:none;flex:1;min-width:0;min-height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;border-radius:8px;color:var(--w-time-today-ink)}
.gd-date-travel[data-intent="past"] .gd-date-travel-day{color:var(--w-time-past-ink)}.gd-date-travel[data-intent="future"] .gd-date-travel-day{color:var(--w-time-future-ink)}.gd-date-travel-day:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-date-travel-intent{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size)}.gd-date-travel-date{font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.gd-date-travel-extra{display:flex;justify-content:center;align-items:center;gap:8px}.gd-date-travel-time{font:inherit;font-family:var(--w-text-caption-font);color:var(--w-ink);background:var(--w-raised);border:0;border-radius:999px;padding:6px 12px;min-height:36px;box-shadow:inset 0 0 0 1px var(--w-line)}.gd-date-travel-time:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-timeline{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}.gd-timeline-day{display:flex;flex-direction:column;gap:4px}.gd-timeline-heading{margin:0;font-family:var(--w-group-label-font, var(--w-text-caption-font));font-size:var(--w-text-caption-size);color:var(--w-ink-soft)}
.gd-timeline-entries{list-style:none;margin:0;padding:0}.gd-timeline-entry{position:relative;padding:0 0 12px 24px;min-height:44px;color:var(--w-time-today-ink)}
.gd-timeline-entry::before{content:"";position:absolute;left:1px;top:6px;width:10px;height:10px;border-radius:50%;background:var(--w-time-now)}.gd-timeline-entry::after{content:"";position:absolute;left:5.5px;top:20px;bottom:0;width:1px;background:var(--w-line)}
.gd-timeline-entry[data-intent="past"]{color:var(--w-time-past-ink)}.gd-timeline-entry[data-intent="past"]::before{background:var(--w-time-past-mark)}.gd-timeline-entry[data-intent="future"]{color:var(--w-time-future-ink)}.gd-timeline-entry[data-intent="future"]::before{background:var(--w-time-future-mark)}
.gd-timeline-entry[data-tone="lamp"]::before{background:var(--w-time-now)}.gd-timeline-entry[data-tone="danger"]::before{background:var(--w-danger)}
.gd-timeline-entry>*,.gd-timeline-press{display:flex;flex-direction:column;gap:2px}.gd-timeline-time{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size)}.gd-timeline-title{font-family:var(--w-text-body-font);font-size:var(--w-text-body-size)}.gd-timeline-body{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft)}
.gd-timeline-press{appearance:none;border:0;margin:0;padding:0;background:none;font:inherit;color:inherit;text-align:start;cursor:pointer;width:100%;border-radius:6px}.gd-timeline-press:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-timeline-now{display:flex;align-items:center;gap:8px;padding:4px 0 8px;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-time-today-ink)}.gd-timeline-now::before{content:"";flex:none;width:12px;height:12px;border-radius:50%;background:var(--w-time-now)}.gd-timeline-now::after{content:"";flex:1;height:1.5px;background:var(--w-time-now)}
@media (prefers-reduced-motion:reduce){.gd-month-day,.gd-date-travel{transition:none}.gd-month-day:active{transform:none}}
.gd-disclosure-head{list-style:none;display:flex;align-items:center;gap:12px;min-height:48px;padding:8px 0;cursor:pointer;border-radius:8px;transition:background-color var(--w-light-ms)}.gd-disclosure-head::-webkit-details-marker{display:none}
.gd-disclosure-head:hover{background:color-mix(in srgb, var(--w-lamp) 6%, transparent)}.gd-disclosure-head:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-disclosure-words{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.gd-disclosure-title{font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight);color:var(--w-ink)}.gd-disclosure-summary{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft)}
.gd-disclosure-chevron{flex:none;width:16px;text-align:center;font-size:20px;color:var(--w-ink-soft);transition:transform var(--w-settle)}.gd-disclosure[open]>.gd-disclosure-head .gd-disclosure-chevron{transform:rotate(90deg)}.gd-disclosure-body{padding-bottom:8px}
@media (prefers-reduced-motion:no-preference){.gd-disclosure[open]>.gd-disclosure-body{animation:gd-disclose var(--w-settle) ease-out}}@keyframes gd-disclose{from{opacity:0;transform:translateY(-4px)}}
.gd-notice{display:flex;gap:12px;padding:12px 8px 12px 15px;border-radius:var(--w-agent-radius);background:var(--w-notice-neutral-bg);color:var(--w-notice-neutral-ink);box-shadow:inset 3px 0 0 var(--w-notice-neutral-accent)}
.gd-notice[data-tone="lamp"]{background:var(--w-notice-lamp-bg);color:var(--w-notice-lamp-ink);box-shadow:inset 3px 0 0 var(--w-notice-lamp-accent)}.gd-notice[data-tone="success"]{background:var(--w-notice-success-bg);color:var(--w-notice-success-ink);box-shadow:inset 3px 0 0 var(--w-notice-success-accent)}.gd-notice[data-tone="danger"]{background:var(--w-notice-danger-bg);color:var(--w-notice-danger-ink);box-shadow:inset 3px 0 0 var(--w-notice-danger-accent)}
.gd-notice-words{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:4px}.gd-notice-title{margin:0;font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight)}.gd-notice-message{margin:0;font-family:var(--w-text-body-font);font-size:var(--w-text-body-size);line-height:var(--w-text-body-lh)}
.gd-notice-dismiss,.gd-search-clear{appearance:none;border:0;margin:0;background:none;color:inherit;flex:none;width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:20px;display:grid;place-items:center}.gd-notice-dismiss:focus-visible,.gd-search-clear:focus-visible{outline:2px solid var(--w-focus);outline-offset:-2px}
.gd-search{display:flex;flex-direction:column;gap:6px}.gd-search-well{display:flex;align-items:center;gap:8px;min-height:44px;border-radius:22px;padding:0 4px 0 14px;background:var(--w-sunken);color:var(--w-ink-soft);box-shadow:inset 0 0 0 1px var(--w-line);transition:box-shadow var(--w-light-ms)}
.gd-search-well:focus-within,.gd-search-well[data-focused="true"]{box-shadow:0 0 0 3px color-mix(in srgb, var(--w-lamp) 25%, transparent), 0 2px 8px color-mix(in srgb, var(--w-shadow-tint) 20%, transparent);border-color:var(--w-lamp);color:var(--w-lamp)}.gd-search-clear{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;border:0;background:color-mix(in srgb, var(--w-ink) 15%, transparent);color:var(--w-ink);font-size:14px;cursor:pointer;transition:all 0.15s ease;flex-shrink:0}.gd-search-clear:hover{background:var(--w-lamp);color:var(--w-ink);transform:scale(1.08)}.gd-search-kbd{font-size:0.68rem;font-family:monospace;font-weight:600;padding:0.1rem 0.35rem;border-radius:0.3rem;background:color-mix(in srgb, var(--w-ink) 8%, transparent);border:1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 8%, transparent));color:var(--w-ink-soft, color-mix(in srgb, var(--w-raised) 50%, transparent));flex-shrink:0}.gd-search-input{flex:1;min-width:0;border:0;background:none;outline:none;font-family:var(--w-field-value-font);font-size:var(--w-field-value-size);color:var(--w-ink);padding:8px 0}.gd-search-input::-webkit-search-cancel-button{display:none}
.gd-search-count{margin:0;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft)}.gd-search-count:empty{display:none}
.gd-number{display:flex;flex-direction:column;gap:6px;align-items:flex-start}.gd-number-well{display:inline-flex;align-items:center;padding:3px;border-radius:var(--w-button-radius);background:var(--w-sunken)}
.gd-number-step{appearance:none;border:0;margin:0;width:44px;height:44px;border-radius:var(--w-button-radius);background:none;color:var(--w-ink);font-size:20px;cursor:pointer;transition:background-color var(--w-light-ms)}.gd-number-step:hover:not(:disabled){background:var(--w-raised)}.gd-number-step:disabled{opacity:.35;cursor:default}.gd-number-step:focus-visible{outline:2px solid var(--w-focus);outline-offset:-2px}
.gd-number-input{width:4.5ch;border:0;background:none;text-align:center;font-family:var(--w-text-title-font);font-size:var(--w-text-title-size);font-variant-numeric:tabular-nums;color:var(--w-ink);-moz-appearance:textfield}.gd-number-input::-webkit-inner-spin-button,.gd-number-input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.gd-number-input:focus-visible{outline:2px solid var(--w-focus);border-radius:6px}
.gd-number-unit{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft);padding-right:4px}
.gd-steps{display:flex;flex-direction:column;gap:8px}.gd-steps-now{margin:0;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft)}
.gd-steps-trail{list-style:none;margin:0;padding:0;display:flex;gap:4px}.gd-steps-step{flex:1;position:relative;min-height:16px}.gd-steps-step::before{content:"";position:absolute;left:0;right:0;top:6px;height:4px;border-radius:2px;background:var(--w-line);transition:background-color var(--w-light-ms)}
.gd-steps-step[data-lit]::before{background:var(--w-toggle-on)}.gd-steps-step[data-state="error"]::before{background:var(--w-danger)}
.gd-steps-press{appearance:none;border:0;margin:0;padding:0;background:none;position:absolute;inset:-14px 0;cursor:pointer;border-radius:6px}.gd-steps-press:focus-visible{outline:2px solid var(--w-focus)}
@media (prefers-reduced-motion:reduce){.gd-disclosure-chevron,.gd-steps-step::before,.gd-number-step,.gd-search-well{transition:none}}
.gd-row[data-tone="danger"] .gd-row-label{color:var(--w-row-danger)}
.gd-launcher{display:flex;flex-direction:column;gap:16px}.gd-launcher-section{display:flex;flex-direction:column;gap:8px}
.gd-launcher-heading{margin:0;font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);font-weight:600;color:var(--w-ink-soft)}
.gd-launcher-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,10rem),1fr));gap:4px}
.gd-launcher-item{position:relative}
.gd-launcher-tile{appearance:none;border:0;margin:0;width:100%;height:100%;min-height:120px;padding:12px;display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:start;cursor:pointer;border-radius:var(--w-agent-radius);background:transparent;color:var(--w-ink);font:inherit;transition:background-color var(--w-light-ms),transform var(--w-settle)}
.gd-launcher-tile:hover{background:color-mix(in srgb, var(--w-lamp) 7%, transparent)}.gd-launcher-tile:active{transform:scale(var(--w-press))}.gd-launcher-tile:focus-visible{outline:2px solid var(--w-focus);outline-offset:-2px}
.gd-launcher-well{position:relative;display:grid;place-items:center;width:44px;height:44px;margin-bottom:6px;border-radius:14px;background:color-mix(in srgb, var(--w-sunken) 88%, var(--w-lamp));color:var(--w-lamp-deep);font-family:var(--w-text-title-font);font-size:var(--w-text-title-size)}
.gd-launcher-dot{position:absolute;top:-2px;right:-2px;width:12px;height:12px;border-radius:50%;background:var(--w-lamp);box-shadow:0 0 0 2px var(--w-ground)}
.gd-launcher-title{font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:var(--w-text-label-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.gd-launcher-badge{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-lamp-deep)}
.gd-launcher-description{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);line-height:var(--w-text-caption-lh);color:var(--w-ink-soft);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gd-launcher-keep{appearance:none;border:0;margin:0;position:absolute;top:8px;right:8px;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:var(--w-raised);color:var(--w-ink-soft);box-shadow:var(--w-surface-raised-shadow);opacity:0;transition:opacity var(--w-light-ms)}
.gd-launcher-item:hover .gd-launcher-keep,.gd-launcher-keep:focus-visible{opacity:1}.gd-launcher-keep:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
@media (hover:none){.gd-launcher-keep{opacity:1}}
.gd-launcher-empty{margin:0;padding:24px 0;text-align:center;color:var(--w-ink-soft)}
.gd-lang-picker{position:relative;display:inline-flex;flex-shrink:0;vertical-align:middle;box-sizing:border-box}
.gd-lang-capsule{display:inline-flex;align-items:center;padding:3px;border-radius:999px;background:var(--w-sunken);box-shadow:inset 0 0 0 1px var(--w-line);gap:2px;flex-shrink:0;white-space:nowrap;box-sizing:border-box}
.gd-lang-capsule-item{appearance:none;border:0;margin:0;min-width:38px;height:32px;padding:0 12px;border-radius:999px;background:none;color:var(--w-ink-soft);font-family:var(--w-text-label-font);font-size:var(--w-text-caption-size);font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;flex-shrink:0;line-height:1;box-sizing:border-box;transition:background-color var(--w-light-ms),color var(--w-light-ms),transform var(--w-settle)}
.gd-lang-capsule-item:hover:not([aria-checked="true"]){color:var(--w-ink);background:color-mix(in srgb, var(--w-raised) 50%, transparent)}
.gd-lang-capsule-item[aria-checked="true"]{background:var(--w-lamp);color:var(--w-on-lamp);box-shadow:var(--w-button-elevated-shadow)}
.gd-lang-capsule-item:focus-visible{outline:2px solid var(--w-focus);outline-offset:1px}
.gd-lang-dropdown{position:relative;display:inline-flex;flex-shrink:0;box-sizing:border-box}
.gd-lang-trigger{appearance:none;border:0;margin:0;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:0 12px;border-radius:999px;background:var(--w-surface);color:var(--w-ink);box-shadow:inset 0 0 0 1px var(--w-line);font-family:var(--w-text-label-font);font-size:var(--w-text-caption-size);font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;line-height:1;box-sizing:border-box;transition:background-color var(--w-light-ms),box-shadow var(--w-light-ms)}
.gd-lang-trigger:hover{background:var(--w-raised);box-shadow:inset 0 0 0 1px var(--w-focus)}
.gd-lang-trigger:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-lang-trigger-code{letter-spacing:0.04em;white-space:nowrap;display:inline-block;line-height:1;flex-shrink:0}
.gd-lang-trigger-chevron{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;transition:transform var(--w-settle)}
.gd-lang-trigger[aria-expanded="true"] .gd-lang-trigger-chevron{transform:rotate(180deg)}
.gd-lang-menu{position:absolute;top:calc(100% + 6px);left:0;min-width:180px;background:var(--w-raised);border-radius:var(--w-agent-radius);padding:6px;box-shadow:var(--w-surface-floating-shadow);box-shadow:inset 0 0 0 1px var(--w-line);list-style:none;margin:0;z-index:50;display:flex;flex-direction:column;gap:2px;box-sizing:border-box}
.gd-lang-menu-item{appearance:none;border:0;margin:0;width:100%;display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:var(--w-surface-inset-radius);background:none;color:var(--w-ink);font-family:inherit;text-align:start;cursor:pointer;box-sizing:border-box;transition:background-color var(--w-light-ms)}
.gd-lang-menu-item:hover,.gd-lang-menu-item[aria-selected="true"]{background:color-mix(in srgb, var(--w-lamp) 12%, transparent)}
.gd-lang-menu-item:focus-visible{outline:2px solid var(--w-focus);outline-offset:-1px}
.gd-lang-menu-labels{display:flex;flex-direction:column;gap:1px}
.gd-lang-menu-native{font-family:var(--w-text-label-font);font-size:var(--w-text-label-size);font-weight:600;color:var(--w-ink);white-space:nowrap}
.gd-lang-menu-secondary{font-family:var(--w-text-caption-font);font-size:var(--w-text-caption-size);color:var(--w-ink-soft);white-space:nowrap}
.gd-lang-check{color:var(--w-lamp);flex-shrink:0}
@media (prefers-reduced-motion:reduce){.gd-lang-capsule-item,.gd-lang-trigger,.gd-lang-trigger-chevron{transition:none}}

/* ==========================================================================
   ThemeSwitcher Web Component: Canonical Diurnal World Controls
   ========================================================================== */
.gd-theme-switcher{position:relative;display:inline-flex;flex-shrink:0;vertical-align:middle;box-sizing:border-box}
.gd-theme-switcher-btn{appearance:none;border:0;margin:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;padding:0 14px;border-radius:999px;background:var(--w-raised);color:var(--w-ink);box-shadow:inset 0 0 0 1px var(--w-line),var(--w-surface-raised-shadow);font-family:var(--w-text-label-font);font-size:var(--w-text-caption-size);font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;line-height:1;box-sizing:border-box;transition:background-color var(--w-light-ms),box-shadow var(--w-light-ms),transform var(--w-settle)}
.gd-theme-switcher-btn:hover{background:var(--w-ground);box-shadow:inset 0 0 0 1px var(--w-focus)}
.gd-theme-switcher-btn:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-theme-switcher-btn[data-gear="icon"]{width:38px;padding:0;border-radius:50%}
.gd-theme-switcher-swatch{width:10px;height:10px;border-radius:50%;flex:none;box-shadow:0 0 0 1px var(--w-line);background:var(--w-lamp)}
.gd-theme-switcher-icon-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%}
.gd-theme-switcher-glyph{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;display:inline-block}
.gd-theme-switcher-label{font-size:var(--w-text-caption-size);letter-spacing:0.01em;color:inherit;white-space:nowrap}
.gd-theme-switcher-popover{position:absolute;top:calc(100% + 8px);right:0;z-index:1050;width:300px;max-width:calc(100vw - 32px);background:var(--w-surface-raised-bg,var(--w-raised));border-radius:var(--w-agent-radius);padding:14px;box-shadow:var(--w-surface-floating-shadow),inset 0 0 0 1px var(--w-line);display:flex;flex-direction:column;gap:12px;box-sizing:border-box;animation:gd-theme-fade-in 0.15s ease-out}
@keyframes gd-theme-fade-in{from{opacity:0;transform:translateY(-4px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.gd-theme-switcher-group{display:flex;flex-direction:column;gap:6px}
.gd-theme-switcher-group-title{font-family:var(--w-text-caption-font);font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--w-ink-soft)}
.gd-theme-switcher-mode-row{display:flex;background:var(--w-sunken);box-shadow:inset 0 0 0 1px var(--w-line);border-radius:999px;padding:3px;gap:2px}
.gd-theme-switcher-mode-btn{flex:1;appearance:none;border:0;background:transparent;padding:6px 0;border-radius:999px;font-family:var(--w-text-label-font);font-size:11.5px;font-weight:600;color:var(--w-ink-soft);cursor:pointer;transition:all var(--w-light-ms);display:flex;align-items:center;justify-content:center}
.gd-theme-switcher-mode-btn:hover{color:var(--w-ink)}
.gd-theme-switcher-mode-btn[aria-checked="true"]{background:var(--w-raised);color:var(--w-ink);font-weight:700;box-shadow:var(--w-surface-raised-shadow)}
.gd-theme-switcher-mode-btn:focus-visible{outline:2px solid var(--w-focus);outline-offset:1px}
.gd-theme-switcher-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}
.gd-theme-switcher-world-btn{appearance:none;border:1px solid transparent;border-radius:var(--w-surface-inset-radius);background:transparent;padding:6px 8px;width:100%;min-width:0;min-height:38px;display:flex;align-items:center;gap:8px;cursor:pointer;font-family:inherit;font-size:12px;color:var(--w-ink);text-align:left;box-sizing:border-box;transition:background-color var(--w-light-ms),border-color var(--w-light-ms)}
.gd-theme-switcher-world-btn:hover{background:var(--w-sunken)}
.gd-theme-switcher-world-btn[aria-checked="true"]{background:color-mix(in srgb, var(--w-lamp) 12%, var(--w-raised));border-color:var(--w-lamp);font-weight:600}
.gd-theme-switcher-world-btn:focus-visible{outline:2px solid var(--w-focus);outline-offset:1px}
.gd-theme-switcher-world-swatch{position:relative;width:20px;height:20px;border-radius:5px;flex:none;box-sizing:border-box}
.gd-theme-switcher-world-dot{position:absolute;right:2px;bottom:2px;width:6px;height:6px;border-radius:50%}
.gd-theme-switcher-world-name{display:block;min-width:0;color:var(--w-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.gd-theme-switcher-check{font-size:12px;font-weight:700;color:var(--w-lamp);flex:none}
@media (prefers-reduced-motion:reduce){.gd-theme-switcher-btn,.gd-theme-switcher-mode-btn,.gd-theme-switcher-world-btn,.gd-theme-switcher-popover{animation:none;transition:none}}

/* ==========================================================================
   ScrollArea Web Component: World-Grounded Kinetic Instruments
   ========================================================================== */
.gd-scrollarea{position:relative;width:100%;min-height:0;min-width:0;overflow:hidden;box-sizing:border-box}
.gd-scrollarea:not([data-orientation="horizontal"]){height:100%}
.gd-scrollarea > .gd-scrollarea-viewport{position:relative;width:100%;height:100%;outline:none;cursor:default;box-sizing:border-box;-webkit-overflow-scrolling:touch}
.gd-scrollarea[data-orientation="vertical"] > .gd-scrollarea-viewport,
.gd-scrollarea[data-orientation="both"] > .gd-scrollarea-viewport{position:absolute;inset:0}
.gd-scrollarea:not([data-variant="native"]) > .gd-scrollarea-viewport{scrollbar-width:none;-ms-overflow-style:none}
.gd-scrollarea:not([data-variant="native"]) > .gd-scrollarea-viewport::-webkit-scrollbar{display:none;width:0;height:0}
.gd-scrollarea[data-variant="native"] > .gd-scrollarea-viewport{scrollbar-width:auto}
.gd-scrollarea[data-variant="native"] > .gd-scrollarea-viewport::-webkit-scrollbar{display:block;width:auto;height:auto}
.gd-scrollarea-viewport[data-orientation="horizontal"]{overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain}
.gd-scrollarea-viewport[data-orientation="vertical"]{overflow-x:hidden;overflow-y:auto;overscroll-behavior-y:contain}
.gd-scrollarea-viewport[data-orientation="both"]{overflow:auto;overscroll-behavior:contain}
.gd-scrollarea-viewport[data-smooth="true"]{scroll-behavior:smooth}
.gd-scrollarea-viewport[data-smooth="false"]{scroll-behavior:auto}
.gd-scrollarea-viewport[data-panning="true"]{cursor:grabbing;user-select:none;-webkit-user-select:none}
.gd-scrollarea-content{box-sizing:border-box}
.gd-scrollarea[data-orientation="horizontal"] > .gd-scrollarea-viewport > .gd-scrollarea-content{display:flex;flex-direction:row;gap:8px;min-width:max-content;width:max-content;height:100%}
.gd-scrollarea[data-orientation="vertical"] > .gd-scrollarea-viewport > .gd-scrollarea-content{display:block;min-width:100%;min-height:max-content}
.gd-scrollarea[data-orientation="both"] > .gd-scrollarea-viewport > .gd-scrollarea-content{display:block;min-width:max-content;min-height:max-content}
.gd-scrollarea > .gd-scrollarea-mask-start,
.gd-scrollarea > .gd-scrollarea-mask-end{position:absolute;pointer-events:none;z-index:2;transition:opacity var(--w-settle, 0.2s ease)}
.gd-scrollarea[data-orientation="horizontal"] > .gd-scrollarea-mask-start{left:0;top:0;bottom:8px;width:2.5rem;background:linear-gradient(to right, color-mix(in srgb, var(--w-ground) 98%, transparent), transparent)}
.gd-scrollarea[data-orientation="horizontal"] > .gd-scrollarea-mask-end{right:0;top:0;bottom:8px;width:2.5rem;background:linear-gradient(to left, color-mix(in srgb, var(--w-ground) 98%, transparent), transparent)}
.gd-scrollarea[data-orientation="vertical"] > .gd-scrollarea-mask-start{top:0;left:0;right:8px;height:2.5rem;background:linear-gradient(to bottom, color-mix(in srgb, var(--w-ground) 98%, transparent), transparent)}
.gd-scrollarea[data-orientation="vertical"] > .gd-scrollarea-mask-end{bottom:0;left:0;right:8px;height:2.5rem;background:linear-gradient(to top, color-mix(in srgb, var(--w-ground) 98%, transparent), transparent)}
.gd-scrollarea > .gd-scrollarea-track{position:absolute;z-index:10;user-select:none;-webkit-user-select:none;touch-action:none;box-sizing:border-box}
.gd-scrollarea[data-variant="native"] > .gd-scrollarea-track{display:none}
.gd-scrollarea > .gd-scrollarea-track[data-axis="horizontal"]{left:2px;right:2px;bottom:2px;height:6px}
.gd-scrollarea > .gd-scrollarea-track[data-axis="vertical"]{top:2px;right:2px;bottom:2px;width:6px}
.gd-scrollarea-rail{position:absolute;inset:0;box-sizing:border-box}

:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) > .gd-scrollarea-track{border-radius:var(--w-toggle-radius,9999px);background:color-mix(in srgb, var(--w-line) 90%, transparent);transition:opacity calc(var(--w-settle, 0.2s) * var(--gd-tempo, 1)),height var(--w-settle, 0.15s ease),width var(--w-settle, 0.15s ease)}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) > .gd-scrollarea-track[data-axis="horizontal"]:hover,
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) > .gd-scrollarea-track[data-axis="horizontal"][data-active="true"]{height:8px}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) > .gd-scrollarea-track[data-axis="vertical"]:hover,
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) > .gd-scrollarea-track[data-axis="vertical"][data-active="true"]{width:8px}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb{position:absolute;border-radius:var(--w-toggle-radius,9999px);background:var(--w-lamp);box-shadow:0 0 8px color-mix(in srgb, var(--w-lamp) 60%, transparent);cursor:grab;touch-action:none;transition:background-color var(--w-settle, 0.15s ease),box-shadow var(--w-settle, 0.15s ease)}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) > .gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-thumb{top:0;bottom:0}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) > .gd-scrollarea-track[data-axis="vertical"] .gd-scrollarea-thumb{left:0;right:0}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb[data-tone="quiet"]{background:var(--w-ink-faint);box-shadow:none}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb[data-tone="signal"]{background:var(--w-focus);box-shadow:0 0 10px color-mix(in srgb, var(--w-glow) 75%, transparent)}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb[data-dragging="true"],
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb:active{cursor:grabbing;background:color-mix(in srgb, var(--w-lamp) 85%, var(--w-ink))}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb[data-tone="quiet"][data-dragging="true"],
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb[data-tone="quiet"]:active{background:var(--w-ink-soft)}
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb[data-tone="signal"][data-dragging="true"],
:is(.gd-scrollarea:not([data-variant]),.gd-scrollarea[data-variant="auto"],.gd-scrollarea[data-variant="sovereign"]) .gd-scrollarea-thumb[data-tone="signal"]:active{background:color-mix(in srgb, var(--w-focus) 90%, var(--w-ground))}

.gd-scrollarea[data-variant="macos"] > .gd-scrollarea-track{background:transparent;border-radius:9999px}
.gd-scrollarea[data-variant="macos"] > .gd-scrollarea-track[data-axis="vertical"]{width:7px;right:3px}
.gd-scrollarea[data-variant="macos"] > .gd-scrollarea-track[data-axis="horizontal"]{height:7px;bottom:3px}
.gd-scrollarea[data-variant="macos"] .gd-scrollarea-thumb{position:absolute;border-radius:9999px;background:color-mix(in srgb, var(--w-ink) 35%, transparent);cursor:grab;touch-action:none;transition:background-color 0.15s ease}
.gd-scrollarea[data-variant="macos"] > .gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-thumb{top:0;bottom:0}
.gd-scrollarea[data-variant="macos"] > .gd-scrollarea-track[data-axis="vertical"] .gd-scrollarea-thumb{left:0;right:0}
.gd-scrollarea[data-variant="macos"] .gd-scrollarea-thumb:hover,
.gd-scrollarea[data-variant="macos"] .gd-scrollarea-thumb:active{background:color-mix(in srgb, var(--w-ink) 65%, transparent)}

.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track{background:transparent;border-radius:9999px;transition:all 0.2s ease}
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-axis="vertical"]{width:4px;right:2px}
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-axis="horizontal"]{height:4px;bottom:2px}
.gd-scrollarea[data-variant="fluent"]:hover > .gd-scrollarea-track,
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track:hover,
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-active="true"]{background:color-mix(in srgb, var(--w-ink) 8%, transparent)}
.gd-scrollarea[data-variant="fluent"]:hover > .gd-scrollarea-track[data-axis="vertical"],
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-axis="vertical"]:hover,
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-axis="vertical"][data-active="true"]{width:10px}
.gd-scrollarea[data-variant="fluent"]:hover > .gd-scrollarea-track[data-axis="horizontal"],
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-axis="horizontal"]:hover,
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-axis="horizontal"][data-active="true"]{height:10px}
.gd-scrollarea[data-variant="fluent"] .gd-scrollarea-thumb{position:absolute;border-radius:9999px;background:color-mix(in srgb, var(--w-ink) 45%, transparent);cursor:grab;touch-action:none;transition:background-color 0.15s ease}
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-thumb{top:0;bottom:0}
.gd-scrollarea[data-variant="fluent"] > .gd-scrollarea-track[data-axis="vertical"] .gd-scrollarea-thumb{left:0;right:0}
.gd-scrollarea[data-variant="fluent"] .gd-scrollarea-thumb:hover,
.gd-scrollarea[data-variant="fluent"] .gd-scrollarea-thumb:active{background:color-mix(in srgb, var(--w-ink) 75%, transparent)}

.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track{opacity:1}
.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track[data-axis="vertical"]{width:16px;right:0;top:0;bottom:0;background:color-mix(in srgb, var(--w-ground) 85%, var(--w-ink));border-left:1px solid var(--w-line)}
.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track[data-axis="horizontal"]{height:16px;bottom:0;left:0;right:0;background:color-mix(in srgb, var(--w-ground) 85%, var(--w-ink));border-top:1px solid var(--w-line)}
.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track[data-axis="vertical"] .gd-scrollarea-rail{top:16px;bottom:16px;left:0;right:0}
.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-rail{left:16px;right:16px;top:0;bottom:0}
.gd-scrollarea[data-variant="classic"] .gd-scrollarea-stepper{position:absolute;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--w-surface-raised-bg, var(--w-ground)) 90%, var(--w-ink));color:var(--w-ink);font-size:9px;line-height:1;cursor:pointer;user-select:none;border:1px solid var(--w-line);box-shadow:inset 1px 1px 0 color-mix(in srgb, var(--w-wash-centre, var(--w-ground)) 70%, transparent),inset -1px -1px 0 color-mix(in srgb, var(--w-ink) 25%, transparent)}
.gd-scrollarea[data-variant="classic"] .gd-scrollarea-stepper:active{box-shadow:inset -1px -1px 0 color-mix(in srgb, var(--w-wash-centre, var(--w-ground)) 70%, transparent),inset 1px 1px 0 color-mix(in srgb, var(--w-ink) 35%, transparent)}
.gd-scrollarea[data-variant="classic"] .gd-scrollarea-stepper[data-dir="start"]{top:0;left:0;width:16px;height:16px;z-index:11}
.gd-scrollarea[data-variant="classic"] .gd-scrollarea-stepper[data-dir="end"]{bottom:0;left:0;width:16px;height:16px;z-index:11}
.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-stepper[data-dir="start"]{top:0;left:0;width:16px;height:16px;z-index:11}
.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-stepper[data-dir="end"]{top:0;right:0;left:auto;bottom:0;width:16px;height:16px;z-index:11}
.gd-scrollarea[data-variant="classic"] .gd-scrollarea-thumb{position:absolute;background:color-mix(in srgb, var(--w-surface-raised-bg, var(--w-ground)) 90%, var(--w-ink));border:1px solid var(--w-line);border-radius:2px;box-shadow:inset 1px 1px 0 color-mix(in srgb, var(--w-wash-centre, var(--w-ground)) 70%, transparent),inset -1px -1px 0 color-mix(in srgb, var(--w-ink) 25%, transparent);cursor:default}
.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track[data-axis="vertical"] .gd-scrollarea-thumb{left:0;right:0}
.gd-scrollarea[data-variant="classic"] > .gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-thumb{top:0;bottom:0}

.gd-scrollarea-track[data-visibility="hover"]{opacity:0.5;transition:opacity 0.2s ease}
.gd-scrollarea:hover > .gd-scrollarea-track[data-visibility="hover"],
.gd-scrollarea-track[data-visibility="hover"]:hover,
.gd-scrollarea-track[data-active="true"]{opacity:1}
.gd-scrollarea-track[data-visibility="always"]{opacity:0.85}
.gd-scrollarea:hover > .gd-scrollarea-track[data-visibility="always"],
.gd-scrollarea-track[data-visibility="always"]:hover{opacity:1}
/* "scrolling": shown only while moving, or while a pointer rests on it. */
.gd-scrollarea-track[data-visibility="scrolling"]{opacity:0;transition:opacity 0.3s ease}
.gd-scrollarea-track[data-visibility="scrolling"][data-moving="true"],
.gd-scrollarea-track[data-visibility="scrolling"]:hover{opacity:0.85}
/* Reduced motion: one rule for every page. When the person or their device asks for less motion,
   nothing moves; animations and transitions jump to their end. Pages never write their own block.
   Waiting signs are left out: they hold a still pose of their own (see .gd-s above). */
@media (prefers-reduced-motion:reduce){:where(*:not(.gd-s,.gd-s *)),:where(*:not(.gd-s *))::before,:where(*:not(.gd-s *))::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
/* Blur costs a low-end phone a lot. Verger decides: when it says the device can only afford
   reduced or essential visuals, no surface blurs what is behind it. Pages never gate it themselves. */
html[data-visual-quality="reduced"] *,html[data-visual-quality="essential"] *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
/* Touch size: on a touch screen nothing you press is smaller than the platform minimum
   (44px, Apple and WCAG 2.5.5; the phone app uses 48 on Android). One rule for every page; pages
   never set their own. Inline text links are exempt, as WCAG allows. */
:root{--gd-touch-min:44px}
@media (pointer:coarse){
:where(button,[role="button"],[role="tab"],[role="menuitem"],[role="switch"],[role="option"],select,summary,input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="range"])):not(.sr-only){min-block-size:var(--gd-touch-min)!important;min-inline-size:var(--gd-touch-min)!important}
}
/* Native scroll bars, one rule for every page (pages never style their own).
   Desktop: thin and world-coloured. Touch screens and phone width: none standing; the OS shows its
   own while moving. A row that scrolls sideways (tabs, chips, rails) declares .gd-strip and never
   shows a bar; the cut-off item at the edge is the hint that there is more. */
*{scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--w-lamp) 60%,var(--w-line)) transparent}
::-webkit-scrollbar{width:9px;height:9px}
::-webkit-scrollbar-track{background:color-mix(in srgb,var(--w-line) 40%,transparent)}
::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--w-lamp) 55%,var(--w-line));border-radius:9999px;border:1.5px solid transparent;background-clip:padding-box}
::-webkit-scrollbar-thumb:hover{background:var(--w-lamp)}
::-webkit-scrollbar-corner{background:transparent}
.gd-strip{scrollbar-width:none;overscroll-behavior-x:contain}.gd-strip::-webkit-scrollbar{display:none}
@media (hover:none) and (pointer:coarse), (max-width:48rem){
*{scrollbar-width:none !important}
::-webkit-scrollbar{display:none !important;width:0 !important;height:0 !important}
}
/* Touch screens and the phone-width layout: no standing scroll bar anywhere, whatever a page asks
   for; it appears while the content moves and fades after, as on the phone app and the OS itself. */
@media (hover:none) and (pointer:coarse), (max-width:48rem){
.gd-scrollarea-track{opacity:0 !important;pointer-events:none;transition:opacity 0.35s ease}
.gd-scrollarea-track[data-moving="true"],.gd-scrollarea-track[data-active="true"]{opacity:0.7 !important}
}

/* Universal fail-safe thumb positioning and minimum grab target */
.gd-scrollarea-thumb{
  position: absolute;
  box-sizing: border-box;
}
.gd-scrollarea:not([data-variant="sovereign"]):not([data-variant="fluid"]):not([data-variant="leaf"]):not([data-variant="ratna"]):not([data-variant="perahera"]):not([data-variant="circadian"]) > .gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-thumb:not([data-pure-token="true"]){
  top: 0;
  bottom: 0;
  height: 100%;
  min-width: 28px;
}
.gd-scrollarea:not([data-variant="sovereign"]):not([data-variant="fluid"]):not([data-variant="leaf"]):not([data-variant="ratna"]):not([data-variant="perahera"]):not([data-variant="circadian"]) > .gd-scrollarea-track[data-axis="vertical"] .gd-scrollarea-thumb:not([data-pure-token="true"]){
  left: 0;
  right: 0;
  width: 100%;
  min-height: 28px;
}

/* Sculpted Talisman Focal Indicator (Leaf, Teardrop, Faceted Gem, Flame Ember) */
.gd-scrollarea-talisman{
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transform-origin: center center;
  transition: transform var(--w-settle, 0.15s ease), filter var(--w-settle, 0.15s ease);
  filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--w-ink) 40%, transparent));
}
.gd-scrollarea-thumb:hover .gd-scrollarea-talisman{
  transform: scale(1.15);
  filter: drop-shadow(0 3px 8px color-mix(in srgb, var(--w-lamp) 60%, transparent));
}
.gd-scrollarea-thumb[data-dragging="true"] .gd-scrollarea-talisman{
  transform: scale(1.22);
  filter: drop-shadow(0 4px 12px color-mix(in srgb, var(--w-lamp) 85%, transparent));
}

/* ==========================================================================
   Tactile & World-Inspired Living Instruments (8px Precision Profile)
   ========================================================================== */

/* 1. 3D Mechanical Calibrated Vernier (Angampora / Caliper & Louvers) */
.gd-scrollarea[data-variant="mechanical"] > .gd-scrollarea-track[data-axis="vertical"]{
  width: 8px;
  right: 2px;
  background: color-mix(in srgb, var(--w-ground) 92%, var(--w-ink));
  box-shadow: inset 1px 0 2px color-mix(in srgb, var(--w-ink) 25%, transparent), inset -1px 0 1px color-mix(in srgb, var(--w-wash-centre, var(--w-ground)) 40%, transparent);
  border-left: 1px solid var(--w-line);
  border-radius: 2px;
}
.gd-scrollarea[data-variant="mechanical"] > .gd-scrollarea-track[data-axis="horizontal"]{
  height: 8px;
  bottom: 2px;
  background: color-mix(in srgb, var(--w-ground) 92%, var(--w-ink));
  box-shadow: inset 0 1px 2px color-mix(in srgb, var(--w-ink) 25%, transparent), inset 0 -1px 1px color-mix(in srgb, var(--w-wash-centre, var(--w-ground)) 40%, transparent);
  border-top: 1px solid var(--w-line);
  border-radius: 2px;
}
.gd-scrollarea[data-variant="mechanical"] .gd-scrollarea-thumb{
  border-radius: 2px;
  background: linear-gradient(to right, color-mix(in srgb, var(--w-surface-raised-bg, var(--w-ground)) 95%, var(--w-ink)), color-mix(in srgb, var(--w-wash-centre, var(--w-ground)) 80%, var(--w-lamp)));
  border: 1px solid color-mix(in srgb, var(--w-line) 80%, var(--w-lamp));
  box-shadow: 1px 1px 2px color-mix(in srgb, var(--w-ink) 35%, transparent), inset 1px 1px 0 color-mix(in srgb, var(--w-surface-raised-bg, var(--w-ground)) 90%, transparent);
  cursor: grab;
}
.gd-scrollarea[data-variant="mechanical"] .gd-scrollarea-thumb::after{
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: repeating-linear-gradient(to bottom, var(--w-ink-faint) 0px, var(--w-ink-faint) 1px, transparent 1px, transparent 2px);
  opacity: 0.7;
}
.gd-scrollarea[data-variant="mechanical"] .gd-scrollarea-thumb:active{
  cursor: grabbing;
  box-shadow: inset 1px 1px 2px color-mix(in srgb, var(--w-ink) 40%, transparent);
}

/* 1. Sovereign Golden Sanctuary Diya (Living Temple Flame) */
.gd-scrollarea[data-variant="sovereign"] > .gd-scrollarea-track[data-axis="vertical"]{
  width: 6px;
  right: 14px;
  background: color-mix(in srgb, var(--w-ground) 80%, var(--w-ink));
  box-shadow: inset 1px 0 2px color-mix(in srgb, var(--w-ink) 25%, transparent);
  border-left: 1px solid color-mix(in srgb, var(--w-lamp) 40%, var(--w-line));
  border-radius: 9999px;
  transition: all var(--w-settle, 0.2s ease);
}
.gd-scrollarea[data-variant="sovereign"] > .gd-scrollarea-track[data-axis="horizontal"]{
  height: 6px;
  bottom: 14px;
  background: color-mix(in srgb, var(--w-ground) 80%, var(--w-ink));
  box-shadow: inset 0 1px 2px color-mix(in srgb, var(--w-ink) 25%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--w-lamp) 40%, var(--w-line));
  border-radius: 9999px;
  transition: all var(--w-settle, 0.2s ease);
}

/* 2. Kinetic Fluid Dewdrop (Wewa / Lotus Ripple Capillary Tube) */
.gd-scrollarea[data-variant="fluid"] > .gd-scrollarea-track[data-axis="vertical"]{
  width: 6px;
  right: 14px;
  background: color-mix(in srgb, var(--w-ground) 75%, transparent);
  box-shadow: inset 1px 1px 2px color-mix(in srgb, var(--w-ink) 25%, transparent), inset -1px -1px 2px color-mix(in srgb, var(--w-surface-raised-bg, var(--w-ground)) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--w-line) 50%, transparent);
  border-radius: 9999px;
  transition: all var(--w-settle, 0.2s ease);
}
.gd-scrollarea[data-variant="fluid"] > .gd-scrollarea-track[data-axis="horizontal"]{
  height: 6px;
  bottom: 14px;
  background: color-mix(in srgb, var(--w-ground) 75%, transparent);
  box-shadow: inset 1px 1px 2px color-mix(in srgb, var(--w-ink) 25%, transparent), inset -1px -1px 2px color-mix(in srgb, var(--w-surface-raised-bg, var(--w-ground)) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--w-line) 50%, transparent);
  border-radius: 9999px;
  transition: all var(--w-settle, 0.2s ease);
}

/* 3. Circadian Astral Sundial (Sanctuary Astrolabe & Solar Ray) */
.gd-scrollarea[data-variant="circadian"] > .gd-scrollarea-track[data-axis="vertical"]{
  width: 6px;
  right: 14px;
  border-radius: 3px;
  background-color: color-mix(in srgb, var(--w-ground) 85%, var(--w-ink));
  border-left: 1px solid var(--w-line);
  box-shadow: inset 1px 0 2px color-mix(in srgb, var(--w-ink) 25%, transparent);
  background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 10px, color-mix(in srgb, var(--w-line) 80%, transparent) 10px, color-mix(in srgb, var(--w-line) 80%, transparent) 11px);
}
.gd-scrollarea[data-variant="circadian"] > .gd-scrollarea-track[data-axis="horizontal"]{
  height: 6px;
  bottom: 14px;
  border-radius: 3px;
  background-color: color-mix(in srgb, var(--w-ground) 85%, var(--w-ink));
  border-top: 1px solid var(--w-line);
  box-shadow: inset 0 1px 2px color-mix(in srgb, var(--w-ink) 25%, transparent);
  background-image: repeating-linear-gradient(to right, transparent 0px, transparent 10px, color-mix(in srgb, var(--w-line) 80%, transparent) 10px, color-mix(in srgb, var(--w-line) 80%, transparent) 11px);
}

/* 4. Faceted Sapphire Prism (Ratna / Gemstone Glint) */
.gd-scrollarea[data-variant="ratna"] > .gd-scrollarea-track[data-axis="vertical"]{
  width: 6px;
  right: 14px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--w-ground) 90%, var(--w-ink));
  border-left: 1px solid color-mix(in srgb, var(--w-lamp) 50%, var(--w-line));
  box-shadow: inset 0 0 6px color-mix(in srgb, var(--w-lamp) 20%, transparent);
}
.gd-scrollarea[data-variant="ratna"] > .gd-scrollarea-track[data-axis="horizontal"]{
  height: 6px;
  bottom: 14px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--w-ground) 90%, var(--w-ink));
  border-top: 1px solid color-mix(in srgb, var(--w-lamp) 50%, var(--w-line));
  box-shadow: inset 0 0 6px color-mix(in srgb, var(--w-lamp) 20%, transparent);
}

/* 5. Nocturnal Torchlight Ember (Perahera / Fire Sparks) */
.gd-scrollarea[data-variant="perahera"] > .gd-scrollarea-track[data-axis="vertical"]{
  width: 6px;
  right: 14px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--w-ink) 92%, var(--w-ground));
  box-shadow: inset 1px 0 3px color-mix(in srgb, var(--w-ink) 60%, transparent);
  border-left: 1px solid color-mix(in srgb, var(--w-lamp) 40%, var(--w-line));
}
.gd-scrollarea[data-variant="perahera"] > .gd-scrollarea-track[data-axis="horizontal"]{
  height: 6px;
  bottom: 14px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--w-ink) 92%, var(--w-ground));
  box-shadow: inset 0 1px 3px color-mix(in srgb, var(--w-ink) 60%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--w-lamp) 40%, var(--w-line));
}

/* 6. Sacred Bo Leaf (Botanical Talisman) */
.gd-scrollarea[data-variant="leaf"] > .gd-scrollarea-track[data-axis="vertical"]{
  width: 6px;
  right: 14px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--w-ground) 85%, var(--w-ink));
  box-shadow: inset 1px 0 2px color-mix(in srgb, var(--w-ink) 25%, transparent);
  border-left: 1px solid color-mix(in srgb, var(--w-lamp) 30%, var(--w-line));
}
.gd-scrollarea[data-variant="leaf"] > .gd-scrollarea-track[data-axis="horizontal"]{
  height: 6px;
  bottom: 14px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--w-ground) 85%, var(--w-ink));
  box-shadow: inset 0 1px 2px color-mix(in srgb, var(--w-ink) 25%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--w-lamp) 30%, var(--w-line));
}

/* Pure Living Talisman Instruments (Zero Rectangular Box Scroller) */
:is(
  .gd-scrollarea[data-variant="sovereign"],
  .gd-scrollarea[data-variant="fluid"],
  .gd-scrollarea[data-variant="leaf"],
  .gd-scrollarea[data-variant="ratna"],
  .gd-scrollarea[data-variant="perahera"],
  .gd-scrollarea[data-variant="circadian"]
) .gd-scrollarea-thumb,
.gd-scrollarea-thumb[data-pure-token="true"]{
  position: absolute !important;
  width: 36px !important;
  min-width: 36px !important;
  max-width: 36px !important;
  height: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  right: auto !important;
  bottom: auto !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  overflow: visible;
  pointer-events: auto !important;
}
:is(
  .gd-scrollarea[data-variant="sovereign"],
  .gd-scrollarea[data-variant="fluid"],
  .gd-scrollarea[data-variant="leaf"],
  .gd-scrollarea[data-variant="ratna"],
  .gd-scrollarea[data-variant="perahera"],
  .gd-scrollarea[data-variant="circadian"]
) .gd-scrollarea-thumb::before{
  display: none !important;
  content: none !important;
}
:is(
  .gd-scrollarea[data-variant="sovereign"],
  .gd-scrollarea[data-variant="fluid"],
  .gd-scrollarea[data-variant="leaf"],
  .gd-scrollarea[data-variant="ratna"],
  .gd-scrollarea[data-variant="perahera"],
  .gd-scrollarea[data-variant="circadian"]
) .gd-scrollarea-thumb[data-dragging="true"],
:is(
  .gd-scrollarea[data-variant="sovereign"],
  .gd-scrollarea[data-variant="fluid"],
  .gd-scrollarea[data-variant="leaf"],
  .gd-scrollarea[data-variant="ratna"],
  .gd-scrollarea[data-variant="perahera"],
  .gd-scrollarea[data-variant="circadian"]
) .gd-scrollarea-thumb:active{
  cursor: grabbing;
}

/* Living Instrument Viewport Padding (Prevents Content Underflow behind Floating Talismans) */
:is(
  .gd-scrollarea[data-variant="sovereign"],
  .gd-scrollarea[data-variant="fluid"],
  .gd-scrollarea[data-variant="leaf"],
  .gd-scrollarea[data-variant="ratna"],
  .gd-scrollarea[data-variant="perahera"],
  .gd-scrollarea[data-variant="circadian"]
)[data-orientation="vertical"] > .gd-scrollarea-viewport{
  padding-right: 28px;
}
:is(
  .gd-scrollarea[data-variant="sovereign"],
  .gd-scrollarea[data-variant="fluid"],
  .gd-scrollarea[data-variant="leaf"],
  .gd-scrollarea[data-variant="ratna"],
  .gd-scrollarea[data-variant="perahera"],
  .gd-scrollarea[data-variant="circadian"]
)[data-orientation="horizontal"] > .gd-scrollarea-viewport{
  padding-bottom: 28px;
}
:is(
  .gd-scrollarea[data-variant="sovereign"],
  .gd-scrollarea[data-variant="fluid"],
  .gd-scrollarea[data-variant="leaf"],
  .gd-scrollarea[data-variant="ratna"],
  .gd-scrollarea[data-variant="perahera"],
  .gd-scrollarea[data-variant="circadian"]
)[data-orientation="both"] > .gd-scrollarea-viewport{
  padding-right: 28px;
  padding-bottom: 28px;
}

/* 7. Perimeter Frame Ribbon */
.gd-scrollarea[data-variant="perimeter"] > .gd-scrollarea-track{
  right: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: color-mix(in srgb, var(--w-line) 40%, transparent);
}
.gd-scrollarea[data-variant="perimeter"] > .gd-scrollarea-track[data-axis="horizontal"]{
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.gd-scrollarea[data-variant="perimeter"] .gd-scrollarea-thumb{
  border-radius: 0;
  background: var(--w-lamp);
  box-shadow: 0 0 8px var(--w-lamp), 0 0 2px var(--w-lamp);
}

/* 8. Landmark Spatial Pips */
.gd-scrollarea-pip{
  position: absolute;
  pointer-events: auto;
  border-radius: 50%;
  background: color-mix(in srgb, var(--w-ink-faint) 80%, transparent);
  transition: transform var(--w-settle), background-color var(--w-settle);
  z-index: 12;
  cursor: pointer;
}
.gd-scrollarea-track[data-axis="vertical"] .gd-scrollarea-pip{
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5px;
  height: 5px;
}
.gd-scrollarea-track[data-axis="horizontal"] .gd-scrollarea-pip{
  top: 50%;
  transform: translate(-50%, -50%);
  width: 5px;
  height: 5px;
}
.gd-scrollarea-pip:hover{
  transform: translate(-50%, -50%) scale(1.8);
  background: var(--w-lamp);
  box-shadow: 0 0 6px var(--w-lamp);
}

/* 9. Scrubber HUD Pill (Context Tooltip on Scrub) */
.gd-scrollarea-hud{
  position: absolute;
  pointer-events: none;
  z-index: 20;
  padding: 3px 8px;
  border-radius: 9999px;
  font-family: var(--w-text-caption-font, system-ui);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  background: color-mix(in srgb, var(--w-ground) 90%, var(--w-ink));
  color: var(--w-ink);
  border: 1px solid var(--w-line);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--w-ink) 25%, transparent);
  transform: translateY(-50%);
  right: 18px;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.1s ease-out;
}
.gd-scrollarea-track[data-active="true"] .gd-scrollarea-hud{
  opacity: 1;
}

@media (prefers-reduced-motion:reduce){.gd-launcher-tile,.gd-launcher-keep{transition:none}.gd-launcher-tile:active{transform:none}}

/* --- Ported Canonical Time Styles --- */

/* ==========================================================================
   Time: Minimalist, World-Personalized Time Component
   ========================================================================== */

.gd-time-timeRoot {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.28rem 0.65rem;
  border-radius: var(--w-radius-md);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 12%, transparent));
  background: var(--w-surface, color-mix(in srgb, var(--paper) 94%, var(--ink) 4%));
  box-shadow: 0 1px 4px color-mix(in srgb, var(--w-shadow-tint) 12%, transparent);
  user-select: none;
}

.gd-time-analogWrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--w-lamp);
}

.gd-time-liveClockSvg {
  display: block;
}

.gd-time-timeDigitalBtn {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  background: transparent;
  border: 0;
  padding: 0.1rem 0.25rem;
  border-radius: var(--w-radius-sm);
  cursor: pointer;
  transition: background 0.15s ease;
}

.gd-time-timeDigitalBtn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--w-ink) 8%, transparent);
}

.gd-time-digitalNumbers {
  font: 700 0.95rem var(--w-font-mono);
  letter-spacing: 0.05em;
  color: var(--w-ink);
  white-space: nowrap;
}

.gd-time-periodBadge {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--w-lamp);
  letter-spacing: 0.04em;
}

.gd-time-formatIndicator {
  display: inline-flex;
  align-items: center;
}

.gd-time-formatTag {
  font: 600 0.62rem system-ui, sans-serif;
  color: var(--w-ink-soft, color-mix(in srgb, var(--w-raised) 45%, transparent));
  text-transform: uppercase;
}


/* --- Ported Canonical Circadian Dial Styles --- */

/* ==========================================================================
   Circadian Clock Dial Component Styles
   ========================================================================== */

.gd-circadian-clockContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  user-select: none;
}

.gd-circadian-dialFrame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--paper-light) 90%, transparent) 40%, color-mix(in srgb, var(--paper) 95%, transparent));
  box-shadow: inset 0 2px 6px color-mix(in srgb, var(--w-shadow-tint) 40%, transparent), 0 4px 16px color-mix(in srgb, var(--w-shadow-tint) 20%, transparent);
  border: 1px solid var(--line);
}

.gd-circadian-clockSvg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.gd-circadian-outerRim {
  fill: none;
  stroke: color-mix(in srgb, var(--w-line, color-mix(in srgb, var(--w-raised) 12%, transparent)) 80%, transparent);
  stroke-width: 1;
}

.gd-circadian-solarBead {
  fill: var(--w-lamp);
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--w-lamp) 80%, transparent));
}

.gd-circadian-cardinalTick {
  stroke: var(--w-lamp);
  stroke-width: 2;
  stroke-linecap: round;
}

.gd-circadian-minorTick {
  stroke: var(--ink-soft);
  stroke-width: 1;
  stroke-linecap: round;
}

.gd-circadian-hourHand {
  stroke: var(--ink);
  stroke-width: 2.8;
  stroke-linecap: round;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.gd-circadian-minuteHand {
  stroke: var(--w-lamp);
  stroke-width: 1.8;
  stroke-linecap: round;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.gd-circadian-centerPivot {
  fill: var(--paper);
  stroke: var(--w-lamp);
  stroke-width: 1.5;
}

.gd-circadian-readoutGroup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.gd-circadian-digitalTime {
  font: 700 1.15rem monospace;
  letter-spacing: 0.04em;
  color: var(--ink);
}

.gd-circadian-phaseLabel {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font: 600 0.72rem system-ui, sans-serif;
  color: var(--w-lamp);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.gd-circadian-stepperRow {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.gd-circadian-stepBtn {
  padding: 0.2rem 0.45rem;
  font-size: 0.68rem;
  font-family: monospace;
  font-weight: 600;
  border-radius: 0.35rem;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper-light) 80%, transparent);
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gd-circadian-stepBtn:hover {
  background: color-mix(in srgb, var(--w-lamp) 18%, transparent);
  border-color: color-mix(in srgb, var(--w-lamp) 40%, transparent);
  color: var(--w-lamp);
}


/* --- Ported Canonical Temporal Combo Styles --- */

/* ==========================================================================
   Temporal Combo: Unified Date & Time Decoupled Architecture
   ========================================================================== */

/* AUTO ADAPTIVE ROOT CONTAINER */
.gd-combo-autoComboRoot {
  display: inline-flex;
  align-items: center;
  width: max-content;
  min-width: max-content;
  flex-shrink: 0;
  max-width: 100%;
}

/* Screen Reader Polite Live Region */
.gd-combo-srOnlyLive {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* NANO COMBO TILE: When size cannot meaningfully hold full or medium bars */
.gd-combo-nanoComboTile {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 0.35rem;
  padding: 0.15rem 0.4rem;
  min-height: 1.95rem;
  border-radius: var(--w-radius-sm);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-ink) 14%, transparent));
  background: color-mix(in srgb, var(--w-surface) 90%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--w-shadow-tint) 4%, transparent);
  user-select: none;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}

.gd-combo-nanoClockBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.3rem;
  border-radius: var(--w-radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--w-ink);
  cursor: pointer;
  transition: all 0.15s ease;
  touch-action: manipulation;
}

.gd-combo-nanoClockBtn:hover {
  background: color-mix(in srgb, var(--w-lamp) 20%, transparent);
  border-color: var(--w-lamp);
  transform: translateY(-1px);
}

.gd-combo-nanoClockBtn:focus-visible {
  outline: 2px solid var(--w-lamp);
  outline-offset: 2px;
}

.gd-combo-nanoClockTime {
  font: 700 0.72rem var(--w-font-mono);
  letter-spacing: 0.04em;
  color: var(--w-lamp);
}

/* COMPACT TWO-ROW QUIET STACK */
.gd-combo-compactComboStack {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border-radius: var(--w-radius-lg);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 12%, transparent));
  background: var(--w-surface, color-mix(in srgb, var(--paper) 94%, var(--ink) 4%));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--w-shadow-tint) 12%, transparent);
  user-select: none;
  box-sizing: border-box;
}

.gd-combo-compactTimeRow {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.gd-combo-compactDateRow {
  display: flex;
  align-items: center;
}


.gd-combo-comboContainer {
  display: flex;
  flex-direction: column;
  gap: clamp(0.45rem, 1.2vw, 0.75rem);
  padding: clamp(0.6rem, 1.8vw, 1.25rem);
  border-radius: var(--w-radius-lg);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 12%, transparent));
  background: var(--w-surface, color-mix(in srgb, var(--paper) 94%, var(--ink) 4%));
  box-shadow: 0 4px 20px color-mix(in srgb, var(--w-shadow-tint) 18%, transparent);
  width: 100%;
  max-width: 48rem;
  box-sizing: border-box;
  overflow: hidden;
}

.gd-combo-comboToggleBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid var(--line);
}

.gd-combo-comboTitleRow {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.gd-combo-comboTitle {
  font: 700 clamp(0.72rem, 1.5vw, 0.82rem) system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--w-lamp);
}

.gd-combo-comboSubtitle {
  font-size: 0.65rem;
  color: var(--ink-soft);
}

.gd-combo-togglePillsGroup {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.gd-combo-togglePill {
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper-light) 60%, transparent);
  color: var(--ink-soft);
  font: 600 0.72rem system-ui, sans-serif;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gd-combo-togglePill:hover {
  background: color-mix(in srgb, var(--w-lamp) 15%, transparent);
  color: var(--w-lamp);
}

.gd-combo-togglePill[data-active="true"] {
  background: color-mix(in srgb, var(--w-lamp) 20%, transparent);
  border-color: color-mix(in srgb, var(--w-lamp) 40%, transparent);
  color: var(--w-lamp);
}

.gd-combo-comboBody {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
}

.gd-combo-dateSegment {
  flex: 1;
  min-width: 0;
}

.gd-combo-comboDivider {
  width: 1px;
  align-self: stretch;
  background: var(--line);
}

.gd-combo-clockSegment {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.gd-combo-clockCard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--paper-light) 80%, transparent);
  border: 1px solid var(--line);
}

.gd-combo-clockCardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.2rem;
}

.gd-combo-timeTopBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.45rem 0.75rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--paper-light) 85%, transparent);
  border: 1px solid var(--line);
}

.gd-combo-timeReadoutGroup {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.gd-combo-clockIconBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper) 80%, transparent);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gd-combo-clockIconBtn:hover {
  background: color-mix(in srgb, var(--w-lamp) 25%, transparent);
  border-color: var(--w-lamp);
  transform: scale(1.05);
}

.gd-combo-digitalNumbersBtn {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  background: transparent;
  border: 0;
  padding: 0.1rem 0.3rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gd-combo-digitalNumbersBtn:hover {
  background: color-mix(in srgb, var(--ink) 8%, transparent);
}

.gd-combo-digitalNumbers {
  font: 700 clamp(0.88rem, 2.2vw, 1.05rem) var(--font-mono, monospace, ui-monospace);
  letter-spacing: 0.05em;
  color: var(--ink);
  white-space: nowrap;
}

.gd-combo-periodBadge {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--w-lamp);
  letter-spacing: 0.04em;
}

.gd-combo-liveClockSvg {
  display: block;
}

.gd-combo-formatSwitch {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.1rem 0.35rem;
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--paper) 80%, transparent);
  border: 1px solid var(--line);
}

.gd-combo-formatBtn {
  background: transparent;
  border: 0;
  padding: 0.1rem 0.25rem;
  border-radius: 0.25rem;
  font: 600 0.66rem system-ui, sans-serif;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.12s ease;
}

.gd-combo-formatBtn:hover {
  color: var(--ink);
}

.gd-combo-formatBtn[data-active="true"] {
  color: var(--w-lamp);
  background: color-mix(in srgb, var(--w-lamp) 15%, transparent);
}

.gd-combo-formatDivider {
  font-size: 0.6rem;
  color: var(--line);
  user-select: none;
}

.gd-combo-visualDialDrawer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--paper-light) 70%, transparent);
  border: 1px dashed var(--line);
  animation: fadeInDial 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInDial {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gd-combo-clockBadge {
  font: 600 0.68rem system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--w-lamp);
}

.gd-combo-closeSegmentBtn {
  background: transparent;
  border: 0;
  color: var(--ink-soft);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  border-radius: 0.3rem;
  transition: all 0.15s ease;
}

.gd-combo-closeSegmentBtn:hover {
  background: color-mix(in srgb, var(--ink) 10%, transparent);
  color: var(--ink);
}

/* Responsive Stacking for Mobile and Tablet */
@media (max-width: 640px) {
  .gd-combo-comboContainer {
    padding: 0.5rem 0.65rem;
    gap: 0.45rem;
  }

  .gd-combo-comboToggleBar {
    gap: 0.35rem;
  }

  .gd-combo-togglePill {
    padding: 0.15rem 0.4rem;
    font-size: 0.65rem;
  }

  .gd-combo-timeTopBar {
    padding: 0.35rem 0.55rem;
  }

  .gd-combo-digitalNumbers {
    font-size: 0.92rem;
  }

  .gd-combo-formatBtn {
    padding: 0.08rem 0.2rem;
    font-size: 0.62rem;
  }
}

@media (max-width: 380px) {
  .gd-combo-comboContainer {
    padding: 0.35rem 0.45rem;
  }

  .gd-combo-comboTitle {
    font-size: 0.68rem;
  }

  .gd-combo-togglePillsGroup {
    gap: 0.2rem;
  }

  .gd-combo-togglePill {
    padding: 0.1rem 0.3rem;
    font-size: 0.6rem;
  }

  .gd-combo-clockIconBtn {
    width: 22px;
    height: 22px;
  }

  .gd-combo-digitalNumbers {
    font-size: 0.85rem;
  }
}

@media (max-width: 860px) {
  .gd-combo-comboBody {
    flex-direction: column;
    align-items: stretch;
  }

  .gd-combo-comboDivider {
    width: 100%;
    height: 1px;
  }

  .gd-combo-clockSegment {
    width: 100%;
    justify-content: center;
  }
}


/* --- Ported Canonical Temporal Horizon (Date) Styles --- */

/* ==========================================================================
   Temporal Horizon Refined: Four-Tier Adaptive DateTime & Phase Architecture
   ========================================================================== */

.gd-date-root {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  font-family: inherit;
  isolation: isolate;
  width: 100%;
}

.gd-date-root[data-compact="true"],
.gd-date-root[data-medium="true"],
.gd-date-root[data-nano="true"] {
  width: fit-content;
  display: inline-flex;
}

/* Screen Reader Polite Live Region */
.gd-date-srOnlyLive {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* --------------------------------------------------------------------------
   FORM FACTOR 0: NANO TILE (When size cannot meaningfully fit chevrons or text)
   -------------------------------------------------------------------------- */
.gd-date-nanoContainer {
  display: inline-flex;
  align-items: center;
  position: relative;
}

.gd-date-nanoDayBadge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: var(--w-radius-sm);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 16%, transparent));
  background: var(--w-surface, color-mix(in srgb, var(--paper) 92%, var(--ink) 6%));
  box-shadow: 0 1px 4px color-mix(in srgb, var(--w-shadow-tint) 18%, transparent);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.18s ease;
  user-select: none;
  touch-action: manipulation;
}

.gd-date-nanoDayBadge:hover {
  transform: translateY(-1px);
  border-color: var(--w-lamp);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--w-lamp) 30%, transparent);
}

.gd-date-nanoDayBadge:focus-visible {
  outline: 2px solid var(--w-lamp);
  outline-offset: 2px;
}

.gd-date-nanoDayHeader {
  width: 100%;
  font-size: 0.5rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.05rem 0;
  color: var(--w-on-lamp);
  background: var(--w-lamp, color-mix(in srgb, var(--paper) 80%, var(--ink) 20%));
  transition: background-color 0.2s ease, color 0.2s ease;
}

.gd-date-nanoDayHeader[data-intent="current"] {
  background: var(--w-lamp);
}

.gd-date-nanoDayHeader[data-intent="review"] {
  background: color-mix(in srgb, var(--w-lamp) 60%, var(--w-ink-soft));
}

.gd-date-nanoDayHeader[data-intent="plan"] {
  background: color-mix(in srgb, var(--w-lamp) 85%, var(--w-surface));
}

.gd-date-nanoDayNumber {
  font: 700 0.85rem var(--w-font-mono);
  line-height: 1.1;
  color: var(--w-ink);
}

/* --------------------------------------------------------------------------
   FORM FACTOR 1: ULTRA-COMPACT MICRO PILL (Zero Slop, Tiny Header Pill)
   -------------------------------------------------------------------------- */
.gd-date-compactBar {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.12rem 0.28rem;
  border-radius: 9999px;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper) 92%, var(--ink) 4%);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--w-shadow-tint) 10%, transparent);
  backdrop-filter: blur(12px);
  user-select: none;
  font-size: 0.72rem;
}

.gd-date-compactDateBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  min-height: 32px;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: var(--ink);
  font: 600 0.74rem system-ui, -apple-system, sans-serif;
  cursor: pointer;
  transition: all 0.18s ease;
}

.gd-date-compactDateBtn:hover {
  background: color-mix(in srgb, var(--ink) 8%, transparent);
}

.gd-date-compactDateBtn:focus-visible {
  outline: 2px solid var(--w-lamp);
  outline-offset: 2px;
}

.gd-date-chevronBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  min-width: 32px;
  min-height: 32px;
  border: 0;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--ink);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.15s ease;
  touch-action: manipulation;
}

.gd-date-chevronBtn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--ink) 10%, transparent);
}

.gd-date-chevronBtn:focus-visible {
  outline: 2px solid var(--w-lamp);
  outline-offset: 2px;
}

.gd-date-chevronBtn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Intent Phase Pip */
.gd-date-phasePip {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  flex-shrink: 0;
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

.gd-date-phasePip[data-intent="current"] {
  background: var(--w-lamp);
  box-shadow: 0 0 5px color-mix(in srgb, var(--w-lamp) 50%, transparent);
}

.gd-date-phasePip[data-intent="review"] {
  background: var(--w-lamp);
  box-shadow: 0 0 5px color-mix(in srgb, var(--w-lamp) 40%, transparent);
}

.gd-date-phasePip[data-intent="plan"] {
  background: var(--w-lamp);
  box-shadow: 0 0 5px color-mix(in srgb, var(--w-lamp) 40%, transparent);
}

/* --------------------------------------------------------------------------
   FORM FACTOR 1.5: MEDIUM ADAPTIVE BAR (Between Compact & Full, for Minimized Panes)
   -------------------------------------------------------------------------- */
.gd-date-mediumBar {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.65rem;
  border-radius: var(--w-radius-md);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 12%, transparent));
  background: var(--w-surface, color-mix(in srgb, var(--paper) 92%, var(--ink) 4%));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--w-shadow-tint) 15%, transparent);
  user-select: none;
}

.gd-date-mediumDateTrigger {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.18rem 0.45rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink);
  font: 700 0.88rem Georgia, serif;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gd-date-mediumDateTrigger:hover {
  background: color-mix(in srgb, var(--paper-light) 80%, transparent);
  border-color: color-mix(in srgb, var(--w-lamp) 30%, transparent);
}

.gd-date-mediumDayBadge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  padding: 0;
  border-radius: 0.38rem;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper-light) 95%, transparent);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--w-shadow-tint) 15%, transparent);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.15s ease;
  user-select: none;
}

.gd-date-mediumDayBadge:hover {
  transform: translateY(-1px);
  border-color: var(--w-lamp);
  box-shadow: 0 2px 6px color-mix(in srgb, var(--w-lamp) 25%, transparent);
}

.gd-date-mediumDayBadgeHeader {
  width: 100%;
  font-size: 0.48rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.05rem 0;
  color: var(--w-on-lamp);
  background: var(--w-lamp, color-mix(in srgb, var(--paper) 80%, var(--ink) 20%));
  transition: background-color 0.2s ease, color 0.2s ease;
}

.gd-date-mediumDayBadgeHeader[data-intent="current"] {
  background: var(--w-lamp);
}

.gd-date-mediumDayBadgeHeader[data-intent="review"] {
  background: color-mix(in srgb, var(--w-lamp) 60%, var(--w-ink-soft));
}

.gd-date-mediumDayBadgeHeader[data-intent="plan"] {
  background: color-mix(in srgb, var(--w-lamp) 85%, var(--w-surface));
}

.gd-date-mediumDayBadgeNumber {
  font: 700 0.8rem var(--w-font-mono);
  line-height: 1.1;
  color: var(--w-ink);
}

.gd-date-mediumPhasePill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--w-lamp) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--w-lamp) 30%, transparent);
  color: var(--w-lamp);
  font: 600 0.72rem system-ui, sans-serif;
  cursor: pointer;
}

.gd-date-mediumCalendarBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 0.45rem;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper-light) 70%, transparent);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

.gd-date-mediumCalendarBtn:hover {
  background: var(--w-lamp);
  border-color: var(--w-lamp);
}

/* --------------------------------------------------------------------------
   FORM FACTOR 2 & 3: FULL HORIZON STACK
   -------------------------------------------------------------------------- */
.gd-date-fullBarContainer {
  display: flex;
  flex-direction: column;
  gap: clamp(0.35rem, 1vw, 0.5rem);
  padding: clamp(0.5rem, 1.5vw, 0.85rem) clamp(0.65rem, 1.8vw, 1.1rem);
  border-radius: var(--w-radius-lg);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 12%, transparent));
  background: var(--w-surface, color-mix(in srgb, var(--paper) 92%, var(--ink) 4%));
  box-shadow: 0 4px 16px color-mix(in srgb, var(--w-shadow-tint) 12%, transparent);
  user-select: none;
  width: 100%;
  max-width: 48rem;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.2s ease;
}

/* TOP ROW: Pure Date with Calendar Icon on the RIGHT */
.gd-date-anchorTopRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.4rem, 1.2vw, 0.75rem);
  padding-bottom: clamp(0.35rem, 1vw, 0.5rem);
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.gd-date-dateDisplayWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 0;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Pure Date Heading */
.gd-date-pureDateHeading {
  font: 700 clamp(0.95rem, 2.5vw, 1.22rem) Georgia, "Times New Roman", serif;
  color: var(--ink);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Clickable Calendar Icon Button on the RIGHT of the Date */
.gd-date-calendarIconBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(1.65rem, 3.5vw, 2rem);
  height: clamp(1.65rem, 3.5vw, 2rem);
  padding: 0;
  border-radius: clamp(0.4rem, 1vw, 0.6rem);
  border: 1px solid color-mix(in srgb, var(--w-lamp) 25%, var(--line));
  background: color-mix(in srgb, var(--w-lamp) 10%, transparent);
  color: var(--w-lamp);
  cursor: pointer;
  transition: all 0.18s ease;
}

.gd-date-calendarIconBtn:hover {
  background: color-mix(in srgb, var(--w-lamp) 25%, transparent);
  border-color: var(--w-lamp);
  color: var(--w-on-lamp);
  transform: translateY(-1px);
}

.gd-date-calendarSvg {
  width: clamp(0.85rem, 2vw, 1.05rem);
  height: clamp(0.85rem, 2vw, 1.05rem);
  color: currentColor;
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--w-lamp) 40%, transparent));
}

.gd-date-calendarGlyph {
  font-size: clamp(0.8rem, 2vw, 1rem);
  line-height: 1;
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--w-lamp) 40%, transparent));
}

/* Stepper Chevrons on Top Flanks */
.gd-date-stepperBtnFlank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(1.7rem, 3.8vw, 2.1rem);
  height: clamp(1.7rem, 3.8vw, 2.1rem);
  border-radius: clamp(0.45rem, 1vw, 0.65rem);
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper-light) 80%, transparent);
  color: var(--ink);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.18s ease;
}

.gd-date-stepperBtnFlank:hover:not(:disabled) {
  background: color-mix(in srgb, var(--w-lamp) 20%, transparent);
  border-color: color-mix(in srgb, var(--w-lamp) 40%, transparent);
  color: var(--w-lamp);
}

.gd-date-stepperBtnFlank:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* BOTTOM ROW: Intent Modes + Icon-Only Date Picker */
.gd-date-intentBottomRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.35rem, 1.2vw, 0.75rem);
  white-space: nowrap;
}

/* 3-Way Intent Slider (Past / Today / Future) */
.gd-date-phaseTrack {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 2px;
  padding: 2px;
  min-width: clamp(8.5rem, 24vw, 13.5rem);
  flex: 1;
  max-width: 22rem;
  border-radius: clamp(0.55rem, 1vw, 0.75rem);
  background: color-mix(in srgb, var(--paper) 75%, var(--ink) 8%);
  border: 1px solid color-mix(in srgb, var(--line) 60%, transparent);
  isolation: isolate;
  white-space: nowrap;
}

.gd-date-phaseSliderPaper {
  position: absolute;
  z-index: -1;
  inset-block: 2px;
  left: 2px;
  width: calc((100% - 4px) / 3);
  border-radius: 0.6rem;
  background: var(--paper-light);
  border: 1px solid color-mix(in srgb, var(--w-lamp) 25%, var(--line));
  box-shadow: 0 1px 4px color-mix(in srgb, var(--w-shadow-tint) 15%, transparent);
  transition: transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.gd-date-phaseTrack[data-phase="review"] .gd-date-phaseSliderPaper {
  transform: translateX(0);
}

.gd-date-phaseTrack[data-phase="current"] .gd-date-phaseSliderPaper {
  transform: translateX(calc(100% + 2px));
}

.gd-date-phaseTrack[data-phase="plan"] .gd-date-phaseSliderPaper {
  transform: translateX(calc(200% + 4px));
}

.gd-date-phaseBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.3rem;
  padding: 0.15rem 0.5rem;
  border: 0;
  border-radius: 0.6rem;
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.18s ease;
}

.gd-date-phaseBtn[aria-pressed="true"] {
  color: var(--ink);
}

.gd-date-phaseBtnContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05rem;
  line-height: 1;
}

.gd-date-phaseTitleRow {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.gd-date-phasePrimaryText {
  font: 700 clamp(0.66rem, 1.6vw, 0.78rem) system-ui, -apple-system, sans-serif;
}

.gd-date-phaseSubText {
  font-size: clamp(0.52rem, 1.2vw, 0.62rem);
  font-weight: 500;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.gd-date-phaseSvg {
  display: inline-block;
  color: var(--w-lamp);
  opacity: 0.9;
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--w-lamp) 40%, transparent));
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease, color 0.15s ease;
}

.gd-date-phaseBtn[aria-pressed="true"] .gd-date-phaseSvg {
  color: var(--w-on-lamp);
  opacity: 1;
}

.gd-date-phaseBtn:hover .gd-date-phaseSvg[data-intent="review"] {
  transform: translateX(-2px);
}

.gd-date-phaseBtn:hover .gd-date-phaseSvg[data-intent="current"] {
  transform: rotate(30deg) scale(1.15);
}

.gd-date-phaseBtn:hover .gd-date-phaseSvg[data-intent="plan"] {
  transform: translateX(2px);
}

.gd-date-phaseEmoji {
  font-size: clamp(0.64rem, 1.5vw, 0.76rem);
  opacity: 0.9;
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--w-lamp) 40%, transparent));
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease;
}

.gd-date-phaseBtn:hover .gd-date-phaseEmoji[data-intent="review"] {
  transform: translateX(-2px);
}

.gd-date-phaseBtn:hover .gd-date-phaseEmoji[data-intent="current"] {
  transform: rotate(30deg) scale(1.15);
}

.gd-date-phaseBtn:hover .gd-date-phaseEmoji[data-intent="plan"] {
  transform: translateX(2px);
}

/* Icon-Only Custom Date Picker Button with Hover Reveal Label */
.gd-date-pickerZone {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.gd-date-datePickerIconBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(1.7rem, 3.8vw, 2.1rem);
  height: clamp(1.7rem, 3.8vw, 2.1rem);
  padding: 0;
  border-radius: clamp(0.45rem, 1vw, 0.6rem);
  border: 1px solid color-mix(in srgb, var(--w-lamp) 25%, var(--line));
  background: color-mix(in srgb, var(--paper-light) 80%, transparent);
  color: var(--w-lamp);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gd-date-datePickerIconBtn:hover {
  background: color-mix(in srgb, var(--w-lamp) 22%, transparent);
  border-color: var(--w-lamp);
  transform: scale(1.08);
}

/* Tooltip revealed only on hover */
.gd-date-datePickerTooltip {
  position: absolute;
  right: 100%;
  margin-right: 0.5rem;
  padding: 0.2rem 0.45rem;
  border-radius: 0.4rem;
  background: var(--w-ink);
  color: var(--w-lamp);
  font: 600 0.7rem system-ui, sans-serif;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateX(4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  border: 1px solid color-mix(in srgb, var(--w-lamp) 30%, transparent);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--w-shadow-tint) 30%, transparent);
}

.gd-date-pickerZone:hover .gd-date-datePickerTooltip {
  opacity: 1;
  transform: translateX(0);
}

/* Direct Typing Date Form */
.gd-date-dateDirectInputForm {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.gd-date-dateDirectInput {
  padding: 0.25rem 0.55rem;
  border-radius: 0.55rem;
  border: 1px solid var(--w-lamp);
  background: var(--paper);
  color: var(--ink);
  font: 600 0.85rem monospace;
  outline: none;
  width: 7.8rem;
}

.gd-date-dateDirectConfirmBtn,
.gd-date-dateDirectCancelBtn {
  padding: 0.22rem 0.45rem;
  border-radius: 0.45rem;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  border: 0;
  transition: opacity 0.15s ease;
}

.gd-date-dateDirectConfirmBtn {
  background: var(--w-lamp);
  color: var(--w-on-lamp);
}

.gd-date-dateDirectCancelBtn {
  background: color-mix(in srgb, var(--ink) 12%, transparent);
  color: var(--ink);
}

/* --------------------------------------------------------------------------
   DYNAMIC THIRD ROW: REVEALS ONLY WHEN IN PAST OR FUTURE
   -------------------------------------------------------------------------- */
.gd-date-dynamicLeapsRow {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: 0.45rem;
  border-top: 1px dashed var(--line);
  animation: leapsSlideIn 180ms ease-out;
}

@keyframes leapsSlideIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.gd-date-leapsScrollWrapper {
  width: 100%;
}

.gd-date-leapPillBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.22rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper-light) 70%, transparent);
  color: var(--ink-soft);
  font: 600 0.72rem system-ui, sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.gd-date-leapPillBtn:hover {
  background: color-mix(in srgb, var(--w-lamp) 15%, transparent);
  border-color: color-mix(in srgb, var(--w-lamp) 35%, transparent);
  color: var(--w-lamp);
}

.gd-date-leapPillBtn[data-active="true"] {
  background: color-mix(in srgb, var(--w-lamp) 20%, transparent);
  border-color: var(--w-lamp);
  color: var(--w-lamp);
}

.gd-date-leapEmoji {
  font-size: 0.72rem;
}

/* --------------------------------------------------------------------------
   FORM FACTOR 4: IN-SITU EXPANDABLE CALENDAR TRAY
   -------------------------------------------------------------------------- */
.gd-date-calendarTray {
  width: 100%;
  max-width: 24rem;
  padding: 0.85rem;
  border-radius: var(--w-radius-lg);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 15%, transparent));
  background: var(--w-surface-elevated, var(--paper-light));
  box-shadow: 0 8px 30px color-mix(in srgb, var(--w-shadow-tint) 28%, transparent);
  animation: traySlideDown 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes traySlideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.gd-date-trayHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.gd-date-trayNavBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--w-radius-sm);
  border: 1px solid var(--w-line, color-mix(in srgb, var(--w-raised) 10%, transparent));
  background: transparent;
  color: var(--w-ink);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gd-date-trayNavBtn:hover {
  background: color-mix(in srgb, var(--w-lamp) 15%, transparent);
  border-color: var(--w-lamp);
  color: var(--w-lamp);
}

.gd-date-monthTitle {
  font: 700 0.95rem var(--w-font-display);
  color: var(--w-ink);
}

/* Weekday Labels */
.gd-date-weekdaysGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
  margin-bottom: 0.35rem;
}

.gd-date-weekdayLabel {
  font: 600 0.7rem system-ui, sans-serif;
  color: var(--w-ink-soft, color-mix(in srgb, var(--w-raised) 45%, transparent));
  text-transform: uppercase;
}

/* Days Matrix */
.gd-date-daysGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.gd-date-dayCell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: var(--w-radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--w-ink);
  font: 500 0.82rem var(--w-font-mono);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gd-date-dayCell:hover:not(:disabled) {
  background: color-mix(in srgb, var(--w-lamp) 15%, transparent);
  border-color: color-mix(in srgb, var(--w-lamp) 30%, transparent);
  color: var(--w-lamp);
}

.gd-date-dayCell[data-outside="true"] {
  opacity: 0.3;
}

.gd-date-dayCell[data-today="true"] {
  font-weight: 700;
  border-color: var(--w-lamp);
  color: var(--w-lamp);
}

.gd-date-dayCell[data-selected="true"] {
  background: var(--w-lamp);
  color: var(--w-on-lamp);
  font-weight: 700;
  border-color: var(--w-lamp);
  box-shadow: 0 0 10px color-mix(in srgb, var(--w-lamp) 40%, transparent);
}

.gd-date-dayCell:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.gd-date-dayPip {
  position: absolute;
  bottom: 2px;
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--w-lamp);
}

.gd-date-dayCell[data-selected="true"] .gd-date-dayPip {
  background: var(--w-on-lamp);
}

/* --------------------------------------------------------------------------
   RESPONSIVE LAYOUT ENGINE (Mobile, Tablet, Desktop)
   -------------------------------------------------------------------------- */
@media (max-width: 640px) {
  .gd-date-fullBarContainer {
    padding: 0.45rem 0.55rem;
    gap: 0.35rem;
    border-radius: 0.85rem;
  }

  .gd-date-anchorTopRow {
    gap: 0.35rem;
    padding-bottom: 0.35rem;
  }

  .gd-date-pureDateHeading {
    font-size: clamp(0.85rem, 3.8vw, 1.05rem);
  }

  .gd-date-calendarIconBtn {
    width: 1.65rem;
    height: 1.65rem;
  }

  .gd-date-stepperBtnFlank {
    width: 1.65rem;
    height: 1.65rem;
    font-size: 0.95rem;
  }

  .gd-date-intentBottomRow {
    gap: 0.35rem;
  }

  .gd-date-phaseTrack {
    min-width: 0;
    flex: 1;
    max-width: none;
  }

  .gd-date-phaseBtn {
    min-height: 1.85rem;
    padding: 0.1rem 0.25rem;
  }

  .gd-date-phasePrimaryText {
    font-size: 0.7rem;
  }

  .gd-date-phaseSubText {
    display: none; /* Hide secondary uppercase subtitles on mobile to prevent overflow */
  }

  .gd-date-datePickerIconBtn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 380px) {
  .gd-date-fullBarContainer {
    padding: 0.35rem 0.45rem;
  }

  .gd-date-pureDateHeading {
    font-size: 0.82rem;
  }

  .gd-date-stepperBtnFlank {
    width: 1.45rem;
    height: 1.45rem;
  }

  .gd-date-calendarIconBtn {
    width: 1.45rem;
    height: 1.45rem;
  }

  .gd-date-phaseEmoji {
    display: none; /* Only show text on ultra-compact phones to prevent any pixel overflow */
  }

  .gd-date-phasePrimaryText {
    font-size: 0.65rem;
  }
}


/* --- Ported Canonical SearchBar Styles --- */

/* ==========================================================================
   Sanctuary Search Bar Component Styles
   ========================================================================== */

.gd-searchbar-searchWell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 0.85rem;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--paper-light) 80%, transparent);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--w-shadow-tint) 10%, transparent);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;
}

.gd-searchbar-searchWell[data-focused="true"] {
  border-color: var(--w-lamp);
  background: color-mix(in srgb, var(--paper-light) 95%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--w-lamp) 25%, transparent),
              0 2px 8px color-mix(in srgb, var(--w-shadow-tint) 20%, transparent);
}

.gd-searchbar-searchIcon {
  font-size: 0.88rem;
  opacity: 0.65;
  transition: opacity 0.15s ease;
  flex-shrink: 0;
}

.gd-searchbar-searchWell[data-focused="true"] .gd-searchbar-searchIcon {
  opacity: 1;
  color: var(--w-lamp);
}

.gd-searchbar-searchInput {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  font: 500 0.88rem system-ui, -apple-system, sans-serif;
  outline: none;
}

.gd-searchbar-searchInput::placeholder {
  color: var(--ink-soft);
}

/* Remove default webkit search decoration cancel buttons */
.gd-searchbar-searchInput::-webkit-search-cancel-button,
.gd-searchbar-searchInput::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

.gd-searchbar-clearBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  border: 0;
  background: color-mix(in srgb, var(--ink) 15%, transparent);
  color: var(--ink);
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.gd-searchbar-clearBtn:hover {
  background: var(--w-lamp);
  color: var(--w-on-lamp);
  transform: scale(1.08);
}

.gd-searchbar-shortcutKbd {
  font-size: 0.68rem;
  font-family: monospace;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--ink) 8%, transparent);
  border: 1px solid var(--line);
  color: var(--ink-soft);
  flex-shrink: 0;
}

.gd-searchbar-srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

`;

let cache: string | null = null;

/** Every rule for the later kit components, for all worlds. Cached; the data is static. */
export function kitStylesheet(): string {
  cache ??= [BASE_CSS, FLOOR_CSS, signTimingCss(), chargeCss(), worldPickCss()].join('\n');
  return cache;
}
