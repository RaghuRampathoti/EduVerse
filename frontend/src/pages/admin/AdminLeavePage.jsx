import React, { useEffect, useState } from "react";
import { CalendarOff, Check, X, Plus } from "lucide-react";
import { leavesApi } from "@/api/leaves";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { StatCard } from "@/components/shared/StatCard";

const EMPTY = { applicantName: "", role: "STUDENT", leaveType: "CASUAL", fromDate: "", toDate: "", reason: "" };

export default function AdminLeavePage() {
  const { toast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    leavesApi.list().then(({ data }) => setLeaves(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleDecision(id, status) {
    try {
      await leavesApi.decide(id, status);
      toast({ title: `Leave ${status}`, variant: status === "APPROVED" ? "success" : "destructive" });
      load();
    } catch (err) { toast({ title: "Error", description: extractErrorMessage(err), variant: "destructive" }); }
  }

  async function handleApply(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leavesApi.apply(form);
      toast({ title: "Leave Application Submitted", variant: "success" });
      setDialogOpen(false); setForm(EMPTY); load();
    } catch (err) {
      toast({ title: "Error", description: extractErrorMessage(err), variant: "destructive" });
    } finally { setSubmitting(false); }
  }

  if (loading) return <Spinner full />;

  const pending = leaves.filter((l) => l.status === "PENDING").length;
  const approved = leaves.filter((l) => l.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management & Approvals"
        description="Approve or reject leave applications from students and faculty members"
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Submit Leave</Button>}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Applications" value={leaves.length} icon={CalendarOff} accent="primary" />
        <StatCard label="Pending Review" value={pending} icon={CalendarOff} accent="warning" />
        <StatCard label="Approved" value={approved} icon={Check} accent="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarOff className="h-4 w-4 text-amber-500" /> All Leave Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow><TableCell colSpan={9}><EmptyState icon={CalendarOff} title="No leave applications" description="Applications will appear here." /></TableCell></TableRow>
              ) : leaves.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-semibold">{l.applicantName}</TableCell>
                  <TableCell><span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{l.applicantRole}</span></TableCell>
                  <TableCell>{l.leaveType}</TableCell>
                  <TableCell className="font-mono text-xs">{l.fromDate || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{l.toDate || "—"}</TableCell>
                  <TableCell className="text-center font-bold">{l.daysCount}</TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.reviewedBy || "—"}</TableCell>
                  <TableCell className="text-right">
                    {l.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-300" onClick={() => handleDecision(l.id, "APPROVED")}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-rose-600 border-rose-300" onClick={() => handleDecision(l.id, "REJECTED")}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Submit Leave Application</DialogTitle>
            <DialogDescription>Record a leave application for a student or faculty member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Applicant Name *</Label>
              <Input value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Leave Type</Label>
                <Select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                  <option value="CASUAL">Casual</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="FAMILY">Family</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>From Date *</Label>
                <Input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>To Date *</Label>
                <Input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Application"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
