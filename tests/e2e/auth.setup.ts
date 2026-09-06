import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test as setup } from '@playwright/test';

const authFile = join(dirname(fileURLToPath(import.meta.url)), '../../playwright/.auth/user.json');

setup('authenticate super admin', async ({ page }) => {
  mkdirSync(dirname(authFile), { recursive: true });

  await page.goto('/auth/login');
  await page
    .getByLabel('Alamat email')
    .fill(process.env.PLAYWRIGHT_USER_EMAIL ?? 'superadmin@example.com');
  await page
    .getByLabel('Kata sandi', { exact: true })
    .fill(process.env.PLAYWRIGHT_USER_PASSWORD ?? 'change-this-password');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
