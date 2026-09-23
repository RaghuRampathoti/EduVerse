import React, { useEffect, useState } from "react";
import { Plus, Wallet, Trash2, DollarSign } from "lucide-react";
import { feeApi } from "@/api/fees";
import { classSectionApi } from "@/api/classSections";
import { studentApi } from "@/api/students";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

const EMPTY_STRUCTURE = { classSectionId: "", title: "", amount: "", academicYear: "2026-2027", dueDate: "", description: "" };
const EMPTY_PAYMENT = { studentId: "", feeStructureId: "", amount: "", paymentMethod: "CASH", transactionRef: "" };

export default function FeesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user && user.role === "ADMIN";

  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classSections, setClassSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({ totalCollected: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [structureForm, setStructureForm] = useState(EMPTY_STRUCTURE);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      feeApi.listStructures(),
      feeApi.listPayments({ page: 0, size: 200 }),
      classSectionApi.list(),
      studentApi.list({ page: 0, size: 500 }),
      feeApi.summary(),
    ])
      .then(([st, pay, cs, stu, sum]) => {
        setStructures(st.data.data);
        setPayments(pay.data.data.content || []);
        setClassSections(cs.data.data);
        setStudents(stu.data.data.content || []);
        setSummary(sum.data.data);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCreateStructure(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...structureForm,
        classSectionId: structureForm.classSectionId ? Number(structureForm.classSectionId) : null,
        amount: Number(structureForm.amount),
      };
      await feeApi.createStructure(payload);
      toast({ title: "Fee structure created and applied", variant: "success" });
      setStructureDialogOpen(false);
      setStructureForm(EMPTY_STRUCTURE);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteStructure(id) {
    if (!window.confirm("Delete this fee structure? Related payment records will also be removed.")) return;
    try {
      await feeApi.deleteStructure(id);
      toast({ title: "Fee structure deleted", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...paymentForm,
        studentId: Number(paymentForm.studentId),
        feeStructureId: Number(paymentForm.feeStructureId),
        amount: Number(paymentForm.amount),
      };
      await feeApi.recordPayment(payload);
      toast({ title: "Payment recorded", variant: "success" });
      setPaymentDialogOpen(false);
      setPaymentForm(EMPTY_PAYMENT);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Fees"
        description="Manage fee structures and track payments"
        actions={
          isAdmin ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(true)}><DollarSign className="h-4 w-4" /> Record Payment</Button>
              <Button onClick={() => setStructureDialogOpen(true)}><Plus className="h-4 w-4" /> New Fee Structure</Button>
            </div>
          ) : null
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Collected" value={formatCurrency(summary.totalCollected)} icon={Wallet} accent="success" />
        <StatCard label="Total Pending" value={formatCurrency(summary.totalPending)} icon={Wallet} accent="warning" />
      </div>

      {loading ? (
        <Spinner full />
      ) : (
        <Tabs defaultValue="structures">
          <TabsList>
            <TabsTrigger value="structures">Fee Structures</TabsTrigger>
            <TabsTrigger value="payments">Payment Records</TabsTrigger>
          </TabsList>

          <TabsContent value="structures">
            {structures.length === 0 ? (
              <Card><EmptyState icon={Wallet} title="No fee structures" description={isAdmin ? "Create a fee structure to start collecting payments." : "No fee structures configured."} /></Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Applies To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Due Date</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {structures.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.title}</TableCell>
                        <TableCell className="text-muted-foreground">{s.className}</TableCell>
                        <TableCell>{formatCurrency(s.amount)}</TableCell>
                        <TableCell>{s.academicYear}</TableCell>
                        <TableCell>{formatDate(s.dueDate)}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteStructure(s.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments">
            {payments.length === 0 ? (
              <Card><EmptyState icon={Wallet} title="No payment records" /></Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.studentName}</TableCell>
                        <TableCell className="text-muted-foreground">{p.feeTitle}</TableCell>
                        <TableCell>{formatCurrency(p.amountDue)}</TableCell>
                        <TableCell>{formatCurrency(p.amountPaid)}</TableCell>
                        <TableCell>{formatCurrency(p.balance)}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create Fee Structure Dialog */}
      <Dialog open={structureDialogOpen} onOpenChange={setStructureDialogOpen}>
        <DialogContent onClose={() => setStructureDialogOpen(false)}>
          <DialogHeader><DialogTitle>New Fee Structure</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateStructure} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={structureForm.title} onChange={(e) => setStructureForm((f) => ({ ...f, title: e.target.value }))} required placeholder="e.g. Term 1 Tuition Fee" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount *</Label>
                <Input type="number" value={structureForm.amount} onChange={(e) => setStructureForm((f) => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Academic Year *</Label>
                <Input value={structureForm.academicYear} onChange={(e) => setStructureForm((f) => ({ ...f, academicYear: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Applies To</Label>
                <Select value={structureForm.classSectionId} onChange={(e) => setStructureForm((f) => ({ ...f, classSectionId: e.target.value }))}>
                  <option value="">All Classes</option>
                  {classSections.map((c) => <option key={c.id} value={c.id}>{c.className} {c.sectionName}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={structureForm.dueDate} onChange={(e) => setStructureForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={structureForm.description} onChange={(e) => setStructureForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStructureDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create & Apply"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent onClose={() => setPaymentDialogOpen(false)}>
          <DialogHeader><DialogTitle>Record Fee Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Student *</Label>
              <Select value={paymentForm.studentId} onChange={(e) => setPaymentForm((f) => ({ ...f, studentId: e.target.value }))} required>
                <option value="">Select student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNumber})</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fee Structure *</Label>
              <Select value={paymentForm.feeStructureId} onChange={(e) => setPaymentForm((f) => ({ ...f, feeStructureId: e.target.value }))} required>
                <option value="">Select fee</option>
                {structures.map((s) => <option key={s.id} value={s.id}>{s.title} - {formatCurrency(s.amount)}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount *</Label>
                <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Method</Label>
                <Select value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm((f) => ({ ...f, paymentMethod: e.target.value }))}>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="ONLINE">Online</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Transaction Reference</Label>
              <Input value={paymentForm.transactionRef} onChange={(e) => setPaymentForm((f) => ({ ...f, transactionRef: e.target.value }))} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Recording..." : "Record Payment"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
