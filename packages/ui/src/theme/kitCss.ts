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

import { SIGN_CYCLE_MS, SIGN_REST, SIGNS, type SignKind } from './signs';
import { WORLD_IDS, WORLDS } from './worlds';

const SIGN_KINDS = Object.keys(SIGN_CYCLE_MS) as SignKind[];

/** Per kind: loop length and rest pose. */
function signTimingCss(): string {
  return SIGN_KINDS.map(
    (k) => `.gd-s[data-sign="${k}"]{--gd-base:${SIGN_CYCLE_MS[k]};--gd-rest:${SIGN_REST[k]}}`,
  ).join('');
}

/** Per world: its tempo, and which sign and perch an auto sign or perch shows. */
function worldPickCss(): string {
  const parts: string[] = [];
  const defaultSign = SIGNS.sanctuary;
  parts.push(`.gd-sign{--gd-tempo:${WORLDS.sanctuary.motion.tempo}}`);
  parts.push(`.gd-sign[data-auto]>.gd-s:not([data-sign="${defaultSign}"]){display:none}`);
  parts.push('.gd-perch[data-auto]>g:not([data-perch="sanctuary"]){display:none}');
  for (const id of WORLD_IDS) {
    const scopes = [`html[data-world="${id}"]`, `.gd-world[data-world="${id}"]`];
    const sign = SIGNS[id];
    for (const s of scopes) {
      parts.push(`${s} .gd-sign{--gd-tempo:${WORLDS[id].motion.tempo}}`);
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
