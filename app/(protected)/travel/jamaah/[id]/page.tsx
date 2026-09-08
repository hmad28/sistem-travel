import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { pilgrims, pilgrimDocuments, documentTypes, registrations } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { PilgrimDocumentField } from '@/components/uploads/pilgrim-document-field';
import { formatIdr } from '@/lib/travel/format';

export default async function Page({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();
  const ctx=await requireOrganizationContext(),org=ctx.organizationId;
  const t=await getTranslations('internalUx'),w=await getTranslations('workflow');
  if(!hasSessionPermission(ctx.user,'pilgrim','view',org))return <p>{w('denied')}</p>;
  const [person]=await readDb.select().from(pilgrims).where(and(eq(pilgrims.id,id),eq(pilgrims.organizationId,org)));
  if(!person)notFound();
  const canDocuments=hasSessionPermission(ctx.user,'document','view',org), canUpload=hasSessionPermission(ctx.user,'document','create',org);
  const canHistory=hasSessionPermission(ctx.user,'registration','view',org)&&hasSessionPermission(ctx.user,'finance','view',org);
  const [types,docs,bookings]=await Promise.all([
    canDocuments?readDb.select().from(documentTypes).where(eq(documentTypes.organizationId,org)):[],
    canDocuments?readDb.select().from(pilgrimDocuments).where(and(eq(pilgrimDocuments.organizationId,org),eq(pilgrimDocuments.pilgrimId,id))).orderBy(desc(pilgrimDocuments.uploadedAt)):[],
    canHistory?readDb.select().from(registrations).where(and(eq(registrations.organizationId,org),eq(registrations.pilgrimId,id))).orderBy(desc(registrations.createdAt)):[]
  ]);
  return <PageShell title={person.fullName} description={person.publicId} actions={<Link className="inline-flex min-h-12 items-center underline" href="/travel/jamaah">{t('backPeople')}</Link>}>
    <section className="rounded-xl border bg-white p-6"><h2 className="text-xl font-semibold">{t('profile')}</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">{[[t('phone'),person.phone],[t('email'),person.email],[t('birthDate'),person.birthDate],[t('address'),person.address]].map(([label,value])=><div key={label}><dt className="text-slate-600">{label}</dt><dd className="mt-1 break-words font-semibold">{value||'—'}</dd></div>)}</dl></section>
    <section className="space-y-4"><h2 className="text-xl font-semibold">{t('documents')}</h2><p>{t('documentsHint')}</p>{!canDocuments?<p>{w('denied')}</p>:!types.length?<p>{t('emptyDocuments')}</p>:<div className="grid gap-4 lg:grid-cols-2">{types.map(type=>{
      const records=docs.filter(d=>d.documentTypeId===type.id);
      return <section key={type.id} className="space-y-4 rounded-xl border bg-white p-5"><h3 className="text-lg font-semibold">{type.name}</h3>{records.length?<ul className="space-y-2">{records.map(doc=><li key={doc.id}><a className="inline-flex min-h-11 items-center gap-2 text-primary underline" href={`/api/travel/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer">{t('open')} · {doc.fileName}</a></li>)}</ul>:<p className="text-slate-600">{t('missing')}</p>}{canUpload&&<details><summary className="min-h-11 cursor-pointer content-center font-semibold text-primary">{t('upload')}</summary><PilgrimDocumentField pilgrimId={id} documentTypeId={type.id}/></details>}</section>;
    })}</div>}</section>
    <section className="space-y-4"><h2 className="text-xl font-semibold">{t('history')}</h2>{!canHistory?<p>{t('noFinance')}</p>:bookings.length?bookings.map(b=><Link className="flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5 text-primary" key={b.id} href={`/admin/manajemen/pendaftaran/${b.id}`}><strong>{b.registrationNumber}</strong><span>{formatIdr.format(b.finalPrice)} →</span></Link>):<p>{t('emptyHistory')}</p>}</section>
  </PageShell>;
}
