import React from "react";
import { BarChart2, Download, FileSpreadsheet, Users, Wallet, GraduationCap, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";

export default function AdminReportsPage() {
  const { toast } = useToast();

  const reportList = [
    { id: "REP-01", title: "Student Admissions & Roster Report", category: "STUDENTS", format: "CSV / PDF" },
    { id: "REP-02", title: "Monthly Class Attendance Summary", category: "ATTENDANCE", format: "PDF / EXCEL" },
    { id: "REP-03", title: "Fee Collection & Overdue Dues Statement", category: "FINANCE", format: "EXCEL" },
    { id: "REP-04", title: "Examination Performance & Grade Analysis", category: "EXAMS", format: "PDF" },
    { id: "REP-05", title: "Faculty Teaching Hours & Payroll Report", category: "STAFF", format: "EXCEL" },
  ];

  function handleDownload(title) {
    toast({ title: "Downloading Report", description: `Generating ${title}...`, variant: "success" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics Center"
        description="Filterable operational and financial reports for admissions, attendance, fees, examinations, and staff performance"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportList.map((r) => (
          <Card key={r.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {r.category}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{r.format}</span>
              </div>
              <CardTitle className="text-base mt-2">{r.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleDownload(r.title)}>
                <Download className="h-3.5 w-3.5" /> Download Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
