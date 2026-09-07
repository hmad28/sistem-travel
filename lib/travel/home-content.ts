import 'server-only';
import { eq } from 'drizzle-orm';
import { readDb } from '@/db/read';
import { appSettings } from '@/db/schema';
import { homeDocumentSchema } from '@/lib/validation/home-content';
export const homeContentKey = (organizationId: string) => `travel.${organizationId}.homepage`;
export async function getHomeContent(organizationId: string) {
  const [row] = await readDb.select({ value: appSettings.value }).from(appSettings).where(eq(appSettings.key, homeContentKey(organizationId)));
  return row ? homeDocumentSchema.parse(JSON.parse(row.value)) : { revision: 0, draft: {}, published: {} };
}
