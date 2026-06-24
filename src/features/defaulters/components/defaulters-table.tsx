"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";

type DefaulterRow = {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  missingCount: number;
  lateCount: number;
  incompleteCount: number;
  correctionCount: number;
  reasons: string[];
};

const columnHelper = createColumnHelper<DefaulterRow>();

const columns: ColumnDef<DefaulterRow, any>[] = [
  columnHelper.accessor("studentName", {
    header: "Student",
    cell: (info) => (
      <Link
        className="font-medium text-foreground hover:text-emerald-700"
        href={`/students/${info.row.original.studentId}`}
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("className", {
    header: "Class",
  }),
  columnHelper.accessor("missingCount", {
    header: "Missing",
  }),
  columnHelper.accessor("lateCount", {
    header: "Late",
  }),
  columnHelper.accessor("correctionCount", {
    header: "Corrections",
  }),
  columnHelper.accessor("reasons", {
    header: "Reasons",
    cell: (info) => (
      <div className="flex flex-wrap gap-2">
        {(info.getValue() as string[]).map((reason: string) => (
          <Badge key={reason} variant="yellow">
            {reason}
          </Badge>
        ))}
      </div>
    ),
  }),
];

export function DefaultersTable({ data }: { data: DefaulterRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
