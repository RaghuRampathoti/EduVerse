import React from "react";
import { FileText, Calendar, CheckCircle2, Clock, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ASSIGNMENTS = [
  { id: 1, title: "Quantum Tunneling Problems", subject: "Quantum Mechanics", section: "MSc Physics A", dueDate: "10 Aug 2026", submitted: "28/32", status: "Active" },
  { id: 2, title: "Laws of Thermodynamics Lab Report", subject: "Thermodynamics", section: "BSc Physics B", dueDate: "12 Aug 2026", submitted: "40/48", status: "Active" },
  { id: 3, title: "Maxwell Equations Assignment", subject: "Electromagnetism", section: "MSc Physics B", dueDate: "15 Aug 2026", submitted: "15/28", status: "Active" },
];

export default function FacultyAssignmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Manage and review coursework assignments"
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add New Assignment
          </Button>
        }
      />

      <div className="space-y-3">
        {ASSIGNMENTS.map((asgn) => (
          <Card key={asgn.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold">{asgn.title}</h4>
                    <Badge variant="secondary" className="text-xs">{asgn.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {asgn.subject} • {asgn.section}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Due: {asgn.dueDate}
                </span>
                <span className="flex items-center gap-1 font-semibold text-foreground bg-muted px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {asgn.submitted} Submitted
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
