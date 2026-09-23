import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserSquare2,
  Wallet,
  Megaphone,
  AlertTriangle,
  GraduationCap,
  CalendarCheck,
  Award,
  Clock,
  Building2,
  ArrowRight,
  TrendingUp,
  FileEdit,
  CalendarOff,
  MessageSquare,
  BarChart2,
  Layers,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowDown,
  Activity,
  Plus,
} from "lucide-react";
import { institutionApi } from "@/api/institution";
import { feeApi } from "@/api/fees";
import { studentApi } from "@/api/students";
import { facultyApi } from "@/api/faculty";
import { classSectionApi } from "@/api/classSections";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState(null);
  const [feeSummary, setFeeSummary] = useState({ totalCollected: 0, totalPending: 0 });
  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const [sectionsCount, setSectionsCount] = useState(0);

  useEffect(() => {
    Promise.all([
      institutionApi.getMine(),
      feeApi.summary(),
      studentApi.list({ page: 0, size: 1 }),
      facultyApi.list({ page: 0, size: 1 }),
      classSectionApi.list(),
    ])
      .then(([inst, fees, students, faculty, sec]) => {
        setInstitution(inst.data.data);
        setFeeSummary(fees.data.data);
        setStudentCount(students.data.data?.totalElements ?? inst.data.data.studentCount);
        setFacultyCount(faculty.data.data?.totalElements ?? inst.data.data.facultyCount);
        const sList = Array.isArray(sec?.data?.data) ? sec.data.data : (sec?.data?.data?.content || []);
        setSectionsCount(sList.length);
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const initialSetupModules = [
    { label: "1. Academic Setup", to: "/admin/academic-setup", icon: GraduationCap, desc: "Academic Sessions, Terms, Working Days", color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400" },
    { label: "2. Staff Setup", to: "/admin/staff-setup", icon: UserSquare2, desc: "Faculty & Staff Onboarding & Allocations", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "3. Class Setup", to: "/admin/class-setup", icon: Building2, desc: "Grade Levels & Course Tracks", color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400" },
    { label: "4. Subject Setup", to: "/admin/subject-setup", icon: BookOpen, desc: "Subject Catalog, Credits & Types", color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400" },
    { label: "5. Section Setup", to: "/admin/section-setup", icon: Layers, desc: "Class Sections & Class Teacher Assign", color: "from-cyan-500/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400" },
  ];

  const operationsModules = [
    { label: "Students", to: "/admin/students", icon: Users, desc: "Admissions, Records & Class Enrolment", color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck, desc: "Daily Student & Staff Attendance", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Fees", to: "/admin/fees", icon: Wallet, desc: "Structure, Invoices & Fee Collection", color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400" },
    { label: "Exams", to: "/admin/exams", icon: Award, desc: "Exams Schedule & Marks Entry", color: "from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400" },
    { label: "Homework", to: "/admin/homework", icon: FileEdit, desc: "Homework Tracking & Submissions", color: "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400" },
    { label: "Leave", to: "/admin/leave", icon: CalendarOff, desc: "Staff & Student Leave Approvals", color: "from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400" },
    { label: "Communication", to: "/admin/communication", icon: MessageSquare, desc: "Announcements & Parent Messaging", color: "from-purple-500/10 to-fuchsia-500/10 text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary/85 to-indigo-950 text-primary-foreground p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Academic Year 2026 - 2027</span>
              <span className="opacity-40">•</span>
              <span className="font-mono text-emerald-300">{institution?.code || "MAIN"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {institution?.name ? `${institution.name} Admin Dashboard` : "Admin Control Panel"}
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Complete initial setup steps, monitor daily institution operations, and generate reporting data synced with Super Admin monitoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button asChild size="sm" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md">
              <Link to="/admin/academic-setup">
                <GraduationCap className="h-4 w-4 mr-1" /> Initial Setup
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md">
              <Link to="/admin/reports">
                <BarChart2 className="h-4 w-4 mr-1" /> Reporting Data
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Workflow Hierarchy Box */}
      <Card className="border-primary/20 bg-gradient-to-r from-background via-primary/5 to-background shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Institution Workflow Hierarchy
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
              Active Sync to Super Admin
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Flow from Master/Super Admin configuration through Admin Initial Setup & Operations to Reporting Data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <div className="min-w-[650px] flex items-center justify-between gap-3 text-xs">
            <div className="flex-1 p-3 rounded-lg border bg-card text-center shadow-xs">
              <div className="font-bold text-primary flex items-center justify-center gap-1">
                <ShieldCheck className="h-4 w-4" /> MASTER ADMIN
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Platform Controller</p>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

            <div className="flex-1 p-3 rounded-lg border bg-card text-center shadow-xs">
              <div className="font-bold text-foreground">SUPER ADMIN</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Create Inst • Assign Admin • Limits</p>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

            <div className="flex-1 p-3 rounded-lg border bg-primary/10 border-primary/30 text-center shadow-xs">
              <div className="font-bold text-primary">ADMIN DASHBOARD</div>
              <p className="text-[10px] text-primary/80 mt-0.5">Current Active Role</p>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

            <div className="flex-1 p-3 rounded-lg border bg-card text-center shadow-xs">
              <div className="font-bold text-emerald-600">REPORTING DATA</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Synced to Super Admin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Staff & Faculty</p>
              <h3 className="text-2xl font-bold mt-1">{facultyCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary"><UserSquare2 className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Students Enrolled</p>
              <h3 className="text-2xl font-bold mt-1">{studentCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600"><Users className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Class Sections</p>
              <h3 className="text-2xl font-bold mt-1">{sectionsCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600"><Layers className="h-5 w-5" /></div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Fee Collection</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(feeSummary.totalCollected || 0)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600"><Wallet className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: INITIAL SETUP vs OPERATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: INITIAL SETUP */}
        <Card className="shadow-sm border-blue-500/20">
          <CardHeader className="bg-blue-500/5 border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <GraduationCap className="h-5 w-5" /> INITIAL SETUP
                </CardTitle>
                <CardDescription className="text-xs">
                  Prerequisite setup steps required before running full institution operations
                </CardDescription>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                5 Steps
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {initialSetupModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={idx}
                  to={mod.to}
                  className="group p-3.5 rounded-xl border bg-card hover:bg-blue-500/5 hover:border-blue-500/30 transition-all flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${mod.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                        {mod.label}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{mod.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Column: OPERATIONS */}
        <Card className="shadow-sm border-emerald-500/20">
          <CardHeader className="bg-emerald-500/5 border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Activity className="h-5 w-5" /> OPERATIONS
                </CardTitle>
                <CardDescription className="text-xs">
                  Daily operational management modules for students, faculty & administrative tasks
                </CardDescription>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                7 Modules
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {operationsModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={idx}
                  to={mod.to}
                  className="group p-3 rounded-xl border bg-card hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${mod.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                      {mod.label}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{mod.desc}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: REPORTING DATA & SUPER ADMIN MONITORING */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-card to-purple-500/5">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-xs font-bold">
              <BarChart2 className="h-3.5 w-3.5" /> REPORTING DATA & MONITORING
            </div>
            <h3 className="text-lg font-bold text-foreground">Operational Data & Super Admin Insights</h3>
            <p className="text-xs text-muted-foreground">
              All initial setup, student admissions, attendance, fees, and exam results compile into real-time reporting data accessible by Super Admin monitoring.
            </p>
          </div>
          <Button asChild className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
            <Link to="/admin/reports">
              <BarChart2 className="h-4 w-4 mr-1.5" /> Access Reports & Analytics
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
