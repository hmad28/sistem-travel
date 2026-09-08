/** Rupiah integers only. Booking debt is independent of invoice issuance. */
export const DEFAULT_DP = 5_000_000;
export const COMMISSION_RATES = [500_000, 1_000_000] as const;
export const EQUIPMENT_NAMES = [
  'Koper Bagasi', 'Koper Kabin', 'Kain Ihram', 'Seragam', 'Kerudung',
  'Tas Multifungsi', 'ID Card', 'Cover Koper', 'Cover Paspor', 'Name Tag',
] as const;

function money(value: number) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000_000)
    throw new Error('invalidAmount');
  return value;
}

export function agreedPrice(base: number, discount: number, extra = 0) {
  const total = money(base) - money(discount) + money(extra);
  if (discount > base || total <= 0) throw new Error('invalidPrice');
  return money(total);
}

export function settlementDate(departure: string, days = 30) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departure) || !Number.isInteger(days) || days < 0)
    throw new Error('invalidDate');
  const date = new Date(`${departure}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== departure)
    throw new Error('invalidDate');
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export function bookingBalance(input: {
  total: number; dpTarget: number; paid: number; refunded?: number; cancelled?: boolean;
}) {
  const total = money(input.total), paid = money(input.paid), refunded = money(input.refunded ?? 0);
  money(input.dpTarget);
  if (refunded > paid || paid - refunded > total) throw new Error('invalidBalance');
  const netPaid = paid - refunded;
  const outstanding = input.cancelled ? 0 : total - netPaid;
  const status = input.cancelled ? 'CANCELLED' : refunded > 0 && netPaid === 0 ? 'REFUND'
    : netPaid === 0 ? 'UNPAID' : netPaid === total ? 'PAID'
    : netPaid <= input.dpTarget ? 'DP' : 'INSTALLMENT';
  return { netPaid, outstanding, status, partialRefund: refunded > 0 && netPaid > 0,
    commissionEligible: !input.cancelled && total > 0 && netPaid === total };
}

/** Issued but unpaid invoices also reserve the booking's billable amount. */
export function remainingBillable(total: number, issued: number) {
  if (money(issued) > money(total)) throw new Error('invoiceLimit');
  return total - issued;
}
