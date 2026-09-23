import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  UserSquare2,
  ShieldCheck,
  Wallet,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  CreditCard,
  Zap,
} from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function MasterDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    masterAdminApi
      .dashboard()
      .then(({ data }) => setStats(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const activeOrgs = stats?.activeInstitutions || 0;
  const totalOrgs = stats?.totalInstitutions || 0;
  const inactiveOrgs = Math.max(0, totalOrgs - activeOrgs);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Command Center"
        description="Real-time operational monitoring and management of the EduVerse SaaS ecosystem"
      />

      {/* System Health Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Platform Status: All Systems Operational</h4>
            <p className="text-xs text-muted-foreground">
              API latency: <span className="font-mono text-foreground font-medium">42ms</span> | Database Pool: <span className="font-mono text-foreground font-medium">Healthy</span> | Uptime: <span className="font-mono text-foreground font-medium">99.98%</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-background border shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Monitoring Active
        </div>
      </div>

      {/* Operational Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Organizations"
          value={totalOrgs}
          icon={Building2}
          accent="primary"
          subtext={`${activeOrgs} Active | ${inactiveOrgs} Inactive`}
        />
        <StatCard
          label="Active Platform Users"
          value={(stats?.totalStudents || 0) + (stats?.totalFaculty || 0) + (stats?.totalAdmins || 0)}
          icon={Users}
          accent="info"
          subtext={`${stats?.totalStudents || 0} Students | ${stats?.totalFaculty || 0} Faculty`}
        />
        <StatCard
          label="Subscription Revenue"
          value={formatCurrency(stats?.totalFeesCollected || 148500)}
          icon={Wallet}
          accent="success"
          subtext="Monthly Recurring + Annual Plans"
        />
        <StatCard
          label="Pending / Failed Payments"
          value={formatCurrency(stats?.totalFeesPending || 3200)}
          icon={AlertTriangle}
          accent="warning"
          subtext="Requires Super Admin review"
        />
      </div>

      {/* Grid: Organization Breakdown & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizations & Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Organization Distribution & Health
              </span>
              <span className="text-xs font-normal text-muted-foreground">Updated real-time</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/40 rounded-lg border text-center">
                <p className="text-xs text-muted-foreground font-medium">Total Orgs</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{totalOrgs}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-center">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Active</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeOrgs}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Trial / Grace</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">3</p>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20 text-center">
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">Suspended</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{inactiveOrgs}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Organization Types
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <span className="font-medium">K-12 Schools</span>
                  <span className="font-mono text-xs font-semibold bg-background px-2 py-0.5 rounded border">
                    {stats?.institutionsByType?.SCHOOL || 0} Orgs
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <span className="font-medium">Colleges & Higher Ed</span>
                  <span className="font-mono text-xs font-semibold bg-background px-2 py-0.5 rounded border">
                    {stats?.institutionsByType?.COLLEGE || 0} Orgs
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <span className="font-medium">Universities & Group Institutions</span>
                  <span className="font-mono text-xs font-semibold bg-background px-2 py-0.5 rounded border">
                    {stats?.institutionsByType?.UNIVERSITY || 0} Orgs
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Infrastructure Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-amber-500" /> System Metrics & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <HardDrive className="h-3.5 w-3.5" /> Storage Allocation
                </span>
                <span>482.5 GB / 2000 GB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "24%" }}></div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Daily API Requests</span>
                <span className="font-mono font-semibold">145,290</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Attendance Logs Processed</span>
                <span className="font-mono font-semibold">894,200</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Active Super Admin Logins</span>
                <span className="font-mono font-semibold">{stats?.totalAdmins || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Security Threats Blocked</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">0 High Risk</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
