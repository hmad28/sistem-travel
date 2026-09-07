'use server';

import { randomUUID } from 'node:crypto';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { db } from '@/db';
import {
  departures,
  travelPackages,
  pilgrims,
  registrations,
  invoices,
  invoiceItems,
  payments,
  receipts,
  auditLogs,
  uploads,
} from '@/db/schema';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';
import { occupiedSeats } from '@/lib/travel/seat-capacity';
import {
  packageEditorSchema,
  departureEditorSchema,
  registrationEditorSchema,
  paymentEditorSchema,
} from '@/lib/validation/travel-workflow';

export type WorkflowKind = 'package' | 'departure' | 'registration' | 'payment';
export type WorkflowState = { ok: boolean; message: string; href?: string; errors?: string[] };
const lines = (v: string) =>
  v
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
const number = (prefix: string) =>
  `${prefix}-${today().replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
class WorkflowError extends Error {}

export async function saveTravelWorkflow(
  kind: WorkflowKind,
  _previous: WorkflowState,
  form: FormData
): Promise<WorkflowState> {
  const t = await getTranslations('workflow');
  try {
    const context = await requireOrganizationContext();
    const resource = {
      package: 'cms',
      departure: 'departure',
      registration: 'registration',
      payment: 'finance',
    }[kind];
    if (
      !resource ||
      !hasSessionPermission(
        context.user,
        resource,
        form.get('id') ? 'edit' : 'create',
        context.organizationId
      )
    )
      return { ok: false, message: t('denied') };
    const raw = Object.fromEntries(form.entries());
    const org = context.organizationId;
    let destination = '/admin/manajemen';
    await db.transaction(async (tx) => {
      let recordId = '';
      if (kind === 'package') {
        const parsed = packageEditorSchema.safeParse(raw);
        if (!parsed.success) throw parsed.error;
        const { id, itinerary, ...data } = parsed.data;
        if (data.thumbnailKey) {
          const [image] = await tx
            .select()
            .from(uploads)
            .where(
              and(
                eq(uploads.publicUrl, data.thumbnailKey),
                eq(uploads.organizationId, org),
                eq(uploads.kind, 'cms_image'),
                isNull(uploads.deletedAt)
              )
            );
          if (!image) throw new WorkflowError('notFound');
        }
        const values = {
          ...data,
          organizationId: org,
          durationNights: data.durationDays - 1,
          isPublished: Number(data.isPublished),
          inclusions: lines(data.inclusions),
          exclusions: lines(data.exclusions),
          facilities: lines(data.facilities),
          requirements: lines(data.requirements),
          itinerary: lines(itinerary).map((title, i) => ({ day: i + 1, title })),
          updatedAt: new Date(),
        };
        if (id) {
          const rows = await tx
            .update(travelPackages)
            .set(values)
            .where(
              and(
                eq(travelPackages.id, id),
                eq(travelPackages.organizationId, org),
                isNull(travelPackages.archivedAt)
              )
            )
            .returning();
          if (!rows.length) throw new WorkflowError('notFound');
          recordId = id;
        } else {
          const [item] = await tx
            .insert(travelPackages)
            .values({ ...values, code: number('PKT'), createdBy: context.user.id })
            .returning();
          recordId = item.id;
        }
        destination = '/admin/cms/paket';
      } else if (kind === 'departure') {
        const { id, ...data } = departureEditorSchema.parse(raw);
        const [pkg] = await tx
          .select()
          .from(travelPackages)
          .where(
            and(
              eq(travelPackages.id, data.packageId),
              eq(travelPackages.organizationId, org),
              isNull(travelPackages.archivedAt)
            )
          );
        if (!pkg) throw new WorkflowError('notFound');
        if (id) {
          const [current] = await tx
            .select()
            .from(departures)
            .where(and(eq(departures.id, id), eq(departures.organizationId, org)))
            .for('update');
          if (!current) throw new WorkflowError('notFound');
          if (!['DRAFT', 'OPEN', 'CLOSED', 'FULL'].includes(current.status))
            throw new WorkflowError('scheduleLocked');
          const enrolled = await tx
            .select({ status: registrations.registrationStatus })
            .from(registrations)
            .where(and(eq(registrations.organizationId, org), eq(registrations.departureId, id)));
          const used = occupiedSeats(
            current.reservedSeats,
            current.confirmedSeats,
            enrolled.filter(
              (r) => !['DRAFT', 'CANCELLED', 'REFUNDED', 'REJECTED'].includes(r.status)
            ).length
          );
          if (data.quota < used) throw new WorkflowError('quotaTooSmall');
          if (enrolled.length && data.packageId !== current.packageId)
            throw new WorkflowError('packageLocked');
          if (enrolled.length && data.status === 'DRAFT') throw new WorkflowError('scheduleLocked');
          await tx
            .update(departures)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(departures.id, id), eq(departures.organizationId, org)));
          recordId = id;
        } else {
          const [item] = await tx
            .insert(departures)
            .values({ ...data, organizationId: org, code: number('BRK') })
            .returning();
          recordId = item.id;
        }
        destination = '/admin/manajemen/keberangkatan';
      } else if (kind === 'registration') {
        const data = registrationEditorSchema.parse(raw);
        // Serialize registrations on the departure to prevent overselling and duplicate enrollment.
        const [departure] = await tx
          .select()
          .from(departures)
          .where(and(eq(departures.id, data.departureId), eq(departures.organizationId, org)))
          .for('update');
        if (!departure || departure.status !== 'OPEN') throw new WorkflowError('departureClosed');
        const [person] = await tx
          .select()
          .from(pilgrims)
          .where(
            and(
              eq(pilgrims.id, data.pilgrimId),
              eq(pilgrims.organizationId, org),
              isNull(pilgrims.archivedAt)
            )
          );
        const [pkg] = await tx
          .select()
          .from(travelPackages)
          .where(
            and(
              eq(travelPackages.id, departure.packageId),
              eq(travelPackages.organizationId, org),
              isNull(travelPackages.archivedAt)
            )
          );
        if (!person || !pkg) throw new WorkflowError('notFound');
        const active = await tx
          .select({ pilgrimId: registrations.pilgrimId })
          .from(registrations)
          .where(
            and(
              eq(registrations.organizationId, org),
              eq(registrations.departureId, departure.id),
              inArray(registrations.registrationStatus, [
                'REGISTERED',
                'VERIFIED',
                'CONFIRMED',
                'READY',
                'DEPARTED',
                'COMPLETED',
              ])
            )
          );
        if (active.some((r) => r.pilgrimId === person.id))
          throw new WorkflowError('alreadyRegistered');
        if (
          occupiedSeats(departure.reservedSeats, departure.confirmedSeats, active.length) >=
          departure.quota
        )
          throw new WorkflowError('full');
        const finalPrice = pkg.startingPrice - data.discount + data.additionalFee;
        if (finalPrice <= 0) throw new WorkflowError('invalidPrice');
        const [registration] = await tx
          .insert(registrations)
          .values({
            ...data,
            organizationId: org,
            registrationNumber: number('REG'),
            registrationDate: today(),
            registrationStatus: 'REGISTERED',
            basePrice: pkg.startingPrice,
            finalPrice,
            createdBy: context.user.id,
          })
          .returning();
        const [invoice] = await tx
          .insert(invoices)
          .values({
            organizationId: org,
            registrationId: registration.id,
            invoiceNumber: number('INV'),
            customerName: person.fullName,
            issueDate: today(),
            subtotal: pkg.startingPrice,
            discount: data.discount,
            additionalFee: data.additionalFee,
            total: finalPrice,
            outstandingAmount: finalPrice,
            status: 'UNPAID',
            snapshot: {
              packageName: pkg.name,
              departureDate: departure.departureDate,
              registrationNumber: registration.registrationNumber,
            },
            createdBy: context.user.id,
          })
          .returning();
        await tx.insert(invoiceItems).values({
          invoiceId: invoice.id,
          description: pkg.name,
          quantity: 1,
          unitPrice: pkg.startingPrice,
          amount: pkg.startingPrice,
        });
        await tx
          .update(departures)
          .set({
            reservedSeats:
              occupiedSeats(departure.reservedSeats, departure.confirmedSeats, active.length) + 1,
            updatedAt: new Date(),
          })
          .where(eq(departures.id, departure.id));
        recordId = registration.id;
        destination = '/travel/pembayaran';
      } else {
        const data = paymentEditorSchema.parse(raw);
        const [invoice] = await tx
          .select()
          .from(invoices)
          .where(and(eq(invoices.id, data.invoiceId), eq(invoices.organizationId, org)))
          .for('update');
        if (!invoice || invoice.status === 'VOID' || invoice.status === 'DRAFT')
          throw new WorkflowError('notFound');
        const [already] = await tx
          .select()
          .from(payments)
          .where(and(eq(payments.id, data.requestId), eq(payments.organizationId, org)));
        if (already) {
          destination = '/travel/pembayaran';
          return;
        }
        if (data.amount > invoice.outstandingAmount) throw new WorkflowError('overpayment');
        if (data.paidDate > today()) throw new WorkflowError('futurePayment');
        const [payment] = await tx
          .insert(payments)
          .values({
            id: data.requestId,
            organizationId: org,
            invoiceId: invoice.id,
            paymentNumber: number('PAY'),
            amount: data.amount,
            method: data.method,
            paidAt: new Date(`${data.paidDate}T12:00:00+07:00`),
            referenceNumber: data.referenceNumber,
            notes: data.notes,
            status: 'VERIFIED',
            createdBy: context.user.id,
            verifiedBy: context.user.id,
            verifiedAt: new Date(),
          })
          .returning();
        const outstanding = invoice.outstandingAmount - data.amount;
        await tx
          .update(invoices)
          .set({
            paidAmount: invoice.paidAmount + data.amount,
            outstandingAmount: outstanding,
            status: outstanding === 0 ? 'PAID' : 'PARTIAL',
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, invoice.id));
        await tx.insert(receipts).values({
          organizationId: org,
          paymentId: payment.id,
          receiptNumber: number('KWT'),
          issuedBy: context.user.id,
          snapshot: {
            customerName: invoice.customerName,
            invoiceNumber: invoice.invoiceNumber,
            amount: data.amount,
            method: data.method,
            paidDate: data.paidDate,
          },
        });
        recordId = payment.id;
        destination = '/travel/pembayaran';
      }
      await tx.insert(auditLogs).values({
        actorId: context.user.id,
        actorEmail: context.user.email,
        action: `${kind}.save`,
        resource,
        resourceId: recordId,
        message: `${kind} saved`,
        metadata: { organizationId: org },
      });
    });
    revalidatePath('/', 'layout');
    return { ok: true, message: t('saved'), href: destination };
  } catch (error) {
    if (error instanceof WorkflowError)
      return { ok: false, message: t(error.message as 'notFound') };
    if (error && typeof error === 'object' && 'issues' in error)
      return {
        ok: false,
        message: t('invalid'),
        errors: (error as { issues: { path: PropertyKey[] }[] }).issues.map((i) =>
          String(i.path[0])
        ),
      };
    console.error('[TRAVEL_WORKFLOW]', error);
    return { ok: false, message: t('failed') };
  }
}
