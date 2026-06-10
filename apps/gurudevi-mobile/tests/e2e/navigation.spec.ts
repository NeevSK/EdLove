import { expect, test } from '@playwright/test';

test.describe('Gurudevi Mobile Web Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the mobile web app
    await page.goto('/');
  });

  test('should render the brand name', async ({ page }) => {
    // The brand name is in the top bar
    const brandName = page.locator('.brand-name');
    await expect(brandName).toBeVisible();
  });

  test('should navigate between main tabs', async ({ page, isMobile }) => {
    // Determine selector based on view
    const navItemSelector = isMobile ? '.mobile-nav-item' : '.sidebar-item';

    // Check for the "Community" tab
    const communityTab = page.locator(navItemSelector).filter({ hasText: 'Community' });
    await expect(communityTab).toBeVisible();

    await communityTab.click();

    // Check if the URL or title updated
    // React Navigation 7 updates the document title (see TabNavigator.web.tsx:274)
    await expect(page).toHaveTitle(/Community/);
  });

  test('should open notifications panel', async ({ page, isMobile }) => {
    const notificationsBtn = page
      .locator(isMobile ? '.mobile-nav-item' : '.sidebar-item')
      .filter({ hasText: /Notifications|Alerts/ });
    await notificationsBtn.click();

    await expect(page).toHaveTitle(/Notifications/);
  });

  test('mobile menu toggle works', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Menu toggle only exists on mobile view');

    const menuToggle = page.locator('.mobile-menu-toggle');
    await menuToggle.click();

    // Sidebar should be open
    const sidebar = page.locator('aside.sidebar.open');
    await expect(sidebar).toBeVisible();
  });
});
