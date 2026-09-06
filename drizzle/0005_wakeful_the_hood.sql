ALTER TYPE "public"."storage_provider" ADD VALUE 'uploadthing';--> statement-breakpoint
ALTER TYPE "public"."upload_kind" ADD VALUE 'cms_image' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."upload_kind" ADD VALUE 'pilgrim_document' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."upload_kind" ADD VALUE 'passport' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."upload_kind" ADD VALUE 'visa' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."upload_kind" ADD VALUE 'payment_proof' BEFORE 'other';--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "uploads_organization_id_idx" ON "uploads" USING btree ("organization_id");