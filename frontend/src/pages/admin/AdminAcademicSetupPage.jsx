import React, { useState } from "react";
import { GraduationCap, Calendar, Plus, Check, Clock, Settings, Save, AlertCircle } from "lucide-react";
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

export default function AdminAcademicSetupPage() {
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ year: "2026-2027", startDate: "2026-06-01", endDate: "2027-04-30", terms: "2" });

  const [workingDays, setWorkingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const [gradingSystem, setGradingSystem] = useState("PERCENTAGE");

  function handleAddSession(e) {
    e.preventDefault();
    const newSession = {
      id: Date.now(),
      year: sessionForm.year,
      startDate: sessionForm.startDate,
      endDate: sessionForm.endDate,
      terms: Number(sessionForm.terms),
      status: academicYears.length === 0 ? "ACTIVE" : "UPCOMING",
      isCurrent: academicYears.length === 0,
    };
    setAcademicYears([...academicYears, newSession]);
    toast({ title: "Academic Session Created", description: `${sessionForm.year} added successfully.`, variant: "success" });
    setDialogOpen(false);
  }

  function handleSetCurrent(id) {
    setAcademicYears(prev =>
      prev.map(y => ({
        ...y,
        isCurrent: y.id === id,
        status: y.id === id ? "ACTIVE" : y.status === "ACTIVE" ? "COMPLETED" : y.status,
      }))
    );
    toast({ title: "Academic Year Updated", description: "Current active academic session updated successfully.", variant: "success" });
  }

  function handleSaveSettings(e) {
    e.preventDefault();
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
            <Button size="sm" onClick={() => setDialogOpen(true)}>
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
                  <Button size="sm" onClick={() => setDialogOpen(true)}>
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
                        {!ay.isCurrent && (
                          <Button variant="outline" size="sm" onClick={() => handleSetCurrent(ay.id)}>
                            Set Active
                          </Button>
                        )}
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
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Academic Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSession} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Academic Year *</Label>
              <Input value={sessionForm.year} onChange={(e) => setSessionForm({ ...sessionForm, year: e.target.value })} placeholder="e.g. 2026-2027" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input type="date" value={sessionForm.startDate} onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>End Date *</Label>
                <Input type="date" value={sessionForm.endDate} onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Number of Semesters / Terms *</Label>
              <Input type="number" value={sessionForm.terms} onChange={(e) => setSessionForm({ ...sessionForm, terms: e.target.value })} required />
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
