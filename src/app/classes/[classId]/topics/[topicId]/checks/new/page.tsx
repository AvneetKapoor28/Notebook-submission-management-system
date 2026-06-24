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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={setup.topic.class.name}
        title={`Notebook check: ${setup.topic.title}`}
        description={`Taught on ${formatShortDate(setup.topic.dateTaught)}. Capture the whole class fast, recover safely if the tab closes, and submit once.`}
      />
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle>Roster entry</CardTitle>
          <CardDescription>
            Defaults assume most students submitted and completed the work. Change only exceptions to stay under the 60-second target.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotebookCheckForm
            students={setup.students}
            topicId={topicId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
