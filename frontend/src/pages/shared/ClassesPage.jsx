import React, { useEffect, useState } from "react";
import { Plus, GraduationCap, Trash2, Pencil } from "lucide-react";
import { classSectionApi } from "@/api/classSections";
import { facultyApi } from "@/api/faculty";
import { extractErrorMessage } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const EMPTY = { className: "", sectionName: "", academicYear: "2026-2027", classTeacherId: "" };

const STORAGE_KEY = "eduverse_superadmin_institutions";

export default function ClassesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user && user.role === "ADMIN";
  const isSuperAdmin = user && user.role === "SUPER_ADMIN";

  const [sections, setSections] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstFilter, setSelectedInstFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    Promise.all([
      classSectionApi.list(),
      facultyApi.list({ page: 0, size: 200 }),
    ])
      .then(([sec, fac]) => {
        let secList = Array.isArray(sec?.data?.data)
          ? sec.data.data
          : (sec?.data?.data?.content || []);
        const facList = Array.isArray(fac?.data?.data?.content)
          ? fac.data.data.content
          : (Array.isArray(fac?.data?.data) ? fac.data.data : []);

        // Load institutions for Super Admin filtering & attribution
        try {
          const saved = localStorage.getItem(`${STORAGE_KEY}_1`) || localStorage.getItem(`${STORAGE_KEY}_2`) || localStorage.getItem(`${STORAGE_KEY}_undefined`);
          let instList = [];
          if (saved) {
            instList = JSON.parse(saved);
          }
          if (!instList) {
            instList = [];
          }
          setInstitutions(instList);

          secList = secList.map((s) => ({
            ...s,
            institutionName: s.institutionName || s.institution?.name || "",
            institutionType: s.institutionType || s.institution?.type || "SCHOOL",
          }));
        } catch {
          setInstitutions([]);
        }

        setSections(secList);
        setFacultyList(facList);
      })
      .catch((err) => {
        const msg = extractErrorMessage(err);
        setError(msg);
        toast({
          title: "Failed to load classes",
          description: msg,
          variant: "destructive",
        });
        setSections([]);
        setFacultyList([]);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setDialogOpen(true);
  }

  function openEdit(section) {
    setEditingId(section.id);
    setForm({
      className: section.className,
      sectionName: section.sectionName || "",
      academicYear: section.academicYear,
      classTeacherId: section.classTeacherId || "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, classTeacherId: form.classTeacherId ? Number(form.classTeacherId) : null };
      if (editingId) {
        await classSectionApi.update(editingId, payload);
        toast({ title: "Class updated", variant: "success" });
      } else {
        await classSectionApi.create(payload);
        toast({ title: "Class created", variant: "success" });
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(section) {
    if (!window.confirm(`Delete "${section.className} ${section.sectionName || ""}"?`)) return;
    try {
      await classSectionApi.delete(section.id);
      toast({ title: "Class deleted", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  const instType = user?.assignedInstitutionType || user?.institutionType || user?.institution?.type;
  const [activeTab, setActiveTab] = useState(instType || "SCHOOL");

  useEffect(() => {
    if (instType) {
      setActiveTab(instType);
    }
  }, [instType]);

  const schoolSections = sections.filter((s) => (s.institutionType || "SCHOOL") === "SCHOOL");
  const collegeSections = sections.filter((s) => s.institutionType === "COLLEGE");
  const univSections = sections.filter((s) => s.institutionType === "UNIVERSITY");

  const allTabs = [
    { id: "SCHOOL", label: "School Class Table", count: schoolSections.length },
    { id: "COLLEGE", label: "College Class Table", count: collegeSections.length },
    { id: "UNIVERSITY", label: "University Class Table", count: univSections.length },
  ];

  const tabs = instType ? allTabs.filter(t => t.id === instType) : allTabs;

  const filteredSections = sections.filter((s) => {
    const matchesInst = selectedInstFilter === "ALL" || s.institutionName === selectedInstFilter;
    return matchesInst && (s.institutionType || instType || "SCHOOL") === activeTab;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Sections"
        description="Organize students into classes, grades, and sections by sector table"
        actions={
          isAdmin ? (
            <Button onClick={() => openCreate(activeTab)}><Plus className="h-4 w-4" /> New Class</Button>
          ) : isSuperAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Filter Institution:</span>
              <Select value={selectedInstFilter} onChange={(e) => setSelectedInstFilter(e.target.value)} className="w-56">
                <option value="ALL">All Institutions</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.name}>
                    {inst.name} ({inst.type || "SCHOOL"})
                  </option>
                ))}
              </Select>
            </div>
          ) : null
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

      {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

      {loading ? (
        <Spinner full />
      ) : filteredSections.length === 0 ? (
        <Card><EmptyState icon={GraduationCap} title={`No ${activeTab !== "ALL" ? activeTab.toLowerCase() : ""} classes found`} description={isAdmin ? "Create your first class or section." : "No class sections found for the selected filter."} action={isAdmin ? <Button onClick={() => openCreate(activeTab)}><Plus className="h-4 w-4" /> New Class</Button> : null} /></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Organization Type</TableHead>
                <TableHead>Institution / Campus</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Class Teacher</TableHead>
                <TableHead>Students</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSections.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.className}</TableCell>
                  <TableCell>{s.sectionName || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        (s.institutionType || "SCHOOL") === "COLLEGE"
                          ? "bg-purple-500/10 text-purple-600 border-purple-200"
                          : (s.institutionType || "SCHOOL") === "UNIVERSITY"
                          ? "bg-blue-500/10 text-blue-600 border-blue-200"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                      }`}
                    >
                      {s.institutionType || "SCHOOL"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {s.institutionName || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.academicYear}</TableCell>
                  <TableCell className="text-muted-foreground">{s.classTeacherName || "Unassigned"}</TableCell>
                  <TableCell>{s.studentCount}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader><DialogTitle>{editingId ? "Edit Class" : "New Class"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Class Name *</Label>
                <Input value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} required placeholder="e.g. Grade 10" />
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Input value={form.sectionName} onChange={(e) => setForm((f) => ({ ...f, sectionName: e.target.value }))} placeholder="e.g. A" />
              </div>
              <div className="space-y-1.5">
                <Label>Academic Year *</Label>
                <Input value={form.academicYear} onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Class Teacher</Label>
                <Select value={form.classTeacherId} onChange={(e) => setForm((f) => ({ ...f, classTeacherId: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {facultyList.map((f) => <option key={f.id} value={f.id}>{f.fullName}</option>)}
                </Select>
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
