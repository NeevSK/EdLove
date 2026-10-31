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
.gd-table-wrap{overflow-x:auto;max-width:100%}
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
.gd-rail{display:flex;flex-direction:column;gap:var(--gd-gap-inside,8px);min-width:0}.gd-rail-label{margin:0}
.gd-rail-track{list-style:none;margin:0;padding:0 0 4px;display:flex;gap:min(0.75rem, 18px);overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:0;overscroll-behavior-x:contain;scrollbar-width:thin}
.gd-rail-item{flex:none;width:var(--gd-rail-item);scroll-snap-align:start}
.gd-carousel{display:flex;flex-direction:column;gap:8px;min-width:0}
.gd-carousel-track{list-style:none;margin:0;padding:0;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;overscroll-behavior-x:contain}.gd-carousel-track::-webkit-scrollbar{display:none}
.gd-carousel-page{flex:none;width:100%;scroll-snap-align:start}
.gd-carousel-controls{display:flex;align-items:center;justify-content:space-between;gap:8px}.gd-carousel-position{display:flex;flex-direction:column;align-items:center;gap:4px}.gd-carousel-dots{display:flex;gap:6px}
.gd-dot{width:6px;height:6px;border-radius:50%;background:var(--w-dot-off);transition:background var(--w-settle)}.gd-dot[data-on]{background:var(--w-dot-on)}
@media (prefers-reduced-motion:reduce){.gd-carousel-track{scroll-behavior:auto}.gd-card{transition:none}.gd-card:is(a,button):active{transform:none;filter:none}}
.gd-surface[data-tone="raised"],.gd-group-body,.gd-card{background-image:radial-gradient(120% 100% at 50% 35%, var(--w-wash-centre), var(--w-wash-edge))}
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
.gd-fab-menu{display:flex;flex-direction:column;gap:4px}.gd-fab-danger .gd-row-label{color:var(--w-danger)}.gd-fab-lit .gd-row-label{color:var(--w-lamp-deep)}
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
`;

let cache: string | null = null;

/** Every rule for the later kit components, for all worlds. Cached; the data is static. */
export function kitStylesheet(): string {
  cache ??= [BASE_CSS, signTimingCss(), chargeCss(), worldPickCss()].join('\n');
  return cache;
}
