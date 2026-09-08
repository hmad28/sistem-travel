export class InventoryError extends Error {}
export function stockChange(current: number, kind: 'IN' | 'OUT' | 'ADJUST', quantity: number) {
  if (![current, quantity].every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 1_000_000))
    throw new InventoryError('invalid');
  const after =
    kind === 'ADJUST' ? quantity : kind === 'IN' ? current + quantity : current - quantity;
  if (after < 0) throw new InventoryError('insufficient');
  if (after > 1_000_000) throw new InventoryError('invalid');
  if (after === current) throw new InventoryError('unchanged');
  return { before: current, after, delta: after - current };
}
