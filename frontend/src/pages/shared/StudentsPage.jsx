import React, { useEffect, useState } from "react";
import { Plus, Users, Trash2, Pencil, Copy, Check, Eye } from "lucide-react";
import { studentApi } from "@/api/students";
import { classSectionApi } from "@/api/classSections";
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
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const EMPTY = {
  fullName: "", email: "", username: "", password: "", phone: "", admissionNumber: "", classSectionId: "", rollNumber: "",
  gender: "", dateOfBirth: "", admissionDate: "", guardianName: "", guardianPhone: "", address: "",
  bloodGroup: "", parentFullName: "", parentEmail: "", parentUsername: "", parentPassword: "", parentPhone: "",
};

export default function StudentsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user && user.role === "ADMIN";
  const [students, setStudents] = useState([]);
  const [classSections, setClassSections] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    const instType = user?.assignedInstitutionType || user?.institutionType || user?.institution?.type || "SCHOOL";
    const params = { page: 0, size: 200, ...(classFilter ? { classSectionId: classFilter } : {}) };
    Promise.all([studentApi.list(params), classSectionApi.list()])
      .then(([st, cs]) => {
        setStudents(st.data.data.content || []);
        const rawList = Array.isArray(cs?.data?.data) ? cs.data.data : (cs?.data?.data?.content || []);
        let localClasses = [];
        const classStorageKey = user?.institutionId
          ? `eduverse_admin_classes_inst_${user.institutionId}`
          : (user?.id ? `eduverse_admin_classes_user_${user.id}` : null);
        if (classStorageKey) {
          try {
            localClasses = JSON.parse(localStorage.getItem(classStorageKey) || "[]");
          } catch (e) {}
        }

        const combined = [...rawList];
        localClasses.forEach((lc) => {
          if ((lc.institutionType || "SCHOOL") === instType) {
            if (!combined.some((c) => String(c.id) === String(lc.id) || c.className === lc.name)) {
              combined.push({
                id: lc.id,
                className: lc.name,
                sectionName: "Section A",
                institutionType: lc.institutionType || instType,
              });
            }
          }
        });

        const filtered = combined.filter((c) => (c.institutionType || "SCHOOL") === instType);
        setClassSections(filtered);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, [classFilter, user]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setDialogOpen(true);
  }

  function openEdit(s) {
    setEditingId(s.id);
    setForm({
      ...EMPTY,
      fullName: s.fullName, phone: s.phone || "", classSectionId: s.classSectionId || "",
      rollNumber: s.rollNumber || "", gender: s.gender || "", dateOfBirth: s.dateOfBirth || "",
      guardianName: s.guardianName || "", guardianPhone: s.guardianPhone || "", address: s.address || "",
      bloodGroup: s.bloodGroup || "",
      parentFullName: s.parentFullName || s.guardianName || "",
      parentEmail: s.parentEmail || "",
      parentUsername: s.parentUsername || "",
      parentPhone: s.parentPhone || s.guardianPhone || "",
      parentPassword: "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.phone && form.phone.length !== 10) {
      setError("Student mobile number must be exactly 10 digits");
      return;
    }
    if (form.guardianPhone && form.guardianPhone.length !== 10) {
      setError("Parent/Guardian mobile number must be exactly 10 digits");
      return;
    }
    if (form.parentPhone && form.parentPhone.length !== 10) {
      setError("Parent Phone number must be exactly 10 digits");
      return;
    }
    setSubmitting(true);
    try {
        const parseSectionId = (val) => {
          if (!val) return null;
          const num = Number(val);
          return isNaN(num) ? null : num;
        };

        if (editingId) {
          const { fullName, phone, classSectionId, rollNumber, gender, dateOfBirth, guardianName, guardianPhone, address, bloodGroup, parentFullName, parentEmail, parentUsername, parentPhone, parentPassword } = form;
          await studentApi.update(editingId, {
            fullName, phone, classSectionId: parseSectionId(classSectionId),
            rollNumber, gender: gender || null, dateOfBirth: dateOfBirth || null,
            guardianName, guardianPhone, address, bloodGroup,
            parentFullName, parentEmail, parentUsername, parentPhone, parentPassword,
          });
          toast({ title: "Student updated", variant: "success" });
          setDialogOpen(false);
        } else {
          const payload = { ...form, classSectionId: parseSectionId(form.classSectionId) };
          const { data } = await studentApi.create(payload);
          toast({ title: "Student enrolled successfully", variant: "success" });
          setCredentials(data.data);
          setDialogOpen(false);
        }
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(s) {
    if (!window.confirm(`Remove student "${s.fullName}"? This deletes their account permanently.`)) return;
    try {
      await studentApi.delete(s.id);
      toast({ title: "Student removed", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  function copyCredentials() {
    if (!credentials) return;
    let text = `=== STUDENT CREDENTIALS ===\nName: ${credentials.fullName}\nUsername: ${credentials.username || credentials.email}\nEmail: ${credentials.email}\nPassword: ${credentials.tempPassword || "N/A"}`;
    if (credentials.parentEmail) {
      text += `\n\n=== PARENT CREDENTIALS ===\nUsername: ${credentials.parentUsername || credentials.parentEmail}\nEmail: ${credentials.parentEmail}\nPassword: ${credentials.parentTempPassword || "N/A"}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student enrollment and profiles"
        actions={
          <div className="flex items-center gap-2">
            <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="w-44">
              <option value="">All Classes</option>
              {classSections.map((c) => <option key={c.id} value={c.id}>{c.className} {c.sectionName}</option>)}
            </Select>
            {isAdmin && <Button onClick={openCreate}><Plus className="h-4 w-4" /> Enroll Student</Button>}
          </div>
        }
      />

      {loading ? (
        <Spinner full />
      ) : students.length === 0 ? (
        <Card><EmptyState icon={Users} title="No students yet" description={isAdmin ? "Enroll your first student to get started." : "No students found."} action={isAdmin ? <Button onClick={openCreate}><Plus className="h-4 w-4" /> Enroll Student</Button> : null} /></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Username / Email</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium flex items-center gap-2.5">
                    <Avatar>{initials(s.fullName)}</Avatar> {s.fullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.admissionNumber}</TableCell>
                  <TableCell>{s.className ? `${s.className} ${s.sectionName || ""}` : "-"}</TableCell>
                  <TableCell>{s.rollNumber || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div>{s.email}</div>
                    {s.username && <div className="text-xs text-muted-foreground font-mono">@{s.username}</div>}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewStudent(s)} title="View Student Profile"><Eye className="h-4 w-4 text-primary" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)} title="Edit Student"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s)} title="Delete Student"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" onClose={() => setDialogOpen(false)}>
          <DialogHeader><DialogTitle>{editingId ? "Edit Student" : "Enroll New Student"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name *</Label>
                <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
              </div>
              {!editingId && (
                <>
                  <div className="space-y-1.5">
                    <Label>Student Username</Label>
                    <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="e.g. student1" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Student Email (login) *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="student@school.edu" required />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label>Student Password</Label>
                    <Input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Leave blank to auto-generate" />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label>Student Mobile Number (10 Digits)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm((f) => ({ ...f, phone: val }));
                  }}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                />
              </div>
              {!editingId && (
                <div className="space-y-1.5">
                  <Label>Admission Number *</Label>
                  <Input value={form.admissionNumber} onChange={(e) => setForm((f) => ({ ...f, admissionNumber: e.target.value }))} required />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Class / Section</Label>
                <Select value={form.classSectionId} onChange={(e) => setForm((f) => ({ ...f, classSectionId: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {classSections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} {c.sectionName ? `- ${c.sectionName}` : ""}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Roll Number</Label>
                <Input value={form.rollNumber} onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
              {!editingId && (
                <div className="space-y-1.5">
                  <Label>Admission Date</Label>
                  <Input type="date" value={form.admissionDate} onChange={(e) => setForm((f) => ({ ...f, admissionDate: e.target.value }))} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Blood Group</Label>
                <Input value={form.bloodGroup} onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))} placeholder="e.g. O+" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Guardian Name</Label>
                <Input value={form.guardianName} onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Parent/Guardian Mobile Number (10 Digits)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.guardianPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm((f) => ({ ...f, guardianPhone: val }));
                  }}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-1">Parent Account {editingId ? "Details & Login Credentials" : "(optional)"}</p>
              <p className="text-xs text-muted-foreground mb-3">Provide details and login credentials for parent portal access.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label>Parent Full Name</Label>
                  <Input value={form.parentFullName} onChange={(e) => setForm((f) => ({ ...f, parentFullName: e.target.value }))} placeholder="e.g. Venu Prasad" />
                </div>
                <div className="space-y-1.5">
                  <Label>Parent Username</Label>
                  <Input value={form.parentUsername} onChange={(e) => setForm((f) => ({ ...f, parentUsername: e.target.value }))} placeholder="e.g. parent1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Parent Email (login)</Label>
                  <Input type="email" value={form.parentEmail} onChange={(e) => setForm((f) => ({ ...f, parentEmail: e.target.value }))} placeholder="venu@gmail.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Parent Phone (10 Digits)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={form.parentPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setForm((f) => ({ ...f, parentPhone: val }));
                    }}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Parent Password</Label>
                  <Input type="text" value={form.parentPassword} onChange={(e) => setForm((f) => ({ ...f, parentPassword: e.target.value }))} placeholder={editingId ? "Leave blank to keep unchanged" : "Leave blank to auto-generate"} />
                </div>
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

      <Dialog open={!!credentials} onOpenChange={() => { setCredentials(null); }}>
        <DialogContent onClose={() => { setCredentials(null); }}>
          <DialogHeader>
            <DialogTitle>Enrollment Credentials</DialogTitle>
            <DialogDescription>Share these credentials with the student and parent so they can log in.</DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="space-y-3 text-sm font-mono">
              <div className="bg-muted rounded-lg p-3 space-y-1 border">
                <p className="font-semibold text-primary font-sans text-xs uppercase tracking-wider mb-1">Student Credentials</p>
                {credentials.username && (
                  <p><span className="text-muted-foreground">Username:</span> <strong className="text-foreground">{credentials.username}</strong></p>
                )}
                <p><span className="text-muted-foreground">Email:</span> <strong className="text-foreground">{credentials.email}</strong></p>
                {credentials.tempPassword && (
                  <p><span className="text-muted-foreground">Password:</span> <strong className="text-foreground">{credentials.tempPassword}</strong></p>
                )}
              </div>

              {credentials.parentEmail && (
                <div className="bg-muted rounded-lg p-3 space-y-1 border">
                  <p className="font-semibold text-primary font-sans text-xs uppercase tracking-wider mb-1">Parent Credentials</p>
                  {credentials.parentUsername && (
                    <p><span className="text-muted-foreground">Username:</span> <strong className="text-foreground">{credentials.parentUsername}</strong></p>
                  )}
                  <p><span className="text-muted-foreground">Email:</span> <strong className="text-foreground">{credentials.parentEmail}</strong></p>
                  {credentials.parentTempPassword && (
                    <p><span className="text-muted-foreground">Password:</span> <strong className="text-foreground">{credentials.parentTempPassword}</strong></p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={copyCredentials}>
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copied to Clipboard" : "Copy Credentials"}
            </Button>
            <Button onClick={() => { setCredentials(null); }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Student Profile Modal */}
      <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <DialogContent className="max-w-2xl" onClose={() => setViewStudent(null)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Eye className="h-5 w-5 text-primary" /> Student Profile & Details
            </DialogTitle>
            <DialogDescription>Comprehensive profile information and credentials for student</DialogDescription>
          </DialogHeader>

          {viewStudent && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Avatar className="h-14 w-14 border-2 border-primary">
                  <span className="text-lg font-bold">{initials(viewStudent.fullName)}</span>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{viewStudent.fullName}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Email: <strong className="text-foreground">{viewStudent.email}</strong></span>
                    {viewStudent.username && (
                      <span>Username: <strong className="text-foreground font-mono">@{viewStudent.username}</strong></span>
                    )}
                    <span>Admission No: <strong className="text-foreground font-mono">{viewStudent.admissionNumber || "N/A"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Student Academic & Personal Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                  <p className="text-muted-foreground font-medium">Class / Section</p>
                  <p className="font-bold text-foreground text-sm">
                    {viewStudent.className ? `${viewStudent.className} ${viewStudent.sectionName || ""}` : "Unassigned"}
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                  <p className="text-muted-foreground font-medium">Roll Number</p>
                  <p className="font-bold text-foreground text-sm">{viewStudent.rollNumber || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                  <p className="text-muted-foreground font-medium">Student Mobile Number</p>
                  <p className="font-bold text-foreground text-sm">{viewStudent.phone || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                  <p className="text-muted-foreground font-medium">Gender</p>
                  <p className="font-bold text-foreground text-sm">{viewStudent.gender || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                  <p className="text-muted-foreground font-medium">Date of Birth</p>
                  <p className="font-bold text-foreground text-sm">{viewStudent.dateOfBirth || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                  <p className="text-muted-foreground font-medium">Blood Group</p>
                  <p className="font-bold text-foreground text-sm">{viewStudent.bloodGroup || "N/A"}</p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30 col-span-2 space-y-1">
                  <p className="text-muted-foreground font-medium">Address</p>
                  <p className="font-bold text-foreground text-sm">{viewStudent.address || "N/A"}</p>
                </div>
              </div>

              {/* Guardian & Parent Account Section */}
              <div className="border-t pt-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parent & Guardian Information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border bg-indigo-500/5 border-indigo-200 space-y-1">
                    <p className="text-muted-foreground font-medium">Guardian Name</p>
                    <p className="font-bold text-foreground text-sm">{viewStudent.guardianName || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-indigo-500/5 border-indigo-200 space-y-1">
                    <p className="text-muted-foreground font-medium">Guardian Mobile Number</p>
                    <p className="font-bold text-foreground text-sm">{viewStudent.guardianPhone || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-indigo-500/5 border-indigo-200 space-y-1">
                    <p className="text-muted-foreground font-medium">Parent Email (Portal Login)</p>
                    <p className="font-bold text-foreground text-sm">{viewStudent.parentEmail || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-indigo-500/5 border-indigo-200 space-y-1">
                    <p className="text-muted-foreground font-medium">Parent Username</p>
                    <p className="font-bold text-foreground text-sm">{viewStudent.parentUsername || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewStudent(null)}>Close</Button>
            {isAdmin && (
              <Button onClick={() => { const st = viewStudent; setViewStudent(null); openEdit(st); }}>
                <Pencil className="h-4 w-4 mr-1" /> Edit Student
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
