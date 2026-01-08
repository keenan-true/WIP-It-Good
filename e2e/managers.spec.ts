import { test, expect } from '@playwright/test';

test.describe('Managers CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/managers');
  });

  test('should display managers page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /managers/i })).toBeVisible();
    await expect(page.getByText(/manage team leaders/i)).toBeVisible();
  });

  test('should open add manager modal', async ({ page }) => {
    await page.getByRole('button', { name: /add manager/i }).click();
    await expect(page.getByRole('heading', { name: /add manager/i })).toBeVisible();
  });

  test('should create a new manager', async ({ page }) => {
    // Click Add Manager button
    await page.getByRole('button', { name: /add manager/i }).click();
    
    // Fill in the form
    await page.getByLabel(/name/i).fill('Test Manager E2E');
    
    // Submit the form
    await page.getByRole('button', { name: /save/i }).click();
    
    // Wait a bit for the API call to complete
    await page.waitForTimeout(500);
    
    // Verify the manager appears in the table
    await expect(page.getByText('Test Manager E2E')).toBeVisible();
  });

  test('should edit a manager', async ({ page }) => {
    // Wait for managers to load
    await page.waitForTimeout(500);
    
    // Get all edit buttons
    const editButtons = page.getByRole('button', { name: /edit/i });
    const count = await editButtons.count();
    
    if (count > 0) {
      // Click the first edit button
      await editButtons.first().click();
      
      // Verify edit modal opened
      await expect(page.getByRole('heading', { name: /edit manager/i })).toBeVisible();
      
      // Change the name
      await page.getByLabel(/name/i).fill('Updated Manager Name');
      
      // Save
      await page.getByRole('button', { name: /save/i }).click();
      
      // Wait for update
      await page.waitForTimeout(500);
      
      // Verify update
      await expect(page.getByText('Updated Manager Name')).toBeVisible();
    }
  });

  test('should cancel modal on cancel button click', async ({ page }) => {
    await page.getByRole('button', { name: /add manager/i }).click();
    await expect(page.getByRole('heading', { name: /add manager/i })).toBeVisible();
    
    // Click cancel button
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Modal should be closed
    await expect(page.getByRole('heading', { name: /add manager/i })).not.toBeVisible();
  });
});
