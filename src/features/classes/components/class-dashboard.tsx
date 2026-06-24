"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Users, Plus, UserPlus, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopicForm } from "@/features/topics/components/topic-form";
import { StudentForm } from "@/features/students/components/student-form";
import { StudentImportForm } from "@/features/students/components/student-import-form";
import { StudentsTable } from "@/features/students/components/students-table";
import { formatPercent, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type TopicItem = {
  id: string;
  chapter: string;
  title: string;
  dateTaught: string;
  lastCheckDate: string | null;
  completionRate: number | null;
  checkCount: number;
};

type StudentItem = {
  id: string;
  rollNumber: number;
  name: string;
  isActive: boolean;
  missedSubmissionsCount: number;
  incompleteSubmissionsCount: number;
};

type ClassItem = {
  id: string;
  name: string;
  students: StudentItem[];
  activeStudents: StudentItem[];
  inactiveStudents: StudentItem[];
  topics: TopicItem[];
};

export function ClassDashboard({ classItem }: { classItem: ClassItem }) {
  const [activeTab, setActiveTab] = useState<"topics" | "roster">("topics");
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentAddMode, setStudentAddMode] = useState<"manual" | "csv">("manual");

  return (
    <div className="space-y-6">
      {/* Notion-style View Tabs */}
      <div className="flex border-b border-border/80 mb-6">
        <button
          onClick={() => setActiveTab("topics")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer -mb-px outline-none",
            activeTab === "topics"
              ? "border-foreground text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          <BookOpen className="size-4" />
          <span>Topics Database</span>
          <Badge variant="neutral" className="ml-1 bg-neutral-100/80 font-normal">
            {classItem.topics.length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer -mb-px outline-none",
            activeTab === "roster"
              ? "border-foreground text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          <Users className="size-4" />
          <span>Students Roster</span>
          <Badge variant="neutral" className="ml-1 bg-neutral-100/80 font-normal">
            {classItem.students.length}
          </Badge>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "topics" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground font-medium">
              {classItem.topics.length} lesson {classItem.topics.length === 1 ? "topic" : "topics"}
            </span>
            <Button
              onClick={() => setShowTopicForm((prev) => !prev)}
              variant={showTopicForm ? "secondary" : "default"}
              size="sm"
              className="gap-1.5 shadow-none border border-border/60 hover:bg-neutral-50/15 cursor-pointer"
            >
              <Plus
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  showTopicForm && "rotate-45"
                )}
              />
              <span>{showTopicForm ? "Close Form" : "New Topic"}</span>
            </Button>
          </div>

          {/* Compact slide down container for creating new topic */}
          {showTopicForm && (
            <div className="p-4 border border-border/60 bg-neutral-50/15 rounded-xl animate-in fade-in slide-in-from-top-3 duration-200">
              <TopicForm classId={classItem.id} />
            </div>
          )}

          {/* Scrollable Topics Table Container */}
          <div className="border border-border/70 rounded-3xl bg-white/90 overflow-hidden shadow-none">
            <div className="max-h-[480px] overflow-y-auto relative scrollbar-thin">
              <Table className="relative border-collapse">
                <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-xs z-10 border-b border-border/80 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-2.5 text-xs font-semibold">Topic</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold">Chapter</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold">Date taught</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold">Last checked</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold">Completion rate</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold">Status</TableHead>
                    <TableHead className="py-2.5 text-xs font-semibold text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classItem.topics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground/60 italic text-sm">
                        No topics created yet. Click "+ New Topic" above to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    classItem.topics.map((topic) => (
                      <TableRow key={topic.id} className="hover:bg-neutral-50/30">
                        <TableCell className="font-semibold text-xs md:text-sm py-3.5">
                          {topic.title}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-3.5">
                          {topic.chapter}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-3.5">
                          {formatShortDate(topic.dateTaught)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-3.5">
                          {formatShortDate(topic.lastCheckDate)}
                        </TableCell>
                        <TableCell className="py-3.5">
                          {topic.completionRate !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/40 shrink-0">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${topic.completionRate}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-emerald-800 bg-green-50 border border-green-200/50 px-1 py-0.2 rounded shrink-0">
                                {formatPercent(topic.completionRate)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5">
                          {topic.checkCount > 0 ? (
                            <Badge variant="green">Checked</Badge>
                          ) : (
                            <Badge variant="neutral">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            <Button asChild size="xs" variant="outline" className="shadow-none cursor-pointer">
                              <Link href={`/classes/${classItem.id}/topics/${topic.id}`}>
                                Open topic
                              </Link>
                            </Button>
                            <Button
                              asChild
                              size="xs"
                              variant={topic.checkCount > 0 ? "outline" : "default"}
                              className="shadow-none cursor-pointer"
                            >
                              <Link href={`/classes/${classItem.id}/topics/${topic.id}/checks/new`}>
                                {topic.checkCount > 0 ? "Edit check" : "Start check"}
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-muted-foreground font-medium">
              {classItem.students.length} {classItem.students.length === 1 ? "student" : "students"} rostered
            </span>
            <Button
              onClick={() => setShowStudentForm((prev) => !prev)}
              variant={showStudentForm ? "secondary" : "default"}
              size="sm"
              className="gap-1.5 shadow-none border border-border/60 hover:bg-neutral-50/15 cursor-pointer"
            >
              <Plus
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  showStudentForm && "rotate-45"
                )}
              />
              <span>{showStudentForm ? "Close Form" : "Add/Import Students"}</span>
            </Button>
          </div>

          {/* Collapsible Student Forms Container */}
          {showStudentForm && (
            <div className="p-5 border border-border/60 bg-neutral-50/15 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex border-b border-border/40 pb-2 gap-2">
                <button
                  onClick={() => setStudentAddMode("manual")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer outline-none",
                    studentAddMode === "manual"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <UserPlus className="size-3.5" />
                  <span>Add Manually</span>
                </button>
                <button
                  onClick={() => setStudentAddMode("csv")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer outline-none",
                    studentAddMode === "csv"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <FileSpreadsheet className="size-3.5" />
                  <span>Import CSV</span>
                </button>
              </div>

              <div className="pt-1">
                {studentAddMode === "manual" ? (
                  <StudentForm classId={classItem.id} />
                ) : (
                  <StudentImportForm classId={classItem.id} />
                )}
              </div>
            </div>
          )}

          {/* Students Table with Max Height */}
          <StudentsTable
            data={classItem.students}
            maxHeightClass="max-h-[480px] overflow-y-auto scrollbar-thin"
          />
        </div>
      )}
    </div>
  );
}
