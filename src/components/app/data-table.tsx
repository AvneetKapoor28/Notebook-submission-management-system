"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

export function DataTable<TData>({
  columns,
  data,
  maxHeightClass,
}: {
  columns: Array<ColumnDef<TData, any>>;
  data: TData[];
  maxHeightClass?: string;
}) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-white/80 dark:bg-card/75 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className={cn("overflow-x-auto", maxHeightClass)}>
        <Table className="relative border-collapse">
          <TableHeader className={cn(maxHeightClass && "sticky top-0 bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/40">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

