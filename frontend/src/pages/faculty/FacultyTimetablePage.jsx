import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  GraduationCap,
  Layers,
  Printer,
  Sparkles,
  Info,
  CalendarDays,
} from "lucide-react";
import { timetableApi } from "@/api/timetable";
import { classSectionApi } from "@/api/classSections";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const DAY_NAMES = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

export default function FacultyTimetablePage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("my-schedule"); // "my-schedule" | "class-schedule"
  const [loading, setLoading] = useState(true);

  // Faculty's personal timetable
  const [myEntries, setMyEntries] = useState([]);
  const [selectedDayFilter, setSelectedDayFilter] = useState("ALL");

  // Class timetable (read-only reference)
  const [classSections, setClassSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classEntries, setClassEntries] = useState([]);
  const [classDay, setClassDay] = useState("MONDAY");
  const [classLoading, setClassLoading] = useState(false);

  // Current day of week for "Today" highlight
  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  // Load faculty's own assigned timetable & class sections list
  useEffect(() => {
    setLoading(true);
    Promise.all([
      timetableApi.getMyTimetable(),
      classSectionApi.list(),
    ])
      .then(([myRes, csRes]) => {
        const entries = Array.isArray(myRes?.data?.data) ? myRes.data.data : [];
        setMyEntries(entries);

        const csList = Array.isArray(csRes?.data?.data) ? csRes.data.data : [];
        setClassSections(csList);
        if (csList.length > 0) {
          setSelectedClass(String(csList[0].id));
        }
      })
      .catch((err) => {
        toast({
          title: "Failed to load schedule",
          description: extractErrorMessage(err),
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // When selectedClass changes in class-schedule tab, load that class's timetable
  useEffect(() => {
    if (!selectedClass || activeTab !== "class-schedule") return;
    setClassLoading(true);
    timetableApi
      .getClassTimetableForFaculty(selectedClass)
      .then((res) => {
        const entries = Array.isArray(res?.data?.data) ? res.data.data : [];
        setClassEntries(entries);
      })
      .catch((err) => {
        toast({
          title: "Failed to load class timetable",
          description: extractErrorMessage(err),
          variant: "destructive",
        });
      })
      .finally(() => setClassLoading(false));
  }, [selectedClass, activeTab]);

  // Filter personal entries
  const filteredMyEntries = myEntries
    .filter((e) => {
      if (selectedDayFilter === "ALL") return true;
      if (selectedDayFilter === "TODAY") return e.dayOfWeek === todayDayName;
      return e.dayOfWeek === selectedDayFilter;
    })
    .sort((a, b) => {
      const dayOrderA = DAYS_OF_WEEK.indexOf(a.dayOfWeek);
      const dayOrderB = DAYS_OF_WEEK.indexOf(b.dayOfWeek);
      if (dayOrderA !== dayOrderB) return dayOrderA - dayOrderB;
      return (a.periodNumber || 0) - (b.periodNumber || 0);
    });

  // Calculate quick metrics
  const uniqueClassesCount = new Set(myEntries.map((e) => e.classSectionId).filter(Boolean)).size;
  const activeDaysCount = new Set(myEntries.map((e) => e.dayOfWeek).filter(Boolean)).size;
  const todayPeriodsCount = myEntries.filter((e) => e.dayOfWeek === todayDayName).length;

  // Group class entries for the selected day
  const classEntriesForDay = classEntries
    .filter((e) => e.dayOfWeek === classDay)
    .sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Faculty Timetable"
        description="View your assigned teaching periods and class schedules (Read-Only)"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 shadow-xs"
            >
              <Printer className="h-4 w-4" /> Print Schedule
            </Button>
          </div>
        }
      />

      {/* Role & Central Management Notice */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400 text-xs">
        <Info className="h-4 w-4 shrink-0" />
        <div>
          <span className="font-semibold">Centralized Schedule:</span> Timetables are managed centrally by the School Administrator. Contact administration for slot adjustments or reassignments.
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Weekly Periods</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{myEntries.length}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Assigned teaching slots</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Today's Schedule</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{todayPeriodsCount}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {DAY_NAMES[todayDayName] || "Weekend"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Classes Taught</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{uniqueClassesCount}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Assigned class sections</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Teaching Days</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{activeDaysCount} Days</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Per academic week</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs: My Assigned Schedule vs Class Timetables */}
      <div className="space-y-4">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("my-schedule")}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "my-schedule"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" /> My Assigned Schedule ({myEntries.length})
          </button>
          <button
            onClick={() => setActiveTab("class-schedule")}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "class-schedule"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" /> Class Timetables (Reference)
          </button>
        </div>

        {/* TAB 1: MY ASSIGNED SCHEDULE */}
        {activeTab === "my-schedule" && (
          <div className="space-y-4">
            {/* Day Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Button
                variant={selectedDayFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDayFilter("ALL")}
                className="text-xs"
              >
                All Days ({myEntries.length})
              </Button>
              {todayPeriodsCount > 0 && (
                <Button
                  variant={selectedDayFilter === "TODAY" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDayFilter("TODAY")}
                  className="text-xs gap-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" /> Today ({todayPeriodsCount})
                </Button>
              )}
              {DAYS_OF_WEEK.map((day) => {
                const count = myEntries.filter((e) => e.dayOfWeek === day).length;
                return (
                  <Button
                    key={day}
                    variant={selectedDayFilter === day ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDayFilter(day)}
                    className="text-xs"
                  >
                    {DAY_NAMES[day]} {count > 0 && `(${count})`}
                  </Button>
                );
              })}
            </div>

            {/* Teaching Slots Grid */}
            {filteredMyEntries.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Calendar}
                  title="No assigned periods found"
                  description={
                    selectedDayFilter === "ALL"
                      ? "You currently have no teaching periods assigned. Contact your school administrator to allocate periods in the Timetable module."
                      : `No teaching periods assigned for ${DAY_NAMES[selectedDayFilter] || selectedDayFilter}.`
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMyEntries.map((slot) => {
                  const isToday = slot.dayOfWeek === todayDayName;
                  return (
                    <Card
                      key={slot.id}
                      className={`transition-all hover:shadow-md border ${
                        isToday ? "border-primary/40 bg-primary/5" : "bg-card"
                      }`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs font-mono">
                            {DAY_NAMES[slot.dayOfWeek] || slot.dayOfWeek}
                          </Badge>
                          <span className="text-xs font-mono font-medium bg-muted px-2 py-0.5 rounded text-foreground">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold text-foreground mt-2">
                          {slot.subject}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-primary">
                          {slot.periodName || `Period ${slot.periodNumber}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-1 space-y-2 text-xs text-muted-foreground border-t mt-2">
                        <div className="flex items-center justify-between pt-1">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            {slot.className} {slot.sectionName ? `(${slot.sectionName})` : ""}
                          </span>
                          {slot.roomNumber && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {slot.roomNumber}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLASS TIMETABLE REFERENCE (READ-ONLY) */}
        {activeTab === "class-schedule" && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">Select Class & Section</h4>
                  <p className="text-xs text-muted-foreground">
                    View complete routine and teaching allocations for any class
                  </p>
                </div>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-64"
                >
                  {classSections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} {c.sectionName || ""} ({c.academicYear})
                    </option>
                  ))}
                </Select>
              </CardContent>
            </Card>

            {/* Day Selector for Class Schedule */}
            <div className="flex border-b overflow-x-auto">
              {DAYS_OF_WEEK.map((day) => {
                const count = classEntries.filter((e) => e.dayOfWeek === day).length;
                return (
                  <button
                    key={day}
                    onClick={() => setClassDay(day)}
                    className={`px-4 py-2.5 font-medium text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                      classDay === day
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {DAY_NAMES[day]}
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                        classDay === day
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Class Period Slots */}
            {classLoading ? (
              <Spinner full />
            ) : classEntriesForDay.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Calendar}
                  title="No timetable configured"
                  description={`No periods scheduled for ${DAY_NAMES[classDay]} in this class.`}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classEntriesForDay.map((slot) => (
                  <Card key={slot.id} className="border shadow-xs bg-card">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {slot.periodName || `Period ${slot.periodNumber}`}
                      </CardTitle>
                      <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-2">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{slot.subject}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Teacher: <span className="font-medium text-foreground">{slot.facultyName || "Unassigned"}</span>
                        </p>
                        {slot.roomNumber && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {slot.roomNumber}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
