/**
 * Pluggable Axe-Core Accessibility Adapter
 * Grounded in W3C WCAG 2.1 / 2.2 AA standards via @axe-core/playwright.
 */

import { AxeBuilder } from '@axe-core/playwright';

/**
 * Runs a full Axe accessibility audit on the active page.
 * @param {import('@playwright/test').Page} page
 * @param {Object} [options]
 * @returns {Promise<{ passesCount: number, violationsCount: number, incompleteCount: number, violations: Array<Object>, passes: Array<Object> }>}
 */
export async function auditA11y(page, options = {}) {
  try {
    const builder = new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']);

    if (options.include) {
      builder.include(options.include);
    }
    if (options.exclude) {
      builder.exclude(options.exclude);
    }

    const results = await builder.analyze();

    return {
      passesCount: results.passes?.length || 0,
      violationsCount: results.violations?.length || 0,
      incompleteCount: results.incomplete?.length || 0,
      violations: results.violations || [],
      passes: results.passes || [],
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`[AxeAdapter] Failed to execute Axe audit: ${err.message}`);
    return {
      passesCount: 0,
      violationsCount: 0,
      incompleteCount: 0,
      violations: [],
      passes: [],
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}
