/**
 * Pluggable Flow: Authentication Phone QR Modal & Focus-Trap Sentinel
 *
 * Grounded in:
 * - W3C Dialog (Modal) Focus Trapping & Restoration Pattern
 * - Scenario: scenario:auth.qr_focus_trap
 *
 * Verifies modal launch, focus entrapment (Tab / Shift+Tab loop),
 * Escape key dismissal, and activeElement restoration.
 */

export default {
  id: 'auth_qr_modal',
  title: 'Authentication Phone QR Modal & Focus-Trap Sentinel',
  description: 'Launches QR device pairing modal, verifies W3C dialog focus containment (Tab/Shift+Tab loop), Escape dismissal, and focus restoration.',
  pjc: {
    flowId: 'flow:auth:device_pairing_modal',
    scenarioId: 'scenario:auth.qr_focus_trap',
    featureId: 'feature:auth.device_link',
  },
  steps: [
    {
      name: 'Navigate to /sign-in and Trigger QR Modal',
      route: '/sign-in',
      auditA11y: true,
      action: async ({ page, flowState }) => {
        const qrBtn = page.locator('button:has-text("Sign in with Phone QR Code")').first();
        if ((await qrBtn.count()) === 0) {
          throw new Error('Trigger button "Sign in with Phone QR Code" not found on /sign-in');
        }
        await qrBtn.click();
        await page.waitForTimeout(400);

        const modalVisible = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          return Boolean(dialog && window.getComputedStyle(dialog).display !== 'none');
        });
        flowState.modalOpened = modalVisible;
        return { success: modalVisible };
      },
      assert: async ({ flowState }) => {
        return {
          passed: Boolean(flowState.modalOpened),
          actual: flowState.modalOpened,
          expected: true,
          message: 'QR device pairing modal launched and visible in DOM',
        };
      },
    },
    {
      name: 'Audit W3C Dialog Focus-Trap Loop',
      auditFocusTrap: true,
      assert: async ({ tools, page }) => {
        const trapResult = await tools.auditModalFocusTrap(page);
        return {
          passed: trapResult.passed,
          actual: trapResult.passed ? `Trapped across ${trapResult.focusableCount} focusables` : 'Focus leaked out of dialog',
          expected: 'Strictly trapped inside dialog',
          message: `Focus-trap verification: ${trapResult.passed ? 'PASSED' : 'LEAK DETECTED'} (${trapResult.focusableCount} focusable elements)`,
        };
      },
    },
    {
      name: 'Escape Dismissal & Focus Restoration',
      action: async ({ page }) => {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        return { success: true };
      },
      assert: async ({ page }) => {
        const status = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          const isClosed = !dialog || window.getComputedStyle(dialog).display === 'none';
          const activeEl = document.activeElement;
          const restored = activeEl && activeEl !== document.body && activeEl.tagName.toLowerCase() === 'button';
          return { isClosed, restored, activeTag: activeEl?.tagName };
        });

        const passed = status.isClosed && status.restored;
        return {
          passed,
          actual: `isClosed=${status.isClosed}, activeTag=${status.activeTag}`,
          expected: 'isClosed=true, activeTag=BUTTON',
          message: passed
            ? 'Modal dismissed via Escape and focus restored to trigger button'
            : `Focus restoration issue: isClosed=${status.isClosed}, activeElement=${status.activeTag}`,
        };
      },
    },
  ],
};
