import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  MapPin,
  Users,
  ClipboardCheck,
  BookOpen,
  FileText,
  Award,
  MessageSquare,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Layers,
  FileEdit,
  TrendingUp,
  UserSquare2,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { facultyApi } from "@/api/faculty";
import { announcementApi } from "@/api/announcements";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const TODAY_SCHEDULE = [
  {
    id: 1,
    time: "08:30 - 09:20 AM",
    subject: "Quantum Mechanics",
    code: "PHY-301",
    section: "MSc Physics · Sec A",
    room: "Lab 204",
    students: 32,
    status: "COMPLETED",
    attendanceMarked: true,
  },
  {
    id: 2,
    time: "09:30 - 10:20 AM",
    subject: "Thermodynamics",
    code: "PHY-202",
    section: "BSc Physics · Sec B",
    room: "Hall 3",
    students: 48,
    status: "ONGOING",
    attendanceMarked: false,
  },
  {
    id: 3,
    time: "11:00 - 11:50 AM",
    subject: "Electromagnetism",
    code: "PHY-405",
    section: "MSc Physics · Sec B",
    room: "Room 102",
    students: 28,
    status: "UPCOMING",
    attendanceMarked: false,
  },
  {
    id: 4,
    time: "02:00 - 02:50 PM",
    subject: "Statistical Mechanics",
    code: "PHY-304",
    section: "BSc Physics · Sec A",
    room: "Lab 105",
    students: 45,
    status: "UPCOMING",
    attendanceMarked: false,
  },
];

const WORKFLOW_STEPS = [
  { step: 1, title: "Login", desc: "Teacher Authentication", path: "/login", icon: CheckCircle2, status: "Done" },
  { step: 2, title: "Dashboard", desc: "Overview & Central Hub", path: "/faculty/dashboard", icon: LayoutDashboard, status: "Active" },
  { step: 3, title: "Today's Teaching Info", desc: "Schedule & Daily Overview", path: "#todays-teaching", icon: Clock, status: "Today" },
  { step: 4, title: "Classes & Timetable", desc: "My Schedule & Classes", path: "/faculty/timetable", icon: Calendar, status: "Check" },
  { step: 5, title: "Take Attendance", desc: "Mark Class Attendance", path: "/faculty/attendance", icon: ClipboardCheck, status: "Action" },
  { step: 6, title: "Teach the Class", desc: "Lesson Plans & Materials", path: "/faculty/lesson-plans", icon: Layers, status: "Classroom" },
  { step: 7, title: "Assignments & Homework", desc: "Create & Review Work", path: "/faculty/assignments", icon: FileText, status: "Academics" },
  { step: 8, title: "Manage Students", desc: "Student Directory & Info", path: "/faculty/students", icon: Users, status: "Students" },
  { step: 9, title: "Exams & Performance", desc: "Marks, Grading & Analytics", path: "/faculty/examinations", icon: Award, status: "Grades" },
  { step: 10, title: "Communication", desc: "Messages & Notices", path: "/faculty/messages", icon: MessageSquare, status: "Connect" },
];

export default function FacultyDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [sumRes, annRes] = await Promise.allSettled([
          facultyApi.myAttendanceSummary(),
          announcementApi.list({ page: 0, size: 5 }),
        ]);

        if (isMounted) {
          if (sumRes.status === "fulfilled" && sumRes.value?.data?.data) {
            setSummary(sumRes.value.data.data);
          }
          if (annRes.status === "fulfilled" && annRes.value?.data?.data?.content) {
            setAnnouncements(annRes.value.data.data.content);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" /> Faculty Portal
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back, Professor!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here is your teaching workflow & daily schedule for today.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="gap-2">
              <Link to="/faculty/attendance">
                <ClipboardCheck className="h-4 w-4" /> Take Attendance Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/faculty/timetable">
                <Calendar className="h-4 w-4" /> View Timetable
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 10-Step Interactive Faculty Workflow Guide */}
      <Card className="border-primary/15 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-primary" /> Teacher Step-by-Step Workflow
              </CardTitle>
              <CardDescription className="text-xs">
                Follow your structured teaching sequence from daily start to student feedback
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">10 Active Steps</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {WORKFLOW_STEPS.map((wf) => {
              const Icon = wf.icon;
              const isToday = wf.step === 3;
              return (
                <Link
                  key={wf.step}
                  to={wf.path.startsWith('#') ? '#' : wf.path}
                  onClick={(e) => {
                    if (wf.path.startsWith('#')) {
                      e.preventDefault();
                      document.getElementById(wf.path.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all hover:shadow-md flex flex-col justify-between group ${
                    isToday
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border/60 hover:border-primary/50 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {wf.step}
                    </span>
                    <Badge variant={isToday ? "default" : "outline"} className="text-[10px] px-1.5 py-0 h-4">
                      {wf.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold group-hover:text-primary transition-colors">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{wf.title}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{wf.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Classes" value={TODAY_SCHEDULE.length} icon={BookOpen} accent="primary" />
        <StatCard label="Attendance Recorded" value={`${summary?.percentagePresent ? summary.percentagePresent.toFixed(1) : "95.0"}%`} icon={CalendarCheck} accent="success" />
        <StatCard label="Pending Assignments" value="12" icon={FileText} accent="warning" />
        <StatCard label="Unread Messages" value="4" icon={MessageSquare} accent="accent" />
      </div>

      {/* Today's Teaching Information Section (Step 3) */}
      <div id="todays-teaching" className="scroll-mt-6">
        <Card className="border-primary/20 shadow-xs">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Today's Teaching Information
                </CardTitle>
                <CardDescription>
                  Detailed view of classes, subjects, rooms, and attendance status for today
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
                <Link to="/faculty/timetable">
                  Full Timetable <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {TODAY_SCHEDULE.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  slot.status === "ONGOING"
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                    : "border-border/60 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start md:items-center gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      slot.status === "ONGOING"
                        ? "bg-primary text-primary-foreground"
                        : slot.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-foreground">{slot.subject}</h3>
                      <Badge variant="outline" className="text-[11px] font-mono">
                        {slot.code}
                      </Badge>
                      {slot.status === "ONGOING" && (
                        <Badge className="bg-primary text-primary-foreground animate-pulse text-[10px]">
                          LIVE NOW
                        </Badge>
                      )}
                      {slot.status === "COMPLETED" && (
                        <Badge
                          variant="secondary"
                          className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 text-[10px]"
                        >
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{slot.section}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-mono font-medium text-foreground bg-muted px-2.5 py-1 rounded-md">
                    <Clock className="h-3.5 w-3.5 text-primary" /> {slot.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {slot.room}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" /> {slot.students} Students
                  </div>

                  <div className="flex items-center gap-2 ml-auto md:ml-0">
                    <Button
                      asChild
                      size="sm"
                      variant={slot.attendanceMarked ? "outline" : "default"}
                      className="h-8 text-xs gap-1"
                    >
                      <Link to="/faculty/attendance">
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        {slot.attendanceMarked ? "Attendance Taken" : "Take Attendance"}
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="h-8 text-xs gap-1">
                      <Link to="/faculty/lesson-plans">
                        <Layers className="h-3.5 w-3.5" /> Lesson Plan
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Grid Section: Announcements & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Announcements */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Megaphone className="h-4.5 w-4.5 text-primary" /> Recent Institutional Announcements
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/faculty/announcements">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent announcements.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl border bg-card hover:bg-muted/20 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">{a.title}</h4>
                    <span className="text-[11px] text-muted-foreground">{formatDate(a.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Teaching Actions */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> Quick Teaching Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10 text-xs">
              <Link to="/faculty/attendance">
                <ClipboardCheck className="h-4 w-4 text-emerald-500" /> 1. Mark Class Attendance
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10 text-xs">
              <Link to="/faculty/lesson-plans">
                <Layers className="h-4 w-4 text-indigo-500" /> 2. Prepare Lesson Plan
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10 text-xs">
              <Link to="/faculty/assignments">
                <FileText className="h-4 w-4 text-blue-500" /> 3. Create New Assignment
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10 text-xs">
              <Link to="/faculty/homework">
                <FileEdit className="h-4 w-4 text-amber-500" /> 4. Assign Homework
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10 text-xs">
              <Link to="/faculty/marks-grading">
                <CheckSquare className="h-4 w-4 text-rose-500" /> 5. Enter Marks & Grades
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2.5 h-10 text-xs">
              <Link to="/faculty/messages">
                <MessageSquare className="h-4 w-4 text-purple-500" /> 6. Message Students / Parents
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
