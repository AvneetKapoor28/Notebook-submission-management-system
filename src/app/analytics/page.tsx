import { PageHeader } from "@/components/app/page-header";
import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";
import { getAnalyticsData } from "@/features/analytics/queries";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[{ label: "Analytics" }, { label: "Overview" }]}
        emoji="📊"
        title="Analytics"
        description="Submission rates, completion quality, and student performance across all your classes."
      />
      <AnalyticsCharts
        kpis={data.kpis}
        classSeries={data.classSeries}
        submissionDistribution={data.submissionDistribution}
        completionDistribution={data.completionDistribution}
        chapterSeries={data.chapterSeries}
        problematicTopics={data.problematicTopics}
      />
    </div>
  );
}
