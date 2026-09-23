import React from "react";
import { Bell, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FacultySettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Faculty portal preferences and account security settings"
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-semibold">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive daily summaries for assignment submissions</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> Security & Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm">
              Change Account Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
