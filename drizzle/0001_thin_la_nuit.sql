ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
DROP TABLE "categories" CASCADE;--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_categoryId_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "category" text NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "is_shared" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "paid_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "owner";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "categoryId";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "isPersonal";