import { PageHeader } from "@/components/app/page-header";
import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";
import { getAnalyticsData } from "@/features/analytics/queries";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Outcome trends"
        description="Charts are phase-three polish, but these reports already expose which classes and topics are struggling."
      />
      <AnalyticsCharts
        classSeries={data.classSeries}
        problematicTopics={data.problematicTopics}
      />
    </div>
  );
}
