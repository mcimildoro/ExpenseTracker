ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paid_by_users_name_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."users"("name") ON DELETE no action ON UPDATE no action;