import React from "react";
import { Layers, BookOpen, Clock, CheckCircle, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LESSON_PLANS = [
  { id: 1, topic: "Chapter 7: Wave Mechanics & Optics", subject: "Quantum Mechanics", duration: "2 Weeks", status: "In Progress" },
  { id: 2, topic: "Chapter 3: Entropy & Reversibility", subject: "Thermodynamics", duration: "1 Week", status: "Completed" },
];

export default function FacultyLessonPlansPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson Plans"
        description="Structured syllabus & lesson plan manager"
        action={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Lesson Plan
          </Button>
        }
      />

      <div className="space-y-3">
        {LESSON_PLANS.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{plan.topic}</h4>
                  <p className="text-xs text-muted-foreground">{plan.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {plan.duration}</span>
                <Badge variant={plan.status === "Completed" ? "outline" : "default"}>{plan.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
