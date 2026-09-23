import React from "react";
import { TrendingUp, Users, Award, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";

export default function FacultyAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        description="Comprehensive insights on student performance, attendance & outcomes"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Avg. Class Performance" value="78%" icon={TrendingUp} accent="primary" />
        <StatCard label="Avg. Class Attendance" value="92%" icon={Users} accent="success" />
        <StatCard label="Top Performer Grade" value="A+ (98%)" icon={Award} accent="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Class Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl">
          Performance curve & grade distribution visualizer
        </CardContent>
      </Card>
    </div>
  );
}
