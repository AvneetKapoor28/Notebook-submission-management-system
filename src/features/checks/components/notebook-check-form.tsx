"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
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
import { Select } from "@/components/ui/select";
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
  COMPLETION_STATUS_SHORTCUTS,
  REMARK_TAGS,
  SUBMISSION_STATUSES,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_SHORTCUTS,
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
  const [activeRow, setActiveRow] = useState(0);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
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
              remarkTags: (existingRecord?.remarkTags ?? []) as any,
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

  useEffect(() => {
    const row = rowRefs.current[activeRow];
    row?.scrollIntoView({ block: "nearest" });
  }, [activeRow]);

  const dirtyRows = useMemo(() => {
    const dirtyFieldRows = formState.dirtyFields.records;

    if (!dirtyFieldRows) {
      return 0;
    }

    return dirtyFieldRows.filter(Boolean).length;
  }, [formState.dirtyFields.records]);

  function handleKeyboardShortcuts(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLInputElement && target.type !== "radio")
    ) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveRow((current) => Math.min(current + 1, students.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveRow((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      toggleExpandedRow(activeRow);
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      void onSubmit();
      return;
    }

    const submissionEntry = Object.entries(SUBMISSION_STATUS_SHORTCUTS).find(
      ([, shortcut]) => shortcut === event.key,
    );

    if (submissionEntry) {
      event.preventDefault();
      setSubmissionStatus(
        activeRow,
        submissionEntry[0] as (typeof SUBMISSION_STATUSES)[number],
      );
      return;
    }

    const completionEntry = Object.entries(COMPLETION_STATUS_SHORTCUTS).find(
      ([, shortcut]) => shortcut === event.key.toUpperCase(),
    );

    if (completionEntry) {
      event.preventDefault();
      setCompletionStatus(
        activeRow,
        completionEntry[0] as (typeof COMPLETION_STATUSES)[number],
      );
    }
  }

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
    <div className="space-y-4" onKeyDown={handleKeyboardShortcuts}>
      {draftCandidate ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">Recovered an unsent draft for this topic.</p>
              <p className="text-amber-700">
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

      <div className="grid gap-4 rounded-lg border border-border/70 bg-neutral-50/10 p-4 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="check-date">
              Check date
            </label>
            <Input id="check-date" type="date" {...form.register("checkDate")} />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2 lg:justify-end">
          <Button onClick={markAllSubmitted} type="button" variant="outline" size="sm" className="text-xs">
            Mark all submitted
          </Button>
          <Button onClick={markAllComplete} type="button" variant="outline" size="sm" className="text-xs">
            Mark all complete
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-neutral-50/50 border-b border-border/40">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Student
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Submission Status
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Completion Status
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const row = watchedRecords[index];
                const isActive = activeRow === index;
                const isExpanded = expandedRows.includes(index);
                const isAbsent = row?.submissionStatus === "ABSENT";

                return (
                  <Fragment key={field.id}>
                    <tr
                      ref={(element) => {
                        rowRefs.current[index] = element;
                      }}
                      className={cn(
                        "border-t border-border/40 align-top transition-colors hover:bg-neutral-50/20",
                        isActive && "bg-amber-50/30 font-medium",
                      )}
                      onClick={() => setActiveRow(index)}
                      tabIndex={0}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Badge variant={isActive ? "yellow" : "neutral"} className="shrink-0">
                            {students[index].rollNumber}
                          </Badge>
                          <div className="truncate">
                            <p className="font-semibold text-sm text-foreground leading-tight">
                              {students[index].name}
                            </p>
                            <p className="text-[10px] text-muted-foreground/75 mt-1 select-none">
                              Shortcuts: 1-5, QWER, Enter
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {SUBMISSION_STATUSES.map((status) => {
                            const isSelected = row?.submissionStatus === status;
                            let activeClass = "";
                            if (isSelected) {
                              if (status === "SUBMITTED") activeClass = "bg-green-50 text-green-800 border-green-200/60 hover:bg-green-100/40";
                              else if (status === "NOT_SUBMITTED") activeClass = "bg-rose-50 text-rose-800 border-rose-200/60 hover:bg-rose-100/40";
                              else if (status === "LATE_SUBMISSION") activeClass = "bg-amber-50 text-amber-800 border-amber-200/60 hover:bg-amber-100/40";
                              else if (status === "EXCUSED") activeClass = "bg-sky-50 text-sky-800 border-sky-200/60 hover:bg-sky-100/40";
                              else if (status === "ABSENT") activeClass = "bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-200/40";
                            } else {
                              activeClass = "border-border/50 bg-transparent text-muted-foreground hover:bg-neutral-50/50 hover:text-foreground";
                            }

                            return (
                              <Button
                                key={status}
                                className={cn("min-w-24 text-xs font-semibold rounded shadow-none border h-7 px-2", activeClass)}
                                onClick={() => setSubmissionStatus(index, status)}
                                size="sm"
                                type="button"
                              >
                                {SUBMISSION_STATUS_LABELS[status]}
                              </Button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {COMPLETION_STATUSES.map((status) => {
                            const isSelected = row?.completionStatus === status;
                            let activeClass = "";
                            if (isSelected) {
                              if (status === "COMPLETE") activeClass = "bg-green-50 text-green-800 border-green-200/60 hover:bg-green-100/40";
                              else if (status === "INCOMPLETE") activeClass = "bg-orange-50 text-orange-800 border-orange-200/60 hover:bg-orange-100/40";
                              else if (status === "NOT_DONE") activeClass = "bg-rose-50 text-rose-800 border-rose-200/60 hover:bg-rose-100/40";
                              else if (status === "NEEDS_CORRECTION") activeClass = "bg-blue-50 text-blue-800 border-blue-200/60 hover:bg-blue-100/40";
                            } else {
                              activeClass = "border-border/50 bg-transparent text-muted-foreground hover:bg-neutral-50/50 hover:text-foreground";
                            }

                            return (
                              <Button
                                key={status}
                                className={cn("min-w-24 text-xs font-semibold rounded shadow-none border h-7 px-2", activeClass)}
                                disabled={isAbsent}
                                onClick={() => setCompletionStatus(index, status)}
                                size="sm"
                                type="button"
                              >
                                {COMPLETION_STATUS_LABELS[status]}
                              </Button>
                            );
                          })}
                        </div>
                        {isAbsent ? (
                          <p className="mt-1 text-[10px] text-muted-foreground italic">
                            Absent (Completion status disabled)
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          onClick={() => toggleExpandedRow(index)}
                          size="xs"
                          type="button"
                          variant="ghost"
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? "Hide notes" : "Edit notes"}
                        </Button>
                        <p className="mt-1 text-[10px] text-muted-foreground pl-1.5">
                          {row?.remarkTags.length
                            ? `${row.remarkTags.length} tags`
                            : row?.remarks
                              ? "Custom remark"
                              : "No remarks"}
                        </p>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="border-t border-dashed border-border/40 bg-neutral-50/15">
                        <td className="px-4 py-4" colSpan={4}>
                          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Tags</p>
                              <div className="flex flex-wrap gap-1.5">
                                {REMARK_TAGS.map((tag) => {
                                  const selected = row?.remarkTags.includes(tag);

                                  return (
                                    <Button
                                      key={tag}
                                      onClick={() => toggleTag(index, tag)}
                                      size="xs"
                                      type="button"
                                      variant={selected ? "default" : "outline"}
                                      className="text-xs rounded shadow-none"
                                    >
                                      {tag}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom Remark</label>
                              <Textarea
                                className="min-h-16 text-xs"
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 rounded-lg border border-border bg-card/95 backdrop-blur-xs p-4 shadow-md animate-in fade-in duration-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="neutral" className="px-2 py-0.5">{students.length} students</Badge>
            <Badge variant="neutral" className="px-2 py-0.5">{dirtyRows} changed</Badge>
            <span className="flex items-center gap-1 select-none">
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
            <Button disabled={isPending} onClick={() => void onSubmit()} size="sm" className="text-xs">
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
      </div>
      {formState.errors.records?.root ? (
        <p className="text-xs text-rose-600 font-semibold">{formState.errors.records.root.message}</p>
      ) : null}
    </div>
  );
}
