ALTER TABLE "users" DROP CONSTRAINT "users_name_unique";--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_paid_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "is_shared" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "is_shared" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "user_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;