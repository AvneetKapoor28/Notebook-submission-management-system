DROP INDEX "notebook_checks_source_idx";--> statement-breakpoint
ALTER TABLE "notebook_checks" DROP COLUMN "check_type";--> statement-breakpoint
ALTER TABLE "notebook_checks" DROP COLUMN "source_check_id";--> statement-breakpoint
DROP TYPE "public"."check_type";