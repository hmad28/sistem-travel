'use server';
import { eq, sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { appSettings, auditLogs } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { homeContentKey } from '@/lib/travel/home-content';
import { homeDocumentSchema, homeKeys, homeTextSchema } from '@/lib/validation/home-content';
export type HomeSaveState = { ok: boolean; message: string; revision: number };
export async function saveHomeContent(previous: HomeSaveState, form: FormData): Promise<HomeSaveState> {
  const t = await getTranslations('homeEditor');
  try {
    const context = await requireOrganizationContext();
    if (!hasSessionPermission(context.user, 'cms', 'edit', context.organizationId)) return { ...previous, ok: false, message: t('denied') };
    const values = homeTextSchema.parse(Object.fromEntries(homeKeys.map(key => [key, form.get(key)])));
    const key = homeContentKey(context.organizationId);
    const revision = Number(form.get('revision'));
    const publish = form.get('intent') === 'publish';
    const result = await db.transaction(async tx => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${key}))`);
      const [row] = await tx.select().from(appSettings).where(eq(appSettings.key, key));
      const current = row ? homeDocumentSchema.parse(JSON.parse(row.value)) : { revision: 0, draft: {}, published: {} };
      if (current.revision !== revision) return null;
      const next = { revision: revision + 1, draft: values, published: publish ? values : current.published };
      const value = JSON.stringify(next);
      await tx.insert(appSettings).values({ key, value, label: 'Homepage', updatedById: context.user.id }).onConflictDoUpdate({ target: appSettings.key, set: { value, updatedById: context.user.id, updatedAt: new Date() } });
      await tx.insert(auditLogs).values({ actorId: context.user.id, actorEmail: context.user.email, action: publish ? 'cms.home.publish' : 'cms.home.draft', resource: 'cms', message: 'Homepage content saved', metadata: { organizationId: context.organizationId, revision: next.revision } });
      return next.revision;
    });
    if (result === null) return { ...previous, ok: false, message: t('conflict') };
    revalidatePath('/');
    return { ok: true, message: t(publish ? 'published' : 'draftSaved'), revision: result };
  } catch (error) {
    console.error('[CMS_HOME]', error);
    return { ...previous, ok: false, message: t('failed') };
  }
}
