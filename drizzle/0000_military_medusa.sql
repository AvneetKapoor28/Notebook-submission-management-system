CREATE TYPE "public"."check_type" AS ENUM('REGULAR_CHECK', 'CORRECTION_CHECK');--> statement-breakpoint
CREATE TYPE "public"."completion_status" AS ENUM('COMPLETE', 'INCOMPLETE', 'NOT_DONE', 'NEEDS_CORRECTION');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('SUBMITTED', 'NOT_SUBMITTED', 'LATE_SUBMISSION', 'EXCUSED', 'ABSENT');--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"name" text NOT NULL,
	"academic_year" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notebook_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"check_type" "check_type" NOT NULL,
	"check_date" date NOT NULL,
	"source_check_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_check_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_check_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"submission_status" "submission_status" NOT NULL,
	"completion_status" "completion_status",
	"remark_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"roll_number" integer NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teachers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"chapter" text NOT NULL,
	"title" text NOT NULL,
	"date_taught" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notebook_checks" ADD CONSTRAINT "notebook_checks_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notebook_checks" ADD CONSTRAINT "notebook_checks_source_check_id_notebook_checks_id_fk" FOREIGN KEY ("source_check_id") REFERENCES "public"."notebook_checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_check_records" ADD CONSTRAINT "student_check_records_notebook_check_id_notebook_checks_id_fk" FOREIGN KEY ("notebook_check_id") REFERENCES "public"."notebook_checks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_check_records" ADD CONSTRAINT "student_check_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "classes_teacher_idx" ON "classes" USING btree ("teacher_id");--> statement-breakpoint
CREATE UNIQUE INDEX "classes_teacher_name_year_idx" ON "classes" USING btree ("teacher_id","name","academic_year");--> statement-breakpoint
CREATE INDEX "notebook_checks_topic_date_idx" ON "notebook_checks" USING btree ("topic_id","check_date");--> statement-breakpoint
CREATE INDEX "notebook_checks_source_idx" ON "notebook_checks" USING btree ("source_check_id");--> statement-breakpoint
CREATE INDEX "student_records_student_idx" ON "student_check_records" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_records_submission_idx" ON "student_check_records" USING btree ("submission_status");--> statement-breakpoint
CREATE INDEX "student_records_completion_idx" ON "student_check_records" USING btree ("completion_status");--> statement-breakpoint
CREATE UNIQUE INDEX "student_records_check_student_idx" ON "student_check_records" USING btree ("notebook_check_id","student_id");--> statement-breakpoint
CREATE INDEX "students_class_idx" ON "students" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "students_active_idx" ON "students" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "students_class_roll_number_idx" ON "students" USING btree ("class_id","roll_number");--> statement-breakpoint
CREATE UNIQUE INDEX "teachers_email_idx" ON "teachers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "topics_class_date_idx" ON "topics" USING btree ("class_id","date_taught");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_class_title_date_idx" ON "topics" USING btree ("class_id","title","date_taught");
