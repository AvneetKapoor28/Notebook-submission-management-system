"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/app/data-table";
import { Badge } from "@/components/ui/badge";
import { StudentStatusToggle } from "@/features/students/components/student-status-toggle";

type StudentRow = {
  id: string;
  rollNumber: number;
  name: string;
  isActive: boolean;
};

const columnHelper = createColumnHelper<StudentRow>();

const columns: ColumnDef<StudentRow, any>[] = [
  columnHelper.accessor("rollNumber", {
    header: "Roll",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("name", {
    header: "Student",
    cell: (info) => (
      <Link
        className="font-medium text-foreground hover:text-emerald-700"
        href={`/students/${info.row.original.id}`}
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("isActive", {
    header: "Status",
    cell: (info) =>
      info.getValue() ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <StudentStatusToggle
        isActive={info.row.original.isActive}
        studentId={info.row.original.id}
      />
    ),
  }),
];

export function StudentsTable({ data }: { data: StudentRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
