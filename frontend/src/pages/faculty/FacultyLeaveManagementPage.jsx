import React from "react";
import { CalendarOff, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LEAVES = [
  { id: 1, type: "Casual Leave", dates: "24 Aug 2026", reason: "Family Function", status: "Approved" },
  { id: 2, type: "Medical Leave", dates: "02 Sep - 03 Sep 2026", reason: "Medical Checkup", status: "Pending" },
];

export default function FacultyLeaveManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Apply for leave and track leave approval status"
        action={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Apply for Leave
          </Button>
        }
      />

      <div className="space-y-3">
        {LEAVES.map((leave) => (
          <Card key={leave.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <CalendarOff className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{leave.type} ({leave.dates})</h4>
                  <p className="text-xs text-muted-foreground">{leave.reason}</p>
                </div>
              </div>
              <Badge variant={leave.status === "Approved" ? "outline" : "secondary"}>
                {leave.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
