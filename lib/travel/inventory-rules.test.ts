import { describe, expect, it } from 'vitest';
import { stockChange } from './inventory-rules';
import { stockMovementSchema } from '@/lib/validation/inventory';
describe('stock integrity', () => {
  it('adds and removes physical quantities', () => {
    expect(stockChange(10, 'IN', 5)).toEqual({ before: 10, after: 15, delta: 5 });
    expect(stockChange(10, 'OUT', 10)).toEqual({ before: 10, after: 0, delta: -10 });
  });
  it('adjusts to a physical count, not by that count', () => {
    expect(stockChange(10, 'ADJUST', 7)).toEqual({ before: 10, after: 7, delta: -3 });
    expect(stockChange(10, 'ADJUST', 0).after).toBe(0);
  });
  it('rejects negative stock, no-op changes, and fractional units', () => {
    expect(() => stockChange(5, 'OUT', 6)).toThrow('insufficient');
    expect(() => stockChange(5, 'ADJUST', 5)).toThrow('unchanged');
    expect(() => stockChange(5, 'IN', 0.5)).toThrow('invalid');
    expect(() => stockChange(1_000_000, 'IN', 1)).toThrow('invalid');
  });
  it('requires a reason and valid dates, but permits an absolute count of zero', () => {
    const input = {
      requestId: '550e8400-e29b-41d4-a716-446655440000',
      itemId: '550e8400-e29b-41d4-a716-446655440001',
      revision: 0,
      movedDate: '2026-09-08',
      kind: 'ADJUST',
      quantity: 0,
      note: 'Physical count',
    };
    expect(stockMovementSchema.safeParse(input).success).toBe(true);
    expect(stockMovementSchema.safeParse({ ...input, kind: 'OUT' }).success).toBe(false);
    expect(stockMovementSchema.safeParse({ ...input, note: '' }).success).toBe(false);
    expect(stockMovementSchema.safeParse({ ...input, movedDate: '2026-02-30' }).success).toBe(
      false
    );
  });
});
