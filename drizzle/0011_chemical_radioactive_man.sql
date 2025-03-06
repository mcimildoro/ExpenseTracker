ALTER TABLE "expenses" DROP CONSTRAINT "expenses_paid_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "is_shared" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "is_shared" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paid_by_users_name_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."users"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "userId";