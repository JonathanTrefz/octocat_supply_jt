import { test, expect } from '@playwright/test';

/**
 * Cats page E2E tests
 *
 * Covers:
 * - Navigation from home page to /cats
 * - Cats grid renders with cards
 * - Search/filter by name or breed
 * - Empty state for no matches
 */

test.describe('Cats page discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Navigate from the home page to the cats page', async ({ page }) => {
    // Given I am on the home page
    await page.goto('/');
    await expect(page.locator('h1:has-text("Smart Cat Tech")')).toBeVisible();

    // When I click the Cats navigation link
    await page.click('nav a:has-text("Cats")');

    // Then I land on the cats page
    await expect(page).toHaveURL(/\/cats/);

    // And I see the cats page heading
    await expect(page.locator('h1:has-text("Meet the Cats")')).toBeVisible();
  });

  test('Cats page shows a grid of cat profile cards', async ({ page }) => {
    // Given I navigate directly to the cats page
    await page.goto('/cats');
    await expect(page.locator('h1:has-text("Meet the Cats")')).toBeVisible();

    // Then at least one cat profile card is visible
    const catCards = page.locator('article');
    await expect(catCards.first()).toBeVisible();
    const count = await catCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Cat cards show expected profile fields', async ({ page }) => {
    // Given I am on the cats page with data loaded
    await page.goto('/cats');
    await expect(page.locator('article').first()).toBeVisible();

    // Then a cat card has a name heading visible
    const firstCard = page.locator('article').first();
    const nameHeading = firstCard.locator('h2');
    await expect(nameHeading).toBeVisible();

    // And the zoomies icon is shown
    const zoomiesIcon = firstCard.locator('text=⚡');
    await expect(zoomiesIcon).toBeVisible();

    // And the naps icon is shown
    const napsIcon = firstCard.locator('text=💤');
    await expect(napsIcon).toBeVisible();

    // And the paw judginess bar is rendered
    const pawIcons = firstCard.locator('text=🐾');
    const pawCount = await pawIcons.count();
    expect(pawCount).toBeGreaterThan(0);
  });

  test('Search for a cat by name', async ({ page }) => {
    // Given I am on the cats page
    await page.goto('/cats');
    await expect(page.locator('article').first()).toBeVisible();

    // When I type a known cat name in the search box
    const searchInput = page.locator('input[aria-label="Search cats by name or breed"]');
    await searchInput.fill('Sir Fluffington');

    // Then the matching cat card is visible
    await expect(page.locator('h2:has-text("Sir Fluffington III")')).toBeVisible();
  });

  test('Search for a cat by breed', async ({ page }) => {
    // Given I am on the cats page
    await page.goto('/cats');
    await expect(page.locator('article').first()).toBeVisible();

    // When I search by a breed name
    const searchInput = page.locator('input[aria-label="Search cats by name or breed"]');
    await searchInput.fill('Bengal');

    // Then only Bengal cats are shown
    const cards = page.locator('article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    // Verify "Zoomie McZoomface" (the Bengal) is visible
    await expect(page.locator('h2:has-text("Zoomie McZoomface")')).toBeVisible();
  });

  test('Search with no matches shows empty state', async ({ page }) => {
    // Given I am on the cats page
    await page.goto('/cats');
    await expect(page.locator('article').first()).toBeVisible();

    // When I search for something that doesn't match any cat
    const searchInput = page.locator('input[aria-label="Search cats by name or breed"]');
    await searchInput.fill('QuantumWarpDragonCat9000');

    // Then I see the empty state message
    const emptyState = page.locator('[role="status"]');
    await expect(emptyState).toContainText('No cats found');

    // And I am shown a prompt to adjust the search
    await expect(emptyState).toContainText(/clearing.*changing.*search/i);
  });
});
