import { expect, test } from '@playwright/test';

test('halaman publik dan pencarian paket tersambung', async ({ page }) => {
  for (const route of [
    '/umroh',
    '/umroh-plus',
    '/haji',
    '/wisata-halal',
    '/umroh-starter-padang',
    '/kontak',
    '/faq',
    '/tentang',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('MISSING_MESSAGE', { exact: false })).toHaveCount(0);
  }
  await page.goto('/umroh?q=tidak-ada-paket-ini');
  await expect(page.getByRole('heading', { name: 'Belum ada paket yang sesuai' })).toBeVisible();
  await page.goto('/umroh');
  await page.getByRole('link', { name: 'Lihat detail paket', exact: true }).first().click();
  await expect(page).toHaveURL(/\/paket\//);
  await expect(page.getByRole('link', { name: 'Tanyakan paket ini' })).toBeVisible();
});

test('kontak menyiapkan pesan tanpa mengaku telah mengirim', async ({ page }) => {
  await page.goto('/kontak');
  await page.getByRole('textbox', { name: 'Nama lengkap' }).fill('Penguji aplikasi');
  await page.getByRole('textbox', { name: 'Nomor WhatsApp' }).fill('081234567890');
  await page.getByRole('button', { name: 'Siapkan pesan konsultasi' }).click();
  await expect(page.getByRole('textbox', { name: 'Pesan konsultasi', exact: true })).toHaveValue(
    /Penguji aplikasi/
  );
  await expect(
    page.getByRole('status').filter({ hasText: /Pesan siap|Nomor konsultasi/ })
  ).toBeVisible();
});

test('halaman publik menampilkan identitas dan paket Hammad Tour', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: /Langkah menuju Tanah Suci/i })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /Umrah Syawal 9 Hari/i }).first()).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Konsultasi perjalanan', exact: true }).first()
  ).toHaveAttribute('href', '/kontak');
  await expect(page.getByRole('contentinfo').getByText(/Powered by/i)).toBeVisible();
});

test('menu HP berpindah ruang kerja dan tidak melebar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Ringkasan website' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'CMS Website', exact: true })).toBeHidden();
  await page.getByRole('button', { name: 'Buka menu', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'CMS Website', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Internal', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Beranda internal' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Manajemen Internal', exact: true })
  ).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
});

test('dashboard operasional dan CMS dapat dibuka oleh admin', async ({ page }) => {
  await page.goto('/admin/manajemen');
  await expect(page.getByRole('heading', { name: 'Beranda internal' })).toBeVisible();
  await expect(page.getByText('Tagihan belum lunas', { exact: true })).toBeVisible();

  await page.goto('/admin/cms');
  await expect(page.getByRole('heading', { name: 'Ringkasan website' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Manajemen Internal', exact: true })
  ).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'CMS Website', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Internal', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/manajemen/);
  await expect(page.getByRole('navigation', { name: 'CMS Website', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Beranda internal' })).toBeVisible();
});

test('identitas CMS tidak menampilkan diagnostik sistem', async ({ page }) => {
  await page.goto('/admin/cms/pengaturan');
  await expect(page.getByRole('heading', { name: 'Identitas & pengaturan website' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Doctor' })).toHaveCount(0);
  await expect(page.locator('form')).toBeVisible();
});

test('alamat pengaturan lama tidak membuka panel teknis', async ({ page }) => {
  await page.goto('/administrations/system');
  await expect(page).toHaveURL(/\/admin\/manajemen\/pengaturan/);
  await expect(page.getByRole('heading', { name: 'Pengaturan travel' })).toBeVisible();
  await expect(page.getByText('DATABASE_URL', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Doctor' })).toHaveCount(0);
});

test('pencarian, rincian, dan unduhan jamaah berfungsi', async ({ page }) => {
  await page.goto('/travel/jamaah');
  await expect(page.getByRole('heading', { name: 'Data jamaah' })).toBeVisible();
  const firstName = await page.locator('tbody tr').first().locator('td').first().innerText();
  await page.getByRole('textbox', { name: 'Cari nama, nomor, atau paket…' }).fill(firstName);
  await page.getByRole('button', { name: 'Lihat', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Unduh data Excel' }).click();
  expect((await download).suggestedFilename()).toMatch(/\.xlsx$/);
});
