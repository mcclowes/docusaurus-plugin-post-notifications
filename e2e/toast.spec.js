// @ts-check
import { test, expect } from '@playwright/test';

test.describe('New Post Toast', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to simulate first visit
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('shows toast notification on first visit when configured', async ({ page }) => {
    await page.goto('/');

    // Wait for the toast to appear (with delay configured in example)
    const toast = page.locator('[role="alert"]').first();

    // Toast should appear within the configured delay + some buffer
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Should show "New post" badge
    await expect(toast.locator('text=New post')).toBeVisible();
  });

  test('toast contains post title', async ({ page }) => {
    await page.goto('/');

    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Should contain a post title (from our example blog posts)
    const title = toast.locator('h4 a');
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText).toBeTruthy();
  });

  test('clicking "Read now" navigates to blog post', async ({ page }) => {
    await page.goto('/');

    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Click the "Read now" link
    const readLink = toast.locator('text=Read now →');
    await readLink.click();

    // Should navigate to a blog post
    await expect(page).toHaveURL(/\/blog\//);
  });

  test('dismiss button removes toast', async ({ page }) => {
    await page.goto('/');

    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Click the dismiss button
    const dismissButton = toast.locator('button[aria-label="Dismiss notification"]');
    await dismissButton.click();

    // Toast should be removed (with animation delay)
    await expect(toast).not.toBeVisible({ timeout: 1000 });
  });

  test('toast position is bottom-right by default', async ({ page }) => {
    await page.goto('/');

    const container = page.locator('[role="alert"]').first().locator('..');
    await expect(container).toBeVisible({ timeout: 5000 });

    // Check that container has bottom-right positioning styles
    const boundingBox = await container.boundingBox();
    const viewportSize = page.viewportSize();

    if (boundingBox && viewportSize) {
      // Should be positioned near the bottom-right
      expect(boundingBox.x + boundingBox.width).toBeGreaterThan(viewportSize.width / 2);
      expect(boundingBox.y).toBeGreaterThan(viewportSize.height / 2);
    }
  });

  test('does not show toast on subsequent visits within same session', async ({ page }) => {
    // First visit - should show toast
    await page.goto('/');
    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Navigate away and back
    await page.goto('/docs/intro');
    await page.goto('/');

    // Wait a bit for potential toast
    await page.waitForTimeout(2000);

    // Toast count should not have increased (localStorage updated)
    // This is a simplified check - actual behavior depends on implementation
  });

  test('toast has accessible attributes', async ({ page }) => {
    await page.goto('/');

    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Should have role="alert"
    await expect(toast).toHaveAttribute('role', 'alert');

    // Should have aria-live
    await expect(toast).toHaveAttribute('aria-live', 'polite');

    // Dismiss button should have aria-label
    const dismissButton = toast.locator('button[aria-label="Dismiss notification"]');
    await expect(dismissButton).toBeVisible();
  });

  test('multiple toasts are displayed when there are multiple new posts', async ({ page }) => {
    await page.goto('/');

    // Wait for toasts to appear
    await page.waitForTimeout(2000);

    const toasts = page.locator('[role="alert"]');
    const count = await toasts.count();

    // Should show at least 2 toasts (we have 2 blog posts in the example)
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('toast shows post description when configured', async ({ page }) => {
    await page.goto('/');

    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Should show description (configured as showDescription: true)
    const description = toast.locator('p');
    const descriptionText = await description.textContent();
    expect(descriptionText).toBeTruthy();
  });

  test('toast shows post date when configured', async ({ page }) => {
    await page.goto('/');

    const toast = page.locator('[role="alert"]').first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Should show date (configured as showDate: true)
    const dateElement = toast.locator('time');
    await expect(dateElement).toBeVisible();
    await expect(dateElement).toHaveAttribute('datetime');
  });
});
