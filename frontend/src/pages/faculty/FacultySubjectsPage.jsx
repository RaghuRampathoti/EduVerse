import React from "react";
import { BookOpen, Users, Clock, Award } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SUBJECTS = [
  { id: 1, name: "Quantum Mechanics", code: "PHY-301", classSection: "MSc Physics - Sec A", students: 32, credits: 4, schedule: "Mon, Wed 08:30 AM" },
  { id: 2, name: "Thermodynamics", code: "PHY-204", classSection: "BSc Physics - Sec B", students: 48, credits: 3, schedule: "Tue, Thu 09:30 AM" },
  { id: 3, name: "Electromagnetism", code: "PHY-402", classSection: "MSc Physics - Sec B", students: 28, credits: 4, schedule: "Mon, Fri 11:00 AM" },
  { id: 4, name: "Statistical Mechanics", code: "PHY-305", classSection: "BSc Physics - Sec A", students: 45, credits: 3, schedule: "Wed, Fri 02:00 PM" },
];

export default function FacultySubjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Subjects"
        description="Courses and subjects assigned for current academic period"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUBJECTS.map((sub) => (
          <Card key={sub.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-1 text-primary border-primary/30">
                    {sub.code}
                  </Badge>
                  <CardTitle className="text-lg font-bold">{sub.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{sub.classSection}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {sub.students} Students
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> {sub.credits} Credits
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {sub.schedule}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
