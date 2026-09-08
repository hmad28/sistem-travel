'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { db } from '@/db';
import { auditLogs, stockItems } from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { stockItemSchema, stockMovementSchema } from '@/lib/validation/inventory';
import { recordStockMovement } from '@/lib/travel/inventory-service';
import { InventoryError } from '@/lib/travel/inventory-rules';
import { EQUIPMENT_NAMES } from '@/lib/travel/booking-finance';

export type InventoryAction = 'create' | 'edit' | 'archive' | 'restore' | 'movement' | 'template';
export type InventoryState = { ok: boolean; message: string; href?: string };
export async function saveInventory(
  mode: InventoryAction,
  _state: InventoryState,
  form: FormData
): Promise<InventoryState> {
  const t = await getTranslations('inventory');
  try {
    z.enum(['create', 'edit', 'archive', 'restore', 'movement', 'template']).parse(mode);
    const context = await requireOrganizationContext(),
      org = context.organizationId;
    const permission = ['create', 'template', 'movement'].includes(mode) ? 'create' : 'edit';
    if (!hasSessionPermission(context.user, 'inventory', permission, org))
      return { ok: false, message: t('denied') };
    const raw = Object.fromEntries(form);
    let href = '/admin/manajemen/stok';
    await db.transaction(async (tx) => {
      if (mode === 'movement') {
        const data = stockMovementSchema.parse(raw);
        await recordStockMovement(tx, org, context.user.id, data);
        href += `/${data.itemId}`;
        return;
      }
      if (mode === 'template') {
        const inserted = await tx
          .insert(stockItems)
          .values(
            EQUIPMENT_NAMES.map((name, index) => ({
              organizationId: org,
              code: `umrah-${String(index + 1).padStart(2, '0')}`,
              name,
              unit: 'buah',
            }))
          )
          .onConflictDoNothing({ target: [stockItems.organizationId, stockItems.code] })
          .returning({ id: stockItems.id });
        if (inserted.length)
          await tx
            .insert(auditLogs)
            .values({
              actorId: context.user.id,
              resource: 'inventory',
              action: 'inventory.template',
              message: 'Default equipment added with zero stock',
              metadata: { organizationId: org, count: inserted.length },
            });
        return;
      }
      const id = z.uuid().parse(raw.id);
      const revision = z.coerce.number().int().min(0).parse(raw.revision);
      const [current] = await tx
        .select()
        .from(stockItems)
        .where(and(eq(stockItems.id, id), eq(stockItems.organizationId, org)))
        .for('update');
      href += `/${id}`;
      if (mode === 'create' || mode === 'edit') {
        const data = stockItemSchema.parse(raw);
        if (mode === 'create') {
          if (current) {
            if (
              current.name === data.name &&
              current.unit === data.unit &&
              current.minimum === data.minimum
            )
              return;
            throw new InventoryError('duplicate');
          }
          await tx
            .insert(stockItems)
            .values({
              id,
              organizationId: org,
              code: id,
              name: data.name,
              unit: data.unit,
              minimum: data.minimum,
            });
        } else {
          if (!current) throw new InventoryError('notFound');
          if (current.revision !== revision) throw new InventoryError('stale');
          if (current.archivedAt) throw new InventoryError('archived');
          await tx
            .update(stockItems)
            .set({
              name: data.name,
              unit: data.unit,
              minimum: data.minimum,
              revision: revision + 1,
              updatedAt: new Date(),
            })
            .where(and(eq(stockItems.id, id), eq(stockItems.organizationId, org)));
        }
      } else {
        if (!current) throw new InventoryError('notFound');
        if (Boolean(current.archivedAt) === (mode === 'archive')) return;
        if (current.revision !== revision) throw new InventoryError('stale');
        if (mode === 'archive' && current.quantity !== 0)
          throw new InventoryError('archiveNonzero');
        await tx
          .update(stockItems)
          .set({
            archivedAt: mode === 'archive' ? new Date() : null,
            revision: revision + 1,
            updatedAt: new Date(),
          })
          .where(and(eq(stockItems.id, id), eq(stockItems.organizationId, org)));
      }
      await tx
        .insert(auditLogs)
        .values({
          actorId: context.user.id,
          action: `inventory.${mode}`,
          resource: 'inventory',
          resourceId: id,
          message: 'Equipment record updated',
          metadata: { organizationId: org },
        });
    });
    revalidatePath('/admin/manajemen', 'layout');
    return { ok: true, message: t('saved'), href };
  } catch (error) {
    if (error instanceof InventoryError)
      return { ok: false, message: t(error.message as 'invalid') };
    if (error instanceof z.ZodError) return { ok: false, message: t('invalid') };
    console.error('[INVENTORY]', error);
    return { ok: false, message: t('failed') };
  }
}
