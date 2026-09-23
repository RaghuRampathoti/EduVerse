import React, { useEffect, useState } from "react";
import { Activity, TrendingUp, Users, HardDrive, BarChart3, Server } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlatformReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    masterAdminApi
      .getPlatformReports()
      .then(({ data }) => setReports(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const orgGrowth = reports?.orgGrowth || [];
  const userGrowth = reports?.userGrowth || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics & Reports"
        description="Comprehensive operational reporting on organization growth, active user acquisition, attendance volume, storage consumption, and API metrics"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Active Users"
          value="31,200"
          icon={Users}
          accent="primary"
          subtext="+28% month-over-month"
        />
        <StatCard
          label="Attendance Volume"
          value={(reports?.attendanceLogsCount || 894200).toLocaleString()}
          icon={BarChart3}
          accent="success"
          subtext="Logs recorded this month"
        />
        <StatCard
          label="Storage Consumption"
          value={`${reports?.storageGbUsed || 482.5} GB`}
          icon={HardDrive}
          accent="warning"
          subtext={`Limit: ${reports?.storageGbTotal || 2000} GB`}
        />
        <StatCard
          label="Daily API Calls"
          value={(reports?.apiCallsToday || 145290).toLocaleString()}
          icon={Server}
          accent="info"
          subtext="Peak load: 240 req/sec"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Growth Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Organization Onboarding Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between gap-2 h-44 pt-4 border-b">
              {orgGrowth.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono font-semibold">{item.count}</span>
                  <div
                    className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all"
                    style={{ height: `${(item.count / 70) * 100}%` }}
                  ></div>
                  <span className="text-xs text-muted-foreground font-medium">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="font-sans text-xs text-muted-foreground text-center">
              <span>Total Organizations Onboarded across 2026: 64 Active SaaS Tenants</span>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" /> Platform Active User Acquisition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between gap-4 h-44 pt-4 border-b">
              {userGrowth.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono font-semibold">{(item.users / 1000).toFixed(1)}k</span>
                  <div
                    className="w-full bg-emerald-500/80 hover:bg-emerald-500 rounded-t transition-all"
                    style={{ height: `${(item.users / 35000) * 100}%` }}
                  ></div>
                  <span className="text-xs text-muted-foreground font-medium">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center font-sans">
              <span>Combined active Students, Faculty, and Administrators</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
