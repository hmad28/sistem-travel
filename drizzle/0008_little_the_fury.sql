CREATE TABLE "stock_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"minimum" integer DEFAULT 0 NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_items_balances_valid" CHECK ("stock_items"."quantity" >= 0 and "stock_items"."minimum" >= 0 and "stock_items"."revision" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"quantity" integer NOT NULL,
	"balance_before" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"moved_date" date NOT NULL,
	"note" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movements_balances_valid" CHECK ("stock_movements"."balance_before" >= 0 and "stock_movements"."balance_after" >= 0 and "stock_movements"."balance_after" = "stock_movements"."balance_before" + "stock_movements"."quantity"),
	CONSTRAINT "stock_movements_kind_valid" CHECK (("stock_movements"."kind" = 'IN' and "stock_movements"."quantity" > 0) or ("stock_movements"."kind" = 'OUT' and "stock_movements"."quantity" < 0) or ("stock_movements"."kind" = 'ADJUST' and "stock_movements"."quantity" <> 0))
);
--> statement-breakpoint
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "stock_items_org_code_idx" ON "stock_items" USING btree ("organization_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_items_org_id_idx" ON "stock_items" USING btree ("organization_id","id");--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_item_fk" FOREIGN KEY ("organization_id","item_id") REFERENCES "public"."stock_items"("organization_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stock_movements_org_item_created_idx" ON "stock_movements" USING btree ("organization_id","item_id","created_at");
--> statement-breakpoint
INSERT INTO "resources" ("name", "slug", "description") VALUES ('INVENTORY', 'inventory', 'Stok perlengkapan jamaah') ON CONFLICT ("slug") DO NOTHING;
