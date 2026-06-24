import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClassForm } from "@/features/classes/components/class-form";
import { listClassesOverview } from "@/features/classes/queries";
import { formatShortDate } from "@/lib/format";

export default async function ClassesPage() {
  const classes = await listClassesOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Setup"
        title="Classes"
        description="Create teaching groups, monitor roster size, and jump into the day’s work from one place."
      />
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle>Create class</CardTitle>
          <CardDescription>
            Keep class setup fast so notebook tracking stays front and center.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClassForm />
        </CardContent>
      </Card>
      <section className="grid gap-4 lg:grid-cols-2">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="bg-white/90">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{classItem.name}</CardTitle>
                  <CardDescription>{classItem.academicYear}</CardDescription>
                </div>
                <Badge variant="neutral">{classItem.activeStudentCount} active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-muted/30 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Students
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{classItem.studentCount}</p>
                </div>
                <div className="rounded-2xl bg-muted/30 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Topics
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{classItem.topicCount}</p>
                </div>
                <div className="rounded-2xl bg-muted/30 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Last check
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {formatShortDate(classItem.latestCheckDate)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href={`/classes/${classItem.id}`}>Open class workspace</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/classes/${classItem.id}`}>Manage students</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
