import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => value || undefined);

export const createPilgrimSchema = z.object({
  fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 huruf.').max(150),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?62|0)[0-9]{8,13}$/, 'Masukkan nomor WhatsApp Indonesia yang benar.'),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  birthPlace: optionalText,
  birthDate: z.iso.date().optional().or(z.literal('')).transform((value) => value || undefined),
  email: z.email('Alamat email belum benar.').optional().or(z.literal('')).transform((value) => value || undefined),
  address: z.string().trim().max(500).optional().transform((value) => value || undefined),
  city: optionalText,
  province: optionalText,
  emergencyName: optionalText,
  emergencyPhone: z
    .string()
    .trim()
    .regex(/^(?:\+?62|0)[0-9]{8,13}$/, 'Nomor kontak darurat belum benar.')
    .optional()
    .or(z.literal(''))
    .transform((value) => value || undefined),
});

export type CreatePilgrimInput = z.infer<typeof createPilgrimSchema>;
