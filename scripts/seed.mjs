import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import postgres from "postgres";

function loadLocalEnv() {
  if (!existsSync(".env.local")) {
    return;
  }

  const content = readFileSync(".env.local", "utf8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^"/, "")
      .replace(/"$/, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const sql = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 1,
});

const teacher = {
  id: randomUUID(),
  name: "Aditi Sharma",
  email: "teacher@notebookflow.local",
};

const classConfigs = [
  {
    name: "Grade 6 - A",
    academicYear: "2026-2027",
    size: 32,
    topics: [
      ["Chapter 1", "Plant Cell", "2026-06-05"],
      ["Chapter 1", "Animal Cell", "2026-06-10"],
      ["Chapter 2", "Nutrition in Plants", "2026-06-15"],
      ["Chapter 2", "Photosynthesis", "2026-06-20"],
    ],
  },
  {
    name: "Grade 7 - B",
    academicYear: "2026-2027",
    size: 36,
    topics: [
      ["Chapter 3", "Heat Transfer", "2026-06-04"],
      ["Chapter 3", "Conduction and Convection", "2026-06-09"],
      ["Chapter 4", "Acids and Bases", "2026-06-14"],
      ["Chapter 4", "Indicators", "2026-06-19"],
    ],
  },
  {
    name: "Grade 8 - A",
    academicYear: "2026-2027",
    size: 38,
    topics: [
      ["Chapter 5", "Force and Pressure", "2026-06-03"],
      ["Chapter 5", "Friction", "2026-06-08"],
      ["Chapter 6", "Crop Production", "2026-06-13"],
      ["Chapter 6", "Microorganisms", "2026-06-18"],
    ],
  },
];

const firstNames = [
  "Aanya",
  "Aarav",
  "Diya",
  "Kabir",
  "Meera",
  "Ishaan",
  "Riya",
  "Vivaan",
  "Sana",
  "Arjun",
  "Kiara",
  "Reyansh",
  "Navya",
  "Parth",
  "Anaya",
  "Ved",
  "Tara",
  "Om",
  "Mira",
  "Dev",
];

const lastNames = [
  "Sharma",
  "Patel",
  "Nair",
  "Gupta",
  "Joshi",
  "Verma",
  "Iyer",
  "Mehta",
  "Kapoor",
  "Rao",
];

function studentName(index, offset) {
  return `${firstNames[(index + offset) % firstNames.length]} ${lastNames[(index * 2 + offset) % lastNames.length]}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getSubmissionStatus(classIndex, topicIndex, studentIndex, isCorrectionCheck) {
  if (!isCorrectionCheck && (studentIndex + topicIndex) % 17 === 0) {
    return "ABSENT";
  }

  if ((studentIndex + classIndex + topicIndex) % 11 === 0) {
    return "NOT_SUBMITTED";
  }

  if ((studentIndex + topicIndex) % 7 === 0) {
    return "LATE_SUBMISSION";
  }

  if (!isCorrectionCheck && (studentIndex + classIndex) % 19 === 0) {
    return "EXCUSED";
  }

  return "SUBMITTED";
}

function getCompletionStatus(submissionStatus, classIndex, topicIndex, studentIndex, isCorrectionCheck) {
  if (submissionStatus === "ABSENT") {
    return null;
  }

  if (isCorrectionCheck) {
    if ((studentIndex + classIndex + topicIndex) % 6 === 0) {
      return "INCOMPLETE";
    }

    return "COMPLETE";
  }

  if ((studentIndex + classIndex + topicIndex) % 13 === 0) {
    return "NEEDS_CORRECTION";
  }

  if ((studentIndex + topicIndex) % 9 === 0) {
    return "NOT_DONE";
  }

  if ((studentIndex + classIndex) % 8 === 0) {
    return "INCOMPLETE";
  }

  return "COMPLETE";
}

function getRemarkTags(submissionStatus, completionStatus) {
  const tags = [];

  if (submissionStatus === "NOT_SUBMITTED") {
    tags.push("Notebook Not Brought");
  }

  if (completionStatus === "INCOMPLETE") {
    tags.push("Homework Incomplete");
  }

  if (completionStatus === "NEEDS_CORRECTION") {
    tags.push("Corrections Pending");
  }

  if (completionStatus === "NOT_DONE") {
    tags.push("Diagram Missing");
  }

  if (submissionStatus === "LATE_SUBMISSION") {
    tags.push("Untidy Work");
  }

  return tags;
}

function getRemarks(submissionStatus, completionStatus, rollNumber) {
  if (submissionStatus === "ABSENT") {
    return "Absent on check day";
  }

  if (submissionStatus === "NOT_SUBMITTED") {
    return `Follow-up needed with roll ${rollNumber}`;
  }

  if (completionStatus === "NEEDS_CORRECTION") {
    return "Recheck diagrams and written explanation";
  }

  return null;
}

async function seed() {
  await sql.begin(async (tx) => {
    await tx`delete from student_check_records`;
    await tx`delete from notebook_checks`;
    await tx`delete from topics`;
    await tx`delete from students`;
    await tx`delete from classes`;
    await tx`delete from teachers where email = ${teacher.email}`;

    await tx`
      insert into teachers (id, name, email)
      values (${teacher.id}, ${teacher.name}, ${teacher.email})
    `;

    for (const [classIndex, classConfig] of classConfigs.entries()) {
      const classId = randomUUID();

      await tx`
        insert into classes (id, teacher_id, name, academic_year)
        values (${classId}, ${teacher.id}, ${classConfig.name}, ${classConfig.academicYear})
      `;

      const students = Array.from({ length: classConfig.size }, (_, index) => ({
        id: randomUUID(),
        rollNumber: index + 1,
        name: studentName(index, classIndex * 3),
        isActive: index < classConfig.size - 2,
      }));

      for (const student of students) {
        await tx`
          insert into students (id, class_id, roll_number, name, is_active)
          values (
            ${student.id},
            ${classId},
            ${student.rollNumber},
            ${student.name},
            ${student.isActive}
          )
        `;
      }

      for (const [topicIndex, topicTuple] of classConfig.topics.entries()) {
        const [chapter, title, dateTaught] = topicTuple;
        const topicId = randomUUID();

        await tx`
          insert into topics (id, class_id, chapter, title, date_taught)
          values (${topicId}, ${classId}, ${chapter}, ${title}, ${dateTaught})
        `;

        const regularCheckId = randomUUID();
        const regularCheckDate = addDays(dateTaught, 3);

        await tx`
          insert into notebook_checks (id, topic_id, check_date)
          values (${regularCheckId}, ${topicId}, ${regularCheckDate})
        `;

        for (const [studentIndex, student] of students.entries()) {
          const submissionStatus = getSubmissionStatus(
            classIndex,
            topicIndex,
            studentIndex,
            false,
          );
          const completionStatus = getCompletionStatus(
            submissionStatus,
            classIndex,
            topicIndex,
            studentIndex,
            false,
          );

          await tx`
            insert into student_check_records (
              id,
              notebook_check_id,
              student_id,
              submission_status,
              completion_status,
              remark_tags,
              remarks
            )
            values (
              ${randomUUID()},
              ${regularCheckId},
              ${student.id},
              ${submissionStatus},
              ${completionStatus},
              ${JSON.stringify(getRemarkTags(submissionStatus, completionStatus))},
              ${getRemarks(submissionStatus, completionStatus, student.rollNumber)}
            )
          `;
        }

        if (topicIndex % 2 === 1) {
          const correctionCheckId = randomUUID();
          const correctionCheckDate = addDays(regularCheckDate, 4);

          await tx`
            insert into notebook_checks (
              id,
              topic_id,
              check_date
            )
            values (
              ${correctionCheckId},
              ${topicId},
              ${correctionCheckDate}
            )
          `;

          for (const [studentIndex, student] of students.entries()) {
            const submissionStatus = getSubmissionStatus(
              classIndex,
              topicIndex,
              studentIndex,
              true,
            );
            const completionStatus = getCompletionStatus(
              submissionStatus,
              classIndex,
              topicIndex,
              studentIndex,
              true,
            );

            await tx`
              insert into student_check_records (
                id,
                notebook_check_id,
                student_id,
                submission_status,
                completion_status,
                remark_tags,
                remarks
              )
              values (
                ${randomUUID()},
                ${correctionCheckId},
                ${student.id},
                ${submissionStatus},
                ${completionStatus},
                ${JSON.stringify(getRemarkTags(submissionStatus, completionStatus))},
                ${completionStatus === "COMPLETE" ? "Corrected and resubmitted" : null}
              )
            `;
          }
        }
      }
    }
  });

  await sql.end();
  console.log("Seed complete.");
}

seed().catch(async (error) => {
  console.error(error);
  await sql.end();
  process.exit(1);
});
