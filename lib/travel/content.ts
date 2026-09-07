import 'server-only';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { readDb } from '@/db/read';
import { appSettings } from '@/db/schema';
import {
  contentEntrySchema,
  sortContent,
  type ContentEntry,
} from '@/lib/validation/travel-content';
export { contentEntrySchema, type ContentEntry } from '@/lib/validation/travel-content';

export const contentKinds = ['banner', 'page', 'article', 'gallery', 'testimonial', 'faq'] as const;
export type ContentKind = (typeof contentKinds)[number];
export const contentKey = (org: string, kind: ContentKind) => `travel.${org}.content.${kind}`;
export async function getContent(org: string, kind: ContentKind): Promise<ContentEntry[]> {
  const [row] = await readDb
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, contentKey(org, kind)));
  if (!row) return [];
  return sortContent(z.array(contentEntrySchema).parse(JSON.parse(row.value)));
}
