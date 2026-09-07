CREATE TABLE "website_visits" (
	"id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"visitor_key" text NOT NULL,
	"path" text NOT NULL,
	"device" text NOT NULL,
	"referrer" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "website_visits_organization_id_id_pk" PRIMARY KEY("organization_id","id")
);
--> statement-breakpoint
ALTER TABLE "website_visits" ADD CONSTRAINT "website_visits_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "website_visits_org_created_idx" ON "website_visits" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "website_visits_org_seen_idx" ON "website_visits" USING btree ("organization_id","last_seen_at");