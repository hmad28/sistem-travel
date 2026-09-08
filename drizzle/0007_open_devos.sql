ALTER TABLE "registrations" ADD COLUMN "dp_target" bigint DEFAULT 5000000 NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "settlement_due_date" date;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "payer_name" text;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "payer_phone" text;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "room_type" text DEFAULT 'QUAD' NOT NULL;