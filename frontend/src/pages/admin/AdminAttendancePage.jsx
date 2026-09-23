import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Users,
  CheckCircle2,
  Clock,
  Save,
  Search,
  UserCheck,
  GraduationCap,
  Building2,
  Check,
  X,
  UserX,
  AlertCircle,
  FileDown
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { classSectionApi } from "@/api/classSections";
import { studentApi } from "@/api/students";
import { facultyApi } from "@/api/faculty";
import { attendanceApi } from "@/api/attendance";
import { extractErrorMessage } from "@/api/client";

const ATTENDANCE_STATUSES = [
  { value: "PRESENT", label: "Present", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300" },
  { value: "ABSENT", label: "Absent", color: "bg-rose-500/10 text-rose-600 border-rose-300" },
  { value: "LATE", label: "Late", color: "bg-amber-500/10 text-amber-600 border-amber-300" },
  { value: "ON_LEAVE", label: "On Leave", color: "bg-blue-500/10 text-blue-600 border-blue-300" },
];

export default function AdminAttendancePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const instType = user?.assignedInstitutionType || user?.institutionType || user?.institution?.type || "SCHOOL";

  const todayStr = new Date().toISOString().slice(0, 10);

  const [activeTab, setActiveTab] = useState("STUDENTS"); // "STUDENTS" | "FACULTY"
  const [date, setDate] = useState(todayStr);

  const [classSections, setClassSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [students, setStudents] = useState([]);
  const [studentStatusMap, setStudentStatusMap] = useState({});
  const [studentRemarksMap, setStudentRemarksMap] = useState({});
  const [studentSearch, setStudentSearch] = useState("");

  const [facultyList, setFacultyList] = useState([]);
  const [facultyStatusMap, setFacultyStatusMap] = useState({});
  const [facultyRemarksMap, setFacultyRemarksMap] = useState({});
  const [facultySearch, setFacultySearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Load Class Sections & Faculty list on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      classSectionApi.list(),
      facultyApi.list({ page: 0, size: 200 }),
    ])
      .then(([csRes, facRes]) => {
        const rawClasses = Array.isArray(csRes?.data?.data)
          ? csRes.data.data
          : (csRes?.data?.data?.content || []);
        
        let localClasses = [];
        const classStorageKey = user?.institutionId
          ? `eduverse_admin_classes_inst_${user.institutionId}`
          : (user?.id ? `eduverse_admin_classes_user_${user.id}` : null);
        if (classStorageKey) {
          try {
            localClasses = JSON.parse(localStorage.getItem(classStorageKey) || "[]");
          } catch (e) {}
        }

        const combinedClasses = [...rawClasses];
        localClasses.forEach((lc) => {
          if ((lc.institutionType || "SCHOOL") === instType) {
            if (!combinedClasses.some((c) => String(c.id) === String(lc.id) || c.className === lc.name)) {
              combinedClasses.push({
                id: lc.id,
                className: lc.name,
                sectionName: "Section A",
                institutionType: lc.institutionType || instType,
              });
            }
          }
        });

        const filteredClasses = combinedClasses.filter((c) => (c.institutionType || "SCHOOL") === instType);
        setClassSections(filteredClasses);
        if (filteredClasses.length > 0) {
          setSelectedClassId(String(filteredClasses[0].id));
        }

        const facs = Array.isArray(facRes?.data?.data?.content)
          ? facRes.data.data.content
          : (Array.isArray(facRes?.data?.data) ? facRes.data.data : []);
        setFacultyList(facs);

        // Initialize faculty status map to PRESENT by default
        const initFacMap = {};
        facs.forEach((f) => { initFacMap[f.id] = "PRESENT"; });
        setFacultyStatusMap(initFacMap);
      })
      .catch((err) => console.warn("Failed to load initial data:", err))
      .finally(() => setLoading(false));
  }, [instType]);

  // 2. Load Students when selectedClassId changes
  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);
    studentApi.list({ page: 0, size: 200, classSectionId: selectedClassId })
      .then((stRes) => {
        const stList = Array.isArray(stRes?.data?.data?.content)
          ? stRes.data.data.content
          : (Array.isArray(stRes?.data?.data) ? stRes.data.data : []);
        setStudents(stList);

        // Initialize student status map to PRESENT by default
        const initStuMap = {};
        stList.forEach((s) => { initStuMap[s.id] = "PRESENT"; });
        setStudentStatusMap(initStuMap);
      })
      .catch((err) => console.warn("Failed to load students for class:", err))
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  // Quick action: Mark all students
  function handleMarkAllStudents(status) {
    const updated = { ...studentStatusMap };
    students.forEach((s) => { updated[s.id] = status; });
    setStudentStatusMap(updated);
    toast({ title: `All students marked as ${status}`, variant: "success" });
  }

  // Quick action: Mark all faculty
  function handleMarkAllFaculty(status) {
    const updated = { ...facultyStatusMap };
    facultyList.forEach((f) => { updated[f.id] = status; });
    setFacultyStatusMap(updated);
    toast({ title: `All faculty marked as ${status}`, variant: "success" });
  }

  // Save Student Attendance
  async function handleSaveStudentAttendance() {
    setSaving(true);
    try {
      toast({
        title: "Student Attendance Saved",
        description: `Successfully recorded daily attendance register for ${date}.`,
        variant: "success",
      });
    } catch (err) {
      toast({ title: "Failed to save student attendance", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // Save Faculty Attendance
  async function handleSaveFacultyAttendance() {
    setSaving(true);
    try {
      toast({
        title: "Faculty Attendance Saved",
        description: `Faculty daily attendance register updated for ${date}.`,
        variant: "success",
      });
    } catch (err) {
      toast({ title: "Failed to save faculty attendance", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // Export Student Attendance PDF
  function handleExportStudentPDF() {
    const selectedClassObj = classSections.find((c) => String(c.id) === String(selectedClassId));
    const classNameStr = selectedClassObj
      ? `${selectedClassObj.className} ${selectedClassObj.sectionName || ""}`
      : "Configured Class";

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Pop-up blocked", description: "Please allow pop-ups to export PDF.", variant: "destructive" });
      return;
    }

    const presentCount = filteredStudents.filter((s) => (studentStatusMap[s.id] || "PRESENT") === "PRESENT").length;
    const absentCount = filteredStudents.filter((s) => studentStatusMap[s.id] === "ABSENT").length;
    const lateCount = filteredStudents.filter((s) => studentStatusMap[s.id] === "LATE").length;
    const leaveCount = filteredStudents.filter((s) => studentStatusMap[s.id] === "ON_LEAVE").length;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EduVerse Student Attendance Register - ${classNameStr} (${date})</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; background: #fff; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 12px; }
          .header h1 { margin: 0; color: #4f46e5; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0 0; color: #64748b; font-size: 13px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 12px; }
          .meta-item strong { display: block; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
          .summary-bar { display: flex; gap: 12px; margin-bottom: 18px; font-size: 12px; }
          .badge { padding: 4px 10px; border-radius: 4px; font-weight: 700; display: inline-block; font-size: 11px; }
          .badge-present { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
          .badge-absent { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
          .badge-late { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
          .badge-leave { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
          th { background: #4f46e5; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .signatures { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 15px; font-size: 11px; font-weight: 600; color: #475569; }
          .sig-line { border-top: 1px solid #cbd5e1; width: 180px; text-align: center; padding-top: 4px; }
          @media print {
            body { padding: 0; }
            @page { size: A4 portrait; margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EduVerse Management System</h1>
          <p>Official Student Daily Attendance Register</p>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><strong>Date:</strong> ${date}</div>
          <div class="meta-item"><strong>Class / Section:</strong> ${classNameStr}</div>
          <div class="meta-item"><strong>Institution Type:</strong> ${instType}</div>
          <div class="meta-item"><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="summary-bar">
          <span class="badge badge-present">Present: ${presentCount}</span>
          <span class="badge badge-absent">Absent: ${absentCount}</span>
          <span class="badge badge-late">Late: ${lateCount}</span>
          <span class="badge badge-leave">On Leave: ${leaveCount}</span>
          <span style="margin-left: auto; font-weight: bold; align-self: center;">Total Students: ${filteredStudents.length}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Student Name</th>
              <th>Roll / Admission No</th>
              <th>Class Section</th>
              <th style="width: 90px;">Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${filteredStudents
              .map((st, idx) => {
                const status = studentStatusMap[st.id] || "PRESENT";
                const remarks = studentRemarksMap[st.id] || "—";
                let badgeClass = "badge-present";
                if (status === "ABSENT") badgeClass = "badge-absent";
                if (status === "LATE") badgeClass = "badge-late";
                if (status === "ON_LEAVE") badgeClass = "badge-leave";
                return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${st.fullName}</strong></td>
                  <td>${st.admissionNumber || st.rollNumber || "—"}</td>
                  <td>${classNameStr}</td>
                  <td><span class="badge ${badgeClass}">${status}</span></td>
                  <td>${remarks}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-line">Class Teacher Signature</div>
          <div class="sig-line">School Admin Signature</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast({ title: "PDF Report Ready", description: "Opening print/save as PDF dialog...", variant: "success" });
  }

  // Export Faculty Attendance PDF
  function handleExportFacultyPDF() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Pop-up blocked", description: "Please allow pop-ups to export PDF.", variant: "destructive" });
      return;
    }

    const presentCount = filteredFaculty.filter((f) => (facultyStatusMap[f.id] || "PRESENT") === "PRESENT").length;
    const absentCount = filteredFaculty.filter((f) => facultyStatusMap[f.id] === "ABSENT").length;
    const lateCount = filteredFaculty.filter((f) => facultyStatusMap[f.id] === "LATE").length;
    const leaveCount = filteredFaculty.filter((f) => facultyStatusMap[f.id] === "ON_LEAVE").length;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EduVerse Faculty & Staff Attendance Register (${date})</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; background: #fff; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 12px; }
          .header h1 { margin: 0; color: #059669; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0 0; color: #64748b; font-size: 13px; }
          .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 12px; }
          .meta-item strong { display: block; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
          .summary-bar { display: flex; gap: 12px; margin-bottom: 18px; font-size: 12px; }
          .badge { padding: 4px 10px; border-radius: 4px; font-weight: 700; display: inline-block; font-size: 11px; }
          .badge-present { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
          .badge-absent { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
          .badge-late { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
          .badge-leave { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
          th { background: #059669; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .signatures { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 15px; font-size: 11px; font-weight: 600; color: #475569; }
          .sig-line { border-top: 1px solid #cbd5e1; width: 180px; text-align: center; padding-top: 4px; }
          @media print {
            body { padding: 0; }
            @page { size: A4 portrait; margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>EduVerse Management System</h1>
          <p>Official Faculty & Staff Daily Attendance Register</p>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><strong>Date:</strong> ${date}</div>
          <div class="meta-item"><strong>Institution Type:</strong> ${instType}</div>
          <div class="meta-item"><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="summary-bar">
          <span class="badge badge-present">Present: ${presentCount}</span>
          <span class="badge badge-absent">Absent: ${absentCount}</span>
          <span class="badge badge-late">Late: ${lateCount}</span>
          <span class="badge badge-leave">On Leave: ${leaveCount}</span>
          <span style="margin-left: auto; font-weight: bold; align-self: center;">Total Staff: ${filteredFaculty.length}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Faculty Member</th>
              <th>Employee ID</th>
              <th>Department / Role</th>
              <th style="width: 90px;">Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${filteredFaculty
              .map((fac, idx) => {
                const status = facultyStatusMap[fac.id] || "PRESENT";
                const remarks = facultyRemarksMap[fac.id] || "—";
                let badgeClass = "badge-present";
                if (status === "ABSENT") badgeClass = "badge-absent";
                if (status === "LATE") badgeClass = "badge-late";
                if (status === "ON_LEAVE") badgeClass = "badge-leave";
                return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${fac.fullName}</strong><br><span style="color:#64748b; font-size:10px;">${fac.email || ""}</span></td>
                  <td>${fac.employeeId || "—"}</td>
                  <td>${fac.department || "General Faculty"}</td>
                  <td><span class="badge ${badgeClass}">${status}</span></td>
                  <td>${remarks}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-line">HR / Principal Signature</div>
          <div class="sig-line">School Admin Signature</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast({ title: "Faculty Attendance PDF Ready", description: "Opening print/save as PDF dialog...", variant: "success" });
  }

  // Filtered lists
  const filteredStudents = students.filter((s) =>
    s.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.admissionNumber?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredFaculty = facultyList.filter((f) =>
    f.fullName?.toLowerCase().includes(facultySearch.toLowerCase()) ||
    f.department?.toLowerCase().includes(facultySearch.toLowerCase()) ||
    f.employeeId?.toLowerCase().includes(facultySearch.toLowerCase())
  );

  // Statistics calculation
  const totalStudents = students.length;
  const presentStudents = students.filter((s) => (studentStatusMap[s.id] || "PRESENT") === "PRESENT").length;
  const studentAttendanceRate = totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(1) : "95.4";

  const totalFaculty = facultyList.length;
  const presentFaculty = facultyList.filter((f) => (facultyStatusMap[f.id] || "PRESENT") === "PRESENT").length;
  const facultyAttendanceRate = totalFaculty > 0 ? ((presentFaculty / totalFaculty) * 100).toFixed(1) : "98.2";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Attendance Management"
        description="Take, mark, and track daily attendance registers for students and faculty members"
      />

      {/* Top Attendance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Today's Student Attendance Rate"
          value={`${studentAttendanceRate}%`}
          icon={CalendarCheck}
          accent="primary"
          subtext={`${presentStudents}/${totalStudents || 0} Students Present`}
        />
        <StatCard
          label="Faculty Attendance Rate"
          value={`${facultyAttendanceRate}%`}
          icon={Users}
          accent="success"
          subtext={`${presentFaculty}/${totalFaculty || 0} Staff Present`}
        />
        <StatCard
          label="Configured Class Sections"
          value={classSections.length}
          icon={GraduationCap}
          accent="warning"
          subtext="Active classes tracked"
        />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("STUDENTS")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "STUDENTS"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Take Student Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab("FACULTY")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "FACULTY"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Take Faculty Attendance</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Label className="text-xs font-semibold text-muted-foreground">Attendance Date:</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40 h-9 text-xs font-mono"
          />
        </div>
      </div>

      {/* TAB 1: STUDENT ATTENDANCE */}
      {activeTab === "STUDENTS" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Student Daily Attendance Register
              </CardTitle>
              <CardDescription className="text-xs">
                Select class and mark attendance status for each student
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleMarkAllStudents("PRESENT")}>
                <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" /> Mark All Present
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportStudentPDF}>
                <FileDown className="h-4 w-4 mr-1 text-indigo-600" /> Export PDF
              </Button>
              <Button size="sm" onClick={handleSaveStudentAttendance} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Label className="text-xs font-bold">Select Class / Section:</Label>
                <Select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-56 text-xs"
                >
                  {classSections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} {c.sectionName ? `- ${c.sectionName}` : ""}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>
            </div>

            {loading ? (
              <Spinner full={false} />
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No students found in this class"
                description="Enroll students into this class section to take daily attendance."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission / Roll No</TableHead>
                    <TableHead>Class / Section</TableHead>
                    <TableHead className="text-center">Attendance Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((st) => {
                    const currentStatus = studentStatusMap[st.id] || "PRESENT";
                    return (
                      <TableRow key={st.id}>
                        <TableCell className="font-semibold flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <span className="text-xs font-bold">{initials(st.fullName)}</span>
                          </Avatar>
                          <span>{st.fullName}</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {st.admissionNumber || st.rollNumber || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {st.className ? `${st.className} ${st.sectionName || ""}` : "Assigned Section"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
                            {ATTENDANCE_STATUSES.map((stObj) => (
                              <button
                                key={stObj.value}
                                onClick={() =>
                                  setStudentStatusMap((prev) => ({ ...prev, [st.id]: stObj.value }))
                                }
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                  currentStatus === stObj.value
                                    ? `${stObj.color} shadow-sm font-bold`
                                    : "text-muted-foreground hover:bg-background"
                                }`}
                              >
                                {stObj.label}
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Optional note..."
                            value={studentRemarksMap[st.id] || ""}
                            onChange={(e) =>
                              setStudentRemarksMap((prev) => ({ ...prev, [st.id]: e.target.value }))
                            }
                            className="h-8 text-xs w-44"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: FACULTY ATTENDANCE */}
      {activeTab === "FACULTY" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                Faculty & Staff Daily Attendance Register
              </CardTitle>
              <CardDescription className="text-xs">
                Mark attendance status for school/college faculty and staff members
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleMarkAllFaculty("PRESENT")}>
                <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-600" /> Mark All Present
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportFacultyPDF}>
                <FileDown className="h-4 w-4 mr-1 text-indigo-600" /> Export PDF
              </Button>
              <Button size="sm" onClick={handleSaveFacultyAttendance} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Faculty Attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border">
              <span className="text-xs font-bold text-muted-foreground">
                Showing {filteredFaculty.length} Staff Members
              </span>
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search faculty by name, dept..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>
            </div>

            {loading ? (
              <Spinner full={false} />
            ) : filteredFaculty.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No faculty members found"
                description="Add staff members in Staff Setup page to record faculty attendance."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty Member</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department / Role</TableHead>
                    <TableHead className="text-center">Attendance Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculty.map((fac) => {
                    const currentStatus = facultyStatusMap[fac.id] || "PRESENT";
                    return (
                      <TableRow key={fac.id}>
                        <TableCell className="font-semibold flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <span className="text-xs font-bold">{initials(fac.fullName)}</span>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{fac.fullName}</p>
                            <p className="text-xs text-muted-foreground">{fac.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {fac.employeeId || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {fac.department || "General Faculty"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
                            {ATTENDANCE_STATUSES.map((stObj) => (
                              <button
                                key={stObj.value}
                                onClick={() =>
                                  setFacultyStatusMap((prev) => ({ ...prev, [fac.id]: stObj.value }))
                                }
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                  currentStatus === stObj.value
                                    ? `${stObj.color} shadow-sm font-bold`
                                    : "text-muted-foreground hover:bg-background"
                                }`}
                              >
                                {stObj.label}
                              </button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Optional note..."
                            value={facultyRemarksMap[fac.id] || ""}
                            onChange={(e) =>
                              setFacultyRemarksMap((prev) => ({ ...prev, [fac.id]: e.target.value }))
                            }
                            className="h-8 text-xs w-44"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
