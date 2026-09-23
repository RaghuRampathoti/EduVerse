import React, { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { facultyApi } from "@/api/faculty";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function MyAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    Promise.all([facultyApi.myAttendanceSummary(), facultyApi.myAttendance()])
      .then(([sum, hist]) => {
        setSummary(sum.data.data);
        setHistory(hist.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div>
      <PageHeader title="My Attendance" description="Your attendance history and summary" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Present" value={summary?.present || 0} accent="success" />
        <StatCard label="Absent" value={summary?.absent || 0} accent="destructive" />
        <StatCard label="Late" value={summary?.late || 0} accent="warning" />
        <StatCard label="Attendance %" value={`${summary?.percentagePresent?.toFixed(1) || 0}%`} accent="primary" />
      </div>

      {history.length === 0 ? (
        <Card><EmptyState icon={CalendarCheck} title="No attendance records yet" /></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>{formatDate(h.date)}</TableCell>
                  <TableCell><StatusBadge status={h.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{h.remarks || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
