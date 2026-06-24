"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";

type StudentRow = {
  id: string;
  rollNumber: number;
  name: string;
  isActive: boolean;
  missedSubmissionsCount: number;
  incompleteSubmissionsCount: number;
};

const columnHelper = createColumnHelper<StudentRow>();

const columns: ColumnDef<StudentRow, any>[] = [
  columnHelper.accessor("rollNumber", {
    header: "Roll",
    cell: (info) => (
      <span className="text-[11px] font-mono font-medium text-muted-foreground/60 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md min-w-[24px] inline-block text-center shadow-sm shadow-black/[0.01]">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => (
      <Link
        className="font-semibold text-foreground hover:text-primary hover:underline transition-all text-xs md:text-sm"
        href={`/students/${info.row.original.id}`}
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("missedSubmissionsCount", {
    header: "Missed",
    cell: (info) => {
      const val = info.getValue();
      return val > 0 ? (
        <Badge variant="red">{val} missed</Badge>
      ) : (
        <span className="text-muted-foreground/45">—</span>
      );
    },
  }),
  columnHelper.accessor("incompleteSubmissionsCount", {
    header: "Incomplete",
    cell: (info) => {
      const val = info.getValue();
      return val > 0 ? (
        <Badge variant="orange">{val} incomplete</Badge>
      ) : (
        <span className="text-muted-foreground/45">—</span>
      );
    },
  }),
];

export function StudentsTable({
  data,
  maxHeightClass,
}: {
  data: StudentRow[];
  maxHeightClass?: string;
}) {
  return (
    <DataTable columns={columns} data={data} maxHeightClass={maxHeightClass} />
  );
}
