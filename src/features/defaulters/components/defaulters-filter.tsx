"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

type ClassItem = {
  id: string;
  name: string;
};

export function DefaultersFilter({
  classes,
  selectedClassId,
}: {
  classes: ClassItem[];
  selectedClassId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("classId", value);
    } else {
      params.delete("classId");
    }
    router.push(`/defaulters?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-1.5 md:max-w-xs">
      <label
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        htmlFor="class-filter"
      >
        Filter by class
      </label>
      <Select
        value={selectedClassId}
        id="class-filter"
        name="classId"
        onChange={handleChange}
      >
        <option value="">All classes</option>
        {classes.map((classItem) => (
          <option key={classItem.id} value={classItem.id}>
            {classItem.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
