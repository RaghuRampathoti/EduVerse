import React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FacultyCalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Academic calendar, events, holidays & institutional deadlines"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" /> August 2026 Academic Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg border flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Independence Day Cultural Event</p>
              <p className="text-xs text-muted-foreground">Main Auditorium</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-muted rounded">15 Aug 2026</span>
          </div>
          <div className="p-3 rounded-lg border flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Faculty Staff Meeting</p>
              <p className="text-xs text-muted-foreground">Conference Hall B</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-muted rounded">20 Aug 2026</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
