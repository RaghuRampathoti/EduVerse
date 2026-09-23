import React, { useEffect, useState } from "react";
import { Repeat, Calendar, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { useToast } from "@/context/ToastContext";
import { extractErrorMessage } from "@/api/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function SubscriptionLifecyclePage() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    masterAdminApi
      .getSubscriptionLifecycle()
      .then(({ data }) => setItems(data.data || []))
      .catch((err) => toast({ title: "Failed to load lifecycle", description: extractErrorMessage(err), variant: "destructive" }))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleUpdateStage(id, newStage) {
    try {
      await masterAdminApi.updateSubscriptionLifecycle(id, { stage: newStage });
      toast({ title: `Lifecycle stage updated to ${newStage}`, variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed to update lifecycle", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Lifecycle & Statuses"
        description="Monitor trial, active, grace period, expired, suspended, and renewed states across all organizations"
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Assigned Plan</TableHead>
              <TableHead>Lifecycle Stage</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Next Billing Date</TableHead>
              <TableHead>Auto Renew</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <span className="font-semibold text-foreground">{item.institutionName}</span>
                  <span className="block text-xs text-muted-foreground">({item.institutionCode})</span>
                </TableCell>
                <TableCell className="font-medium text-primary">{item.planName}</TableCell>
                <TableCell>
                  <StatusBadge status={item.lifecycleStage || "ACTIVE"} />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{item.startDate}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{item.nextBillingDate}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${item.autoRenew ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {item.autoRenew ? "Enabled" : "Disabled"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleUpdateStage(item.institutionId, "ACTIVE")}>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Set Active / Renewed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStage(item.institutionId, "GRACE_PERIOD")}>
                        <Clock className="h-4 w-4 text-amber-500" /> Extend Grace Period
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStage(item.institutionId, "EXPIRED")}>
                        <AlertCircle className="h-4 w-4 text-rose-500" /> Mark Expired
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
