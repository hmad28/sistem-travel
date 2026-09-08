import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { and, asc, eq, isNull, gt, notInArray } from 'drizzle-orm';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { readDb } from '@/db/read';
import { travelPackages, departures, pilgrims, invoices } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { PageShell } from '@/components/layout';
import { WorkflowForm, type EditorField } from './workflow-form';
import { RegistrationWizard, type RegistrationOptions } from './registration-wizard';
import type { WorkflowKind } from '@/app/actions/travel-workflow';
import { formatIdr } from '@/lib/travel/format';

export async function WorkflowPage({ kind, id = '', invoiceId = '' }: { kind: WorkflowKind; id?: string; invoiceId?:string }) {
  const t = await getTranslations('workflow');
  const context = await requireOrganizationContext();
  const org = context.organizationId;
  if (id && !z.uuid().safeParse(id).success) notFound();
  const resource = {
    package: 'cms',
    departure: 'departure',
    registration: 'registration',
    payment: 'finance',
  }[kind];
  if (!hasSessionPermission(context.user, resource, id ? 'edit' : 'create', org))
    return <p>{t('denied')}</p>;
  let fields: EditorField[] = [];
  let prerequisite = '';
  let registrationOptions: RegistrationOptions | undefined;
  const option = (value: string, label: string) => ({ value, label });
  if (kind === 'package') {
    const [record] = id
      ? await readDb
          .select()
          .from(travelPackages)
          .where(
            and(
              eq(travelPackages.id, id),
              eq(travelPackages.organizationId, org),
              isNull(travelPackages.archivedAt)
            )
          )
      : [];
    if (id && !record) notFound();
    fields = [
      { name: 'id', type: 'hidden', value: id },
      { name: 'thumbnailKey', type: 'hidden', value: record?.thumbnailKey ?? '' },
      { name: 'name', required: true, value: record?.name },
      { name: 'slug', required: true, value: record?.slug },
      {
        name: 'type',
        required: true,
        value: record?.type ?? 'UMRAH',
        options: ['UMRAH', 'HAJJ', 'TOUR'].map((v) => option(v, t(v as 'UMRAH'))),
      },
      {
        name: 'durationDays',
        type: 'number',
        min: 2,
        max: 365,
        required: true,
        value: record?.durationDays ?? 9,
      },
      {
        name: 'startingPrice',
        type: 'number',
        min: 0,
        required: true,
        value: record?.startingPrice,
      },
      {
        name: 'isPublished',
        value: String(record?.isPublished ?? 0),
        options: [option('0', t('draft')), option('1', t('published'))],
      },
      ...(
        [
          'shortDescription',
          'description',
          'inclusions',
          'exclusions',
          'facilities',
          'requirements',
          'itinerary',
        ] as const
      ).map((name) => ({
        name,
        type: 'textarea',
        value:
          name === 'itinerary'
            ? record?.itinerary.map((d) => String(d.title ?? d.description ?? '')).join('\n')
            : Array.isArray(record?.[name])
              ? (record[name] as string[]).join('\n')
              : String(record?.[name] ?? ''),
      })),
      ...(
        ['departureAirport', 'defaultAirline', 'makkahHotelText', 'madinahHotelText'] as const
      ).map((name) => ({ name, value: record?.[name] ?? '' })),
    ];
  } else if (kind === 'departure') {
    const [record] = id
      ? await readDb
          .select()
          .from(departures)
          .where(and(eq(departures.id, id), eq(departures.organizationId, org)))
      : [];
    if (id && !record) notFound();
    if (record && !['DRAFT', 'OPEN', 'CLOSED', 'FULL'].includes(record.status))
      return (
        <PageShell title={t('departureTitle')}>
          <p>{t('scheduleLocked')}</p>
        </PageShell>
      );
    const packages = await readDb
      .select()
      .from(travelPackages)
      .where(and(eq(travelPackages.organizationId, org), isNull(travelPackages.archivedAt)))
      .orderBy(asc(travelPackages.name));
    if (!packages.length) prerequisite = '/admin/cms/paket/baru';
    fields = [
      { name: 'id', type: 'hidden', value: id },
      {
        name: 'packageId',
        required: true,
        value: record?.packageId,
        options: packages.map((p) => option(p.id, p.name)),
      },
      { name: 'departureDate', type: 'date', required: true, value: record?.departureDate },
      { name: 'returnDate', type: 'date', required: true, value: record?.returnDate },
      { name: 'quota', type: 'number', min: 1, max: 1000, required: true, value: record?.quota },
      { name: 'meetingPoint', value: record?.meetingPoint ?? '' },
      {
        name: 'status',
        value: record?.status ?? 'OPEN',
        options: [
          option('OPEN', t('open')),
          option('DRAFT', t('draft')),
          option('CLOSED', t('closed')),
          option('FULL', t('seatsFull')),
        ],
      },
      { name: 'notes', type: 'textarea', value: record?.notes ?? '' },
    ];
  } else if (kind === 'registration') {
    const people = await readDb
      .select()
      .from(pilgrims)
      .where(and(eq(pilgrims.organizationId, org), isNull(pilgrims.archivedAt)))
      .orderBy(asc(pilgrims.fullName));
    const schedules = await readDb
      .select({ departure: departures, package: travelPackages })
      .from(departures)
      .innerJoin(travelPackages, eq(departures.packageId, travelPackages.id))
      .where(
        and(
          eq(departures.organizationId, org),
          eq(travelPackages.organizationId, org),
          eq(departures.status, 'OPEN')
        )
      )
      .orderBy(asc(departures.departureDate));
    if (!people.length) prerequisite = '/travel/jamaah/baru';
    else if (!schedules.length) prerequisite = '/admin/manajemen/keberangkatan/baru';
    registrationOptions = { requestId: randomUUID(), people: people.map(p => ({ id: p.id, fullName: p.fullName, phone: p.phone })),
      schedules: schedules.map(({ departure: d, package: p }) => ({ id: d.id, name: p.name, date: d.departureDate, price: p.startingPrice })) };
    fields = [
      {
        name: 'pilgrimId',
        required: true,
        options: people.map((p) => option(p.id, `${p.fullName} · ${p.publicId}`)),
      },
      {
        name: 'departureId',
        required: true,
        options: schedules.map(({ departure: d, package: p }) =>
          option(d.id, `${p.name} · ${d.departureDate} · ${formatIdr.format(p.startingPrice)}`)
        ),
      },
      { name: 'discount', type: 'number', min: 0, value: 0, required: true },
      { name: 'additionalFee', type: 'number', min: 0, value: 0, required: true },
      { name: 'notes', type: 'textarea' },
    ];
  } else {
    const bills = await readDb
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.organizationId, org),
          gt(invoices.outstandingAmount, 0),
          notInArray(invoices.status, ['DRAFT', 'VOID']),
          isNull(invoices.voidedAt)
        )
      )
      .orderBy(asc(invoices.customerName));
    if (!bills.length) prerequisite = '/admin/manajemen/pendaftaran/baru';
    fields = [
      { name: 'requestId', type: 'hidden', value: randomUUID() },
      {
        name: 'invoiceId',
        value: bills.some(b=>b.id===invoiceId) ? invoiceId : '',
        required: true,
        options: bills.map((p) =>
          option(
            p.id,
            `${p.customerName} · ${p.invoiceNumber} · ${formatIdr.format(p.outstandingAmount)}`
          )
        ),
      },
      { name: 'amount', type: 'number', min: 1, required: true },
      { name: 'paidDate', type: 'date', required: true },
      {
        name: 'method',
        value: 'TRANSFER',
        options: [option('TRANSFER', t('transfer')), option('CASH', t('cash'))],
      },
      { name: 'referenceNumber' },
      { name: 'notes', type: 'textarea' },
    ];
  }
  return (
    <PageShell title={t(`${kind}Title`)} description={t('flow')}>
      {prerequisite ? (
        <div className="space-y-4 rounded-xl border bg-white p-6">
          <p>{t('prerequisite')}</p>
          <Link
            className="inline-flex min-h-12 items-center rounded-lg bg-primary px-5 text-primary-foreground"
            href={prerequisite}
          >
            {t('prepareData')}
          </Link>
        </div>
      ) : registrationOptions ? <RegistrationWizard {...registrationOptions} /> : (
        <WorkflowForm
          kind={kind}
          fields={fields}
          back={kind === 'package' ? '/admin/cms/paket' : '/admin/manajemen'}
        />
      )}
    </PageShell>
  );
}
