import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {

  test('should display DevTrack landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DevTrack/);
    await expect(page.locator('.dt-hero-title')).toBeVisible();
    await expect(page.locator('a[href="/projects"]')).toBeVisible();
    await expect(page.locator('a[href="/projects/new"]')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.nav-link[href="/projects"]')).toBeVisible();
    await expect(page.locator('a.nav-link[href="/about"]')).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/');
    await page.click('a.nav-link[href="/projects"]');
    await expect(page).toHaveURL('/projects');
    await expect(page.locator('.dt-page-title')).toContainText('Projects');
  });

  test('should navigate to create project page', async ({ page }) => {
    await page.goto('/');
    await page.click('a.dt-btn-new');
    await expect(page).toHaveURL('/projects/new');
  });

});
