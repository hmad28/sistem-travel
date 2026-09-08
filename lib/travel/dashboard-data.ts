import 'server-only';

import { and, asc, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { readDb } from '@/db/read';
import {
  departures,
  invoices,
  pilgrims,
  registrations,
  travelPackages,
  stockItems,
} from '@/db/schema';

const activeRegistrationStatuses = [
  'REGISTERED',
  'VERIFIED',
  'CONFIRMED',
  'READY',
] as const;

export async function getDashboardData(organizationId: string) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const [pilgrimSummary, departureSummary, financeSummary, documentSummary, nearestRows, inventorySummary] =
    await Promise.all([
      readDb
        .select({ total: sql<number>`count(*)::int` })
        .from(pilgrims)
        .where(and(eq(pilgrims.organizationId, organizationId), isNull(pilgrims.archivedAt))),
      readDb
        .select({ total: sql<number>`count(*)::int` })
        .from(departures)
        .where(
          and(
            eq(departures.organizationId, organizationId),
            inArray(departures.status, ['OPEN', 'FULL', 'PREPARATION']),
            gt(departures.departureDate, today)
          )
        ),
      readDb.execute<{ total: string; paid: string; outstanding: string; unpaidPilgrims: number }>(sql`
        select coalesce(sum(r.final_price),0)::text as total,
          coalesce(sum(coalesce(i.paid,0)),0)::text as paid,
          coalesce(sum(greatest(0,r.final_price-coalesce(i.paid,0))),0)::text as outstanding,
          count(distinct r.pilgrim_id) filter (where r.final_price>coalesce(i.paid,0))::int as "unpaidPilgrims"
        from ${registrations} r
        left join (select registration_id, sum(paid_amount) as paid from ${invoices}
          where organization_id=${organizationId} and status not in ('VOID','DRAFT') and voided_at is null
          group by registration_id) i on i.registration_id=r.id
        where r.organization_id=${organizationId} and r.registration_status not in ('DRAFT','CANCELLED','REFUNDED','REJECTED')
      `),
      readDb
        .select({
          total: sql<number>`count(*)::int`,
          ready: sql<number>`count(*) filter (where ${registrations.documentStatus} = 'APPROVED')::int`,
          incomplete: sql<number>`count(*) filter (where ${registrations.documentStatus} <> 'APPROVED')::int`,
        })
        .from(registrations)
        .where(
          and(
            eq(registrations.organizationId, organizationId),
            inArray(registrations.registrationStatus, [...activeRegistrationStatuses])
          )
        ),
      readDb
        .select({
          id: departures.id,
          packageName: travelPackages.name,
          departureDate: departures.departureDate,
          quota: departures.quota,
          confirmedSeats: departures.confirmedSeats,
          status: departures.status,
        })
        .from(departures)
        .innerJoin(travelPackages, eq(departures.packageId, travelPackages.id))
        .where(
          and(
            eq(departures.organizationId, organizationId),
            inArray(departures.status, ['OPEN', 'FULL', 'PREPARATION']),
            gt(departures.departureDate, today)
          )
        )
        .orderBy(asc(departures.departureDate))
        .limit(1),
      readDb.select({ low: sql<number>`count(*)::int` }).from(stockItems).where(and(
        eq(stockItems.organizationId, organizationId), isNull(stockItems.archivedAt),
        sql`${stockItems.quantity} <= ${stockItems.minimum}`
      )),
    ]);

  const documentTotal = documentSummary[0]?.total ?? 0;
  const documentReady = documentSummary[0]?.ready ?? 0;

  return {
    pilgrims: pilgrimSummary[0]?.total ?? 0,
    lowStockItems: inventorySummary[0]?.low ?? 0,
    activeDepartures: departureSummary[0]?.total ?? 0,
    finance: {
      total: Number(financeSummary.rows[0]?.total ?? 0),
      paid: Number(financeSummary.rows[0]?.paid ?? 0),
      outstanding: Number(financeSummary.rows[0]?.outstanding ?? 0),
      unpaidPilgrims: financeSummary.rows[0]?.unpaidPilgrims ?? 0,
    },
    documents: {
      total: documentTotal,
      ready: documentReady,
      incomplete: documentSummary[0]?.incomplete ?? 0,
      percentage: documentTotal ? Math.round((documentReady / documentTotal) * 100) : 0,
    },
    nearestDeparture: nearestRows[0] ?? null,
  };
}
