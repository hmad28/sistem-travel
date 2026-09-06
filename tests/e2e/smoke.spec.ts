import { expect, test } from '@playwright/test';

test('halaman publik menampilkan identitas dan paket Hammad Tour', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: /Menuju Baitullah/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Umrah Syawal 9 Hari/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Konsultasi WhatsApp/i })).toHaveAttribute(
    'href',
    /wa\.me/
  );
  await expect(page.getByText(/Powered by/i)).toBeVisible();
});

test('dashboard operasional dan CMS dapat dibuka oleh admin', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /Selamat pagi, Admin/i })).toBeVisible();
  await expect(page.getByText('Perlu dikerjakan')).toBeVisible();

  await page.goto('/admin/cms');
  await expect(page.getByRole('heading', { name: 'Website & Konten' })).toBeVisible();
  await expect(page.getByText('Website aktif')).toBeVisible();
});
