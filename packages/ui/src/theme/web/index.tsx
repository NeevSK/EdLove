/**
 * @repo/ui/theme/web — the active world for the web.
 *
 * `WorldStyles` puts every world's variables and component rules in the
 * document head (see `../css.ts`). Switching worlds is an attribute on <html>
 * (`data-world`, `data-mode`, `data-phase`); there is nothing to hydrate.
 * Components themselves live in `@repo/ui/components/web`.
 */

import type { HTMLAttributes, ReactNode } from 'react';
import { worldStylesheet } from '../css';
import { kitStylesheet } from '../kitCss';
import type { Phase, WorldId, WorldMode } from '../types';
import { WORLDS } from '../worlds';

/** Inline every world's variables and component rules. Render once, in <head>. */
export function WorldStyles({ nonce }: { nonce?: string }) {
  const css = `${worldStylesheet()}\n${kitStylesheet()}`;
  // biome-ignore lint/security/noDangerouslySetInnerHtml: generated from typed world data, no user input.
  return <style id="gd-worlds" nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} />;
}

export interface WorldScopeProps extends HTMLAttributes<HTMLDivElement> {
  world: WorldId;
  mode: WorldMode;
  phase?: Phase;
  children: ReactNode;
}

/** Render a subtree in another world (previews, the world picker). */
export function WorldScope({ world, mode, phase, className, children, ...rest }: WorldScopeProps) {
  return (
    <div
      {...rest}
      className={['gd-world', 'gd-page', className].filter(Boolean).join(' ')}
      data-world={world}
      data-mode={mode}
      data-phase={phase}
    >
      {children}
    </div>
  );
}

/** Display names of the worlds, for pickers. */
export function worldName(id: WorldId, lang: 'en' | 'si' | 'ta' = 'en'): string {
  return WORLDS[id].names[lang];
}
