import { describe, expect, it } from 'vitest';
import {
  departureEditorSchema,
  paymentEditorSchema,
  registrationEditorSchema,
} from './travel-workflow';
const id = '89c24b54-00b0-46e6-b36c-865b150a182f';
describe('travel workflow input', () => {
  it('preserves the fully booked status when editing a departure', () => {
    expect(
      departureEditorSchema.parse({
        id,
        packageId: id,
        departureDate: '2027-01-10',
        returnDate: '2027-01-19',
        quota: 45,
        meetingPoint: '',
        notes: '',
        status: 'FULL',
      }).status
    ).toBe('FULL');
  });
  it('rejects departure dates in reverse order', () => {
    expect(
      departureEditorSchema.safeParse({
        packageId: id,
        departureDate: '2027-01-10',
        returnDate: '2027-01-09',
        quota: 45,
        meetingPoint: '',
        notes: '',
        status: 'OPEN',
      }).success
    ).toBe(false);
  });
  it('rejects fractional seats', () => {
    expect(
      departureEditorSchema.safeParse({
        packageId: id,
        departureDate: '2027-01-10',
        returnDate: '2027-01-19',
        quota: 1.5,
        meetingPoint: '',
        notes: '',
        status: 'OPEN',
      }).success
    ).toBe(false);
  });
  it('accepts a complete departure', () => {
    expect(
      departureEditorSchema.safeParse({
        packageId: id,
        departureDate: '2027-01-10',
        returnDate: '2027-01-19',
        quota: 45,
        meetingPoint: 'Bandara',
        notes: '',
        status: 'DRAFT',
      }).success
    ).toBe(true);
  });
  it('rejects negative registration discounts', () => {
    expect(
      registrationEditorSchema.safeParse({
        pilgrimId: id,
        departureId: id,
        discount: -10,
        additionalFee: 0,
        notes: '',
      }).success
    ).toBe(false);
  });
  it('rejects zero or fractional Rupiah payments', () => {
    for (const amount of [0, 0.5, -1])
      expect(
        paymentEditorSchema.safeParse({
          requestId: id,
          invoiceId: id,
          amount,
          paidDate: '2027-01-10',
          method: 'CASH',
          referenceNumber: '',
          notes: '',
        }).success
      ).toBe(false);
  });
});
