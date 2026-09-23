import React, { useEffect, useState } from "react";
import { CalendarCheck, Save, Calendar, Filter } from "lucide-react";
import { classSectionApi } from "@/api/classSections";
import { facultyApi } from "@/api/faculty";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { initials, formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "HALF_DAY", "ON_LEAVE"];

export default function MarkAttendancePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("mark"); // 'mark' | 'history'

  const [classSections, setClassSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  // Single day mark mode state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Date-to-Date range history mode state
  const todayStr = new Date().toISOString().slice(0, 10);
  const firstOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState("ALL");
  const [rangeRecords, setRangeRecords] = useState([]);
  const [rangeLoading, setRangeLoading] = useState(false);

  useEffect(() => {
    classSectionApi.list().then(({ data }) => {
      setClassSections(data.data);
      if (data.data.length > 0) setSelectedClass(String(data.data[0].id));
      else setLoading(false);
    }).catch(err => {
      toast({ title: "Failed to load classes", description: extractErrorMessage(err), variant: "destructive" });
      setLoading(false);
    });
  }, []);

  // Fetch student list for selected class
  useEffect(() => {
    if (!selectedClass) return;
    facultyApi.myStudents(selectedClass, { size: 200 })
      .then((stuRes) => setStudents(stuRes.data.data.content || []))
      .catch(() => {});
  }, [selectedClass]);

  // Fetch daily attendance for marking mode
  useEffect(() => {
    if (!selectedClass || activeTab !== "mark") return;
    setLoading(true);
    facultyApi.classAttendance(selectedClass, date, { size: 200 })
      .then((attRes) => {
        const map = {};
        (attRes.data.data.content || []).forEach((a) => (map[a.studentId] = a.status));
        setStatusMap(map);
      })
      .catch(err => {
        toast({ title: "Failed to load attendance data", description: extractErrorMessage(err), variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [selectedClass, date, activeTab]);

  // Fetch date-to-date range attendance history
  useEffect(() => {
    if (!selectedClass || activeTab !== "history") return;
    if (!startDate || !endDate) return;
    setRangeLoading(true);
    facultyApi
      .classAttendance(selectedClass, null, { startDate, endDate, size: 500 })
      .then(({ data }) => {
        setRangeRecords(data.data.content || []);
      })
      .catch(err => {
        toast({ title: "Failed to load date-to-date attendance", description: extractErrorMessage(err), variant: "destructive" });
      })
      .finally(() => setRangeLoading(false));
  }, [selectedClass, startDate, endDate, activeTab]);

  function setStatus(studentId, status) {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  }

  async function handleSaveAll() {
    const entries = students
      .filter((s) => statusMap[s.id])
      .map((s) => ({ studentId: s.id, status: statusMap[s.id] }));
    if (entries.length === 0) {
      toast({ title: "Mark at least one student first", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await facultyApi.markStudentAttendance({ classSectionId: Number(selectedClass), date, entries });
      toast({ title: "Attendance saved", description: `${entries.length} students updated`, variant: "success" });
    } catch (err) {
      toast({ title: "Failed to save", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function markAllPresent() {
    const map = {};
    students.forEach((s) => (map[s.id] = "PRESENT"));
    setStatusMap(map);
  }

  // Filtered date range records
  const filteredRangeRecords = rangeRecords.filter((r) => {
    if (selectedStudentFilter === "ALL") return true;
    return String(r.studentId) === selectedStudentFilter;
  });

  // Calculate summary metrics for range
  const totalRangeCount = filteredRangeRecords.length;
  const presentCount = filteredRangeRecords.filter((r) => r.status === "PRESENT").length;
  const absentCount = filteredRangeRecords.filter((r) => r.status === "ABSENT").length;
  const lateCount = filteredRangeRecords.filter((r) => r.status === "LATE").length;
  const presentPct = totalRangeCount > 0 ? ((presentCount / totalRangeCount) * 100).toFixed(1) : 0;

  return (
    <div>
      <PageHeader
        title="Class Attendance"
        description="Record daily attendance and review date-to-date attendance reports"
        actions={
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <Label className="text-xs text-muted-foreground">Class & Section</Label>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-48">
                {classSections.map((c) => <option key={c.id} value={c.id}>{c.className} {c.sectionName}</option>)}
              </Select>
            </div>
          </div>
        }
      />

      {/* Mode Switcher Tabs */}
      <div className="flex border-b mb-6 border-border">
        <button
          onClick={() => setActiveTab("mark")}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "mark"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarCheck className="h-4 w-4" /> Take Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" /> Date-to-Date Attendance Report
        </button>
      </div>

      {activeTab === "mark" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-card p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Select Date:</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={markAllPresent}>Mark All Present</Button>
              <Button size="sm" onClick={handleSaveAll} disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </div>

          {loading ? (
            <Spinner full />
          ) : classSections.length === 0 ? (
            <Card><EmptyState icon={CalendarCheck} title="No classes assigned" description="Ask your admin to assign you a class." /></Card>
          ) : students.length === 0 ? (
            <Card><EmptyState icon={CalendarCheck} title="No students in this class" /></Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium flex items-center gap-2.5">
                        <Avatar>{initials(s.fullName)}</Avatar> {s.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.rollNumber || "-"}</TableCell>
                      <TableCell>
                        <Select value={statusMap[s.id] || ""} onChange={(e) => setStatus(s.id, e.target.value)} className="w-40">
                          <option value="" disabled>Mark status</option>
                          {STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st.replaceAll("_", " ")}</option>)}
                        </Select>
                        {statusMap[s.id] && <span className="ml-2 inline-block align-middle"><StatusBadge status={statusMap[s.id]} /></span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {activeTab === "history" && (
        <>
          {/* Date to Date Controls */}
          <div className="bg-card p-4 rounded-lg border shadow-sm mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">From Date (Start Date)</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">To Date (End Date)</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Filter by Student</Label>
                <Select value={selectedStudentFilter} onChange={(e) => setSelectedStudentFilter(e.target.value)}>
                  <option value="ALL">All Students in Class</option>
                  {students.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.fullName} ({s.rollNumber || "No Roll"})</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Stat Cards for the Date Range */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Records" value={totalRangeCount} accent="primary" />
            <StatCard label="Present" value={presentCount} accent="success" />
            <StatCard label="Absent" value={absentCount} accent="destructive" />
            <StatCard label="Attendance %" value={`${presentPct}%`} accent={Number(presentPct) >= 75 ? "success" : "warning"} />
          </div>

          {/* Attendance History Table */}
          {rangeLoading ? (
            <Spinner full />
          ) : filteredRangeRecords.length === 0 ? (
            <Card>
              <EmptyState
                icon={Calendar}
                title="No attendance data for selected range"
                description={`No attendance records found between ${formatDate(startDate)} and ${formatDate(endDate)}.`}
              />
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRangeRecords.map((r) => (
                    <TableRow key={r.id || `${r.studentId}-${r.date}`}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(r.date)}</TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Avatar>{initials(r.studentName || "ST")}</Avatar> {r.studentName || "Student"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.rollNumber || "-"}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-muted-foreground">{r.remarks || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
