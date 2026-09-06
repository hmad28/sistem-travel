import { randomInt } from 'node:crypto';
import { and, desc, eq, ilike, isNull, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { readDb } from '@/db/read';
import { pilgrims } from '@/db/schema';
import { writeAuditLog } from '@/lib/audit';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { requireApiPermission } from '@/lib/auth/server-permissions';
import { handleRouteError, parseJson } from '@/lib/api/response';
import { createPilgrimSchema } from '@/lib/validation/pilgrim';

function normalizeIndonesianPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

export async function GET(request: NextRequest) {
  try {
    const context = await requireOrganizationContext();
    const authz = await requireApiPermission('pilgrim', 'view', context.organizationId);
    if (!authz.ok) return authz.response;

    const query = request.nextUrl.searchParams.get('q')?.trim();
    const search = query
      ? or(
          ilike(pilgrims.fullName, `%${query}%`),
          ilike(pilgrims.publicId, `%${query}%`),
          ilike(pilgrims.phone, `%${query}%`)
        )
      : undefined;

    const rows = await readDb
      .select()
      .from(pilgrims)
      .where(
        and(
          eq(pilgrims.organizationId, context.organizationId),
          isNull(pilgrims.archivedAt),
          search
        )
      )
      .orderBy(desc(pilgrims.createdAt))
      .limit(100);

    return NextResponse.json({ data: rows });
  } catch (error) {
    return handleRouteError('[TRAVEL_PILGRIMS_GET]', error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireOrganizationContext();
    const authz = await requireApiPermission('pilgrim', 'create', context.organizationId);
    if (!authz.ok) return authz.response;

    const parsed = await parseJson(request, createPilgrimSchema);
    if (!parsed.ok) return parsed.response;

    const year = new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(new Date());
    const publicId = `HT-JMH-${year}-${randomInt(100000, 999999)}`;
    const [created] = await db
      .insert(pilgrims)
      .values({
        organizationId: context.organizationId,
        publicId,
        ...parsed.data,
        phone: normalizeIndonesianPhone(parsed.data.phone),
        emergencyPhone: parsed.data.emergencyPhone
          ? normalizeIndonesianPhone(parsed.data.emergencyPhone)
          : undefined,
      })
      .returning();

    await writeAuditLog({
      sessionUser: context.user,
      request,
      action: 'pilgrim.create',
      resource: 'pilgrim',
      resourceId: created.id,
      message: `Jamaah ${created.publicId} ditambahkan`,
      metadata: { organizationId: context.organizationId },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return handleRouteError('[TRAVEL_PILGRIMS_POST]', error);
  }
}
