import React, { useEffect, useState } from "react";
import { Plus, Megaphone, Pin, Trash2 } from "lucide-react";
import { announcementApi } from "@/api/announcements";
import { extractErrorMessage } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

const CAN_POST_ROLES = ["SUPER_ADMIN", "ADMIN", "FACULTY"];
const EMPTY = { title: "", content: "", audience: "ALL", pinned: false };

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canPost = CAN_POST_ROLES.includes(user?.role);

  function load() {
    setLoading(true);
    announcementApi.list({ page: 0, size: 100 }).then(({ data }) => setAnnouncements(data.data.content || [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await announcementApi.create(form);
      toast({ title: "Announcement posted", variant: "success" });
      setDialogOpen(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await announcementApi.delete(id);
      toast({ title: "Announcement deleted", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Organization-wide notices and updates"
        actions={canPost && <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Post Announcement</Button>}
      />

      {loading ? (
        <Spinner full />
      ) : announcements.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="No announcements" description="Nothing has been posted yet." /></Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                      <Badge variant="secondary">{a.audience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">{formatDate(a.createdAt)} · Posted by {a.postedByName}</p>
                  </div>
                  {canPost && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Content *</Label>
              <Textarea rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}>
                  <option value="ALL">Everyone</option>
                  <option value="STUDENTS">Students</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="PARENTS">Parents</option>
                </Select>
              </div>
              <div className="flex items-end gap-2 pb-1.5">
                <input
                  id="pinned"
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="pinned">Pin to top</Label>
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Posting..." : "Post"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
