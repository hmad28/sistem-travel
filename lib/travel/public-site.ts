import 'server-only';
import { cache } from 'react';
import { and, asc, eq, isNull, inArray, gte } from 'drizzle-orm';
import { readDb } from '@/db/read';
import { organizations, travelPackages, departures } from '@/db/schema';
import { loadAppBranding } from '@/lib/branding/server';
import { getContent, type ContentEntry } from './content';
import { getHomeContent } from './home-content';

export interface PublicPackage {
  id: string;
  slug: string;
  name: string;
  type: string;
  durationDays: number;
  startingPrice: number;
  shortDescription: string;
  description: string;
  hotel: string;
  madinahHotel: string;
  airline: string;
  departureAirport: string;
  departureDate: string | null;
  quota: number;
  confirmedSeats: number;
  inclusions: string[];
  exclusions: string[];
  requirements: string[];
  facilities: string[];
  itinerary: Record<string, unknown>[];
  image: string;
}
export interface PublicSiteData {
  homeText: Record<string, string>;
  content: Record<'banner'|'page'|'article'|'gallery'|'testimonial'|'faq', ContentEntry[]>;
  brand: { name: string; logoUrl: string };
  contact: { phone: string; whatsapp: string; email: string; address: string };
  packages: PublicPackage[];
}

export const getPublicSite = cache(async (): Promise<PublicSiteData> => {
  const brand = await loadAppBranding();
  const [organization] = await readDb
    .select()
    .from(organizations)
    .where(and(eq(organizations.slug, 'hammad-tour'), eq(organizations.status, 'ACTIVE')))
    .limit(1);
  if (!organization)
    return { brand, homeText: {}, contact: { phone: '', whatsapp: '', email: '', address: '' }, packages: [], content: {banner:[],page:[],article:[],gallery:[],testimonial:[],faq:[]} };
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const rows = await readDb
    .select({ item: travelPackages, departure: departures })
    .from(travelPackages)
    .leftJoin(
      departures,
      and(
        eq(departures.packageId, travelPackages.id),
        eq(departures.organizationId, organization.id),
        inArray(departures.status, ['OPEN', 'FULL', 'PREPARATION']),
        gte(departures.departureDate, today)
      )
    )
    .where(
      and(
        eq(travelPackages.organizationId, organization.id),
        eq(travelPackages.isPublished, 1),
        isNull(travelPackages.archivedAt)
      )
    )
    .orderBy(asc(travelPackages.displayOrder), asc(departures.departureDate));
  const seen = new Set<string>();
  const packages = rows
    .filter(({ item }) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .map(({ item, departure }, index) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      type: item.type,
      durationDays: item.durationDays,
      startingPrice: Number(item.startingPrice),
      shortDescription: item.shortDescription ?? '',
      description: item.description ?? '',
      hotel: item.makkahHotelText ?? '',
      madinahHotel: item.madinahHotelText ?? '',
      airline: item.defaultAirline ?? '',
      departureAirport: item.departureAirport ?? '',
      departureDate: departure?.departureDate ?? null,
      quota: departure?.quota ?? 0,
      confirmedSeats: departure?.confirmedSeats ?? 0,
      inclusions: item.inclusions,
      exclusions: item.exclusions,
      requirements: item.requirements,
      facilities: item.facilities,
      itinerary: item.itinerary,
      image: item.thumbnailKey || (index % 2 ? '/images/makkah-city.png' : '/images/makkah.jpg'),
    }));
  const validPhone = (value: string | null) =>
    value && !['6281234567890', '081234567890'].includes(value.replace(/\D/g, '')) ? value : '';
  const [banner,page,article,gallery,testimonial,faq] = await Promise.all((['banner','page','article','gallery','testimonial','faq'] as const).map(async kind=>(await getContent(organization.id,kind)).filter(entry=>entry.published)));
  return {
    homeText: (await getHomeContent(organization.id)).published,
    content: {banner,page,article,gallery,testimonial,faq},
    brand,
    contact: {
      phone: validPhone(organization.phone),
      whatsapp: validPhone(organization.whatsapp),
      email: organization.email ?? '',
      address: organization.address ?? '',
    },
    packages,
  };
});
