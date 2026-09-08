import { describe, expect, it } from 'vitest';
import { agreedPrice, bookingBalance, remainingBillable, settlementDate } from './booking-finance';

describe('booking financial rules', () => {
  it('uses an agreed price after discount and additional fee', () => {
    expect(agreedPrice(30_000_000, 1_000_000, 500_000)).toBe(29_500_000);
    expect(() => agreedPrice(10, 11)).toThrow();
    expect(() => agreedPrice(1.5, 0)).toThrow();
  });
  it('calculates H-30 across months and leap years without server timezone dependence', () => {
    expect(settlementDate('2028-03-01')).toBe('2028-01-31');
    expect(settlementDate('2026-01-15')).toBe('2025-12-16');
    expect(() => settlementDate('2026-02-30')).toThrow();
  });
  it('DP paid in full is not a fully paid booking', () => {
    const result = bookingBalance({ total: 30_000_000, dpTarget: 5_000_000, paid: 5_000_000 });
    expect(result.status).toBe('DP');
    expect(result.outstanding).toBe(25_000_000);
    expect(result.commissionEligible).toBe(false);
  });
  it('authorizes commission only after full net settlement', () => {
    const input = { total: 30_000_000, dpTarget: 5_000_000, paid: 30_000_000 };
    expect(bookingBalance(input).commissionEligible).toBe(true);
    expect(bookingBalance({ ...input, refunded: 1 }).commissionEligible).toBe(false);
    expect(bookingBalance({ ...input, cancelled: true }).commissionEligible).toBe(false);
  });
  it('does not recreate receivables for cancelled bookings', () => {
    expect(bookingBalance({ total: 30, dpTarget: 5, paid: 5, refunded: 5, cancelled: true }).outstanding).toBe(0);
    expect(() => bookingBalance({ total: 30, dpTarget: 5, paid: 5, refunded: 6 })).toThrow();
  });
  it('reserves unpaid invoices against the agreed total', () => {
    expect(remainingBillable(30_000_000, 5_000_000)).toBe(25_000_000);
    expect(remainingBillable(30_000_000, 30_000_000)).toBe(0);
    expect(() => remainingBillable(30, 31)).toThrow();
  });
});
