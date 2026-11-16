import React, { useState } from "react";
import { GraduationCap, Calendar, Plus, Check, Clock, Settings, Save, AlertCircle, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";

const SESSIONS_STORAGE_KEY = "eduverse_academic_sessions";
const RULES_STORAGE_KEY = "eduverse_academic_rules";

function calculateDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export default function AdminAcademicSetupPage() {
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    year: "2026-2027",
    startDate: "2026-06-01",
    endDate: "2027-04-30",
    terms: "2",
  });

  const [formErrors, setFormErrors] = useState({
    year: "",
    startDate: "",
    endDate: "",
    terms: "",
    general: "",
  });

  const [workingDays, setWorkingDays] = useState(() => {
    try {
      const saved = localStorage.getItem(RULES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.workingDays) return parsed.workingDays;
      }
    } catch {}
    return {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    };
  });

  const [gradingSystem, setGradingSystem] = useState(() => {
    try {
      const saved = localStorage.getItem(RULES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gradingSystem) return parsed.gradingSystem;
      }
    } catch {}
    return "PERCENTAGE";
  });

  // Calculate year boundary constraints for the date pickers
  const yearMatch = (sessionForm.year || "").trim().match(/^(\d{4})-(\d{4})$/);
  const isConsecutive = yearMatch && Number(yearMatch[2]) === Number(yearMatch[1]) + 1;
  const startYear = isConsecutive ? yearMatch[1] : null;
  const endYear = isConsecutive ? yearMatch[2] : null;

  const startMin = startYear ? `${startYear}-01-01` : undefined;
  const startMax = startYear ? `${startYear}-12-31` : undefined;
  const endMin = endYear ? `${endYear}-01-01` : undefined;
  const endMax = endYear ? `${endYear}-12-31` : undefined;

  function handleOpenDialog() {
    let nextYear = "2026-2027";
    let nextStart = "2026-06-01";
    let nextEnd = "2027-04-30";

    if (academicYears.length > 0) {
      const years = academicYears
        .map((y) => {
          const m = (y.year || "").match(/^(\d{4})-(\d{4})$/);
          return m ? Number(m[2]) : 0;
        })
        .filter(Boolean);

      if (years.length > 0) {
        const maxEndYear = Math.max(...years);
        nextYear = `${maxEndYear}-${maxEndYear + 1}`;
        nextStart = `${maxEndYear}-06-01`;
        nextEnd = `${maxEndYear + 1}-04-30`;
      }
    }

    setSessionForm({
      year: nextYear,
      startDate: nextStart,
      endDate: nextEnd,
      terms: "2",
    });
    setFormErrors({ year: "", startDate: "", endDate: "", terms: "", general: "" });
    setDialogOpen(true);
  }

  function handleYearChange(newYear) {
    setFormErrors((prev) => ({ ...prev, year: "", general: "" }));
    const match = newYear.trim().match(/^(\d{4})-(\d{4})$/);
    if (match && Number(match[2]) === Number(match[1]) + 1) {
      const y1 = match[1];
      const y2 = match[2];
      setSessionForm({
        ...sessionForm,
        year: newYear,
        startDate: `${y1}-06-01`,
        endDate: `${y2}-04-30`,
      });
    } else {
      setSessionForm({ ...sessionForm, year: newYear });
    }
  }

  function validateSessionForm() {
    const errs = { year: "", startDate: "", endDate: "", terms: "", general: "" };
    let hasError = false;

    // 1. Academic Year Validation
    const trimmedYear = (sessionForm.year || "").trim();
    const match = trimmedYear.match(/^(\d{4})-(\d{4})$/);
    if (!match) {
      errs.year = "Academic year must be in YYYY-YYYY format (e.g. 2026-2027).";
      hasError = true;
    } else {
      const y1 = Number(match[1]);
      const y2 = Number(match[2]);
      if (y2 !== y1 + 1) {
        errs.year = "Academic year must be two consecutive years (e.g. 2026-2027).";
        hasError = true;
      }
    }

    // Duplicate Check
    if (!errs.year && academicYears.some((ay) => ay.year.trim().toLowerCase() === trimmedYear.toLowerCase())) {
      errs.year = `Academic session for '${trimmedYear}' already exists.`;
      hasError = true;
    }

    const startY = match ? match[1] : null;
    const endY = match ? match[2] : null;

    // 2. Start Date Validation (Sync with start year)
    if (!sessionForm.startDate) {
      errs.startDate = "Start date is required.";
      hasError = true;
    } else if (startY) {
      const minStart = `${startY}-01-01`;
      const maxStart = `${startY}-12-31`;
      if (sessionForm.startDate < minStart || sessionForm.startDate > maxStart) {
        errs.startDate = `Start date must fall within ${startY} (${minStart} to ${maxStart}).`;
        hasError = true;
      }
    }

    // 3. End Date Validation (Sync with end year)
    if (!sessionForm.endDate) {
      errs.endDate = "End date is required.";
      hasError = true;
    } else if (endY) {
      const minEnd = `${endY}-01-01`;
      const maxEnd = `${endY}-12-31`;
      if (sessionForm.endDate < minEnd || sessionForm.endDate > maxEnd) {
        errs.endDate = `End date must fall within ${endY} (${minEnd} to ${maxEnd}).`;
        hasError = true;
      }
    }

    // 4. End Date > Start Date & Minimum Duration (90 days)
    if (sessionForm.startDate && sessionForm.endDate) {
      if (sessionForm.endDate <= sessionForm.startDate) {
        errs.endDate = "End date must be strictly later than start date.";
        hasError = true;
      } else {
        const days = calculateDaysBetween(sessionForm.startDate, sessionForm.endDate);
        if (days < 90) {
          errs.endDate = `Academic session must last at least 90 days (currently ${days} days).`;
          hasError = true;
        }
      }
    }

    // 5. Overlap Check with Existing Sessions
    if (sessionForm.startDate && sessionForm.endDate) {
      const conflict = academicYears.find((ay) => {
        return sessionForm.startDate <= ay.endDate && sessionForm.endDate >= ay.startDate;
      });
      if (conflict) {
        errs.general = `Selected dates overlap with existing session "${conflict.year}" (${conflict.startDate} to ${conflict.endDate}).`;
        hasError = true;
      }
    }

    // 6. Terms Validation
    const termsNum = Number(sessionForm.terms);
    if (!sessionForm.terms || isNaN(termsNum) || termsNum < 1 || termsNum > 6) {
      errs.terms = "Number of terms must be between 1 and 6.";
      hasError = true;
    }

    setFormErrors(errs);
    return !hasError;
  }

  function handleAddSession(e) {
    e.preventDefault();
    if (!validateSessionForm()) {
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    let initialStatus = "UPCOMING";
    if (todayStr >= sessionForm.startDate && todayStr <= sessionForm.endDate) {
      initialStatus = "ACTIVE";
    } else if (todayStr > sessionForm.endDate) {
      initialStatus = "COMPLETED";
    }

    const shouldBeCurrent = academicYears.length === 0 || initialStatus === "ACTIVE";

    const newSession = {
      id: Date.now(),
      year: sessionForm.year.trim(),
      startDate: sessionForm.startDate,
      endDate: sessionForm.endDate,
      terms: Number(sessionForm.terms),
      status: initialStatus,
      isCurrent: shouldBeCurrent,
    };

    const updated = shouldBeCurrent
      ? academicYears
          .map((y) => ({ ...y, isCurrent: false, status: y.status === "ACTIVE" ? "COMPLETED" : y.status }))
          .concat(newSession)
      : [...academicYears, newSession];

    setAcademicYears(updated);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    toast({
      title: "Academic Session Created",
      description: `${sessionForm.year} added successfully (${initialStatus}).`,
      variant: "success",
    });
    setDialogOpen(false);
  }

  function handleSetCurrent(id) {
    const updated = academicYears.map((y) => ({
      ...y,
      isCurrent: y.id === id,
      status: y.id === id ? "ACTIVE" : y.status === "ACTIVE" ? "COMPLETED" : y.status,
    }));
    setAcademicYears(updated);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    toast({ title: "Academic Year Updated", description: "Current active academic session updated successfully.", variant: "success" });
  }

  function handleDeleteSession(id, yearName) {
    const updated = academicYears.filter((y) => y.id !== id);
    if (updated.length > 0 && !updated.some((y) => y.isCurrent)) {
      updated[0].isCurrent = true;
      if (updated[0].status !== "COMPLETED") updated[0].status = "ACTIVE";
    }
    setAcademicYears(updated);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    toast({ title: "Session Removed", description: `Academic session ${yearName} deleted.`, variant: "success" });
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify({ gradingSystem, workingDays }));
    } catch {}
    toast({ title: "Academic Rules Saved", description: "Working days and grading rules updated.", variant: "success" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Setup"
        description="Configure academic years, terms, working schedules, and grading standards for your institution"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Session List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" /> Academic Sessions & Terms
              </CardTitle>
              <CardDescription className="text-xs">Manage active and historical academic sessions</CardDescription>
            </div>
            <Button size="sm" onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-1" /> Add Session
            </Button>
          </CardHeader>
          <CardContent>
            {academicYears.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No academic sessions configured"
                description="Add your first academic year session to get started."
                action={
                  <Button size="sm" onClick={handleOpenDialog}>
                    <Plus className="h-4 w-4 mr-1" /> Add Session
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicYears.map((ay) => (
                    <TableRow key={ay.id} className={ay.isCurrent ? "bg-primary/5 font-medium" : ""}>
                      <TableCell className="font-semibold text-foreground flex items-center gap-2">
                        {ay.year}
                        {ay.isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-bold uppercase">
                            Current
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ay.startDate}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ay.endDate}</TableCell>
                      <TableCell className="text-xs">{ay.terms} Semesters</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${
                          ay.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : ay.status === "UPCOMING"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-slate-500/10 text-slate-600"
                        }`}>
                          {ay.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!ay.isCurrent && (
                            <Button variant="outline" size="sm" onClick={() => handleSetCurrent(ay.id)}>
                              Set Active
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(ay.id, ay.year)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            title="Delete session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Academic Settings & Working Days */}
        <Card className="space-y-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Institution Rules
            </CardTitle>
            <CardDescription className="text-xs">Schedule and grading standards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Grading System</Label>
                <Select value={gradingSystem} onChange={(e) => setGradingSystem(e.target.value)}>
                  <option value="PERCENTAGE">Percentage (%) Scale</option>
                  <option value="GPA_4">GPA 4.0 Scale</option>
                  <option value="GPA_10">GPA 10.0 Scale</option>
                  <option value="LETTER">Letter Grade (A+, A, B...)</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Weekly Working Days</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.keys(workingDays).map((day) => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer capitalize p-1.5 border rounded hover:bg-accent/50">
                      <input
                        type="checkbox"
                        checked={workingDays[day]}
                        onChange={(e) => setWorkingDays({ ...workingDays, [day]: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" /> Save Academic Rules
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Academic Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSession} className="space-y-4">
            {formErrors.general && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formErrors.general}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Academic Year *</Label>
              <Input
                value={sessionForm.year}
                onChange={(e) => handleYearChange(e.target.value)}
                placeholder="e.g. 2026-2027"
                required
                className={formErrors.year ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {formErrors.year ? (
                <p className="text-xs text-destructive">{formErrors.year}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">Two consecutive years in YYYY-YYYY format</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  min={startMin}
                  max={startMax}
                  value={sessionForm.startDate}
                  onChange={(e) => {
                    setSessionForm({ ...sessionForm, startDate: e.target.value });
                    setFormErrors((prev) => ({ ...prev, startDate: "", endDate: "", general: "" }));
                  }}
                  required
                  className={formErrors.startDate ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {formErrors.startDate ? (
                  <p className="text-xs text-destructive">{formErrors.startDate}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {startYear ? `Within ${startYear}` : "Session start"}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  min={endMin}
                  max={endMax}
                  value={sessionForm.endDate}
                  onChange={(e) => {
                    setSessionForm({ ...sessionForm, endDate: e.target.value });
                    setFormErrors((prev) => ({ ...prev, endDate: "", general: "" }));
                  }}
                  required
                  className={formErrors.endDate ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {formErrors.endDate ? (
                  <p className="text-xs text-destructive">{formErrors.endDate}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {endYear ? `Within ${endYear} (min 90d)` : "Session end"}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Number of Semesters / Terms *</Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={sessionForm.terms}
                onChange={(e) => {
                  setSessionForm({ ...sessionForm, terms: e.target.value });
                  setFormErrors((prev) => ({ ...prev, terms: "" }));
                }}
                required
                className={formErrors.terms ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {formErrors.terms ? (
                <p className="text-xs text-destructive">{formErrors.terms}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">Standard is 2 semesters or 3 terms per year</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Session</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
