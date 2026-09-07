import { describe, expect, it } from 'vitest';
import { occupiedSeats } from './seat-capacity';

describe('departure seat allocation', () => {
  it('does not count confirmed reservations twice', () => {
    expect(occupiedSeats(42, 42, 40)).toBe(42);
  });
  it('includes unconfirmed reservations', () => {
    expect(occupiedSeats(42, 28, 40)).toBe(42);
  });
  it('uses active registrations when counters lag behind', () => {
    expect(occupiedSeats(2, 1, 3)).toBe(3);
  });
  it('starts an empty departure at zero', () => {
    expect(occupiedSeats(0, 0)).toBe(0);
  });
});
