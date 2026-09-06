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

test('menu HP berpindah ruang kerja dan tidak melebar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Ringkasan website' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'CMS Website', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Buka menu', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'CMS Website', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Internal', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ringkasan bisnis' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Manajemen Internal', exact: true })
  ).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});

test('dashboard operasional dan CMS dapat dibuka oleh admin', async ({ page }) => {
  await page.goto('/admin/manajemen');
  await expect(page.getByRole('heading', { name: 'Ringkasan bisnis' })).toBeVisible();
  await expect(page.getByText('Perlu dikerjakan')).toBeVisible();

  await page.goto('/admin/cms');
  await expect(page.getByRole('heading', { name: 'Ringkasan website' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Manajemen Internal', exact: true })
  ).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'CMS Website', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Internal', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/manajemen/);
  await expect(page.getByRole('navigation', { name: 'CMS Website', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ringkasan bisnis' })).toBeVisible();
});

test('identitas CMS tidak menampilkan diagnostik sistem', async ({ page }) => {
  await page.goto('/admin/cms/pengaturan');
  await expect(page.getByRole('heading', { name: 'Identitas & pengaturan website' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Doctor' })).toHaveCount(0);
  await expect(page.locator('form')).toBeVisible();
});
