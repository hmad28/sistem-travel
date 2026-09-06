import { expect, test } from '@playwright/test';

test('halaman publik menampilkan identitas dan paket Hammad Tour', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Ibadah lebih tenang/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Umrah Syawal 9 Hari/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Konsultasi Gratis/i })).toHaveAttribute(
    'href',
    /wa\.me/
  );
  await expect(page.getByText(/Powered by/i)).toBeVisible();
});
