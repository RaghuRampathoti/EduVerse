import React, { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, User, Plus, Pencil, Trash2, Sparkles, AlertCircle } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const DEFAULT_PERIOD_TIMES = {
  1: { start: "09:00 AM", end: "09:45 AM", name: "Period 1" },
  2: { start: "09:45 AM", end: "10:30 AM", name: "Period 2" },
  3: { start: "10:30 AM", end: "11:15 AM", name: "Period 3" },
  4: { start: "11:15 AM", end: "12:00 PM", name: "Period 4" },
  5: { start: "01:00 PM", end: "01:45 PM", name: "Period 5" },
  6: { start: "01:45 PM", end: "02:30 PM", name: "Period 6" },
  7: { start: "02:30 PM", end: "03:15 PM", name: "Period 7" },
};

const EMPTY_FORM = {
  dayOfWeek: "MONDAY",
  periodNumber: 1,
  periodName: "Period 1",
  startTime: "09:00 AM",
  endTime: "09:45 AM",
  subject: "",
  facultyId: "",
  roomNumber: "Classroom",
};

export default function TimetablePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user && user.role === "ADMIN";

  const [classSections, setClassSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);

  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [assigningFirstPeriod, setAssigningFirstPeriod] = useState(false);
  const [error, setError] = useState("");

  // Load class sections and faculty list
  useEffect(() => {
    setLoading(true);
    Promise.all([classSectionApi.list(), facultyApi.list({ page: 0, size: 200 })])
      .then(([csRes, facRes]) => {
        const csList = Array.isArray(csRes?.data?.data) ? csRes.data.data : [];
        const facList = Array.isArray(facRes?.data?.data?.content) ? facRes.data.data.content : [];
        setClassSections(csList);
        setFacultyList(facList);
        if (csList.length > 0) setSelectedClass(String(csList[0].id));
        else setLoading(false);
      })
      .catch((err) => {
        toast({ title: "Failed to load class sections", description: extractErrorMessage(err), variant: "destructive" });
        setLoading(false);
      });
  }, []);

  // Load timetable for selected class section
  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    timetableApi
      .listByClass(selectedClass)
      .then(({ data }) => {
        setTimetableEntries(data.data || []);
      })
      .catch((err) => {
        toast({ title: "Failed to load timetable", description: extractErrorMessage(err), variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [selectedClass]);

  const activeSection = classSections.find((c) => String(c.id) === String(selectedClass));

  function openCreateForPeriod(pNum, day = selectedDay) {
    const existing = timetableEntries.find(
      (e) => e.dayOfWeek === day && e.periodNumber === pNum
    );
    const defaults = DEFAULT_PERIOD_TIMES[pNum] || { start: "09:00 AM", end: "09:45 AM", name: `Period ${pNum}` };

    if (existing) {
      setForm({
        id: existing.id,
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

  async function handleAssignFirstPeriod() {
    if (!selectedClass) return;
    setAssigningFirstPeriod(true);
    try {
      const { data } = await timetableApi.assignFirstPeriod(selectedClass);
      setTimetableEntries(data.data || []);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        classSectionId: Number(selectedClass),
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

      // Reload
      const { data } = await timetableApi.listByClass(selectedClass);
      setTimetableEntries(data.data || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this period schedule entry?")) return;
    try {
      await timetableApi.deleteEntry(id);
      toast({ title: "Period schedule deleted", variant: "success" });
      const { data } = await timetableApi.listByClass(selectedClass);
      setTimetableEntries(data.data || []);
    } catch (err) {
      toast({ title: "Failed to delete", description: extractErrorMessage(err), variant: "destructive" });
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
      <PageHeader
        title="Time Table"
        description="Prepare and manage weekly period schedules for every class"
        actions={
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <Label className="text-xs text-muted-foreground">Select Class & Section</Label>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-52">
                {classSections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} {c.sectionName || ""} ({c.academicYear})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        }
      />

      {/* Class Teacher & Auto-Assign Header Banner */}
      {activeSection && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Class: {activeSection.className} {activeSection.sectionName || ""}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Class Teacher:{" "}
                  {activeSection.classTeacherName ? (
                    <span className="font-semibold text-primary">{activeSection.classTeacherName}</span>
                  ) : (
                    <span className="text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Unassigned
                    </span>
                  )}
                </p>
              </div>
            </div>

            {isAdmin && (
              <Button
                onClick={handleAssignFirstPeriod}
                disabled={assigningFirstPeriod || !activeSection.classTeacherName}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                {assigningFirstPeriod ? "Assigning..." : "Assign 1st Period to Class Teacher"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Spinner full />
      ) : classSections.length === 0 ? (
        <Card>
          <EmptyState
            icon={Calendar}
            title="No class sections available"
            description="Create a class section in Classes & Sections module first."
          />
        </Card>
      ) : (
        <div>
          {/* Day Tabs Selector */}
          <div className="flex border-b mb-6 overflow-x-auto">
            {DAYS_OF_WEEK.map((day) => {
              const count = timetableEntries.filter((e) => e.dayOfWeek === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 font-medium text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                    selectedDay === day
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${selectedDay === day ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Periods Table for selected Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
              const entry = dayEntriesMap[pNum];
              const defaults = DEFAULT_PERIOD_TIMES[pNum];

              return (
                <Card key={pNum} className={`border transition-all ${entry ? "bg-card shadow-sm hover:shadow" : "bg-muted/20 border-dashed"}`}>
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {entry?.periodName || defaults.name}
                    </CardTitle>
                    <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
                      {entry?.startTime || defaults.start} - {entry?.endTime || defaults.end}
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3">
                    {entry ? (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{entry.subject}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <User className="h-3.5 w-3.5 text-primary" />
                              {entry.facultyName || "No teacher assigned"}
                            </p>
                            {entry.roomNumber && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3.5 w-3.5" /> {entry.roomNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex justify-end gap-1 mt-3 pt-2 border-t">
                            <Button variant="ghost" size="sm" onClick={() => openCreateForPeriod(pNum)}>
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-xs text-muted-foreground mb-2">No subject assigned for Period {pNum}</p>
                        {isAdmin && (
                          <Button variant="outline" size="sm" onClick={() => openCreateForPeriod(pNum)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Assign Period {pNum}
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

      {/* Add / Edit Period Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Period Schedule" : "Assign Period Schedule"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Day of Week *</Label>
                <Select
                  value={form.dayOfWeek}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
                  required
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0) + d.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </div>

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
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>
                      Period {num}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label>Subject Name *</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Mathematics, Quantum Physics, Attendance"
                  required
                />
              </div>

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

              <div className="space-y-1.5 col-span-2">
                <Label>Room / Lab Number</Label>
                <Input
                  value={form.roomNumber}
                  onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
                  placeholder="e.g. Room 101, Science Lab"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Period Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
