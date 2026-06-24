"use client";

import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormMessage } from "@/components/app/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importStudentsAction } from "@/features/students/actions";

type CsvRow = {
  rollNumber: number;
  name: string;
};

export function StudentImportForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [previewCount, setPreviewCount] = useState(0);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [isPending, startTransition] = useTransition();

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setRows([]);
      setPreviewCount(0);
      return;
    }

    const result = await new Promise<Papa.ParseResult<string[]>>((resolve) => {
      Papa.parse<string[]>(file, {
        skipEmptyLines: true,
        complete: resolve,
      });
    });

    const parsedRows = result.data.slice(1).map((row) => ({
      rollNumber: Number(row[0]),
      name: (row[1] ?? "").trim(),
    }));

    if (!parsedRows.length) {
      setError("CSV did not contain any student rows.");
      setRows([]);
      return;
    }

    setRows(parsedRows);
    setPreviewCount(parsedRows.length);
    setError(undefined);
  }

  function handleImport() {
    if (!rows.length) {
      setError("Choose a CSV file first.");
      return;
    }

    startTransition(async () => {
      const result = await importStudentsAction({
        classId,
        rows,
      });

      if (!result.ok) {
        toast.error(result.message);
        setError(result.message);
        return;
      }

      toast.success(result.message);
      setRows([]);
      setPreviewCount(0);
      setError(undefined);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student-csv">Import CSV</Label>
        <Input
          id="student-csv"
          accept=".csv,text/csv"
          onChange={onFileChange}
          type="file"
        />
        <p className="text-sm text-muted-foreground">
          Expected columns: <span className="font-medium">Roll Number, Student Name</span>
        </p>
        <FormMessage message={error} />
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {previewCount ? `${previewCount} rows ready to import.` : "No file loaded yet."}
        </p>
        <Button disabled={isPending || !rows.length} onClick={handleImport} type="button">
          {isPending ? "Importing..." : "Import students"}
        </Button>
      </div>
    </div>
  );
}
