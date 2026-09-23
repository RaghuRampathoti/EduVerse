import React from "react";
import { BarChart2, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const REPORTS = [
  { id: 1, name: "Attendance_Report_Jul_2026.pdf", type: "Monthly Attendance", generated: "01 Aug 2026" },
  { id: 2, name: "MidTerm_Performance_Summary.xlsx", type: "Class Grades", generated: "28 Jul 2026" },
];

export default function FacultyReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate, export and download official academic reports"
      />

      <div className="space-y-3">
        {REPORTS.map((rep) => (
          <Card key={rep.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{rep.name}</h4>
                  <p className="text-xs text-muted-foreground">{rep.type} • Generated {rep.generated}</p>
                </div>
              </div>
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
