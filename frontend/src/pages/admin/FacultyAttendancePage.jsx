import React, { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { facultyApi } from "@/api/faculty";
import { attendanceApi } from "@/api/attendance";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "HALF_DAY", "ON_LEAVE"];

export default function FacultyAttendancePage() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [faculty, setFaculty] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([facultyApi.list({ page: 0, size: 200 }), attendanceApi.listFacultyAttendance(date)])
      .then(([facultyRes, attRes]) => {
        setFaculty(facultyRes.data.data.content || []);
        const map = {};
        (attRes.data.data.content || []).forEach((a) => {
          map[a.facultyId] = a.status;
        });
        setAttendance(map);
      })
      .finally(() => setLoading(false));
  }, [date]);

  async function markStatus(facultyId, status) {
    setAttendance((prev) => ({ ...prev, [facultyId]: status }));
    try {
      await attendanceApi.markFaculty({ facultyId, date, status });
    } catch (err) {
      toast({ title: "Failed to save", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div>
      <PageHeader
        title="Faculty Attendance"
        description="Mark and review daily attendance for teaching staff"
        actions={<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />}
      />

      {loading ? (
        <Spinner full />
      ) : faculty.length === 0 ? (
        <Card><EmptyState icon={CalendarCheck} title="No faculty found" description="Add faculty members first." /></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculty.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="text-muted-foreground">{f.employeeId}</TableCell>
                  <TableCell className="font-medium">{f.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{f.department || "-"}</TableCell>
                  <TableCell>
                    <Select
                      value={attendance[f.id] || ""}
                      onChange={(e) => markStatus(f.id, e.target.value)}
                      className="w-40"
                    >
                      <option value="" disabled>Mark status</option>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                    </Select>
                    {attendance[f.id] && <span className="ml-2 inline-block align-middle"><StatusBadge status={attendance[f.id]} /></span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
