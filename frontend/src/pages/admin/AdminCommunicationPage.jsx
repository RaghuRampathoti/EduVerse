import React, { useState } from "react";
import { MessageSquare, Send, Mail, PhoneCall, Bell, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/context/ToastContext";

export default function AdminCommunicationPage() {
  const { toast } = useToast();
  const [broadcasts, setBroadcasts] = useState([]);

  const [form, setForm] = useState({ title: "", channel: "EMAIL", group: "ALL_STUDENTS", content: "" });

  function handleSend(e) {
    e.preventDefault();
    const newB = {
      id: `COMM-${Date.now()}`,
      title: form.title,
      channel: form.channel,
      recipientGroup: form.group,
      sentAt: "Just now",
      status: "DELIVERED",
      count: 150,
    };
    setBroadcasts([newB, ...broadcasts]);
    toast({ title: "Broadcast Message Sent", description: `Dispatched to ${form.group} via ${form.channel}`, variant: "success" });
    setForm({ title: "", channel: "EMAIL", group: "ALL_STUDENTS", content: "" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Hub & Notifications"
        description="Dispatch Email, SMS, Push, and In-App notifications with template scheduling and delivery tracking"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Broadcast Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" /> Dispatch Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Notification Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Sports Day Notice" />
              </div>
              <div className="space-y-1.5">
                <Label>Channel *</Label>
                <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                  <option value="EMAIL">Email Broadcast</option>
                  <option value="SMS">SMS Alert</option>
                  <option value="IN_APP">In-App Notification</option>
                  <option value="PUSH">Mobile Push Notification</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Recipient Audience *</Label>
                <Select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
                  <option value="ALL_STUDENTS">All Enrolled Students</option>
                  <option value="ALL_FACULTY">All Faculty & Staff</option>
                  <option value="ALL_PARENTS">All Guardians / Parents</option>
                  <option value="GRADE_10">Grade 10 Only</option>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4" /> Send Broadcast Now
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Broadcast History & Delivery Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {broadcasts.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No broadcast notifications sent"
                description="Dispatched announcements and SMS alerts will appear in history."
              />
            ) : (
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broadcast ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Dispatched At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs font-semibold">{b.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{b.title}</TableCell>
                    <TableCell>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-muted">{b.channel}</span>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{b.recipientGroup}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{b.sentAt}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                        {b.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
