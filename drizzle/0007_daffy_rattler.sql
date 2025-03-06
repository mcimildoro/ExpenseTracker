ALTER TABLE "expenses" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "userId" text;