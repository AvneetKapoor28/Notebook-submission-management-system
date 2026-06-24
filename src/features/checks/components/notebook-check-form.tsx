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

export function NotebookCheckForm({
  topicId,
  students,
}: {
  topicId: string;
  students: Student[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeRow, setActiveRow] = useState(0);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const defaultValues = useMemo<NotebookCheckFormValues>(
    () => ({
      topicId,
      checkDate: new Date().toISOString().slice(0, 10),
      records: students.map((student) => ({
        studentId: student.id,
        submissionStatus: "SUBMITTED",
        completionStatus: "COMPLETE",
        remarkTags: [],
        remarks: null,
      })),
    }),
    [students, topicId],
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
      router.push(`/checks/${result.data?.checkId}`);
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

      <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-white/90 p-5 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="check-date">
              Check date
            </label>
            <Input id="check-date" type="date" {...form.register("checkDate")} />
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-2 lg:justify-end">
          <Button onClick={markAllSubmitted} type="button" variant="outline">
            Mark all submitted
          </Button>
          <Button onClick={markAllComplete} type="button" variant="outline">
            Mark all complete
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-white/95 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.32)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50/90">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Submission
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Completion
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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
                        "border-t border-border/70 align-top",
                        isActive && "bg-emerald-50/70",
                      )}
                      onClick={() => setActiveRow(index)}
                      tabIndex={0}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={isActive ? "green" : "neutral"}>
                            {students[index].rollNumber}
                          </Badge>
                          <div>
                            <p className="font-medium text-foreground">
                              {students[index].name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Shortcuts: 1-5, QWER, Enter
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {SUBMISSION_STATUSES.map((status) => (
                            <Button
                              key={status}
                              className="min-w-28"
                              onClick={() => setSubmissionStatus(index, status)}
                              size="sm"
                              type="button"
                              variant={
                                row?.submissionStatus === status ? "default" : "outline"
                              }
                            >
                              {SUBMISSION_STATUS_LABELS[status]}
                            </Button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {COMPLETION_STATUSES.map((status) => (
                            <Button
                              key={status}
                              className="min-w-28"
                              disabled={isAbsent}
                              onClick={() => setCompletionStatus(index, status)}
                              size="sm"
                              type="button"
                              variant={
                                row?.completionStatus === status ? "default" : "outline"
                              }
                            >
                              {COMPLETION_STATUS_LABELS[status]}
                            </Button>
                          ))}
                        </div>
                        {isAbsent ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Completion is disabled for absent students.
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          onClick={() => toggleExpandedRow(index)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          {isExpanded ? "Hide notes" : "Edit notes"}
                        </Button>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {row?.remarkTags.length
                            ? `${row.remarkTags.length} tags selected`
                            : row?.remarks
                              ? "Custom remark added"
                              : "No remarks yet"}
                        </p>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="border-t border-dashed border-border/70 bg-muted/10">
                        <td className="px-4 py-4" colSpan={4}>
                          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-3">
                              <p className="text-sm font-medium">Quick tags</p>
                              <div className="flex flex-wrap gap-2">
                                {REMARK_TAGS.map((tag) => {
                                  const selected = row?.remarkTags.includes(tag);

                                  return (
                                    <Button
                                      key={tag}
                                      onClick={() => toggleTag(index, tag)}
                                      size="sm"
                                      type="button"
                                      variant={selected ? "default" : "outline"}
                                    >
                                      {tag}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-medium">Custom remark</label>
                              <Textarea
                                className="min-h-28"
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

      <div className="sticky bottom-4 z-10 rounded-[2rem] border border-border/70 bg-white/95 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="neutral">{students.length} students</Badge>
            <Badge variant="neutral">{dirtyRows} rows changed</Badge>
            <span>
              Last autosave:{" "}
              {lastAutosavedAt
                ? new Date(lastAutosavedAt).toLocaleTimeString()
                : "Not saved yet"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={persistDraft} type="button" variant="outline">
              Save draft now
            </Button>
            <Button disabled={isPending} onClick={() => void onSubmit()} type="button">
              {isPending ? "Saving check..." : "Submit notebook check"}
            </Button>
          </div>
        </div>
      </div>
      {formState.errors.records?.root ? (
        <p className="text-sm text-rose-600">{formState.errors.records.root.message}</p>
      ) : null}
    </div>
  );
}
