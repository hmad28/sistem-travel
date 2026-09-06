import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import { db } from '@/db';
import { pilgrimDocuments } from '@/db/schema';
import { writeAuditLog } from '@/lib/audit';
import { handleRouteError, jsonError } from '@/lib/api/response';
import { requireOrganizationContext } from '@/lib/auth/organization-context';
import { requireApiPermission } from '@/lib/auth/server-permissions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const context = await requireOrganizationContext();
    const authz = await requireApiPermission('document', 'view', context.organizationId);
    if (!authz.ok) return authz.response;

    const [document] = await db
      .select({ id: pilgrimDocuments.id, fileKey: pilgrimDocuments.fileKey })
      .from(pilgrimDocuments)
      .where(
        and(
          eq(pilgrimDocuments.id, id),
          eq(pilgrimDocuments.organizationId, context.organizationId)
        )
      )
      .limit(1);

    if (!document) return jsonError('Dokumen tidak ditemukan.', 404);

    const uploadThing = new UTApi();
    const { ufsUrl } = await uploadThing.generateSignedURL(document.fileKey, {
      expiresIn: '5m',
    });

    await writeAuditLog({
      sessionUser: context.user,
      request,
      action: 'document.download',
      resource: 'document',
      resourceId: document.id,
      message: 'Dokumen jamaah dibuka melalui tautan sementara',
      metadata: { organizationId: context.organizationId },
    });

    return NextResponse.redirect(ufsUrl);
  } catch (error) {
    return handleRouteError('[TRAVEL_DOCUMENT_DOWNLOAD]', error);
  }
}
