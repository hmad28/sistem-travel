import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { contentKinds, getContent, type ContentKind } from '@/lib/travel/content';
import { ContentForm } from '@/components/travel/content-form';
import { PageShell } from '@/components/layout';
export default async function Page({params,searchParams}:{params:Promise<{kind:string}>;searchParams:Promise<{edit?:string}>}) {
  const {kind} = await params; const {edit} = await searchParams;
  if (!contentKinds.includes(kind as ContentKind)) notFound();
  const context = await requireOrganizationContext(); const t = await getTranslations('contentEditor');
  if (!hasSessionPermission(context.user,'cms','view',context.organizationId)) return <p>{t('denied')}</p>;
  const entries = await getContent(context.organizationId,kind as ContentKind);
  const entry = entries.find(e => e.id === edit);
  if (edit && edit !== 'new' && !entry) notFound();
  return <PageShell title={t(kind as 'banner')} description={t('description')} actions={<Link href={`?edit=new`} className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 text-primary-foreground">{t('add')}</Link>}>
    {edit ? <ContentForm key={edit} kind={kind as ContentKind} entry={entry} /> : <div className="divide-y rounded-xl border bg-white">{!entries.length && <p className="p-6">{t('empty')}</p>}{entries.map(e => <Link key={e.id} href={`?edit=${e.id}`} className="flex min-h-16 items-center justify-between gap-4 p-5 hover:bg-accent"><strong>{e.title}</strong><span>{t(e.published?'published':'draft')}</span></Link>)}</div>}
  </PageShell>;
}
