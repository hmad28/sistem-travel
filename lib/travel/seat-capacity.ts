/** Confirmed seats are included in reserved seats, not an additional allocation. */
export function occupiedSeats(reserved: number, confirmed: number, activeRegistrations = 0) {
  return Math.max(reserved, confirmed, activeRegistrations);
}
