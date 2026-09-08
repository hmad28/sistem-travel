import Link from 'next/link';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { pilgrims } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { SimpleRecords } from '@/components/travel/simple-records';

export default async function Page() {
  const ctx = await requireOrganizationContext();
  const t = await getTranslations('internalUx'), s = await getTranslations('travelSimple');
  if (!hasSessionPermission(ctx.user, 'pilgrim', 'view', ctx.organizationId)) return <p>{s('denied')}</p>;
  const people = await readDb.select().from(pilgrims).where(and(eq(pilgrims.organizationId, ctx.organizationId), isNull(pilgrims.archivedAt))).orderBy(desc(pilgrims.createdAt)).limit(100);
  return <PageShell title={s('jamaah')} description={t('peopleHint')} actions={hasSessionPermission(ctx.user,'pilgrim','create',ctx.organizationId) && <Link className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 text-primary-foreground" href="/travel/jamaah/baru">{s('addPilgrim')}</Link>}>
    <SimpleRecords title={s('jamaah')} headers={[t('name'),t('number'),t('phone'),t('email')]} rows={people.map(p=>[p.fullName,p.publicId,p.phone,p.email||'—'])} detailKeyIndex={1} detailLinks={Object.fromEntries(people.map(p=>[p.publicId,`/travel/jamaah/${p.id}`]))}/>
    <p className="text-muted-foreground">{s('limit')}</p>
  </PageShell>;
}
