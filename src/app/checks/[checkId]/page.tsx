import { notFound, redirect } from "next/navigation";

import { getNotebookCheckDetail } from "@/features/checks/queries";

export default async function NotebookCheckDetailPage({
  params,
}: {
  params: Promise<{ checkId: string }>;
}) {
  const { checkId } = await params;
  const check = await getNotebookCheckDetail(checkId);

  if (!check) {
    notFound();
  }

  redirect(`/classes/${check.topic.class.id}/topics/${check.topic.id}`);
}
