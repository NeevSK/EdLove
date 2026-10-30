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

import { radiusCss } from './css';
import { resolveWorld } from './resolve';
import type { Radius, WorldId } from './types';
import { SIGN_CYCLE_MS, SIGN_REST, SIGNS, type SignKind } from './signs';
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
    typeof x === 'number' ? Math.max(0, x - by) : [Math.max(0, x[0] - by), Math.max(0, x[1] - by), Math.max(0, x[2] - by), Math.max(0, x[3] - by)];
  return `--w-toggle-radius:${radiusCss(r.toggle.radius)};--w-segment-radius:${radiusCss(shrink(r.surface.inset.radius, 3))}`;
}

/** Per world: its tempo, and which sign and perch an auto sign or perch shows. */
function worldPickCss(): string {
  const parts: string[] = [];
  const defaultSign = SIGNS.sanctuary;
  parts.push(`.gd-sign{--gd-tempo:${WORLDS.sanctuary.motion.tempo}}`);
  parts.push(`:root{${shapeVars('sanctuary')}}`);
  parts.push(`.gd-sign[data-auto]>.gd-s:not([data-sign="${defaultSign}"]){display:none}`);
  parts.push('.gd-perch[data-auto]>g:not([data-perch="sanctuary"]){display:none}');
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
    }
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
.gd-switch[aria-checked="true"]{background:var(--w-lamp)}
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
.gd-picker{display:flex;flex-direction:column;gap:8px;padding:6px 0}
.gd-picker-choice{appearance:none;margin:0;font:inherit;text-align:start;cursor:pointer;display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:10px 14px;border-radius:14px;background:var(--w-ground);border:1px solid var(--w-line);color:var(--w-ink)}
.gd-picker-choice[aria-checked="true"]{border:2px solid var(--w-focus)}
.gd-picker-choice:focus-visible{outline:2px solid var(--w-focus);outline-offset:2px}
.gd-picker-choice:active{opacity:.85}
.gd-picker-lamp{flex:none;width:26px;height:18px;border-radius:min(9px, var(--w-button-radius));background:var(--w-lamp)}
.gd-picker-name{flex:1;display:flex;flex-direction:column;gap:4px}
.gd-picker-name::after{content:"";width:44px;height:1px;background:var(--w-ornament);opacity:.7}
.gd-picker-mark{flex:none;width:8px;height:8px;border-radius:50%;background:var(--w-lamp)}
`;

let cache: string | null = null;

/** Every rule for the later kit components, for all worlds. Cached; the data is static. */
export function kitStylesheet(): string {
  cache ??= [BASE_CSS, signTimingCss(), chargeCss(), worldPickCss()].join('\n');
  return cache;
}
