import React, { useEffect, useState } from "react";
import { Award, Plus, Send, CheckCircle2, Trash2, Calendar } from "lucide-react";
import { examsApi } from "@/api/exams";
import { useToast } from "@/context/ToastContext";
import { extractErrorMessage } from "@/api/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const EMPTY = { title: "", type: "MIDTERM", startDate: "", endDate: "", classes: "" };

export default function AdminExamsPage() {
  const { toast } = useToast();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    examsApi.list()
      .then(({ data }) => setExams(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleSchedule(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await examsApi.create(form);
      toast({ title: "Examination Scheduled", variant: "success" });
      setDialogOpen(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast({ title: "Error", description: extractErrorMessage(err), variant: "destructive" });
    } finally { setSubmitting(false); }
  }

  async function handlePublish(id) {
    try {
      await examsApi.publishResults(id);
      toast({ title: "Results Published", variant: "success" });
      load();
    } catch (err) { toast({ title: "Error", description: extractErrorMessage(err), variant: "destructive" }); }
  }

  async function handleDelete(id) {
    try {
      await examsApi.delete(id);
      toast({ title: "Exam deleted", variant: "success" });
      load();
    } catch (err) { toast({ title: "Error", description: extractErrorMessage(err), variant: "destructive" }); }
  }

  if (loading) return <Spinner full />;

  const scheduled = exams.filter((e) => e.status === "SCHEDULED").length;
  const published = exams.filter((e) => e.resultsPublished).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations & Assessment Schedule"
        description="Schedule midterms, finals, unit tests, and manage result publications across classes"
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Schedule Exam</Button>}
      />

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{exams.length}</p><p className="text-muted-foreground text-xs">Total Exams</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-amber-500">{scheduled}</p><p className="text-muted-foreground text-xs">Scheduled</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-emerald-500">{published}</p><p className="text-muted-foreground text-xs">Results Published</p></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Target Classes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Results</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow><TableCell colSpan={8}><EmptyState icon={Award} title="No exams scheduled" description="Schedule your first examination above." /></TableCell></TableRow>
            ) : exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-semibold">{exam.title}</TableCell>
                <TableCell><span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{exam.type}</span></TableCell>
                <TableCell className="text-xs font-mono">{exam.startDate || "—"}</TableCell>
                <TableCell className="text-xs font-mono">{exam.endDate || "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{exam.targetClasses}</TableCell>
                <TableCell><StatusBadge status={exam.status} /></TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${exam.resultsPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {exam.resultsPublished ? "Published" : "Pending"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!exam.resultsPublished && (
                      <Button size="sm" variant="outline" onClick={() => handlePublish(exam.id)}>
                        <Send className="h-3.5 w-3.5" /> Publish
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(exam.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Schedule New Examination</DialogTitle>
            <DialogDescription>Define exam type, date range, and target classes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Exam Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Mid-Term Examination 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="MIDTERM">Mid-Term</option>
                  <option value="FINAL">Final Exam</option>
                  <option value="UNIT_TEST">Unit Test</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="PRACTICAL">Practical</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Target Classes</Label>
                <Input value={form.classes} onChange={(e) => setForm({ ...form, classes: e.target.value })} placeholder="Grade 10-A, 10-B" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>End Date *</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Scheduling..." : "Schedule Exam"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
