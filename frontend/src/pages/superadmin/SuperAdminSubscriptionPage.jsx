import React, { useEffect, useState } from "react";
import { CreditCard, ShieldCheck, Users, HardDrive, Check, ArrowUpRight } from "lucide-react";
import { institutionApi } from "@/api/institution";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SuperAdminSubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);

  useEffect(() => {
    institutionApi
      .getMine()
      .then(({ data }) => setOrg(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const planName = org?.maxStudents > 5000 ? "Enterprise Plan" : org?.maxStudents > 1000 ? "Premium Plan" : "Standard Plan";
  const studentLimit = org?.maxStudents || 1000;
  const currentStudents = org?.studentCount || 0;
  const currentFaculty = org?.facultyCount || 0;
  const facultyLimit = Math.round(studentLimit / 10);
  const studentUsagePercent = Math.min(100, Math.round((currentStudents / studentLimit) * 100));

  const includedModules = [
    "Core Attendance & Leave Management",
    "Classes, Sections & Timetable Engine",
    "Student & Staff Profiles",
    "Fee Collections & Online Payments",
    "Announcements & Broadcast Notices",
    "Examinations & Report Cards",
    "Performance Analytics",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription & Capacity Limits"
        description="Monitor your organization's subscription plan, student allocation caps, faculty limits, and active platform entitlements"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Subscription Plan"
          value={planName}
          icon={CreditCard}
          accent="primary"
          subtext="Annual Auto-Renewal Active"
        />
        <StatCard
          label="Student Capacity Used"
          value={`${currentStudents} / ${studentLimit}`}
          icon={Users}
          accent="info"
          subtext={`${studentUsagePercent}% of capacity filled`}
        />
        <StatCard
          label="Faculty Limit"
          value={`${currentFaculty} / ${facultyLimit}`}
          icon={Users}
          accent="success"
          subtext="Assigned across branches"
        />
        <StatCard
          label="Storage Allocated"
          value="45.2 GB / 500 GB"
          icon={HardDrive}
          accent="warning"
          subtext="Cloud Backup Active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Plan & Limits Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Plan Capacity & Resource Quotas
            </CardTitle>
            <CardDescription>
              Resource allocation for {org?.name || "your organization"} across all active branches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Student Admissions Progress</span>
                <span className="font-mono font-bold text-primary">{currentStudents} / {studentLimit} Students ({studentUsagePercent}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${studentUsagePercent}%` }}
                ></div>
              </div>
            </div>

            {/* Quota details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t text-sm">
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs text-muted-foreground font-medium">Max Institutions / Branches</p>
                <p className="text-lg font-bold text-foreground mt-0.5">Unlimited Branches</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs text-muted-foreground font-medium">Organization Super Admin Logins</p>
                <p className="text-lg font-bold text-foreground mt-0.5">Primary & Backup Super Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enabled Entitlements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Active Platform Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {includedModules.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium p-2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{m}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
