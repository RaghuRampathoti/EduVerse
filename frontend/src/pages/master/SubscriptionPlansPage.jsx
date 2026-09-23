import React, { useEffect, useState } from "react";
import { CreditCard, Plus, Check, Layers, Users, HardDrive, Clock, Calendar } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { useToast } from "@/context/ToastContext";
import { extractErrorMessage } from "@/api/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

const EMPTY_PLAN = {
  name: "",
  code: "",
  price: 0,
  billingCycle: "MONTHLY",
  validityPeriod: "1 Month (30 Days)",
  maxStudents: 500,
  maxFaculty: 50,
  storageGb: 50,
};

export default function SubscriptionPlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PLAN);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    masterAdminApi
      .getSubscriptionPlans()
      .then(({ data }) => setPlans(data.data || []))
      .catch((err) => toast({ title: "Failed to load plans", description: extractErrorMessage(err), variant: "destructive" }))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        validityPeriod: form.billingCycle === "ANNUAL" ? "1 Year (365 Days)" : "1 Month (30 Days)"
      };
      await masterAdminApi.createSubscriptionPlan(payload);
      toast({ title: "Plan created successfully", variant: "success" });
      setDialogOpen(false);
      setForm(EMPTY_PLAN);
      load();
    } catch (err) {
      toast({ title: "Error creating plan", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans & Tier Pricing"
        description="Configure tier structures, student limits, faculty caps, plan validity periods, and feature module entitlements for EduVerse SaaS"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Create Custom Plan
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isAnnual = plan.billingCycle === "ANNUAL";
          const validityText = plan.validityPeriod || (isAnnual ? "1 Year (365 Days)" : "1 Month (30 Days)");

          return (
            <Card key={plan.id} className="relative flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-primary">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase px-2 py-0.5 rounded bg-muted">
                    {plan.code}
                  </span>
                  <StatusBadge status={plan.status || "ACTIVE"} />
                </div>
                <CardTitle className="text-xl mt-2">{plan.name}</CardTitle>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{formatCurrency(plan.price)}</span>
                    <span className="text-xs font-semibold text-muted-foreground">/{isAnnual ? "annual" : "monthly"}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${isAnnual ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                    {isAnnual ? "Yearly Plan" : "Monthly Plan"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3 flex-1 text-sm">
                <div className="flex items-center gap-2 p-2 rounded bg-muted/40 border">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-medium">
                    Plan Duration / Validity: <strong className="text-foreground">{validityText}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Max Students: <strong>{plan.maxStudents?.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-info" />
                  <span>Max Faculty: <strong>{plan.maxFaculty?.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-amber-500" />
                  <span>Storage Limit: <strong>{plan.storageGb} GB</strong></span>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Included Modules</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(plan.modules || []).map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                        <Check className="h-3 w-3" /> {m}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create Subscription Plan</DialogTitle>
            <DialogDescription>Define a new plan tier and billing validity period.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Plan Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Higher Ed Enterprise" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Code Identifier *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="ENTERPRISE_PRO" />
              </div>
              <div className="space-y-1.5">
                <Label>Plan Time Period / Billing *</Label>
                <Select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}>
                  <option value="MONTHLY">Monthly (1 Month Validity)</option>
                  <option value="ANNUAL">Annual / Yearly (1 Year Validity)</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Price (₹) *</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Max Students</Label>
                <Input type="number" value={form.maxStudents} onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Max Faculty</Label>
                <Input type="number" value={form.maxFaculty} onChange={(e) => setForm({ ...form, maxFaculty: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Storage (GB)</Label>
                <Input type="number" value={form.storageGb} onChange={(e) => setForm({ ...form, storageGb: Number(e.target.value) })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Create Plan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
