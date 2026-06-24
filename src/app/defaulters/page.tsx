import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { DefaultersFilter } from "@/features/defaulters/components/defaulters-filter";
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[{ label: "Attention Queue" }, { label: "Defaulters" }]}
        emoji="🚨"
        title="Defaulters"
        description="Students crossing active thresholds for missing work, lateness, or correction-heavy history."
      />
      <Card className="shadow-none border-border/80 bg-card/40">
        <CardContent className="p-4">
          <DefaultersFilter
            classes={data.classes}
            selectedClassId={selectedClassId}
          />
        </CardContent>
      </Card>
      <DefaultersTable data={filtered} />
    </div>
  );
}
