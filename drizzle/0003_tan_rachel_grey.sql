DROP INDEX "classes_teacher_name_year_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "classes_teacher_name_idx" ON "classes" USING btree ("teacher_id","name");--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "academic_year";