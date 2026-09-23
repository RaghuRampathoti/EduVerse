import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SCHEDULE = [
  { time: "08:30 - 09:20 AM", subject: "Quantum Mechanics", section: "MSc Physics · Sec A", room: "Lab 204", students: 32 },
  { time: "09:30 - 10:20 AM", subject: "Thermodynamics", section: "BSc Physics · Sec B", room: "Hall 3", students: 48 },
  { time: "11:00 - 11:50 AM", subject: "Electromagnetism", section: "MSc Physics · Sec B", room: "Room 102", students: 28 },
  { time: "02:00 - 02:50 PM", subject: "Statistical Mechanics", section: "BSc Physics · Sec A", room: "Lab 105", students: 45 },
];

export default function FacultyTimetablePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable"
        description="Your daily and weekly teaching schedule"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Today's Teaching Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SCHEDULE.map((slot, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border bg-card hover:bg-muted/30 transition-colors gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{slot.subject}</h4>
                  <p className="text-xs text-muted-foreground">{slot.section}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground sm:self-center">
                <span className="flex items-center gap-1 font-mono font-medium text-foreground bg-muted px-2 py-1 rounded">
                  {slot.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {slot.room}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {slot.students}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
