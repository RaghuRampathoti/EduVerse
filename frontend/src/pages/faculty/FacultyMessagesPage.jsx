import React from "react";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MESSAGES = [
  { id: 1, sender: "Martha Johnson (Parent)", topic: "Query regarding Alex's Mid-Term prep", time: "10 mins ago", unread: true },
  { id: 2, sender: "HOD Physics", topic: "Departmental Meeting scheduled for Friday", time: "1 hour ago", unread: true },
  { id: 3, sender: "Dean Academics", topic: "Syllabus Review Submission Reminder", time: "Yesterday", unread: false },
];

export default function FacultyMessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Communicate with parents, department heads, and students"
      />

      <div className="space-y-3">
        {MESSAGES.map((msg) => (
          <Card key={msg.id} className={msg.unread ? "border-primary/40 bg-primary/5" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">{msg.sender}</h4>
                    {msg.unread && <Badge className="text-[10px] px-1.5 py-0 h-4">New</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{msg.topic}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{msg.time}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
