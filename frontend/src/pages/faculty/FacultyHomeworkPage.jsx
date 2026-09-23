import React from "react";
import { FileEdit, Calendar, AlertCircle, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HOMEWORK_ITEMS = [
  { id: 1, title: "Chapter 4 Numerical Exercises", subject: "Quantum Mechanics", section: "MSc Physics A", dueDate: "Tomorrow", pending: 3 },
  { id: 2, title: "Heat Capacity Calculations", subject: "Thermodynamics", section: "BSc Physics B", dueDate: "08 Aug 2026", pending: 5 },
];

export default function FacultyHomeworkPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework"
        description="Daily homework tasks and tracking"
        action={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Assign Homework
          </Button>
        }
      />

      <div className="space-y-3">
        {HOMEWORK_ITEMS.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <FileEdit className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.subject} • {item.section}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {item.dueDate}</span>
                <span className="flex items-center gap-1 text-amber-600 font-medium"><AlertCircle className="h-3.5 w-3.5" /> {item.pending} pending review</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
