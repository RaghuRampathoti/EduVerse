import React, { useState, useEffect } from "react";
import { GraduationCap, Plus, Pencil, Trash2, Layers, BookOpen, Users, Building2, UserCheck } from "lucide-react";
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
import { classSectionApi } from "@/api/classSections";
import { facultyApi } from "@/api/faculty";
import { extractErrorMessage } from "@/api/client";

export default function AdminClassSetupPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const instType = user?.assignedInstitutionType || user?.institutionType || user?.institution?.type;

  const classStorageKey = user?.institutionId
    ? `eduverse_admin_classes_inst_${user.institutionId}`
    : (user?.id ? `eduverse_admin_classes_user_${user.id}` : null);

  const [classes, setClasses] = useState(() => {
    if (!classStorageKey) return [];
    try {
      const saved = localStorage.getItem(classStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [facultyList, setFacultyList] = useState([]);
  const [activeTab, setActiveTab] = useState(instType || "SCHOOL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: "", track: "Secondary", capacity: "100", institutionType: instType || "SCHOOL", classTeacherId: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("eduverse_admin_classes");
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (instType) {
      setActiveTab(instType);
    }
  }, [instType]);

  function loadData() {
    facultyApi.list({ page: 0, size: 200 })
      .then((facRes) => {
        const facList = Array.isArray(facRes?.data?.data?.content)
          ? facRes.data.data.content
          : (Array.isArray(facRes?.data?.data) ? facRes.data.data : []);
        setFacultyList(facList);
      })
      .catch((err) => console.warn("Failed to load faculty:", err));

    classSectionApi.list()
      .then((res) => {
        const secList = Array.isArray(res?.data?.data) ? res.data.data : (res?.data?.data?.content || []);
        const apiClasses = secList.map((s) => ({
          id: s.id,
          name: s.className,
          track: "General",
          sectionsCount: s.studentCount || 1,
          capacity: 100,
          status: "ACTIVE",
          institutionType: s.institutionType || instType || "SCHOOL",
          classTeacherId: s.classTeacherId || null,
          classTeacherName: s.classTeacherName || null,
          isFromDb: true,
        }));

        setClasses(apiClasses);
        if (classStorageKey) {
          try {
            localStorage.setItem(classStorageKey, JSON.stringify(apiClasses));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.error("Error loading backend class sections:", err);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate(sector) {
    const targetSector = sector || instType || activeTab || "SCHOOL";
    setEditingItem(null);
    setForm({ name: "", track: "Secondary", capacity: "100", institutionType: targetSector, classTeacherId: "" });
    setDialogOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const targetSector = form.institutionType || instType || "SCHOOL";
      const teacherIdNum = form.classTeacherId ? Number(form.classTeacherId) : null;
      const teacherObj = facultyList.find(f => f.id === teacherIdNum);
      const teacherName = teacherObj ? teacherObj.fullName : (form.classTeacherId ? "Assigned Teacher" : null);

      const newClassItem = {
        id: editingItem ? editingItem.id : Date.now(),
        name: form.name,
        track: form.track,
        sectionsCount: editingItem ? editingItem.sectionsCount : 0,
        capacity: Number(form.capacity),
        status: "ACTIVE",
        institutionType: targetSector,
        classTeacherId: teacherIdNum,
        classTeacherName: teacherName,
        isFromDb: editingItem ? editingItem.isFromDb : true,
      };

      // Also persist to Backend Database via classSectionApi
      try {
        if (editingItem && typeof editingItem.id === 'number' && editingItem.isFromDb) {
          await classSectionApi.update(editingItem.id, {
            className: form.name,
            sectionName: "Section A",
            academicYear: "2026-2027",
            institutionType: targetSector,
            classTeacherId: teacherIdNum,
          });
        } else {
          await classSectionApi.create({
            className: form.name,
            sectionName: "Section A",
            academicYear: "2026-2027",
            institutionType: targetSector,
            classTeacherId: teacherIdNum,
          });
        }
      } catch (backendErr) {
        console.warn("Backend classSection save warning:", backendErr);
      }

      setClasses((prev) => {
        let updated;
        if (editingItem) {
          updated = prev.map(c => c.id === editingItem.id ? newClassItem : c);
        } else {
          updated = [...prev, newClassItem];
        }
        if (classStorageKey) {
          try {
            localStorage.setItem(classStorageKey, JSON.stringify(updated));
          } catch (e) {}
        }
        return updated;
      });

      toast({
        title: editingItem ? "Class Updated" : "Class Created",
        description: `${form.name} saved successfully with ${teacherName ? `Class Teacher: ${teacherName}` : 'no class teacher assigned'}.`,
        variant: "success",
      });
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast({ title: "Save failed", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      if (typeof id === 'number' && id < 1000000000000) {
        await classSectionApi.delete(id);
      }
    } catch (e) {
      console.warn("Backend delete warning:", e);
    }
    setClasses((prev) => {
      const updated = prev.filter(c => c.id !== id);
      if (classStorageKey) {
        try {
          localStorage.setItem(classStorageKey, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    toast({ title: "Class Deleted", variant: "success" });
  }

  const schoolClasses = classes.filter((c) => (c.institutionType || "SCHOOL") === "SCHOOL");
  const collegeClasses = classes.filter((c) => c.institutionType === "COLLEGE");
  const universityClasses = classes.filter((c) => c.institutionType === "UNIVERSITY");

  const allTabs = [
    { id: "SCHOOL", label: "School Class Table", count: schoolClasses.length },
    { id: "COLLEGE", label: "College Class Table", count: collegeClasses.length },
    { id: "UNIVERSITY", label: "University Class Table", count: universityClasses.length },
  ];

  const tabs = instType ? allTabs.filter(t => t.id === instType) : allTabs;

  const displayedClasses = classes.filter((c) => (c.institutionType || instType || "SCHOOL") === activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Setup"
        description="Define grade levels, academic tracks, and class level parameters by sector table"
        actions={
          <Button onClick={() => openCreate(activeTab)}>
            <Plus className="h-4 w-4 mr-1" /> New Class Level
          </Button>
        }
      />

      {/* Sector Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>{tab.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground border"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-primary/5 border-primary/20 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{displayedClasses.length}</p>
            <p className="text-xs text-muted-foreground font-medium">
              {`${activeTab} Configured Classes`}
            </p>
          </div>
        </Card>
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{displayedClasses.reduce((acc, c) => acc + c.sectionsCount, 0)}</p>
            <p className="text-xs text-muted-foreground font-medium">Active Sections</p>
          </div>
        </Card>
        <Card className="p-4 bg-blue-500/5 border-blue-500/20 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{displayedClasses.reduce((acc, c) => acc + c.capacity, 0)}</p>
            <p className="text-xs text-muted-foreground font-medium">Total Student Capacity</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {activeTab === "SCHOOL" && "School Class Directory"}
            {activeTab === "COLLEGE" && "College Class Directory"}
            {activeTab === "UNIVERSITY" && "University Class Directory"}
          </CardTitle>
          <CardDescription className="text-xs">Classes serve as parent containers for academic sections</CardDescription>
        </CardHeader>
        <CardContent>
          {displayedClasses.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={`No ${activeTab.toLowerCase()} classes configured`}
              description="Add class levels to structure academic sections and capacity."
              action={
                <Button size="sm" onClick={() => openCreate(activeTab)}>
                  <Plus className="h-4 w-4 mr-1" /> New Class Level
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Level</TableHead>
                  <TableHead>Organization Type</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>Academic Track / Department</TableHead>
                  <TableHead>Assigned Sections</TableHead>
                  <TableHead>Max Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-bold text-foreground">{cls.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          (cls.institutionType || "SCHOOL") === "COLLEGE"
                            ? "bg-purple-500/10 text-purple-600 border-purple-200"
                            : (cls.institutionType || "SCHOOL") === "UNIVERSITY"
                            ? "bg-blue-500/10 text-blue-600 border-blue-200"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                        }`}
                      >
                        {cls.institutionType || "SCHOOL"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {cls.classTeacherName ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-200">
                          <UserCheck className="h-3 w-3" /> {cls.classTeacherName}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not Assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-foreground font-medium">
                        {cls.track}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">{cls.sectionsCount} Sections</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{cls.capacity} Students</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                        {cls.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(cls);
                          setForm({
                            name: cls.name,
                            track: cls.track || "Secondary",
                            capacity: String(cls.capacity || 100),
                            institutionType: cls.institutionType || "SCHOOL",
                            classTeacherId: cls.classTeacherId ? String(cls.classTeacherId) : "",
                          });
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id, cls.name)}>
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
            <DialogTitle>{editingItem ? "Edit Class Level" : "New Class Level"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Class / Grade Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grade 10 or BSC CS Year 1"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Organization Type *</Label>
              <Select
                value={form.institutionType || instType || "SCHOOL"}
                disabled={!!instType}
                onChange={(e) => setForm({ ...form, institutionType: e.target.value })}
              >
                <option value="SCHOOL">School</option>
                <option value="COLLEGE">College</option>
                <option value="UNIVERSITY">University</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assign Class Teacher (Faculty Member)</Label>
              <Select
                value={form.classTeacherId || ""}
                onChange={(e) => setForm({ ...form, classTeacherId: e.target.value })}
              >
                <option value="">-- No Class Teacher Assigned --</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName} ({f.department || "Faculty"}) {f.employeeId ? `- ${f.employeeId}` : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Academic Track / Category</Label>
              <Select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}>
                <option value="Primary School">Primary School</option>
                <option value="Middle School">Middle School</option>
                <option value="Secondary">Secondary School</option>
                <option value="Higher Secondary (Science)">Higher Secondary (Science)</option>
                <option value="Higher Secondary (Commerce)">Higher Secondary (Commerce)</option>
                <option value="Undergraduate">Undergraduate Program</option>
                <option value="Engineering">Engineering & Tech</option>
                <option value="Postgraduate">Postgraduate Program</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Max Total Capacity (Students)</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Class Level"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
