import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, Plus, Pencil, Trash2, Layers, Award, Check, UserCheck, GraduationCap, Filter } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { facultyApi } from "@/api/faculty";
import { classSectionApi } from "@/api/classSections";

export default function AdminSubjectSetupPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const instType = user?.assignedInstitutionType || user?.institutionType || user?.institution?.type;
  const isCollege = instType === "COLLEGE" || (!instType && user?.institutionName?.toLowerCase().includes("college"));

  // Strict tenant/admin isolation: Each admin/institution only accesses their own subject catalogue
  const storageKey = user?.institutionId
    ? `eduverse_admin_subjects_inst_${user.institutionId}`
    : (user?.id ? `eduverse_admin_subjects_user_${user.id}` : null);

  const classStorageKey = user?.institutionId
    ? `eduverse_admin_classes_inst_${user.institutionId}`
    : (user?.id ? `eduverse_admin_classes_user_${user.id}` : null);

  const standardCollegeStreams = [
    "MPC",
    "BiPC",
    "CEC",
    "MEC",
    "HEC",
    "Inter 1st Year (MPC)",
    "Inter 2nd Year (MPC)",
    "Inter 1st Year (BiPC)",
    "Inter 2nd Year (BiPC)",
    "Inter 1st Year (CEC)",
    "Inter 2nd Year (CEC)",
    "Inter 1st Year (MEC)",
    "Inter 2nd Year (MEC)",
  ];

  const standardSchoolGrades = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
  ];

  const defaultClass = isCollege ? "MPC" : "Class 10";

  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [configuredClasses, setConfiguredClasses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "CORE",
    credits: "4",
    allocatedClasses: defaultClass,
    customClass: "",
    faculty: "Unassigned",
  });

  useEffect(() => {
    // Remove legacy un-scoped key to prevent cross-admin data leakage
    try {
      localStorage.removeItem("eduverse_admin_subjects");
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!storageKey) {
      setSubjects([]);
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      // New admin starts with a clean empty catalogue
      setSubjects(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setSubjects([]);
    }
  }, [storageKey]);

  useEffect(() => {
    // Load faculty list for lead faculty assignment
    facultyApi.list({ page: 0, size: 200 })
      .then((res) => {
        const list = Array.isArray(res?.data?.data?.content)
          ? res.data.data.content
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        setFacultyList(list);
      })
      .catch((err) => console.warn("Failed to load faculty:", err));

    // Load configured classes from local storage and backend class-sections
    let localClassNames = [];
    if (classStorageKey) {
      try {
        const saved = localStorage.getItem(classStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          localClassNames = parsed.map(c => c.name).filter(Boolean);
        }
      } catch (e) {}
    }

    classSectionApi.list()
      .then((res) => {
        const secList = Array.isArray(res?.data?.data) ? res.data.data : (res?.data?.data?.content || []);
        const apiNames = secList.map(s => s.className).filter(Boolean);
        const combined = Array.from(new Set([...localClassNames, ...apiNames]));
        setConfiguredClasses(combined);
      })
      .catch((err) => {
        console.warn("Could not load backend classes:", err);
        setConfiguredClasses(Array.from(new Set(localClassNames)));
      });
  }, [classStorageKey]);

  const uniqueClassesInSubjects = useMemo(() => {
    const list = subjects.map(s => s.allocatedClasses).filter(Boolean);
    return Array.from(new Set(list));
  }, [subjects]);

  const displayedSubjects = useMemo(() => {
    if (selectedClassFilter === "ALL") return subjects;
    return subjects.filter(s => (s.allocatedClasses || "All Classes") === selectedClassFilter);
  }, [subjects, selectedClassFilter]);

  function openCreate() {
    setEditingItem(null);
    setForm({
      code: "",
      name: "",
      type: "CORE",
      credits: "4",
      allocatedClasses: isCollege ? "MPC" : "Class 10",
      customClass: "",
      faculty: "Unassigned",
    });
    setDialogOpen(true);
  }

  function openEdit(sub) {
    setEditingItem(sub);
    const standardList = isCollege ? standardCollegeStreams : standardSchoolGrades;
    const knownClasses = [...standardList, ...configuredClasses, "All Classes", "All Grades"];
    const isCustom = sub.allocatedClasses && !knownClasses.includes(sub.allocatedClasses);

    setForm({
      code: sub.code,
      name: sub.name,
      type: sub.type,
      credits: String(sub.credits),
      allocatedClasses: isCustom ? "CUSTOM" : (sub.allocatedClasses || defaultClass),
      customClass: isCustom ? sub.allocatedClasses : "",
      faculty: sub.faculty || "Unassigned",
    });
    setDialogOpen(true);
  }

  function handleSave(e) {
    e.preventDefault();
    const finalClass = form.allocatedClasses === "CUSTOM"
      ? (form.customClass.trim() || (isCollege ? "MPC" : "All Classes"))
      : (form.allocatedClasses || (isCollege ? "MPC" : "All Classes"));

    setSubjects((prev) => {
      let updated;
      if (editingItem) {
        updated = prev.map(s => s.id === editingItem.id ? {
          ...s,
          code: form.code,
          name: form.name,
          type: form.type,
          credits: Number(form.credits),
          allocatedClasses: finalClass,
          faculty: form.faculty,
        } : s);
        toast({ title: "Subject Updated", description: `${form.name} updated for ${finalClass}.`, variant: "success" });
      } else {
        const newSubject = {
          id: Date.now(),
          code: form.code,
          name: form.name,
          type: form.type,
          credits: Number(form.credits),
          allocatedClasses: finalClass,
          faculty: form.faculty,
        };
        updated = [...prev, newSubject];
        toast({ title: "Subject Created", description: `${form.name} assigned to ${finalClass}.`, variant: "success" });
      }
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    setDialogOpen(false);
  }

  function handleDelete(id, name) {
    if (!window.confirm(`Delete ${name} from subject catalog?`)) return;
    setSubjects((prev) => {
      const updated = prev.filter(s => s.id !== id);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    toast({ title: "Subject Deleted", variant: "success" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subject Setup"
        description="Configure institution subject catalogue, credit hours, subject type (Core vs Elective), class stream mapping, and faculty"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> New Subject
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Subject Catalogue & Credit Allocations
              </CardTitle>
              <CardDescription className="text-xs">
                Define subjects, credit hours, and assign specialized faculty to specific classes/streams (e.g. MPC, BiPC)
              </CardDescription>
            </div>
            {uniqueClassesInSubjects.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">Filter by Class:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  aria-label="Filter subjects by class"
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ALL">All Classes ({subjects.length})</option>
                  {uniqueClassesInSubjects.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls} ({subjects.filter(s => s.allocatedClasses === cls).length})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects in catalogue"
              description="Create your first subject to map course credits, target classes (MPC, BiPC), and faculty."
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-1" /> New Subject
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Weekly Credits</TableHead>
                  <TableHead>Target Classes</TableHead>
                  <TableHead>Lead Faculty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedSubjects.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">{sub.code}</TableCell>
                    <TableCell className="font-semibold text-primary">{sub.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                        sub.type === "CORE" ? "bg-primary/10 text-primary" : "bg-purple-500/10 text-purple-600"
                      }`}>
                        {sub.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{sub.credits} Hours/Wk</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                        {sub.allocatedClasses || "All Classes"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      {sub.faculty && sub.faculty !== "Unassigned" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                          <UserCheck className="h-3.5 w-3.5" /> {sub.faculty}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(sub)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id, sub.name)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Subject" : "New Subject"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Subject Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. MATH-101"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Subject Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Higher Mathematics"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Subject Type</Label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="CORE">Core Mandatory</option>
                  <option value="ELECTIVE">Elective Course</option>
                  <option value="LAB">Practical Lab</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Weekly Credits (Hours)</Label>
                <Input
                  type="number"
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: e.target.value })}
                  required
                />
              </div>

              {/* Target Class / Stream Selection */}
              <div className="space-y-1.5 col-span-2">
                <Label className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" /> Target Class / Stream *
                </Label>
                <Select
                  value={form.allocatedClasses}
                  onChange={(e) => setForm({ ...form, allocatedClasses: e.target.value })}
                >
                  {isCollege && (
                    <optgroup label="College Streams / Groups">
                      <option value="MPC">MPC (Mathematics, Physics, Chemistry)</option>
                      <option value="BiPC">BiPC (Biology, Physics, Chemistry)</option>
                      <option value="CEC">CEC (Commerce, Economics, Civics)</option>
                      <option value="MEC">MEC (Mathematics, Economics, Commerce)</option>
                      <option value="HEC">HEC (History, Economics, Civics)</option>
                      <option value="Inter 1st Year (MPC)">Inter 1st Year (MPC)</option>
                      <option value="Inter 2nd Year (MPC)">Inter 2nd Year (MPC)</option>
                      <option value="Inter 1st Year (BiPC)">Inter 1st Year (BiPC)</option>
                      <option value="Inter 2nd Year (BiPC)">Inter 2nd Year (BiPC)</option>
                    </optgroup>
                  )}
                  {configuredClasses.length > 0 && (
                    <optgroup label="Configured Classes in Setup">
                      {configuredClasses
                        .filter(c => !standardCollegeStreams.includes(c))
                        .map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </optgroup>
                  )}
                  {!isCollege && (
                    <optgroup label="Standard Grades">
                      {standardSchoolGrades.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="General / Other">
                    <option value="All Classes">All Classes / General</option>
                    <option value="CUSTOM">Custom Class / Stream...</option>
                  </optgroup>
                </Select>
                {form.allocatedClasses === "CUSTOM" && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom class/stream name (e.g. MPC Section B, Diploma CS)"
                    value={form.customClass}
                    onChange={(e) => setForm({ ...form, customClass: e.target.value })}
                    required
                  />
                )}
              </div>

              {/* Lead Faculty for Selected Class */}
              <div className="space-y-1.5 col-span-2">
                <Label className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-primary" /> Lead Faculty (Assigned Teacher for this Class)
                </Label>
                <Select value={form.faculty || "Unassigned"} onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
                  <option value="Unassigned">-- Select Lead Faculty --</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.fullName}>
                      {f.fullName} ({f.department || "Faculty"}) {f.employeeId ? `- ${f.employeeId}` : ""}
                    </option>
                  ))}
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Assign the faculty member teaching this subject to{" "}
                  <span className="font-semibold text-foreground">
                    {form.allocatedClasses === "CUSTOM" ? (form.customClass || "the custom class") : form.allocatedClasses}
                  </span>.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Subject</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

