import 'server-only';

import { and, desc, eq, ilike, isNull, or } from 'drizzle-orm';
import { readDb } from '@/db/read';
import {
  departures,
  invoices,
  pilgrims,
  registrations,
  travelPackages,
} from '@/db/schema';
import { formatIdr, formatIndonesianDate, parseDatabaseDate } from './format';

const documentLabels = {
  MISSING: 'Perlu dilengkapi',
  UPLOADED: 'Sedang diperiksa',
  UNDER_REVIEW: 'Sedang diperiksa',
  APPROVED: 'Lengkap',
  REJECTED: 'Perlu diperbaiki',
  EXPIRED: 'Kedaluwarsa',
} as const;

const departureLabels = {
  DRAFT: 'Draf',
  OPEN: 'Dibuka',
  FULL: 'Penuh',
  CLOSED: 'Ditutup',
  PREPARATION: 'Persiapan',
  DEPARTED: 'Berangkat',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
} as const;

const invoiceLabels = {
  DRAFT: 'Draf',
  ISSUED: 'Terbit',
  UNPAID: 'Belum lunas',
  PARTIAL: 'Cicilan',
  PAID: 'Lunas',
  OVERDUE: 'Jatuh tempo',
  VOID: 'Dibatalkan',
} as const;

export async function getPilgrimRows(organizationId: string, query?: string) {
  const rows = await readDb
    .select({
      fullName: pilgrims.fullName,
      publicId: pilgrims.publicId,
      phone: pilgrims.phone,
      documentStatus: registrations.documentStatus,
      packageName: travelPackages.name,
    })
    .from(pilgrims)
    .leftJoin(
      registrations,
      and(
        eq(registrations.pilgrimId, pilgrims.id),
        eq(registrations.organizationId, organizationId)
      )
    )
    .leftJoin(departures, eq(registrations.departureId, departures.id))
    .leftJoin(travelPackages, eq(departures.packageId, travelPackages.id))
    .where(
      and(
        eq(pilgrims.organizationId, organizationId),
        isNull(pilgrims.archivedAt),
        query
          ? or(
              ilike(pilgrims.fullName, `%${query}%`),
              ilike(pilgrims.publicId, `%${query}%`),
              ilike(pilgrims.phone, `%${query}%`)
            )
          : undefined
      )
    )
    .orderBy(desc(pilgrims.createdAt))
    .limit(100);

  return rows.map((row) => [
    row.fullName,
    row.publicId,
    row.phone,
    row.documentStatus ? documentLabels[row.documentStatus] : 'Belum terdaftar',
    row.packageName ?? 'Belum memilih paket',
  ]);
}

export async function getDepartureRows(organizationId: string) {
  const rows = await readDb
    .select({
      name: travelPackages.name,
      departureDate: departures.departureDate,
      confirmedSeats: departures.confirmedSeats,
      quota: departures.quota,
      price: travelPackages.startingPrice,
      status: departures.status,
    })
    .from(departures)
    .innerJoin(travelPackages, eq(departures.packageId, travelPackages.id))
    .where(eq(departures.organizationId, organizationId))
    .orderBy(desc(departures.departureDate))
    .limit(100);

  return rows.map((row) => [
    row.name,
    formatIndonesianDate.format(parseDatabaseDate(row.departureDate)),
    `${row.confirmedSeats} / ${row.quota}`,
    formatIdr.format(Number(row.price)),
    departureLabels[row.status],
  ]);
}

export async function getInvoiceRows(organizationId: string, query?: string) {
  const rows = await readDb
    .select({
      invoiceNumber: invoices.invoiceNumber,
      id: invoices.id,
      customerName: invoices.customerName,
      total: invoices.total,
      paidAmount: invoices.paidAmount,
      status: invoices.status,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        query
          ? or(
              ilike(invoices.invoiceNumber, `%${query}%`),
              ilike(invoices.customerName, `%${query}%`)
            )
          : undefined
      )
    )
    .orderBy(desc(invoices.createdAt))
    .limit(100);

  return rows.map((row) => [
    row.invoiceNumber,
    row.customerName,
    formatIdr.format(Number(row.total)),
    formatIdr.format(Number(row.paidAmount)),
    invoiceLabels[row.status],
  ]);
}
