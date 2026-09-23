import React, { useEffect, useState } from "react";
import { FileEdit, Plus, Trash2, BookOpen } from "lucide-react";
import { homeworkApi } from "@/api/homework";
import { useToast } from "@/context/ToastContext";
import { extractErrorMessage } from "@/api/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const EMPTY = { title: "", subject: "", classSection: "", faculty: "", dueDate: "", description: "" };

export default function AdminHomeworkPage() {
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    homeworkApi.list().then(({ data }) => setList(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await homeworkApi.create(form);
      toast({ title: "Homework Assigned", variant: "success" });
      setDialogOpen(false); setForm(EMPTY); load();
    } catch (err) {
      toast({ title: "Error", description: extractErrorMessage(err), variant: "destructive" });
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    try { await homeworkApi.delete(id); toast({ title: "Deleted", variant: "success" }); load(); }
    catch (err) { toast({ title: "Error", description: extractErrorMessage(err), variant: "destructive" }); }
  }

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework Oversight & Submission Tracking"
        description="Monitor homework assignments across all classes and faculty members"
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Assign Homework</Button>}
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class / Section</TableHead>
              <TableHead>Assigned Faculty</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState icon={FileEdit} title="No homework assigned" description="Homework assigned to classes will appear here." /></TableCell></TableRow>
            ) : list.map((hw) => (
              <TableRow key={hw.id}>
                <TableCell className="font-semibold">{hw.title}</TableCell>
                <TableCell>{hw.subject}</TableCell>
                <TableCell>{hw.classSection}</TableCell>
                <TableCell className="text-muted-foreground">{hw.assignedFaculty}</TableCell>
                <TableCell className="font-mono text-xs">{hw.dueDate || "—"}</TableCell>
                <TableCell><StatusBadge status={hw.status} /></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(hw.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Assign Homework</DialogTitle>
            <DialogDescription>Create a new homework assignment for a class.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Homework Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Chapter 5 Exercise Set" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" />
              </div>
              <div className="space-y-1.5">
                <Label>Class / Section</Label>
                <Input value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value })} placeholder="Grade 10-A" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Assigned Faculty</Label>
                <Input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="Mr. Sharma" />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Instructions / Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the homework task..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Assign Homework"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
