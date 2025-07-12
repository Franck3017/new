import { test, expect, Locator } from '@playwright/test';

test.describe('Home page', () => {
  async function ensureMenuOpen(navbar: Locator) {
    const menuBtn = navbar.locator('button[aria-label="Abrir menú móvil"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      // Espera a que el menú móvil esté presente en el DOM
      const mobileMenu = navbar.locator('div.md\\:hidden.border-t');
      await expect(mobileMenu).toBeVisible({ timeout: 7000 });
      // Espera a que el enlace esté visible
      await expect(mobileMenu.locator('a[href="/peliculas"]')).toBeVisible({ timeout: 7000 });
    }
  }

  test('debe mostrar el título y secciones principales', async ({ page }) => {
    await page.goto('/');
    const navbar = page.locator('nav');
    await ensureMenuOpen(navbar);

    await expect(navbar.locator('a[href="/peliculas"]')).toBeVisible();
    await expect(navbar.locator('a[href="/series"]')).toBeVisible();
    await expect(navbar.locator('a[href="/personas"]')).toBeVisible();
    await expect(navbar.locator('a[href="/buscar"]')).toBeVisible();
  });

  test('la navegación a Películas funciona', async ({ page }) => {
    await page.goto('/');
    const navbar = page.locator('nav');
    await ensureMenuOpen(navbar);

    const moviesLink = navbar.locator('a[href="/peliculas"]').first();
    await moviesLink.click();
    await expect(page).toHaveURL(/peliculas/);

    // Busca un heading visible que contenga "Películas"
    const heading = page.locator('h1, h2').filter({ hasText: 'Películas' }).first();
    await expect(heading).toBeVisible();
  });
}); 