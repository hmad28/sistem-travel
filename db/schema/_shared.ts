import { pgEnum, timestamp } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const orgStatusEnum = pgEnum('org_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const permissionTargetEnum = pgEnum('permission_target', ['USER', 'ROLE', 'ORGANIZATION']);
export const invitationStatusEnum = pgEnum('invitation_status', [
  'PENDING',
  'ACCEPTED',
  'REVOKED',
  'EXPIRED',
]);
export const storageProviderEnum = pgEnum('storage_provider', ['local', 's3', 'uploadthing']);
export const uploadKindEnum = pgEnum('upload_kind', [
  'avatar',
  'attachment',
  'rich_text_image',
  'organization_logo',
  'cms_image',
  'pilgrim_document',
  'passport',
  'visa',
  'payment_proof',
  'other',
]);

export const travelPackageTypeEnum = pgEnum('travel_package_type', ['UMRAH', 'HAJJ', 'TOUR']);
export const departureStatusEnum = pgEnum('departure_status', [
  'DRAFT',
  'OPEN',
  'FULL',
  'CLOSED',
  'PREPARATION',
  'DEPARTED',
  'COMPLETED',
  'CANCELLED',
]);
export const genderEnum = pgEnum('gender', ['MALE', 'FEMALE']);
export const registrationStatusEnum = pgEnum('registration_status', [
  'DRAFT',
  'REGISTERED',
  'VERIFIED',
  'CONFIRMED',
  'READY',
  'DEPARTED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
  'REJECTED',
]);
export const documentStatusEnum = pgEnum('document_status', [
  'MISSING',
  'UPLOADED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'VERIFIED',
  'REJECTED',
  'REVERSED',
]);
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'DRAFT',
  'ISSUED',
  'UNPAID',
  'PARTIAL',
  'PAID',
  'OVERDUE',
  'VOID',
]);

export const timestamps = {
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
};
