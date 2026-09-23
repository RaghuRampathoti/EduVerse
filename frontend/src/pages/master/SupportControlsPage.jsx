import React, { useEffect, useState } from "react";
import { Headphones, Megaphone, Plus, Bell, MessageSquare, AlertCircle } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export default function SupportControlsPage() {
  const { toast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", audience: "ALL_SUPER_ADMINS", priority: "MEDIUM" });
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    masterAdminApi
      .getSupportNotices()
      .then(({ data }) => setNotices(data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await masterAdminApi.createSupportNotice(form);
      toast({ title: "Broadcast notice posted", variant: "success" });
      setDialogOpen(false);
      setForm({ title: "", content: "", audience: "ALL_SUPER_ADMINS", priority: "MEDIUM" });
      load();
    } catch (err) {
      toast({ title: "Failed to post notice", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Controls & Broadcast Notices"
        description="Broadcast maintenance alerts, system updates, and manage organization support requests"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Broadcast Notice
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" /> Active Platform Broadcast Announcements
            </CardTitle>
            <CardDescription>
              Notices sent to all Super Admins or entire organization userbases across EduVerse.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="p-4 rounded-lg border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${notice.priority === "HIGH" ? "bg-rose-500" : "bg-primary"}`}></span>
                    <h4 className="font-semibold text-sm">{notice.title}</h4>
                  </div>
                  <StatusBadge status={notice.status || "ACTIVE"} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span>Audience: <strong className="text-foreground">{notice.audience}</strong></span>
                  <span>Priority: <strong className="text-foreground">{notice.priority}</strong></span>
                  <span>Posted: <strong className="text-foreground">{notice.createdAt}</strong></span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Broadcast Notice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create Broadcast Announcement</DialogTitle>
            <DialogDescription>Send a system notice across the EduVerse platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Notice Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Server Maintenance Scheduled"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Audience Scope</Label>
              <Select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="ALL_SUPER_ADMINS">All Organization Super Admins</option>
                <option value="ALL_USERS">All Platform Users</option>
                <option value="FACULTY_ONLY">All Faculty Members</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High / Urgent</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Broadcasting..." : "Broadcast Notice"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
