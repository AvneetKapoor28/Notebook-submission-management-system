DROP INDEX "topics_class_date_idx";--> statement-breakpoint
DROP INDEX "topics_class_title_date_idx";--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "notes_given_on" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "topics_class_date_idx" ON "topics" USING btree ("class_id","notes_given_on");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_class_title_date_idx" ON "topics" USING btree ("class_id","title","notes_given_on");--> statement-breakpoint
ALTER TABLE "topics" DROP COLUMN "chapter";--> statement-breakpoint
ALTER TABLE "topics" DROP COLUMN "date_taught";