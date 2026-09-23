import React, { useEffect, useState } from "react";
import { BarChart2, Download, Users, Wallet, GraduationCap, Calendar, Building2 } from "lucide-react";
import { institutionApi } from "@/api/institution";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";

export default function SuperAdminReportsPage() {
  const { toast } = useToast();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    institutionApi.getMine()
      .then(({ data }) => setOrg(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const reportList = [
    { id: "REP-01", title: "Student Admissions & Roster Report", category: "STUDENTS", icon: GraduationCap, value: org?.studentCount || 0, label: "Total Students Enrolled" },
    { id: "REP-02", title: "Faculty & Staff Utilization Report", category: "STAFF", icon: Users, value: org?.facultyCount || 0, label: "Active Faculty Members" },
    { id: "REP-03", title: "Campus & Branch Status Summary", category: "INSTITUTION", icon: Building2, value: org?.name || "N/A", label: "Institution Name" },
    { id: "REP-04", title: "Fee Collection & Revenue Summary", category: "FINANCE", icon: Wallet, value: `${org?.maxStudents || 0} capacity`, label: "Max Student Capacity" },
  ];

  function handleDownload(title) {
    toast({ title: "Generating Report", description: `Preparing ${title}...`, variant: "success" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Reports & Analytics"
        description="Institution-level reports for admissions, attendance, finance, and staff activity"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={org?.studentCount || 0} icon={GraduationCap} accent="primary" />
        <StatCard label="Total Faculty" value={org?.facultyCount || 0} icon={Users} accent="info" />
        <StatCard label="Institution Status" value={org?.status || "ACTIVE"} icon={Building2} accent="success" />
        <StatCard label="Student Capacity" value={`${org?.studentCount || 0} / ${org?.maxStudents || 0}`} icon={Calendar} accent="warning" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportList.map((r) => (
          <Card key={r.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">{r.category}</span>
                <r.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base mt-2">{r.title}</CardTitle>
              <CardDescription className="text-xs">{r.label}: <strong className="text-foreground">{r.value}</strong></CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload(r.title)}>
                <Download className="h-3.5 w-3.5" /> Export Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
