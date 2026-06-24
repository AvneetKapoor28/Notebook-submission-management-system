UPDATE "student_check_records" SET "submission_status" = 'ABSENT', "completion_status" = NULL WHERE "submission_status" = 'EXCUSED';--> statement-breakpoint
UPDATE "student_check_records" SET "completion_status" = 'INCOMPLETE' WHERE "completion_status" = 'NEEDS_CORRECTION';--> statement-breakpoint
ALTER TABLE "student_check_records" ALTER COLUMN "completion_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."completion_status";--> statement-breakpoint
CREATE TYPE "public"."completion_status" AS ENUM('COMPLETE', 'INCOMPLETE', 'NOT_DONE');--> statement-breakpoint
ALTER TABLE "student_check_records" ALTER COLUMN "completion_status" SET DATA TYPE "public"."completion_status" USING "completion_status"::"public"."completion_status";--> statement-breakpoint
ALTER TABLE "student_check_records" ALTER COLUMN "submission_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."submission_status";--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('SUBMITTED', 'NOT_SUBMITTED', 'LATE_SUBMISSION', 'ABSENT');--> statement-breakpoint
ALTER TABLE "student_check_records" ALTER COLUMN "submission_status" SET DATA TYPE "public"."submission_status" USING "submission_status"::"public"."submission_status";