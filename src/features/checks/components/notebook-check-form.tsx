"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  useTransition,
  useCallback,
} from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createNotebookCheckAction,
} from "@/features/checks/actions";
import {
  notebookCheckFormSchema,
  type NotebookCheckFormValues,
} from "@/features/checks/schemas";
import {
  COMPLETION_STATUSES,
  COMPLETION_STATUS_LABELS,
  REMARK_TAGS,
  SUBMISSION_STATUSES,
  SUBMISSION_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type Student = {
  id: string;
  name: string;
  rollNumber: number;
};



type DraftPayload = {
  updatedAt: string;
  values: NotebookCheckFormValues;
};

function draftKey(topicId: string, checkDate: string) {
  return `notebook-draft:${topicId}:${checkDate}`;
}

export type StudentRecord = {
  studentId: string;
  submissionStatus: (typeof SUBMISSION_STATUSES)[number];
  completionStatus: (typeof COMPLETION_STATUSES)[number] | null;
  remarkTags: string[];
  remarks: string | null;
};

export type ExistingCheck = {
  id: string;
  checkDate: string;
  studentRecords: StudentRecord[];
};

export function NotebookCheckForm({
  topicId,
  students,
  existingCheck,
}: {
  topicId: string;
  students: Student[];
  existingCheck?: ExistingCheck | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const defaultValues = useMemo<NotebookCheckFormValues>(
    () => {
      if (existingCheck) {
        return {
          topicId,
          checkDate: existingCheck.checkDate,
          records: students.map((student) => {
            const existingRecord = existingCheck.studentRecords.find(
              (r) => r.studentId === student.id,
            );
            return {
              studentId: student.id,
              submissionStatus: existingRecord?.submissionStatus ?? "SUBMITTED",
              completionStatus: existingRecord ? existingRecord.completionStatus : "COMPLETE",
              remarkTags: (existingRecord?.remarkTags ?? []) as (typeof REMARK_TAGS)[number][],
              remarks: existingRecord?.remarks ?? null,
            };
          }),
        };
      }

      return {
        topicId,
        checkDate: new Date().toISOString().slice(0, 10),
        records: students.map((student) => ({
          studentId: student.id,
          submissionStatus: "SUBMITTED",
          completionStatus: "COMPLETE",
          remarkTags: [],
          remarks: null,
        })),
      };
    },
    [students, topicId, existingCheck],
  );

  const form = useForm<NotebookCheckFormValues>({
    resolver: zodResolver(notebookCheckFormSchema),
    defaultValues,
  });
  const { control, formState, getValues, handleSubmit, reset, setValue } = form;
  const { fields } = useFieldArray({ control, name: "records" });
  const watchedCheckDate = useWatch({ control, name: "checkDate" });
  const watchedRecords = useWatch({ control, name: "records" });
  const currentDraftKey = draftKey(topicId, watchedCheckDate);

  const [draftCandidate, setDraftCandidate] = useState<DraftPayload | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const prefix = `notebook-draft:${topicId}:`;
    const drafts = Object.keys(window.localStorage)
      .filter((key) => key.startsWith(prefix))
      .map((key) => {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as DraftPayload) : null;
      })
      .filter((value): value is DraftPayload => value !== null)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

    return drafts[0] ?? null;
  });
  const [lastAutosavedAt, setLastAutosavedAt] = useState<string | null>(
    draftCandidate?.updatedAt ?? null,
  );

  const clearAllTopicDrafts = useCallback(() => {
    const prefix = `notebook-draft:${topicId}:`;
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => localStorage.removeItem(key));
  }, [topicId]);

  const persistDraft = useCallback(() => {
    const payload: DraftPayload = {
      updatedAt: new Date().toISOString(),
      values: getValues(),
    };

    localStorage.setItem(currentDraftKey, JSON.stringify(payload));
    setLastAutosavedAt(payload.updatedAt);
  }, [currentDraftKey, getValues]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (formState.isDirty) {
        persistDraft();
      }
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [formState.isDirty, persistDraft]);

  useEffect(() => {
    function handleBeforeUnload() {
      if (formState.isDirty) {
        persistDraft();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formState.isDirty, persistDraft]);

  function setSubmissionStatus(index: number, value: (typeof SUBMISSION_STATUSES)[number]) {
    setValue(`records.${index}.submissionStatus`, value, { shouldDirty: true });

    if (value === "ABSENT") {
      setValue(`records.${index}.completionStatus`, null, { shouldDirty: true });
    } else if (getValues(`records.${index}.completionStatus`) === null) {
      setValue(`records.${index}.completionStatus`, "COMPLETE", {
        shouldDirty: true,
      });
    }
  }

  function setCompletionStatus(index: number, value: (typeof COMPLETION_STATUSES)[number]) {
    if (getValues(`records.${index}.submissionStatus`) === "ABSENT") {
      return;
    }

    setValue(`records.${index}.completionStatus`, value, { shouldDirty: true });
  }

  function toggleTag(index: number, tag: (typeof REMARK_TAGS)[number]) {
    const currentTags = getValues(`records.${index}.remarkTags`);
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter((item) => item !== tag)
      : [...currentTags, tag];

    setValue(`records.${index}.remarkTags`, nextTags, { shouldDirty: true });
  }

  function markAllSubmitted() {
    fields.forEach((_, index) => {
      setSubmissionStatus(index, "SUBMITTED");
    });
    persistDraft();
  }

  function markAllComplete() {
    fields.forEach((_, index) => {
      if (getValues(`records.${index}.submissionStatus`) !== "ABSENT") {
        setCompletionStatus(index, "COMPLETE");
      }
    });
    persistDraft();
  }

  function toggleExpandedRow(index: number) {
    setExpandedRows((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  function restoreDraft() {
    if (!draftCandidate) {
      return;
    }

    reset(draftCandidate.values);
    setDraftCandidate(null);
    toast.success("Draft restored.");
  }

  function discardDraft() {
    clearAllTopicDrafts();
    setDraftCandidate(null);
    setLastAutosavedAt(null);
    toast.success("Draft discarded.");
  }

  const dirtyRows = useMemo(() => {
    const dirtyFieldRows = formState.dirtyFields.records;

    if (!dirtyFieldRows) {
      return 0;
    }

    return dirtyFieldRows.filter(Boolean).length;
  }, [formState.dirtyFields.records]);

  const filteredFieldsWithIndex = useMemo(() => {
    return fields
      .map((field, index) => {
        const student = students.find((s) => s.id === field.studentId) || students[index];
        return { field, index, student };
      })
      .filter(({ student }) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.rollNumber.toString().includes(query)
        );
      });
  }, [fields, students, searchQuery]);

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await createNotebookCheckAction({
        ...values,
        records: values.records.map((record: NotebookCheckFormValues["records"][number]) => ({
          ...record,
          remarks: record.remarks?.trim() ? record.remarks.trim() : null,
        })),
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      clearAllTopicDrafts();
      toast.success(result.message);
      router.push(`/classes/${result.data?.classId}/topics/${result.data?.topicId}`);
      router.refresh();
    });
  });

  return (
    <div className="space-y-4">
      {draftCandidate ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">Recovered an unsent draft for this topic.</p>
              <p className="text-amber-700/80 dark:text-amber-400/80 text-xs">
                Last saved at {new Date(draftCandidate.updatedAt).toLocaleTimeString()}.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={restoreDraft} size="sm" type="button">
                Restore draft
              </Button>
              <Button onClick={discardDraft} size="sm" type="button" variant="outline">
                Discard
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Control / Filter Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-neutral-50/30 dark:bg-neutral-900/10 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block" htmlFor="check-date">
              Check date
            </label>
            <Input id="check-date" type="date" className="h-8 text-xs w-[140px] px-2 py-1 shadow-none" {...form.register("checkDate")} />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block" htmlFor="search-student">
              Find Student
            </label>
            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="search-student"
                type="text"
                placeholder="Name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 h-8 text-xs shadow-none w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={markAllSubmitted} type="button" variant="outline" size="sm" className="text-xs h-8">
            Mark all submitted
          </Button>
          <Button onClick={markAllComplete} type="button" variant="outline" size="sm" className="text-xs h-8">
            Mark all complete
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-auto custom-scrollbar max-h-[calc(100vh-325px)] min-h-[350px]">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-xs border-b border-border z-10">
              <tr>
                <th className="w-[25%] min-w-[180px] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Student
                </th>
                <th className="w-[40%] min-w-[340px] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Submission Status
                </th>
                <th className="w-[25%] min-w-[280px] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Completion Status
                </th>
                <th className="w-[10%] min-w-[120px] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFieldsWithIndex.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No students found matching &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredFieldsWithIndex.map(({ field, index, student }) => {
                  const row = watchedRecords[index];
                  const isExpanded = expandedRows.includes(index);
                  const isAbsent = row?.submissionStatus === "ABSENT";

                  return (
                    <Fragment key={field.id}>
                      <tr
                        className="border-t border-border/40 align-middle transition-colors hover:bg-neutral-50/30 dark:hover:bg-neutral-900/20"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="neutral" className="shrink-0 w-8 h-5 justify-center font-mono text-[10px] shadow-none">
                              {student.rollNumber}
                            </Badge>
                            <div className="truncate">
                              <p className="font-semibold text-sm text-foreground leading-tight">
                                {student.name}
                              </p>
                            </div>
                          </div>
                        </td>
                      
                      <td className="px-4 py-3 align-middle">
                        <div className="inline-flex w-full max-w-[340px] items-center rounded-lg bg-neutral-100/60 p-0.5 border border-neutral-200/40 dark:bg-neutral-900/60 dark:border-neutral-800/40">
                          {SUBMISSION_STATUSES.map((status) => {
                            const isSelected = row?.submissionStatus === status;
                            
                            // Map schema codes to shorter user-friendly labels to fit beautifully
                            let label = SUBMISSION_STATUS_LABELS[status];
                            if (status === "NOT_SUBMITTED") label = "Missing";
                            if (status === "LATE_SUBMISSION") label = "Late";

                            let activeClass = "";
                            if (isSelected) {
                              if (status === "SUBMITTED") {
                                activeClass = "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20 shadow-xs font-semibold";
                              } else if (status === "NOT_SUBMITTED") {
                                activeClass = "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/20 shadow-xs font-semibold";
                              } else if (status === "LATE_SUBMISSION") {
                                activeClass = "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/20 shadow-xs font-semibold";
                              } else if (status === "ABSENT") {
                                activeClass = "bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200 shadow-xs font-semibold border-neutral-300/40 dark:border-neutral-600/40";
                              }
                            } else {
                              activeClass = "text-muted-foreground hover:text-foreground border-transparent bg-transparent";
                            }

                            return (
                              <button
                                key={status}
                                className={cn(
                                  "flex-1 py-1 px-1.5 text-[11px] font-medium transition-all text-center rounded-md border border-transparent select-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/50",
                                  activeClass
                                )}
                                onClick={() => setSubmissionStatus(index, status)}
                                type="button"
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 align-middle">
                        <div className="inline-flex w-full max-w-[280px] items-center rounded-lg bg-neutral-100/60 p-0.5 border border-neutral-200/40 dark:bg-neutral-900/60 dark:border-neutral-800/40">
                          {COMPLETION_STATUSES.map((status) => {
                            const isSelected = row?.completionStatus === status;
                            
                            // Map schema codes to shorter user-friendly labels to fit beautifully
                            let label = COMPLETION_STATUS_LABELS[status];

                            let activeClass = "";
                            if (isSelected) {
                              if (status === "COMPLETE") {
                                activeClass = "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20 shadow-xs font-semibold";
                              } else if (status === "INCOMPLETE") {
                                activeClass = "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border-orange-500/20 shadow-xs font-semibold";
                              } else if (status === "NOT_DONE") {
                                activeClass = "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/20 shadow-xs font-semibold";
                              }
                            } else {
                              activeClass = "text-muted-foreground hover:text-foreground border-transparent bg-transparent disabled:opacity-40";
                            }

                            return (
                              <button
                                key={status}
                                className={cn(
                                  "flex-1 py-1 px-1.5 text-[11px] font-medium transition-all text-center rounded-md border border-transparent select-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed",
                                  activeClass
                                )}
                                disabled={isAbsent}
                                onClick={() => setCompletionStatus(index, status)}
                                type="button"
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                        {isAbsent ? (
                          <p className="mt-1 text-[9px] text-muted-foreground/75 italic leading-none pl-1">
                            Absent (disabled)
                          </p>
                        ) : null}
                      </td>
                      
                      <td className="px-4 py-3 align-middle">
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            onClick={() => toggleExpandedRow(index)}
                            type="button"
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-md border border-border bg-neutral-50/50 hover:bg-neutral-100 dark:bg-neutral-900/30 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-none"
                            )}
                          >
                            <span>📝</span>
                            <span>{isExpanded ? "Hide" : "Notes"}</span>
                          </button>
                          
                          {/* Tags/Remarks Summary */}
                          {(row?.remarkTags && row.remarkTags.length > 0) || row?.remarks ? (
                            <div className="flex flex-wrap gap-1 max-w-[150px] mt-0.5">
                              {row.remarkTags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-semibold bg-neutral-100 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-800/50"
                                >
                                  {tag}
                                </span>
                              ))}
                              {row.remarks && (
                                <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/30 dark:border-amber-900/30 max-w-[100px] truncate">
                                  {row.remarks}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded ? (
                      <tr className="border-t border-b border-border/30 bg-neutral-50/30 dark:bg-neutral-900/20">
                        <td className="px-4 py-4" colSpan={4}>
                          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Tags</p>
                              <div className="flex flex-wrap gap-1.5">
                                {REMARK_TAGS.map((tag) => {
                                  const selected = row?.remarkTags.includes(tag);

                                  return (
                                    <button
                                      key={tag}
                                      onClick={() => toggleTag(index, tag)}
                                      type="button"
                                      className={cn(
                                        "px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer select-none",
                                        selected
                                          ? "bg-neutral-900 border-neutral-950 text-white dark:bg-neutral-100 dark:border-neutral-200 dark:text-neutral-900"
                                          : "bg-transparent border-neutral-200 text-muted-foreground hover:text-foreground dark:border-neutral-800 dark:hover:bg-neutral-850"
                                      )}
                                    >
                                      {tag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Custom Remark</label>
                              <Textarea
                                className="min-h-16 text-xs bg-card border-border/80 focus-visible:ring-1 focus-visible:ring-ring/50"
                                placeholder="Optional note for this student"
                                value={row?.remarks ?? ""}
                                onChange={(event) =>
                                  setValue(
                                    `records.${index}.remarks`,
                                    event.target.value || null,
                                    { shouldDirty: true },
                                  )
                                }
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-4 z-10 rounded-xl border border-border bg-card/95 dark:bg-card/90 backdrop-blur-xs p-4 shadow-md animate-in fade-in duration-300">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="neutral" className="px-2 py-0.5 font-semibold">
              {searchQuery.trim()
                ? `Showing ${filteredFieldsWithIndex.length} of ${students.length} students`
                : `${students.length} students`}
            </Badge>
            <Badge variant="neutral" className="px-2 py-0.5 font-semibold">{dirtyRows} changed</Badge>
            <span className="flex items-center gap-1 select-none font-medium">
              ☁️{" "}
              {lastAutosavedAt
                ? `Draft saved at ${new Date(lastAutosavedAt).toLocaleTimeString()}`
                : "No draft saved"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={persistDraft} type="button" variant="outline" size="sm" className="text-xs">
              Save draft now
            </Button>
            <Button disabled={isPending} onClick={() => void onSubmit()} size="sm" className="text-xs font-semibold">
              {isPending
                ? existingCheck
                  ? "Updating check..."
                  : "Saving check..."
                : existingCheck
                  ? "Update notebook check"
                  : "Submit notebook check"}
            </Button>
          </div>
        </div>
        {formState.errors.records?.root ? (
          <p className="text-xs text-rose-600 font-semibold mt-2">{formState.errors.records.root.message}</p>
        ) : null}
      </div>
    </div>
  );
}
