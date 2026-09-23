import React, { useEffect, useState } from "react";
import { Layers, Plus, Pencil, Trash2, GraduationCap, Users, UserCheck } from "lucide-react";
import { classSectionApi } from "@/api/classSections";
import { facultyApi } from "@/api/faculty";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const EMPTY_SECTION = { className: "", sectionName: "", academicYear: "2026-2027", classTeacherId: "" };

export default function AdminSectionSetupPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_SECTION);
  const [submitting, setSubmitting] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([
      classSectionApi.list(),
      facultyApi.list({ page: 0, size: 100 }),
    ])
      .then(([secRes, facRes]) => {
        const secList = Array.isArray(secRes?.data?.data)
          ? secRes.data.data
          : (secRes?.data?.data?.content || []);
        const facList = Array.isArray(facRes?.data?.data?.content)
          ? facRes.data.data.content
          : (Array.isArray(facRes?.data?.data) ? facRes.data.data : []);
        setSections(secList);
        setFacultyList(facList);
      })
      .catch((err) => {
        toast({ title: "Failed to load sections", description: extractErrorMessage(err), variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadData, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_SECTION);
    setDialogOpen(true);
  }

  function openEdit(sec) {
    setEditingId(sec.id);
    setForm({
      className: sec.className || "",
      sectionName: sec.sectionName || "",
      academicYear: sec.academicYear || "2026-2027",
      classTeacherId: sec.classTeacherId ? String(sec.classTeacherId) : "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        classTeacherId: form.classTeacherId ? Number(form.classTeacherId) : null,
      };
      if (editingId) {
        await classSectionApi.update(editingId, payload);
        toast({ title: "Section Updated", variant: "success" });
      } else {
        await classSectionApi.create(payload);
        toast({ title: "Section Created", variant: "success" });
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      toast({ title: "Action failed", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(sec) {
    if (!window.confirm(`Delete section "${sec.className} - ${sec.sectionName}"?`)) return;
    try {
      await classSectionApi.delete(sec.id);
      toast({ title: "Section deleted", variant: "success" });
      loadData();
    } catch (err) {
      toast({ title: "Delete failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Section Setup"
        description="Create class sections (Section A, B, C), assign Class Teachers, and configure classroom capacity"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Add Section
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Active Class Sections & Teacher Allocation
          </CardTitle>
          <CardDescription className="text-xs">Manage individual sections under each class level</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Spinner full />
          ) : sections.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No sections found"
              description="Create sections for your classes to group students."
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-1" /> Add Section
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Section Name</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Assigned Class Teacher</TableHead>
                  <TableHead>Enrolled Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((sec) => (
                  <TableRow key={sec.id}>
                    <TableCell className="font-bold text-foreground">{sec.className}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                        Section {sec.sectionName || "A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{sec.academicYear}</TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {sec.classTeacherName || "Unassigned"}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">{sec.studentCount || 0} Students</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(sec)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(sec)}>
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
            <DialogTitle>{editingId ? "Edit Section" : "Create New Section"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Class Name *</Label>
                <Input
                  list="class-name-suggestions"
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  placeholder="e.g. B.Tech CSE or Grade 10"
                  required
                />
                <datalist id="class-name-suggestions">
                  <option value="B.Tech Computer Science" />
                  <option value="B.Tech ECE" />
                  <option value="B.Sc Computer Science" />
                  <option value="B.Sc Physics" />
                  <option value="B.Com Finance" />
                  <option value="BBA Management" />
                  <option value="MBA Business Administration" />
                  <option value="M.Sc Data Science" />
                  <option value="M.Tech IT" />
                  <option value="Grade 10" />
                  <option value="Grade 11" />
                  <option value="Grade 12" />
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label>Section Name *</Label>
                <Input
                  value={form.sectionName}
                  onChange={(e) => setForm({ ...form, sectionName: e.target.value })}
                  placeholder="e.g. Section A"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Academic Year *</Label>
                <Input
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Class Teacher</Label>
                <Select value={form.classTeacherId} onChange={(e) => setForm({ ...form, classTeacherId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.fullName}</option>
                  ))}
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Section"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
