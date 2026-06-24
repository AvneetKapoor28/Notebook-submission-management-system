import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotebookCheckForm } from "@/features/checks/components/notebook-check-form";
import { getNotebookCheckSetup } from "@/features/checks/queries";
import { formatShortDate } from "@/lib/format";

export default async function NewNotebookCheckPage({
  params,
}: {
  params: Promise<{ classId: string; topicId: string }>;
}) {
  const { classId, topicId } = await params;
  const setup = await getNotebookCheckSetup(topicId);

  if (!setup || setup.topic.class.id !== classId) {
    notFound();
  }

  const hasExistingCheck = !!setup.topic.notebookCheck;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[
          { label: "Classes", href: "/classes" },
          { label: setup.topic.class.name, href: `/classes/${classId}` },
          { label: setup.topic.title, href: `/classes/${classId}/topics/${topicId}` },
          { label: hasExistingCheck ? "Edit Check" : "New Check" }
        ]}
        emoji="✍️"
        title={hasExistingCheck ? `Edit check: ${setup.topic.title}` : `Notebook check: ${setup.topic.title}`}
        description={
          setup.topic.notebookCheck
            ? `Last checked on ${formatShortDate(setup.topic.notebookCheck.checkDate)}. Update records and submit when finished.`
            : `Taught on ${formatShortDate(setup.topic.dateTaught)}. Capture the whole class fast, recover safely if the tab closes, and submit once.`
        }
      />
      <Card className="shadow-none border-border/80 bg-card">
        <CardHeader className="p-5">
          <CardTitle className="text-base font-semibold">Roster entry</CardTitle>
          <CardDescription className="text-xs">
            Defaults assume most students submitted and completed the work. Change only exceptions to stay under the 60-second target.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <NotebookCheckForm
            students={setup.students}
            topicId={topicId}
            existingCheck={setup.topic.notebookCheck}
          />
        </CardContent>
      </Card>
    </div>
  );
}
