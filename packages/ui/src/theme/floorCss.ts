/**
 * Rules for the web floor (FloorView and its patterns). World colours only
 * (`--w-*`); gaps from the kit's spacing; sideways shelves are `.gd-strip`, so
 * the platform owns their scroll bars. Joined
 * into the kit stylesheet.
 */
export const FLOOR_CSS = `
.gd-floor{position:relative;min-width:0}
.gd-floor-ground{position:absolute;inset:0;pointer-events:none;z-index:0}
.gd-floor-areas{position:relative;z-index:1;display:flex;flex-direction:column;gap:var(--gd-gap-section,40px);min-width:0}
.gd-floor-areas[data-arrangement="board"]{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:var(--gd-gap-group,24px);align-items:start}
.gd-floor-areas[data-arrangement="board"]>.gd-floor-area{max-block-size:100%;overflow-y:auto;overscroll-behavior:contain}
.gd-floor-area,.gd-floor-group{min-width:0}
.gd-floor-group>.gd-stack>h3.gd-text{margin:0}
.gd-floor-piece{min-width:0;border-radius:var(--w-card-tile-radius)}
.gd-floor-piece[data-lit]{box-shadow:0 0 24px color-mix(in srgb, var(--w-glow) 35%, transparent)}
.gd-floor-shelf{list-style:none;margin:0;padding:0 0 4px;display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory}
.gd-floor-shelf-item{flex:none;scroll-snap-align:start;min-width:0}
.gd-floor-shelf[data-sized]>.gd-floor-shelf-item{width:var(--gd-floor-item)}
.gd-floor-list{display:flex;flex-direction:column}
.gd-floor-stepper{display:flex;align-items:center;justify-content:space-between;gap:8px}
.gd-floor-path{list-style:none;margin:0;padding:0}
.gd-floor-path-step{position:relative;padding:0 0 12px 28px;min-width:0}
.gd-floor-path-step::before{content:"";position:absolute;left:2px;top:16px;width:12px;height:12px;border-radius:50%;background:var(--w-line)}
.gd-floor-path-step[data-first]::before{background:var(--w-lamp)}
.gd-floor-path-step:not(:last-child)::after{content:"";position:absolute;left:7px;top:32px;bottom:0;width:2px;background:var(--w-line)}
.gd-floor-side{display:grid;gap:16px;align-items:start}
.gd-floor-side[data-shape="list-detail"]{grid-template-columns:2fr 3fr}
.gd-floor-side[data-shape="desk"]{grid-template-columns:2fr 1fr}
.gd-floor-main{min-width:0}
.gd-floor-picks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.gd-floor-pick{all:unset;box-sizing:border-box;display:flex;align-items:center;inline-size:100%;min-block-size:var(--gd-touch-min,44px);padding:0 12px;border-radius:var(--w-card-tile-radius);color:var(--w-ink-soft);font:inherit;cursor:pointer}
.gd-floor-pick[aria-current]{color:var(--w-ink);background:color-mix(in srgb, var(--w-lamp) 14%, transparent)}
.gd-floor-pick:focus-visible{outline:2px solid var(--w-lamp);outline-offset:2px}
`;
