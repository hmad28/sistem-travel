import 'server-only';

import { and, asc, eq, gt, inArray } from 'drizzle-orm';
import { readDb } from '@/db/read';
import { departures, organizations, travelPackages } from '@/db/schema';

export async function getPublishedPackages(organizationSlug: string) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return readDb
    .select({
      id: travelPackages.id,
      name: travelPackages.name,
      slug: travelPackages.slug,
      durationDays: travelPackages.durationDays,
      startingPrice: travelPackages.startingPrice,
      hotel: travelPackages.makkahHotelText,
      airline: travelPackages.defaultAirline,
      departureDate: departures.departureDate,
      quota: departures.quota,
      confirmedSeats: departures.confirmedSeats,
    })
    .from(travelPackages)
    .innerJoin(organizations, eq(travelPackages.organizationId, organizations.id))
    .innerJoin(departures, eq(departures.packageId, travelPackages.id))
    .where(
      and(
        eq(organizations.slug, organizationSlug),
        eq(organizations.status, 'ACTIVE'),
        eq(travelPackages.isPublished, 1),
        inArray(departures.status, ['OPEN', 'FULL']),
        gt(departures.departureDate, today)
      )
    )
    .orderBy(asc(travelPackages.displayOrder), asc(departures.departureDate))
    .limit(6);
}
