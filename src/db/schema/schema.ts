import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import {
  COMPLETION_STATUSES,
  SUBMISSION_STATUSES,
} from "@/lib/constants";

export const submissionStatusEnum = pgEnum(
  "submission_status",
  SUBMISSION_STATUSES,
);
export const completionStatusEnum = pgEnum(
  "completion_status",
  COMPLETION_STATUSES,
);

export const teachers = pgTable(
  "teachers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("teachers_email_idx").on(table.email)],
);

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("classes_teacher_idx").on(table.teacherId),
    uniqueIndex("classes_teacher_name_idx").on(
      table.teacherId,
      table.name,
    ),
  ],
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    rollNumber: integer("roll_number").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("students_class_idx").on(table.classId),
    index("students_active_idx").on(table.isActive),
    uniqueIndex("students_class_roll_number_idx").on(
      table.classId,
      table.rollNumber,
    ),
  ],
);

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    notesGivenOn: date("notes_given_on").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("topics_class_date_idx").on(table.classId, table.notesGivenOn),
    uniqueIndex("topics_class_title_date_idx").on(
      table.classId,
      table.title,
      table.notesGivenOn,
    ),
  ],
);

export const notebookChecks = pgTable(
  "notebook_checks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    topicId: uuid("topic_id")
      .notNull()
      .unique()
      .references(() => topics.id, { onDelete: "cascade" }),
    checkDate: date("check_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notebook_checks_topic_date_idx").on(table.topicId, table.checkDate),
  ],
);

export const studentCheckRecords = pgTable(
  "student_check_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    notebookCheckId: uuid("notebook_check_id")
      .notNull()
      .references(() => notebookChecks.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    submissionStatus: submissionStatusEnum("submission_status").notNull(),
    completionStatus: completionStatusEnum("completion_status"),
    remarkTags: jsonb("remark_tags").$type<string[]>().default([]).notNull(),
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("student_records_student_idx").on(table.studentId),
    index("student_records_submission_idx").on(table.submissionStatus),
    index("student_records_completion_idx").on(table.completionStatus),
    uniqueIndex("student_records_check_student_idx").on(
      table.notebookCheckId,
      table.studentId,
    ),
  ],
);

export const teachersRelations = relations(teachers, ({ many }) => ({
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [classes.teacherId],
    references: [teachers.id],
  }),
  students: many(students),
  topics: many(topics),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  checkRecords: many(studentCheckRecords),
}));

export const topicsRelations = relations(topics, ({ one }) => ({
  class: one(classes, {
    fields: [topics.classId],
    references: [classes.id],
  }),
  notebookCheck: one(notebookChecks),
}));

export const notebookChecksRelations = relations(
  notebookChecks,
  ({ one, many }) => ({
    topic: one(topics, {
      fields: [notebookChecks.topicId],
      references: [topics.id],
    }),
    studentRecords: many(studentCheckRecords),
  }),
);

export const studentCheckRecordsRelations = relations(
  studentCheckRecords,
  ({ one }) => ({
    notebookCheck: one(notebookChecks, {
      fields: [studentCheckRecords.notebookCheckId],
      references: [notebookChecks.id],
    }),
    student: one(students, {
      fields: [studentCheckRecords.studentId],
      references: [students.id],
    }),
  }),
);

export type Teacher = typeof teachers.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type NotebookCheck = typeof notebookChecks.$inferSelect;
export type StudentCheckRecord = typeof studentCheckRecords.$inferSelect;
