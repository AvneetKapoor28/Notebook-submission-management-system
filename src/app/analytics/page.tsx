import { PageHeader } from "@/components/app/page-header";
import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";
import { getAnalyticsData } from "@/features/analytics/queries";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        breadcrumbs={[{ label: "Analytics" }, { label: "Outcome trends" }]}
        emoji="📊"
        title="Outcome trends"
        description="View reports of how classes and topics are performing over time."
      />
      <AnalyticsCharts
        classSeries={data.classSeries}
        problematicTopics={data.problematicTopics}
      />
    </div>
  );
}
