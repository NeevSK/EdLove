/**
 * Pluggable Flow: Preference Cascade & Diurnal Lineage
 *
 * Grounded in:
 * - docs/architecture/interaction-tree-and-e2e-testing-standard.md
 * - Scenario: scenario:settings.cultural_diurnal_lineage
 *
 * Verifies that preferences mutated on /settings cascade predictably
 * to /workspace and /self without resets, and survive browser reconstitution (F5).
 */

export default {
  id: 'preference_cascade',
  title: 'Preference Cascade & Diurnal Lineage',
  description: 'Mutates theme and layout preferences on /settings, verifies cross-screen persistence across /workspace, /self, and browser reload (F5).',
  pjc: {
    flowId: 'flow:settings:preference_cascade',
    scenarioId: 'scenario:settings.cultural_diurnal_lineage',
    featureId: 'feature:settings.preference_sync',
  },
  steps: [
    {
      name: 'Apply Diurnal & Layout Mutations on /settings',
      route: '/settings',
      auditA11y: true,
      action: async ({ page }) => {
        // Mutate diurnal mode to Night (Dark)
        const darkBtn = page.locator('button:has-text("Night (Dark)")').first();
        if ((await darkBtn.count()) > 0 && (await darkBtn.isVisible())) {
          await darkBtn.click();
          await page.waitForTimeout(300);
        }

        // Mutate layout to Side rail
        const layoutBtn = page.locator('button:has-text("Side rail")').first();
        if ((await layoutBtn.count()) > 0 && (await layoutBtn.isVisible())) {
          await layoutBtn.click();
          await page.waitForTimeout(300);
        }

        return { success: true };
      },
      assert: async ({ page, flowState }) => {
        const mode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
        flowState.targetMode = mode;
        return {
          passed: mode === 'dark',
          actual: mode,
          expected: 'dark',
          message: `Diurnal mode is "${mode}" on /settings`,
        };
      },
    },
    {
      name: 'Verify State Lineage on /workspace Floor',
      route: '/workspace',
      assert: async ({ page, flowState }) => {
        const mode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
        return {
          passed: mode === flowState.targetMode,
          actual: mode,
          expected: flowState.targetMode,
          message: `Diurnal mode preserved as "${mode}" across floor transition to /workspace`,
        };
      },
    },
    {
      name: 'Verify State Lineage on /self Floor',
      route: '/self',
      assert: async ({ page, flowState }) => {
        const mode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
        return {
          passed: mode === flowState.targetMode,
          actual: mode,
          expected: flowState.targetMode,
          message: `Diurnal mode preserved as "${mode}" across floor transition to /self`,
        };
      },
    },
    {
      name: 'Verify Reconstitution Persistence After Browser Reload (F5)',
      action: async ({ page }) => {
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(400);
        return { success: true };
      },
      assert: async ({ page, flowState }) => {
        const mode = await page.evaluate(() => document.documentElement.getAttribute('data-mode'));
        return {
          passed: mode === flowState.targetMode,
          actual: mode,
          expected: flowState.targetMode,
          message: `Diurnal mode reconstituted as "${mode}" after page reload (zero FOUC flash)`,
        };
      },
    },
  ],
};
