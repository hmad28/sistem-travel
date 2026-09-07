'use server';
import { randomUUID } from 'node:crypto';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { appSettings, auditLogs, uploads } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import {
  contentKinds,
  contentKey,
  contentEntrySchema,
  type ContentKind,
  type ContentEntry,
} from '@/lib/travel/content';
import type { WorkflowState } from './travel-workflow';
class ContentConflict extends Error {}

export async function saveTravelContent(
  kind: ContentKind,
  _state: WorkflowState,
  form: FormData
): Promise<WorkflowState> {
  const t = await getTranslations('workflow');
  try {
    const context = await requireOrganizationContext();
    if (
      !contentKinds.includes(kind) ||
      !hasSessionPermission(context.user, 'cms', 'edit', context.organizationId)
    )
      return { ok: false, message: t('denied') };
    const entry = contentEntrySchema.parse({
      id: form.get('id') || randomUUID(),
      title: form.get('title'),
      body: form.get('body'),
      image: form.get('image') || '',
      mobileImage: kind === 'banner' ? form.get('mobileImage') || '' : '',
      videoUrl: kind === 'testimonial' ? form.get('videoUrl') || '' : '',
      sortOrder: form.get('sortOrder') || 0,
      revision: Number(form.get('revision') || 0),
      link: form.get('link') || '',
      published: form.get('published') === '1',
    });
    const key = contentKey(context.organizationId, kind);
    await db.transaction(async (tx) => {
      // Covers creation of a collection as well as concurrent edits to existing collections.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${key}))`);
      for (const imageUrl of new Set([entry.image, entry.mobileImage].filter(Boolean))) {
        const [image] = await tx
          .select()
          .from(uploads)
          .where(
            and(
              eq(uploads.publicUrl, imageUrl),
              eq(uploads.organizationId, context.organizationId),
              eq(uploads.kind, 'cms_image'),
              isNull(uploads.deletedAt)
            )
          );
        if (!image) throw new Error('Image is not an organization CMS upload');
      }
      const [current] = await tx.select().from(appSettings).where(eq(appSettings.key, key));
      const entries: ContentEntry[] = current
        ? JSON.parse(current.value).map((v: unknown) => contentEntrySchema.parse(v))
        : [];
      const index = entries.findIndex((v) => v.id === entry.id);
      if (index >= 0 && entries[index].revision !== entry.revision) throw new ContentConflict();
      if (index < 0 && form.get('id')) throw new ContentConflict();
      entry.revision += 1;
      if (index >= 0) entries[index] = entry;
      else entries.push(entry);
      if (entries.length > 500) throw new Error('Collection limit');
      const value = JSON.stringify(entries);
      await tx
        .insert(appSettings)
        .values({ key, value, label: kind, updatedById: context.user.id })
        .onConflictDoUpdate({
          target: appSettings.key,
          set: { value, updatedById: context.user.id, updatedAt: new Date() },
        });
      await tx.insert(auditLogs).values({
        actorId: context.user.id,
        actorEmail: context.user.email,
        action: 'cms.content.save',
        resource: 'cms',
        resourceId: entry.id,
        message: 'Website content saved',
        metadata: { organizationId: context.organizationId, kind },
      });
    });
    revalidatePath('/', 'layout');
    return { ok: true, message: t('saved'), href: `/admin/cms/konten/${kind}` };
  } catch (error) {
    if (error instanceof ContentConflict)
      return { ok: false, message: (await getTranslations('homeEditor'))('conflict') };
    if (error && typeof error === 'object' && 'issues' in error)
      return { ok: false, message: (await getTranslations('contentEditor'))('invalid') };
    console.error('[CMS_CONTENT]', error);
    return { ok: false, message: t('failed') };
  }
}
