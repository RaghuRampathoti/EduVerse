import React, { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { studentApi } from "@/api/students";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default function StudentFeesPage() {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    studentApi.myFees().then(({ data }) => setFees(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const totalDue = fees.reduce((s, f) => s + (f.amountDue || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.amountPaid || 0), 0);
  const totalBalance = fees.reduce((s, f) => s + (f.balance || 0), 0);

  return (
    <div>
      <PageHeader title="My Fees" description="Your fee statement" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Due" value={formatCurrency(totalDue)} icon={Wallet} accent="primary" />
        <StatCard label="Total Paid" value={formatCurrency(totalPaid)} icon={Wallet} accent="success" />
        <StatCard label="Balance" value={formatCurrency(totalBalance)} icon={Wallet} accent="warning" />
      </div>

      {fees.length === 0 ? (
        <Card><EmptyState icon={Wallet} title="No fee records" /></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.feeTitle}</TableCell>
                  <TableCell>{formatCurrency(f.amountDue)}</TableCell>
                  <TableCell>{formatCurrency(f.amountPaid)}</TableCell>
                  <TableCell>{formatCurrency(f.balance)}</TableCell>
                  <TableCell><StatusBadge status={f.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
