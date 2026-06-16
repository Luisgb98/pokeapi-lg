import { test, expect } from '@playwright/test';

test('pokedex home loads and search filters the grid', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('link', { name: /bulbasaur/i })).toBeVisible();
  const search = page.getByRole('textbox').first();
  await search.fill('charizard');
  await expect(page.getByRole('link', { name: /charizard/i })).toBeVisible();
});

test('pokemon detail page renders stats and matchups', async ({ page }) => {
  await page.goto('/en/pokemon/25');
  await expect(page.getByRole('heading', { name: /pikachu/i })).toBeVisible();
  await expect(page.getByText(/base stats/i)).toBeVisible();
});

test('shared team URL pre-populates the team builder', async ({ page }) => {
  await page.goto('/en/team?team=1,4,7');
  await expect(page.getByText(/bulbasaur/i).first()).toBeVisible();
  await expect(page.getByText(/charmander/i).first()).toBeVisible();
  await expect(page.getByText(/squirtle/i).first()).toBeVisible();
});

test('games hub shows two mode links', async ({ page }) => {
  await page.goto('/en/game');
  await expect(page.getByRole('heading', { name: /^games$/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /who's that pok/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /type quiz/i })).toBeVisible();
});

test('daily game loads with four choices', async ({ page }) => {
  await page.goto('/en/game/whos-that');
  await expect(page.getByRole('heading', { name: /who's that pok/i })).toBeVisible();
  // Wait for the game to hydrate (skeleton disappears, real buttons appear).
  // Scope to <main> to exclude the 6 LanguageSwitcher pill buttons in the nav.
  const choices = page.locator('main').getByRole('button').filter({ hasText: /\w/ });
  await expect(choices).toHaveCount(4);
});

test('hearting a pokemon adds it to the favorites page', async ({ page }) => {
  await page.goto('/en/pokemon/25');
  await expect(page.getByRole('heading', { name: /pikachu/i })).toBeVisible();
  // FavoriteButton has aria-label "Add Pikachu to favorites" when not yet hearted
  const heartBtn = page.getByRole('button', { name: /add pikachu to favorites/i });
  await expect(heartBtn).toBeVisible();
  await heartBtn.click();
  // Navigate to favorites page and verify Pikachu appears
  await page.goto('/en/favorites');
  await expect(page.getByRole('link', { name: /pikachu/i }).first()).toBeVisible();
});
