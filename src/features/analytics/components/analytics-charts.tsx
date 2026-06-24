"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsCharts({
  classSeries,
  problematicTopics,
}: {
  classSeries: Array<{
    name: string;
    submissionRate: number;
    completionRate: number;
    topicCount: number;
  }>;
  problematicTopics: Array<{
    name: string;
    issueCount: number;
    className: string;
  }>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="bg-white/90 dark:bg-card/75">
        <CardHeader>
          <CardTitle>Class performance</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classSeries}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="submissionRate" fill="#15803d" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completionRate" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-white/90 dark:bg-card/75">
        <CardHeader>
          <CardTitle>Most problematic topics</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={problematicTopics}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="issueCount" fill="#b45309" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
