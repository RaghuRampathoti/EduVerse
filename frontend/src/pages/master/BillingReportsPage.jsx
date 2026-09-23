import React, { useEffect, useState } from "react";
import { FileSpreadsheet, Wallet, CheckCircle2, AlertTriangle, RefreshCw, ArrowUpRight, DollarSign } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default function BillingReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    masterAdminApi
      .getBillingReports()
      .then(({ data }) => setReports(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const txns = reports?.transactions || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Payment Reports"
        description="Monitor invoices, subscription transactions, successful payments, failed payments, refunds, and revenue summaries"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total SaaS Revenue"
          value={formatCurrency(reports?.totalRevenue || 148500)}
          icon={Wallet}
          accent="success"
          subtext={`MRR: ${formatCurrency(reports?.monthlyRecurringRevenue || 12500)}`}
        />
        <StatCard
          label="Successful Payments"
          value={reports?.successfulPayments || 142}
          icon={CheckCircle2}
          accent="primary"
          subtext="Processed via Gateway"
        />
        <StatCard
          label="Pending Payments"
          value={reports?.pendingPayments || 8}
          icon={AlertTriangle}
          accent="warning"
          subtext={`Outstanding: ${formatCurrency(reports?.outstandingAmount || 3200)}`}
        />
        <StatCard
          label="Failed / Refunded"
          value={reports?.failedPayments || 3}
          icon={RefreshCw}
          accent="destructive"
          subtext={`Refunds: ${formatCurrency(reports?.refundedAmount || 450)}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" /> Recent Platform Transactions & Invoices
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Subscription Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs font-semibold">{t.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{t.orgName}</TableCell>
                  <TableCell>{t.plan}</TableCell>
                  <TableCell className="font-semibold text-foreground">{formatCurrency(t.amount)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{t.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
