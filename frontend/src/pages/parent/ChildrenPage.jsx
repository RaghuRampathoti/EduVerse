import React, { useEffect, useState } from "react";
import { Baby, CalendarCheck, Wallet } from "lucide-react";
import { parentApi } from "@/api/parent";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { initials, formatDate, formatCurrency } from "@/lib/utils";

export default function ChildrenPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [fees, setFees] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    parentApi.children().then(({ data }) => {
      setChildren(data.data);
      if (data.data.length > 0) setSelectedId(String(data.data[0].id));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setDetailLoading(true);
    Promise.all([
      parentApi.childAttendance(selectedId),
      parentApi.childAttendanceSummary(selectedId),
      parentApi.childFees(selectedId),
    ])
      .then(([att, sum, fee]) => {
        setAttendance(att.data.data);
        setAttendanceSummary(sum.data.data);
        setFees(fee.data.data);
      })
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  if (loading) return <Spinner full />;

  if (children.length === 0) {
    return (
      <div>
        <PageHeader title="My Children" />
        <Card><EmptyState icon={Baby} title="No children linked" description="Contact your organization's admin to link your children's accounts." /></Card>
      </div>
    );
  }

  const selected = children.find((c) => String(c.id) === selectedId);

  return (
    <div>
      <PageHeader
        title="My Children"
        description="View attendance and fee details"
        actions={
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-56">
            {children.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </Select>
        }
      />

      {selected && (
        <Card className="mb-6">
          <CardContent className="p-5 flex items-center gap-3">
            <Avatar className="h-12 w-12 text-sm">{initials(selected.fullName)}</Avatar>
            <div>
              <p className="text-sm font-semibold">{selected.fullName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Admission No. {selected.admissionNumber} · {selected.className} {selected.sectionName} · Roll {selected.rollNumber || "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {detailLoading ? (
        <Spinner full />
      ) : (
        <Tabs defaultValue="attendance">
          <TabsList>
            <TabsTrigger value="attendance"><CalendarCheck className="h-3.5 w-3.5 mr-1.5 inline" /> Attendance</TabsTrigger>
            <TabsTrigger value="fees"><Wallet className="h-3.5 w-3.5 mr-1.5 inline" /> Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div><p className="text-2xl font-bold">{attendanceSummary?.present || 0}</p><p className="text-xs text-muted-foreground">Present</p></div>
                <div><p className="text-2xl font-bold">{attendanceSummary?.absent || 0}</p><p className="text-xs text-muted-foreground">Absent</p></div>
                <div><p className="text-2xl font-bold">{attendanceSummary?.late || 0}</p><p className="text-xs text-muted-foreground">Late</p></div>
                <div><p className="text-2xl font-bold">{attendanceSummary?.percentagePresent?.toFixed(1) || 0}%</p><p className="text-xs text-muted-foreground">Attendance</p></div>
              </CardContent>
            </Card>
            {attendance.length === 0 ? (
              <Card><EmptyState icon={CalendarCheck} title="No attendance records yet" /></Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {attendance.map((a) => (
                      <TableRow key={a.id}><TableCell>{formatDate(a.date)}</TableCell><TableCell><StatusBadge status={a.status} /></TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="fees">
            {fees.length === 0 ? (
              <Card><EmptyState icon={Wallet} title="No fee records" /></Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Fee</TableHead><TableHead>Due</TableHead><TableHead>Paid</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead></TableRow>
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
