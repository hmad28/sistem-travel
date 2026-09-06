import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { db } from '@/db';
import {
  documentTypes,
  pilgrimDocuments,
  pilgrims,
  registrations,
  uploads,
} from '@/db/schema';
import {
  OrganizationAccessError,
  requireOrganizationContext,
} from '@/lib/auth/organization-context';
import { hasSessionPermission } from '@/lib/auth/permissions';

const upload = createUploadthing();

async function requireUploadAccess(resource: 'cms' | 'document') {
  try {
    const context = await requireOrganizationContext();
    const allowed = hasSessionPermission(
      context.user,
      resource,
      'create',
      context.organizationId
    );

    if (!allowed) {
      throw new UploadThingError('Anda tidak memiliki izin untuk mengunggah file ini.');
    }

    return context;
  } catch (error) {
    if (error instanceof UploadThingError) throw error;
    if (error instanceof OrganizationAccessError) {
      throw new UploadThingError(error.message);
    }
    throw new UploadThingError('Sesi tidak valid. Silakan masuk kembali.');
  }
}

const documentInput = z.object({
  pilgrimId: z.string().uuid(),
  documentTypeId: z.string().uuid(),
  registrationId: z.string().uuid().optional(),
});

export const uploadRouter = {
  cmsImage: upload({
    image: {
      maxFileSize: '8MB',
      maxFileCount: 10,
      minFileCount: 1,
      acl: 'public-read',
    },
  })
    .middleware(async () => {
      const context = await requireUploadAccess('cms');
      return {
        userId: context.user.id,
        organizationId: context.organizationId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const [record] = await db
        .insert(uploads)
        .values({
          organizationId: metadata.organizationId,
          ownerId: metadata.userId,
          kind: 'cms_image',
          provider: 'uploadthing',
          filename: file.key,
          originalName: file.name,
          mime: file.type,
          size: file.size,
          path: file.key,
          publicUrl: file.ufsUrl,
        })
        .onConflictDoUpdate({
          target: uploads.path,
          set: {
            originalName: file.name,
            mime: file.type,
            size: file.size,
            publicUrl: file.ufsUrl,
            updatedAt: new Date(),
          },
        })
        .returning({ id: uploads.id, url: uploads.publicUrl });

      return record;
    }),

  pilgrimDocument: upload(
    {
      image: { maxFileSize: '8MB', maxFileCount: 1, acl: 'private' },
      pdf: { maxFileSize: '8MB', maxFileCount: 1, acl: 'private' },
    },
    { awaitServerData: true }
  )
    .input(documentInput)
    .middleware(async ({ input }) => {
      const context = await requireUploadAccess('document');
      const [pilgrim, documentType] = await Promise.all([
        db
          .select({ id: pilgrims.id })
          .from(pilgrims)
          .where(
            and(
              eq(pilgrims.id, input.pilgrimId),
              eq(pilgrims.organizationId, context.organizationId)
            )
          )
          .limit(1),
        db
          .select({ id: documentTypes.id })
          .from(documentTypes)
          .where(
            and(
              eq(documentTypes.id, input.documentTypeId),
              eq(documentTypes.organizationId, context.organizationId)
            )
          )
          .limit(1),
      ]);

      if (!pilgrim[0] || !documentType[0]) {
        throw new UploadThingError('Data jamaah atau jenis dokumen tidak ditemukan.');
      }

      if (input.registrationId) {
        const [registration] = await db
          .select({ id: registrations.id })
          .from(registrations)
          .where(
            and(
              eq(registrations.id, input.registrationId),
              eq(registrations.pilgrimId, input.pilgrimId),
              eq(registrations.organizationId, context.organizationId)
            )
          )
          .limit(1);
        if (!registration) {
          throw new UploadThingError('Pendaftaran jamaah tidak ditemukan.');
        }
      }

      return {
        ...input,
        userId: context.user.id,
        organizationId: context.organizationId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return db.transaction(async (tx) => {
        const [uploadRecord] = await tx
          .insert(uploads)
          .values({
            organizationId: metadata.organizationId,
            ownerId: metadata.userId,
            kind: 'pilgrim_document',
            provider: 'uploadthing',
            filename: file.key,
            originalName: file.name,
            mime: file.type,
            size: file.size,
            path: file.key,
            publicUrl: null,
            metadata: { access: 'private' },
          })
          .returning({ id: uploads.id });

        const [document] = await tx
          .insert(pilgrimDocuments)
          .values({
            organizationId: metadata.organizationId,
            pilgrimId: metadata.pilgrimId,
            registrationId: metadata.registrationId,
            documentTypeId: metadata.documentTypeId,
            fileKey: file.key,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedBy: metadata.userId,
          })
          .returning({ id: pilgrimDocuments.id });

        return { id: document.id, uploadId: uploadRecord.id };
      });
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
