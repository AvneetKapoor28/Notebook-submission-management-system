ALTER TABLE "topics" ADD COLUMN "notes_given_on" date;
UPDATE "topics" SET "notes_given_on" = "date_taught";