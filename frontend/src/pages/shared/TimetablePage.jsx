import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  AlertCircle,
  Layers,
  GraduationCap,
  BookOpen,
  LayoutGrid,
  List,
  CheckCircle2,
} from "lucide-react";
import { classSectionApi } from "@/api/classSections";
import { facultyApi } from "@/api/faculty";
import { timetableApi } from "@/api/timetable";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const DAY_NAMES = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

const DEFAULT_PERIOD_TIMES = {
  1: { start: "09:00 AM", end: "09:45 AM", name: "Period 1" },
  2: { start: "09:45 AM", end: "10:30 AM", name: "Period 2" },
  3: { start: "10:30 AM", end: "11:15 AM", name: "Period 3" },
  4: { start: "11:15 AM", end: "12:00 PM", name: "Period 4" },
  5: { start: "01:00 PM", end: "01:45 PM", name: "Period 5" },
  6: { start: "01:45 PM", end: "02:30 PM", name: "Period 6" },
  7: { start: "02:30 PM", end: "03:15 PM", name: "Period 7" },
  8: { start: "03:15 PM", end: "04:00 PM", name: "Period 8" },
};

const COMMON_SUBJECT_SUGGESTIONS = [
  "Mathematics",
  "English",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Studies",
  "Computer Science",
  "Physical Education",
  "Library / Reading",
  "Class Teacher Period / Attendance",
];

const EMPTY_FORM = {
  classSectionId: "",
  dayOfWeek: "MONDAY",
  periodNumber: 1,
  periodName: "Period 1",
  startTime: "09:00 AM",
  endTime: "09:45 AM",
  subject: "",
  facultyId: "",
  roomNumber: "Classroom",
};

const EMPTY_CLASS_FORM = {
  className: "",
  sectionName: "A",
  academicYear: "2026-2027",
  classTeacherId: "",
  capacity: 60,
};

export default function TimetablePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");

  // Navigation View: "grid" (single class weekly schedule) or "all-classes" (overview of every class)
  const [viewMode, setViewMode] = useState("grid");

  // State
  const [classSections, setClassSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);

  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [loading, setLoading] = useState(true);

  // Timetable Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [assigningFirstPeriod, setAssigningFirstPeriod] = useState(false);
  const [error, setError] = useState("");

  // Quick Class Creation Dialog
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [classForm, setClassForm] = useState(EMPTY_CLASS_FORM);
  const [creatingClass, setCreatingClass] = useState(false);
  const [quickSeeding, setQuickSeeding] = useState(false);

  // Load class sections & faculty list
  const loadClassSectionsAndFaculty = async () => {
    setLoading(true);
    try {
      const [csRes, facRes] = await Promise.all([
        classSectionApi.list(),
        facultyApi.list({ page: 0, size: 200 }),
      ]);
      const csList = Array.isArray(csRes?.data?.data) ? csRes.data.data : [];
      const facList = Array.isArray(facRes?.data?.data?.content)
        ? facRes.data.data.content
        : Array.isArray(facRes?.data?.data)
        ? facRes.data.data
        : [];

      setClassSections(csList);
      setFacultyList(facList);

      if (csList.length > 0) {
        setSelectedClass((prev) => (prev && csList.some((c) => String(c.id) === String(prev)) ? prev : String(csList[0].id)));
      } else {
        setSelectedClass("");
      }
    } catch (err) {
      toast({
        title: "Failed to load data",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassSectionsAndFaculty();
  }, []);

  // Load timetable for selected class section
  const loadTimetableForClass = async (classId) => {
    if (!classId) {
      setTimetableEntries([]);
      return;
    }
    try {
      const { data } = await timetableApi.listByClass(classId);
      setTimetableEntries(data.data || []);
    } catch (err) {
      toast({
        title: "Failed to load timetable",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadTimetableForClass(selectedClass);
    }
  }, [selectedClass]);

  const activeSection = classSections.find((c) => String(c.id) === String(selectedClass));

  // Open creation modal for a specific period or generic entry
  function openCreateForPeriod(pNum, day = selectedDay, targetClassId = selectedClass) {
    const existing = timetableEntries.find(
      (e) => e.dayOfWeek === day && e.periodNumber === pNum
    );
    const defaults = DEFAULT_PERIOD_TIMES[pNum] || { start: "09:00 AM", end: "09:45 AM", name: `Period ${pNum}` };

    if (existing && String(targetClassId) === String(selectedClass)) {
      setForm({
        id: existing.id,
        classSectionId: String(targetClassId),
        dayOfWeek: existing.dayOfWeek,
        periodNumber: existing.periodNumber,
        periodName: existing.periodName || defaults.name,
        startTime: existing.startTime || defaults.start,
        endTime: existing.endTime || defaults.end,
        subject: existing.subject,
        facultyId: existing.facultyId ? String(existing.facultyId) : "",
        roomNumber: existing.roomNumber || "Classroom",
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        classSectionId: String(targetClassId || selectedClass || (classSections[0]?.id ?? "")),
        dayOfWeek: day,
        periodNumber: pNum,
        periodName: defaults.name,
        startTime: defaults.start,
        endTime: defaults.end,
      });
    }
    setError("");
    setDialogOpen(true);
  }

  // Generic "+ Create Timetable Entry" button
  function openGenericCreate(targetClassId = null) {
    const classId = targetClassId || selectedClass || (classSections[0]?.id ? String(classSections[0].id) : "");
    const defaults = DEFAULT_PERIOD_TIMES[1];
    setForm({
      ...EMPTY_FORM,
      classSectionId: String(classId),
      dayOfWeek: selectedDay,
      periodNumber: 1,
      periodName: defaults.name,
      startTime: defaults.start,
      endTime: defaults.end,
    });
    setError("");
    setDialogOpen(true);
  }

  // Handle Timetable Entry Submit
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.classSectionId) {
      setError("Please select a Class & Section");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        classSectionId: Number(form.classSectionId),
        dayOfWeek: form.dayOfWeek,
        periodNumber: Number(form.periodNumber),
        periodName: form.periodName,
        startTime: form.startTime,
        endTime: form.endTime,
        subject: form.subject,
        facultyId: form.facultyId ? Number(form.facultyId) : null,
        roomNumber: form.roomNumber,
      };
      await timetableApi.saveEntry(payload);
      toast({ title: "Timetable entry saved", variant: "success" });
      setDialogOpen(false);

      if (String(form.classSectionId) !== String(selectedClass)) {
        setSelectedClass(String(form.classSectionId));
      } else {
        await loadTimetableForClass(selectedClass);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Delete
  async function handleDelete(id) {
    if (!window.confirm("Delete this period schedule entry?")) return;
    try {
      await timetableApi.deleteEntry(id);
      toast({ title: "Period schedule deleted", variant: "success" });
      await loadTimetableForClass(selectedClass);
    } catch (err) {
      toast({ title: "Failed to delete", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  // Handle Auto-assign 1st period
  async function handleAssignFirstPeriod(targetClassId = selectedClass) {
    if (!targetClassId) return;
    setAssigningFirstPeriod(true);
    try {
      const { data } = await timetableApi.assignFirstPeriod(targetClassId);
      if (String(targetClassId) === String(selectedClass)) {
        setTimetableEntries(data.data || []);
      }
      toast({
        title: "1st Period Assigned!",
        description: data.message || `First period assigned to Class Teacher across all days`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed to Assign 1st Period",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setAssigningFirstPeriod(false);
    }
  }

  // Handle Quick Class Creation
  async function handleCreateClass(e) {
    e.preventDefault();
    if (!classForm.className.trim()) {
      toast({ title: "Class name is required", variant: "destructive" });
      return;
    }
    setCreatingClass(true);
    try {
      const payload = {
        className: classForm.className.trim(),
        sectionName: classForm.sectionName?.trim() || "A",
        academicYear: classForm.academicYear?.trim() || "2026-2027",
        classTeacherId: classForm.classTeacherId ? Number(classForm.classTeacherId) : null,
        capacity: Number(classForm.capacity) || 60,
      };
      const res = await classSectionApi.create(payload);
      toast({ title: "Class created successfully!", variant: "success" });
      setClassDialogOpen(false);
      setClassForm(EMPTY_CLASS_FORM);

      await loadClassSectionsAndFaculty();
      if (res?.data?.data?.id) {
        setSelectedClass(String(res.data.data.id));
      }
    } catch (err) {
      toast({
        title: "Failed to create class",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setCreatingClass(false);
    }
  }

  // Quick Seed 10 Standard Classes (Grade 1 to Grade 10)
  async function handleQuickSeedClasses() {
    if (!window.confirm("Quick setup standard classes (Grade 1 to Grade 10, Section A)?")) return;
    setQuickSeeding(true);
    try {
      const standardGrades = [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
      ];
      for (const g of standardGrades) {
        await classSectionApi.create({
          className: g,
          sectionName: "A",
          academicYear: "2026-2027",
          capacity: 60,
        });
      }
      toast({ title: "Standard classes created!", description: "Grade 1 to Grade 10 are now ready for timetable scheduling.", variant: "success" });
      await loadClassSectionsAndFaculty();
    } catch (err) {
      toast({
        title: "Quick setup encountered an issue",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setQuickSeeding(false);
    }
  }

  // Filter entries for currently selected day
  const dayEntriesMap = {};
  timetableEntries
    .filter((e) => e.dayOfWeek === selectedDay)
    .forEach((e) => {
      dayEntriesMap[e.periodNumber] = e;
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Timetable Management"
        description="Centralized administration: Create, schedule, and manage period timetables for every class"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted p-1 rounded-lg border text-xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Class Schedule Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all-classes")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "all-classes"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" /> All Classes ({classSections.length})
              </button>
            </div>

            {/* Quick Class Creation */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClassDialogOpen(true)}
                className="gap-1.5 shadow-xs"
              >
                <Layers className="h-4 w-4 text-primary" /> + Add Class
              </Button>
            )}

            {/* Timetable Entry Creation Option */}
            {isAdmin && classSections.length > 0 && (
              <Button
                size="sm"
                onClick={() => openGenericCreate()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create Timetable Entry
              </Button>
            )}
          </div>
        }
      />

      {/* When NO class sections exist: Actionable Empty State */}
      {loading ? (
        <Spinner full />
      ) : classSections.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center bg-card">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
              <Calendar className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">No Classes Available Yet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Before creating timetables, you need class sections in your institution. You can add your custom class or set up standard classes instantly below.
              </p>
            </div>
            {isAdmin && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => setClassDialogOpen(true)}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 gap-1.5 font-semibold shadow-sm"
                >
                  <Plus className="h-4 w-4" /> + Create New Class & Section
                </Button>
                <Button
                  variant="outline"
                  onClick={handleQuickSeedClasses}
                  disabled={quickSeeding}
                  className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/5 gap-1.5 font-semibold"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {quickSeeding ? "Setting up..." : "⚡ Quick Setup (Grade 1 - 10)"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* VIEW MODE 1: CLASS SCHEDULE GRID */}
          {viewMode === "grid" && (
            <div className="space-y-6">
              {/* Class Selector Bar & Class Teacher Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Active Class Section
                    </Label>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-64 font-bold text-sm"
                      >
                        {classSections.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.className} {c.sectionName ? `· Sec ${c.sectionName}` : ""} ({c.academicYear})
                          </option>
                        ))}
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openGenericCreate(selectedClass)}
                        className="text-xs text-primary hover:text-primary gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Slot
                      </Button>
                    </div>
                  </div>
                </div>

                {activeSection && (
                  <div className="flex flex-wrap items-center gap-3 sm:self-center">
                    <div className="text-xs bg-muted/60 px-3 py-1.5 rounded-lg border">
                      <span className="text-muted-foreground">Class Teacher: </span>
                      {activeSection.classTeacherName ? (
                        <span className="font-semibold text-foreground">{activeSection.classTeacherName}</span>
                      ) : (
                        <span className="text-amber-600 font-medium">Unassigned</span>
                      )}
                    </div>

                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAssignFirstPeriod(selectedClass)}
                        disabled={assigningFirstPeriod || !activeSection.classTeacherName}
                        className="gap-1.5 text-xs font-semibold shadow-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        {assigningFirstPeriod ? "Assigning..." : "Assign 1st Period to Class Teacher"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Day Tabs Selector */}
              <div className="flex border-b overflow-x-auto">
                {DAYS_OF_WEEK.map((day) => {
                  const count = timetableEntries.filter((e) => e.dayOfWeek === day).length;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2.5 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                        selectedDay === day
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {DAY_NAMES[day]}
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                          selectedDay === day
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

              {/* Periods Grid (1 to 8) for Selected Day */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((pNum) => {
                  const entry = dayEntriesMap[pNum];
                  const defaults = DEFAULT_PERIOD_TIMES[pNum];

                  return (
                    <Card
                      key={pNum}
                      className={`transition-all ${
                        entry
                          ? "border bg-card shadow-xs hover:shadow-md"
                          : "border-dashed border-2 bg-muted/20 hover:bg-muted/30"
                      }`}
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {entry?.periodName || defaults.name}
                        </CardTitle>
                        <span className="text-[11px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
                          {entry?.startTime || defaults.start} - {entry?.endTime || defaults.end}
                        </span>
                      </CardHeader>

                      <CardContent className="p-4 pt-2 space-y-3">
                        {entry ? (
                          <div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground leading-tight">
                                {entry.subject}
                              </h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="font-medium text-foreground">
                                  {entry.facultyName || "No Teacher Assigned"}
                                </span>
                              </p>
                              {entry.roomNumber && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span>{entry.roomNumber}</span>
                                </p>
                              )}
                            </div>

                            {isAdmin && (
                              <div className="flex justify-end gap-1 mt-3 pt-2 border-t">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openCreateForPeriod(pNum, selectedDay, selectedClass)}
                                  className="h-7 px-2 text-xs"
                                >
                                  <Pencil className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(entry.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4 space-y-2">
                            <p className="text-xs text-muted-foreground">Unscheduled Slot</p>
                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCreateForPeriod(pNum, selectedDay, selectedClass)}
                                className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/5 gap-1"
                              >
                                <Plus className="h-3 w-3" /> Assign Period {pNum}
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: ALL CLASSES OVERVIEW & CREATION MATRIX */}
          {viewMode === "all-classes" && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" /> All Classes Timetable Status
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Create, configure, and inspect timetable period schedules across every class section in the organization
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <Button
                        size="sm"
                        onClick={() => openGenericCreate()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs gap-1.5"
                      >
                        <Plus className="h-4 w-4" /> Create Timetable for Class
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Class & Section</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Class Teacher</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classSections.map((sec) => (
                        <TableRow key={sec.id} className="hover:bg-muted/20">
                          <TableCell className="font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                {sec.className?.charAt(0) || "C"}
                              </div>
                              <div>
                                <span>{sec.className}</span>
                                {sec.sectionName && (
                                  <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                                    Sec {sec.sectionName}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {sec.academicYear || "2026-2027"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {sec.classTeacherName ? (
                              <span className="font-semibold text-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                {sec.classTeacherName}
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {sec.capacity || 60} Students
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openGenericCreate(sec.id)}
                                className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/5 gap-1"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add Period
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedClass(String(sec.id));
                                  setViewMode("grid");
                                }}
                                className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                              >
                                View Schedule
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* DIALOG 1: CREATE / EDIT TIMETABLE PERIOD ENTRY */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Edit Period Schedule" : "Create Timetable Entry"}
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Target Class Selection */}
              <div className="space-y-1.5 col-span-2">
                <Label>Class & Section *</Label>
                <Select
                  value={form.classSectionId}
                  onChange={(e) => setForm((f) => ({ ...f, classSectionId: e.target.value }))}
                  required
                >
                  <option value="">Select Target Class...</option>
                  {classSections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} {c.sectionName ? `· Sec ${c.sectionName}` : ""} ({c.academicYear})
                    </option>
                  ))}
                </Select>
              </div>

              {/* Day of Week */}
              <div className="space-y-1.5">
                <Label>Day of Week *</Label>
                <Select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
                  required
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {DAY_NAMES[d]}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Period Number */}
              <div className="space-y-1.5">
                <Label>Period Number *</Label>
                <Select
                  value={form.periodNumber}
                  onChange={(e) => {
                    const pNum = Number(e.target.value);
                    const defs = DEFAULT_PERIOD_TIMES[pNum] || { start: "09:00 AM", end: "09:45 AM", name: `Period ${pNum}` };
                    setForm((f) => ({
                      ...f,
                      periodNumber: pNum,
                      periodName: defs.name,
                      startTime: defs.start,
                      endTime: defs.end,
                    }));
                  }}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      Period {num}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5 col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Subject Name *</Label>
                  <span className="text-[11px] text-muted-foreground">Click common subject:</span>
                </div>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Mathematics, English, Physics"
                  required
                />
                {/* Quick Subject Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COMMON_SUBJECT_SUGGESTIONS.slice(0, 6).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, subject: sub }))}
                      className="text-[10px] bg-muted hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded transition-colors border"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Faculty */}
              <div className="space-y-1.5 col-span-2">
                <Label>Assigned Teacher / Faculty</Label>
                <Select
                  value={form.facultyId}
                  onChange={(e) => setForm((f) => ({ ...f, facultyId: e.target.value }))}
                >
                  <option value="">Select Teacher (Unassigned)</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} {f.department ? `(${f.department})` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Start & End Times */}
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  placeholder="09:00 AM"
                />
              </div>

              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  placeholder="09:45 AM"
                />
              </div>

              {/* Room / Classroom */}
              <div className="space-y-1.5 col-span-2">
                <Label>Room / Lab / Location</Label>
                <Input
                  value={form.roomNumber}
                  onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                  placeholder="e.g. Room 101, Science Lab, Classroom"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
                {submitting ? "Saving..." : form.id ? "Update Entry" : "Save Timetable Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: QUICK CLASS & SECTION CREATION */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent onClose={() => setClassDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add New Class & Section</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Class Name *</Label>
              <Input
                value={classForm.className}
                onChange={(e) => setClassForm((f) => ({ ...f, className: e.target.value }))}
                placeholder="e.g. Grade 10, Class 5, Inter 1st Year, B.Tech CSE"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Section Name</Label>
                <Input
                  value={classForm.sectionName}
                  onChange={(e) => setClassForm((f) => ({ ...f, sectionName: e.target.value }))}
                  placeholder="e.g. A, B, C"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Academic Year</Label>
                <Input
                  value={classForm.academicYear}
                  onChange={(e) => setClassForm((f) => ({ ...f, academicYear: e.target.value }))}
                  placeholder="2026-2027"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Class Teacher (Optional)</Label>
              <Select
                value={classForm.classTeacherId}
                onChange={(e) => setClassForm((f) => ({ ...f, classTeacherId: e.target.value }))}
              >
                <option value="">Select Teacher (Unassigned)</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName} {f.department ? `(${f.department})` : ""}
                  </option>
                ))}
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creatingClass} className="bg-primary hover:bg-primary/90">
                {creatingClass ? "Creating Class..." : "Create Class & Section"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
