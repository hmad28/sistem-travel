CREATE TYPE "public"."departure_status" AS ENUM('DRAFT', 'OPEN', 'FULL', 'CLOSED', 'PREPARATION', 'DEPARTED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('MISSING', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('DRAFT', 'ISSUED', 'UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'VERIFIED', 'REJECTED', 'REVERSED');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('DRAFT', 'REGISTERED', 'VERIFIED', 'CONFIRMED', 'READY', 'DEPARTED', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."travel_package_type" AS ENUM('UMRAH', 'HAJJ', 'TOUR');--> statement-breakpoint
CREATE TABLE "departures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"code" text NOT NULL,
	"departure_date" date NOT NULL,
	"return_date" date NOT NULL,
	"quota" integer NOT NULL,
	"reserved_seats" integer DEFAULT 0 NOT NULL,
	"confirmed_seats" integer DEFAULT 0 NOT NULL,
	"status" "departure_status" DEFAULT 'DRAFT' NOT NULL,
	"meeting_point" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departures_valid_dates" CHECK ("departures"."return_date" > "departures"."departure_date"),
	CONSTRAINT "departures_valid_quota" CHECK ("departures"."quota" >= 0 and "departures"."reserved_seats" >= 0 and "departures"."confirmed_seats" >= 0 and "departures"."confirmed_seats" <= "departures"."quota")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" bigint NOT NULL,
	"amount" bigint NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"registration_id" uuid,
	"customer_name" text NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date,
	"subtotal" bigint NOT NULL,
	"discount" bigint DEFAULT 0 NOT NULL,
	"additional_fee" bigint DEFAULT 0 NOT NULL,
	"total" bigint NOT NULL,
	"paid_amount" bigint DEFAULT 0 NOT NULL,
	"outstanding_amount" bigint NOT NULL,
	"status" "invoice_status" DEFAULT 'DRAFT' NOT NULL,
	"notes" text,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid,
	"voided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_totals_valid" CHECK ("invoices"."total" >= 0 and "invoices"."paid_amount" >= 0 and "invoices"."outstanding_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"payment_number" text NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"method" text NOT NULL,
	"paid_at" timestamp NOT NULL,
	"reference_number" text,
	"proof_file_key" text,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"created_by" uuid,
	"verified_by" uuid,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_positive_amount" CHECK ("payments"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"receipt_number" text NOT NULL,
	"payment_id" uuid NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"issued_by" uuid,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_price_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"occupancy" integer,
	"price" bigint NOT NULL,
	"child_policy" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "travel_package_type" DEFAULT 'UMRAH' NOT NULL,
	"short_description" text,
	"description" text,
	"duration_days" integer NOT NULL,
	"duration_nights" integer NOT NULL,
	"thumbnail_key" text,
	"starting_price" bigint DEFAULT 0 NOT NULL,
	"departure_airport" text,
	"default_airline" text,
	"makkah_hotel_text" text,
	"madinah_hotel_text" text,
	"inclusions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"exclusions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"facilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"itinerary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_published" integer DEFAULT 0 NOT NULL,
	"is_featured" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_by" uuid,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilgrims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"public_id" text NOT NULL,
	"full_name" text NOT NULL,
	"gender" "gender",
	"birth_place" text,
	"birth_date" date,
	"nik_encrypted" text,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"city" text,
	"province" text,
	"occupation" text,
	"emergency_name" text,
	"emergency_phone" text,
	"emergency_relation" text,
	"medical_notes" text,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"registration_number" text NOT NULL,
	"pilgrim_id" uuid NOT NULL,
	"departure_id" uuid NOT NULL,
	"price_variant_id" uuid,
	"registration_date" date NOT NULL,
	"registration_status" "registration_status" DEFAULT 'DRAFT' NOT NULL,
	"document_status" "document_status" DEFAULT 'MISSING' NOT NULL,
	"base_price" bigint NOT NULL,
	"discount" bigint DEFAULT 0 NOT NULL,
	"additional_fee" bigint DEFAULT 0 NOT NULL,
	"final_price" bigint NOT NULL,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilgrim_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"pilgrim_id" uuid NOT NULL,
	"registration_id" uuid,
	"document_type_id" uuid NOT NULL,
	"file_key" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" bigint NOT NULL,
	"status" "document_status" DEFAULT 'UPLOADED' NOT NULL,
	"review_notes" text,
	"uploaded_by" uuid,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "legal_name" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "favicon_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "primary_color" varchar(16) DEFAULT '#0d493f';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "secondary_color" varchar(16) DEFAULT '#d4ad5c';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "whatsapp" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "website_domain" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "timezone" text DEFAULT 'Asia/Jakarta' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "currency" varchar(3) DEFAULT 'IDR' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "locale" varchar(10) DEFAULT 'id-ID' NOT NULL;--> statement-breakpoint
ALTER TABLE "departures" ADD CONSTRAINT "departures_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departures" ADD CONSTRAINT "departures_package_id_travel_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."travel_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_price_variants" ADD CONSTRAINT "package_price_variants_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_price_variants" ADD CONSTRAINT "package_price_variants_package_id_travel_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."travel_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_packages" ADD CONSTRAINT "travel_packages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_packages" ADD CONSTRAINT "travel_packages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilgrims" ADD CONSTRAINT "pilgrims_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_pilgrim_id_pilgrims_id_fk" FOREIGN KEY ("pilgrim_id") REFERENCES "public"."pilgrims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_price_variant_id_package_price_variants_id_fk" FOREIGN KEY ("price_variant_id") REFERENCES "public"."package_price_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_types" ADD CONSTRAINT "document_types_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilgrim_documents" ADD CONSTRAINT "pilgrim_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilgrim_documents" ADD CONSTRAINT "pilgrim_documents_pilgrim_id_pilgrims_id_fk" FOREIGN KEY ("pilgrim_id") REFERENCES "public"."pilgrims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilgrim_documents" ADD CONSTRAINT "pilgrim_documents_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilgrim_documents" ADD CONSTRAINT "pilgrim_documents_document_type_id_document_types_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilgrim_documents" ADD CONSTRAINT "pilgrim_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilgrim_documents" ADD CONSTRAINT "pilgrim_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "departures_org_code_idx" ON "departures" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "departures_org_schedule_idx" ON "departures" USING btree ("organization_id","departure_date","status");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_org_number_idx" ON "invoices" USING btree ("organization_id","invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_org_status_due_idx" ON "invoices" USING btree ("organization_id","status","due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_org_number_idx" ON "payments" USING btree ("organization_id","payment_number");--> statement-breakpoint
CREATE INDEX "payments_org_invoice_idx" ON "payments" USING btree ("organization_id","invoice_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "receipts_org_number_idx" ON "receipts" USING btree ("organization_id","receipt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "receipts_payment_idx" ON "receipts" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "package_price_variants_package_idx" ON "package_price_variants" USING btree ("organization_id","package_id");--> statement-breakpoint
CREATE UNIQUE INDEX "package_price_variants_org_code_idx" ON "package_price_variants" USING btree ("organization_id","package_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "travel_packages_org_slug_idx" ON "travel_packages" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "travel_packages_org_code_idx" ON "travel_packages" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "travel_packages_org_published_idx" ON "travel_packages" USING btree ("organization_id","is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "pilgrims_org_public_id_idx" ON "pilgrims" USING btree ("organization_id","public_id");--> statement-breakpoint
CREATE INDEX "pilgrims_org_name_idx" ON "pilgrims" USING btree ("organization_id","full_name");--> statement-breakpoint
CREATE INDEX "pilgrims_org_phone_idx" ON "pilgrims" USING btree ("organization_id","phone");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_org_number_idx" ON "registrations" USING btree ("organization_id","registration_number");--> statement-breakpoint
CREATE INDEX "registrations_org_departure_idx" ON "registrations" USING btree ("organization_id","departure_id","registration_status");--> statement-breakpoint
CREATE UNIQUE INDEX "document_types_org_code_idx" ON "document_types" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "pilgrim_documents_org_pilgrim_idx" ON "pilgrim_documents" USING btree ("organization_id","pilgrim_id","status");