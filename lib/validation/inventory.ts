import { z } from 'zod';
const quantity = z.coerce.number().int().min(0).max(1_000_000);
export const stockItemSchema = z.object({
  id: z.uuid(),
  revision: z.coerce.number().int().min(0),
  name: z.string().trim().min(2).max(120),
  unit: z.string().trim().min(1).max(24),
  minimum: quantity,
});
export const stockMovementSchema = z
  .object({
    requestId: z.uuid(),
    itemId: z.uuid(),
    revision: z.coerce.number().int().min(0),
    kind: z.enum(['IN', 'OUT', 'ADJUST']),
    quantity,
    movedDate: z.iso.date(),
    note: z.string().trim().min(3).max(1000),
  })
  .refine((v) => v.kind === 'ADJUST' || v.quantity > 0, {
    path: ['quantity'],
    message: 'positiveQuantity',
  });
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
