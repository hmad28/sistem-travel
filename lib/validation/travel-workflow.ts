import { z } from 'zod';

const amount = z.coerce.number().int().min(0).max(1_000_000_000_000);
const date = z.iso.date();
export const packageEditorSchema = z.object({
  thumbnailKey: z.string().max(1000).default(''),
  id: z.union([z.uuid(), z.literal('')]).default(''),
  name: z.string().trim().min(3).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(180),
  type: z.enum(['UMRAH', 'HAJJ', 'TOUR']),
  durationDays: z.coerce.number().int().min(2).max(365),
  startingPrice: amount,
  shortDescription: z.string().trim().max(500),
  description: z.string().trim().max(10000),
  departureAirport: z.string().trim().max(160),
  defaultAirline: z.string().trim().max(160),
  makkahHotelText: z.string().trim().max(300),
  madinahHotelText: z.string().trim().max(300),
  inclusions: z.string().max(5000),
  exclusions: z.string().max(5000),
  requirements: z.string().max(5000),
  facilities: z.string().max(5000),
  itinerary: z.string().max(10000),
  isPublished: z.enum(['0', '1']),
});
export const departureEditorSchema = z
  .object({
    id: z.union([z.uuid(), z.literal('')]).default(''),
    packageId: z.uuid(),
    departureDate: date,
    returnDate: date,
    quota: z.coerce.number().int().min(1).max(1000),
    meetingPoint: z.string().trim().max(500),
    notes: z.string().trim().max(2000),
    status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'FULL']),
  })
  .refine((v) => v.returnDate > v.departureDate, { path: ['returnDate'], message: 'returnDate' });
export const registrationEditorSchema = z.object({
  pilgrimId: z.uuid(),
  departureId: z.uuid(),
  discount: amount,
  additionalFee: amount,
  notes: z.string().trim().max(2000),
});
export const paymentEditorSchema = z.object({
  requestId: z.uuid(),
  invoiceId: z.uuid(),
  amount: amount.refine((v) => v > 0),
  paidDate: date,
  method: z.enum(['TRANSFER', 'CASH']),
  referenceNumber: z.string().trim().max(200),
  notes: z.string().trim().max(2000),
});
