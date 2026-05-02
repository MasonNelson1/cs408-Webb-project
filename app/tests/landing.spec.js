import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display DevTrack landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DevTrack/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a.nav-link[href="/projects"]')).toBeVisible();
    await expect(page.locator('a.dt-btn-new[href="/projects/new"]')).toBeVisible();

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
    await expect(page.locator('h2')).toContainText('Projects');
  });

  test('should navigate to create project page', async ({ page }) => {
    await page.goto('/');
    await page.click('a.dt-btn-new');
    await expect(page).toHaveURL('/projects/new');
  });
});

test.describe('Project Flow', () => {
  test('should create a new project', async ({ page }) => {
    await page.goto('/projects/new');
    await page.fill('input[name="name"]', 'Test Project');
    await page.fill('textarea[name="description"]', 'A test project');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/projects');
    await expect(page.locator('body')).toContainText('Test Project');
  });

  test('should add a task to a project', async ({ page }) => {
    // Create project first
    await page.goto('/projects/new');
    await page.fill('input[name="name"]', 'Task Test Project');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/projects');

    // Click into the project
    await page.click('text=Task Test Project');
    await expect(page.locator('body')).toContainText('Task Test Project');

    // Add a task
    await page.fill('input[name="title"]', 'My first task');
    await page.click('button[type="submit"]:has-text("Add Task")');
    await expect(page.locator('body')).toContainText('My first task');
  });

  test('should delete a task', async ({ page }) => {
    // Create project
    await page.goto('/projects/new');
    await page.fill('input[name="name"]', 'Delete Task Project');
    await page.click('button[type="submit"]');
    await page.click('text=Delete Task Project');

    // Add task
    await page.fill('input[name="title"]', 'Task to delete');
    await page.click('button[type="submit"]:has-text("Add Task")');
    await expect(page.locator('body')).toContainText('Task to delete');

    // Delete via 3-dot menu
    await page.click('button[onclick*="toggleMenu"]');
    await page.click('button[type="submit"]:has-text("Delete Task")');
    await expect(page.locator('body')).not.toContainText('Task to delete');
  });

  test('should mark a task complete', async ({ page }) => {
    // Create project
    await page.goto('/projects/new');
    await page.fill('input[name="name"]', 'Complete Task Project');
    await page.click('button[type="submit"]');
    await page.click('text=Complete Task Project');

    // Add task
    await page.fill('input[name="title"]', 'Task to complete');
    await page.click('button[type="submit"]:has-text("Add Task")');

    // Toggle complete by clicking circle button
    await page.click('button[type="submit"] i.bi-circle');
    await expect(page.locator('.completed')).toBeVisible();
  });
});
