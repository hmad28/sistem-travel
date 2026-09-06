import '../scripts/load-env.mjs';

import { eq } from 'drizzle-orm';
import { createNodeDb } from './node';
import {
  departures,
  documentTypes,
  invoices,
  organizations,
  pilgrims,
  registrations,
  travelPackages,
} from './schema';
import { seedDatabase } from './seed';

const packageSeeds = [
  { code: 'UMR-SYW-9', slug: 'umrah-syawal-9-hari', name: 'Umrah Syawal 9 Hari', durationDays: 9, durationNights: 7, startingPrice: 29_900_000, departureDate: '2027-01-15', returnDate: '2027-01-23', quota: 45, confirmedSeats: 42, hotel: 'Setaraf bintang 5' },
  { code: 'UMR-RMD-12', slug: 'umrah-awal-ramadan-12-hari', name: 'Awal Ramadan 12 Hari', durationDays: 12, durationNights: 10, startingPrice: 33_500_000, departureDate: '2027-02-02', returnDate: '2027-02-13', quota: 45, confirmedSeats: 28, hotel: 'Dekat Masjidil Haram' },
  { code: 'UMR-TRK-12', slug: 'umrah-plus-turki', name: 'Umrah Plus Turki', durationDays: 12, durationNights: 10, startingPrice: 36_900_000, departureDate: '2027-03-18', returnDate: '2027-03-29', quota: 90, confirmedSeats: 50, hotel: 'Makkah, Madinah & Istanbul' },
] as const;

const firstNames = ['Ahmad', 'Siti', 'Abdul', 'Nurhayati', 'Muhammad', 'Aisyah', 'Hasan', 'Fatimah', 'Ridwan', 'Maryam', 'Yusuf', 'Khadijah', 'Fauzan', 'Rahma', 'Hidayat', 'Salma'];
const lastNames = ['Fauzi', 'Aminah', 'Rahman', 'Hakim', 'Nugraha', 'Pratama', 'Hidayah', 'Karim'];

async function main() {
  const { db, pool } = createNodeDb();

  try {
    await seedDatabase(db);
    const [organization] = await db.select().from(organizations).where(eq(organizations.slug, 'hammad-tour')).limit(1);
    if (!organization) throw new Error('Organisasi Hammad Tour belum tersedia');

    const seededDepartures = [];
    for (const [index, item] of packageSeeds.entries()) {
      const [travelPackage] = await db
        .insert(travelPackages)
        .values({
          organizationId: organization.id,
          code: item.code,
          slug: item.slug,
          name: item.name,
          type: 'UMRAH',
          shortDescription: `Paket ${item.name} dengan pendampingan jamaah dari awal hingga pulang.`,
          durationDays: item.durationDays,
          durationNights: item.durationNights,
          startingPrice: item.startingPrice,
          departureAirport: 'Soekarno-Hatta (CGK)',
          defaultAirline: 'Saudia Airlines',
          makkahHotelText: item.hotel,
          madinahHotelText: 'Hotel dekat Masjid Nabawi',
          inclusions: ['Tiket pesawat pulang-pergi', 'Hotel', 'Visa', 'Makan', 'Manasik'],
          isPublished: 1,
          isFeatured: index === 0 ? 1 : 0,
          displayOrder: index + 1,
        })
        .onConflictDoUpdate({
          target: [travelPackages.organizationId, travelPackages.code],
          set: { name: item.name, startingPrice: item.startingPrice, makkahHotelText: item.hotel, isPublished: 1, updatedAt: new Date() },
        })
        .returning();

      const [departure] = await db
        .insert(departures)
        .values({
          organizationId: organization.id,
          packageId: travelPackage.id,
          code: `DEP-${item.code}-2027`,
          departureDate: item.departureDate,
          returnDate: item.returnDate,
          quota: item.quota,
          confirmedSeats: item.confirmedSeats,
          reservedSeats: item.confirmedSeats,
          status: 'OPEN',
          meetingPoint: 'Terminal 3 Bandara Soekarno-Hatta',
        })
        .onConflictDoUpdate({
          target: [departures.organizationId, departures.code],
          set: { packageId: travelPackage.id, departureDate: item.departureDate, returnDate: item.returnDate, quota: item.quota, confirmedSeats: item.confirmedSeats, reservedSeats: item.confirmedSeats, status: 'OPEN', updatedAt: new Date() },
        })
        .returning();
      seededDepartures.push({ departure, price: item.startingPrice });
    }

    for (const [index, name] of ['KTP', 'Kartu Keluarga', 'Paspor', 'Buku Vaksin'].entries()) {
      await db.insert(documentTypes).values({ organizationId: organization.id, code: `DOC-${index + 1}`, name }).onConflictDoUpdate({
        target: [documentTypes.organizationId, documentTypes.code],
        set: { name, updatedAt: new Date() },
      });
    }

    for (let index = 1; index <= 120; index += 1) {
      const fullName = `${firstNames[(index - 1) % firstNames.length]} ${lastNames[(index - 1) % lastNames.length]}`;
      const publicId = `HT-JMH-${String(index).padStart(5, '0')}`;
      const [pilgrim] = await db
        .insert(pilgrims)
        .values({ organizationId: organization.id, publicId, fullName, gender: index % 2 ? 'MALE' : 'FEMALE', phone: `62812${String(1_000_000 + index)}`, city: index % 3 === 0 ? 'Bogor' : index % 3 === 1 ? 'Jakarta' : 'Depok', province: index % 3 === 0 ? 'Jawa Barat' : 'DKI Jakarta' })
        .onConflictDoUpdate({ target: [pilgrims.organizationId, pilgrims.publicId], set: { fullName, archivedAt: null, updatedAt: new Date() } })
        .returning();

      const departureIndex = index <= 42 ? 0 : index <= 70 ? 1 : 2;
      const selected = seededDepartures[departureIndex];
      const registrationNumber = `REG/HT/2026/${String(index).padStart(4, '0')}`;
      const documentStatus = index <= 100 ? 'APPROVED' : index % 2 ? 'UNDER_REVIEW' : 'MISSING';
      const [registration] = await db
        .insert(registrations)
        .values({ organizationId: organization.id, registrationNumber, pilgrimId: pilgrim.id, departureId: selected.departure.id, registrationDate: '2026-09-05', registrationStatus: documentStatus === 'APPROVED' ? 'READY' : 'CONFIRMED', documentStatus, basePrice: selected.price, finalPrice: selected.price })
        .onConflictDoUpdate({ target: [registrations.organizationId, registrations.registrationNumber], set: { pilgrimId: pilgrim.id, departureId: selected.departure.id, documentStatus, finalPrice: selected.price, updatedAt: new Date() } })
        .returning();

      const paymentMode = index % 5;
      const paidAmount = paymentMode <= 2 ? selected.price : paymentMode === 3 ? 5_000_000 : 0;
      const outstandingAmount = selected.price - paidAmount;
      await db
        .insert(invoices)
        .values({ organizationId: organization.id, invoiceNumber: `INV/HT/2026/${String(index).padStart(4, '0')}`, registrationId: registration.id, customerName: fullName, issueDate: '2026-09-05', dueDate: '2026-12-15', subtotal: selected.price, total: selected.price, paidAmount, outstandingAmount, status: outstandingAmount === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID', snapshot: { packageName: packageSeeds[departureIndex].name, pilgrimPublicId: publicId } })
        .onConflictDoUpdate({ target: [invoices.organizationId, invoices.invoiceNumber], set: { registrationId: registration.id, customerName: fullName, total: selected.price, paidAmount, outstandingAmount, status: outstandingAmount === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID', updatedAt: new Date() } });
    }

    console.log(`Demo Hammad Tour siap: ${packageSeeds.length} paket dan 120 jamaah.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Demo seed gagal:', error);
  process.exit(1);
});
