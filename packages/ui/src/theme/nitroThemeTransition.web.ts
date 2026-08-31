import type { ThemeTransitionType } from './nitroThemeTransition.types';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => { finished: Promise<void> };
};

export async function startThemeTransition(
  updateThemeCallback: () => void | Promise<void>,
  _options?: { type?: ThemeTransitionType; duration?: number },
): Promise<void> {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const documentWithTransition = document as ViewTransitionDocument;

  if (!prefersReducedMotion && documentWithTransition.startViewTransition) {
    const transition = documentWithTransition.startViewTransition(updateThemeCallback);
    await transition.finished;
    return;
  }

  await updateThemeCallback();
}
