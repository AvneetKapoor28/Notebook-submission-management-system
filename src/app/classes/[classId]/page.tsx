import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import { getClassDetail } from "@/features/classes/queries";
import { ClassDashboard } from "@/features/classes/components/class-dashboard";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const classItem = await getClassDetail(classId);

  if (!classItem) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[{ label: "Classes", href: "/classes" }, { label: classItem.name }]}
        emoji="🏫"
        title={classItem.name}
        description={`Academic year ${classItem.academicYear}. Manage the roster, create topics, and start checks without leaving the workflow.`}
      />

      <ClassDashboard classItem={classItem} />
    </div>
  );
}
