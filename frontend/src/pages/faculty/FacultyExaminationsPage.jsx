import React from "react";
import { Award, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EXAMS = [
  { id: 1, name: "Mid-Term Examination 2026", subject: "Quantum Mechanics", date: "15 Aug 2026", time: "09:00 AM - 12:00 PM", hall: "Exam Hall A" },
  { id: 2, name: "Practical Assessment", subject: "Thermodynamics", date: "18 Aug 2026", time: "01:30 PM - 04:30 PM", hall: "Physics Lab 2" },
];

export default function FacultyExaminationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        description="Exam schedules, invigilation duties, and evaluation management"
      />

      <div className="space-y-3">
        {EXAMS.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold">{exam.name}</h4>
                  <p className="text-xs text-muted-foreground">{exam.subject} • {exam.hall}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {exam.date}</span>
                <span className="flex items-center gap-1 font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">{exam.time}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
