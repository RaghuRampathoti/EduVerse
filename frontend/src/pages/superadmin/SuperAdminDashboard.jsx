import React, { useEffect, useState } from "react";
import {
  Users,
  UserSquare2,
  Wallet,
  Megaphone,
  AlertTriangle,
  Building2,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Bell,
  CalendarCheck,
  Filter,
  Eye,
} from "lucide-react";
import { institutionApi } from "@/api/institution";
import { feeApi } from "@/api/fees";
import { studentApi } from "@/api/students";
import { facultyApi } from "@/api/faculty";
import { announcementApi } from "@/api/announcements";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

const STORAGE_KEY = "eduverse_superadmin_institutions";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState(null);
  const [feeSummary, setFeeSummary] = useState({ totalCollected: 0, totalPending: 0 });
  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [savedBranches, setSavedBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("ALL");

  useEffect(() => {
    Promise.all([
      institutionApi.getMine(),
      feeApi.summary(),
      studentApi.list({ page: 0, size: 1 }),
      facultyApi.list({ page: 0, size: 1 }),
      announcementApi.list({ page: 0, size: 5 }),
    ])
      .then(([inst, fees, students, faculty, ann]) => {
        const org = inst.data.data;
        setInstitution(org);
        setFeeSummary(fees.data.data);
        setStudentCount(students.data.data.totalElements ?? org.studentCount);
        setFacultyCount(faculty.data.data.totalElements ?? org.facultyCount);
        setAnnouncements(ann.data.data.content || []);

        // Load saved branch institutions
        const saved = localStorage.getItem(`${STORAGE_KEY}_${org.id}`);
        if (saved) {
          try {
            setSavedBranches(JSON.parse(saved));
          } catch {
            setSavedBranches([]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const allBranches = savedBranches.map((b) => ({
    id: b.id,
    name: b.name,
    type: b.type || "SCHOOL",
    students: b.students || 0,
    faculty: b.faculty || 0,
    attendance: "N/A",
    collected: b.collected || 0,
    pending: b.pending || 0,
    status: b.status || "ACTIVE",
  }));

  const selectedBranch = selectedBranchId !== "ALL"
    ? allBranches.find(b => String(b.id) === String(selectedBranchId))
    : null;

  const displayStudents = selectedBranch ? selectedBranch.students : (savedBranches.length > 0 ? allBranches.reduce((acc, b) => acc + b.students, 0) : studentCount);
  const displayFaculty = selectedBranch ? selectedBranch.faculty : (savedBranches.length > 0 ? allBranches.reduce((acc, b) => acc + b.faculty, 0) : facultyCount);
  const displayCollected = selectedBranch ? selectedBranch.collected : (savedBranches.length > 0 ? allBranches.reduce((acc, b) => acc + b.collected, 0) : feeSummary.totalCollected);
  const displayPending = selectedBranch ? selectedBranch.pending : (savedBranches.length > 0 ? allBranches.reduce((acc, b) => acc + b.pending, 0) : feeSummary.totalPending);

  return (
    <div className="space-y-6">
      <PageHeader
        title={selectedBranch ? `${selectedBranch.name} Dashboard` : (institution?.name ? `${institution.name} Organization` : "Super Admin Organization")}
        description={selectedBranch ? `Specific operational status & performance metrics for ${selectedBranch.name}` : "Comprehensive operational dashboard across all schools, colleges, and institutes under your management"}
        actions={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} className="w-64">
              <option value="ALL">All Institutions (Portfolio View)</option>
              {allBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.type})
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {/* Operational Alerts Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">
              Operational Alerts {selectedBranch ? `for ${selectedBranch.name}` : "(2 Require Attention)"}
            </h4>
            <p className="text-xs text-muted-foreground">
              • Term 2 fee collection deadline approaching in 5 days | • Low attendance warning in Section 9-B (78% vs 90% threshold)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-background border shadow-sm">
          <Bell className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
          Live Alert Monitor
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={selectedBranch ? "Enrolled Students" : "Total Enrolled Students"}
          value={displayStudents}
          icon={Users}
          accent="primary"
          subtext={selectedBranch ? `${selectedBranch.name} student roster` : `Across ${allBranches.length} institutions`}
        />
        <StatCard
          label={selectedBranch ? "Faculty Staff" : "Total Faculty Staff"}
          value={displayFaculty}
          icon={UserSquare2}
          accent="info"
          subtext="Active teaching staff"
        />
        <StatCard
          label="Fees Collected"
          value={formatCurrency(displayCollected)}
          icon={Wallet}
          accent="success"
          subtext="Academic Year 2026-2027"
        />
        <StatCard
          label="Pending Fee Balance"
          value={formatCurrency(displayPending)}
          icon={Wallet}
          accent="warning"
          subtext="Follow-up reminder sent"
        />
      </div>

      {/* Grid: Branch-by-Branch Portfolio Health & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Portfolio Health */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Branch-by-Branch Operational Overview
              </span>
              <span className="text-xs font-normal text-muted-foreground">{allBranches.length} Institutions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBranches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No institutions or branches created yet. Super Admin can add schools, colleges, or universities under Institutions.
                    </TableCell>
                  </TableRow>
                ) : (
                  allBranches.map((b, idx) => (
                    <TableRow key={b.id || idx} className={selectedBranchId === String(b.id) ? "bg-primary/5 font-medium" : ""}>
                      <TableCell className="font-semibold text-foreground">{b.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {b.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">{b.students}</TableCell>
                      <TableCell>{b.faculty}</TableCell>
                      <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">{b.attendance}</TableCell>
                      <TableCell>
                        <StatusBadge status={b.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={selectedBranchId === String(b.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedBranchId(selectedBranchId === String(b.id) ? "ALL" : String(b.id))}
                          className="h-7 text-xs gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          {selectedBranchId === String(b.id) ? "Showing" : "Filter Status"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" /> Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements posted yet.</p>}
            {announcements.map((a) => (
              <div key={a.id} className="border-b last:border-0 pb-3 last:pb-0">
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(a.createdAt)} · {a.postedByName}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
