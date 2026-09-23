import React from "react";
import { CheckSquare, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MARKS_SHEETS = [
  { id: 1, classSection: "MSc Physics - Sec A", subject: "Quantum Mechanics", exam: "Mid-Term 2026", status: "Pending Grading", totalStudents: 32 },
  { id: 2, classSection: "BSc Physics - Sec B", subject: "Thermodynamics", exam: "Quiz 2", status: "Published", totalStudents: 48 },
];

export default function FacultyMarksGradingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks & Grading"
        description="Enter marks, manage gradebooks and publish result cards"
        action={
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" /> Upload Grade Sheet
          </Button>
        }
      />

      <div className="space-y-3">
        {MARKS_SHEETS.map((sheet) => (
          <Card key={sheet.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{sheet.subject} - {sheet.exam}</h4>
                  <p className="text-xs text-muted-foreground">{sheet.classSection} • {sheet.totalStudents} Students</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                {sheet.status}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
