import 'server-only';

import { and, asc, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { readDb } from '@/db/read';
import {
  departures,
  invoices,
  pilgrims,
  registrations,
  travelPackages,
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

  const [pilgrimSummary, departureSummary, financeSummary, documentSummary, nearestRows] =
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
      readDb
        .select({
          total: sql<number>`coalesce(sum(${invoices.total}), 0)::bigint`,
          paid: sql<number>`coalesce(sum(${invoices.paidAmount}), 0)::bigint`,
          outstanding: sql<number>`coalesce(sum(${invoices.outstandingAmount}), 0)::bigint`,
          unpaidPilgrims: sql<number>`count(*) filter (where ${invoices.outstandingAmount} > 0)::int`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.organizationId, organizationId),
            inArray(invoices.status, ['ISSUED', 'UNPAID', 'PARTIAL', 'PAID', 'OVERDUE'])
          )
        ),
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
    ]);

  const documentTotal = documentSummary[0]?.total ?? 0;
  const documentReady = documentSummary[0]?.ready ?? 0;

  return {
    pilgrims: pilgrimSummary[0]?.total ?? 0,
    activeDepartures: departureSummary[0]?.total ?? 0,
    finance: {
      total: Number(financeSummary[0]?.total ?? 0),
      paid: Number(financeSummary[0]?.paid ?? 0),
      outstanding: Number(financeSummary[0]?.outstanding ?? 0),
      unpaidPilgrims: financeSummary[0]?.unpaidPilgrims ?? 0,
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
