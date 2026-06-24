import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { DefaultersTable } from "@/features/defaulters/components/defaulters-table";
import { getDefaultersData } from "@/features/defaulters/queries";

export default async function DefaultersPage({
  searchParams,
}: {
  searchParams?: Promise<{ classId?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const data = await getDefaultersData();
  const selectedClassId = params.classId ?? "";
  const filtered = selectedClassId
    ? data.defaulters.filter((student) => student.classId === selectedClassId)
    : data.defaulters;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Attention queue"
        title="Defaulters"
        description="Students crossing the current hardcoded thresholds for missing work, lateness, or correction-heavy history."
      />
      <Card className="bg-white/90">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-3 md:max-w-xs">
            <label className="text-sm font-medium" htmlFor="class-filter">
              Filter by class
            </label>
            <Select defaultValue={selectedClassId} id="class-filter" name="classId">
              <option value="">All classes</option>
              {data.classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </Select>
            <button className="hidden" type="submit" />
          </form>
        </CardContent>
      </Card>
      <DefaultersTable data={filtered} />
    </div>
  );
}
