ALTER TABLE "expenses" DROP CONSTRAINT "expenses_paid_by_users_name_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");