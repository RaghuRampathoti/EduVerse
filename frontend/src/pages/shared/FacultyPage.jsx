import React, { useEffect, useState } from "react";
import { Plus, UserSquare2, Trash2, Pencil, Copy, Check } from "lucide-react";
import { facultyApi } from "@/api/faculty";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const EMPTY = {
  fullName: "", email: "", password: "", phone: "", employeeId: "", department: "", designation: "",
  qualification: "", gender: "", joiningDate: "", dateOfBirth: "", address: "", monthlySalary: "",
  institutionType: "COLLEGE",
};

export default function FacultyPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user && user.role === "ADMIN";
  const instType = user?.assignedInstitutionType || user?.institutionType || user?.institution?.type;
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(instType || "SCHOOL");

  useEffect(() => {
    if (instType) {
      setActiveTab(instType);
    }
  }, [instType]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    facultyApi.list({ page: 0, size: 200 }).then(({ data }) => setFaculty(data.data.content || [])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function openCreate(sector) {
    setEditingId(null);
    const targetSector = sector && sector !== "ALL" ? sector : activeTab !== "ALL" ? activeTab : "COLLEGE";
    setForm({ ...EMPTY, institutionType: targetSector });
    setDialogOpen(true);
  }

  function openEdit(f) {
    setEditingId(f.id);
    setForm({
      ...EMPTY, fullName: f.fullName, phone: f.phone || "", department: f.department || "",
      designation: f.designation || "", qualification: f.qualification || "", address: f.address || "",
      monthlySalary: f.monthlySalary || "", institutionType: f.institutionType || "COLLEGE",
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.phone && form.phone.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const { fullName, phone, department, designation, qualification, address, monthlySalary, institutionType } = form;
        await facultyApi.update(editingId, {
          fullName, phone, department, designation, qualification, address,
          monthlySalary: monthlySalary ? Number(monthlySalary) : null,
          institutionType: institutionType || "COLLEGE",
        });
        toast({ title: "Faculty updated", variant: "success" });
        setDialogOpen(false);
      } else {
        const payload = { ...form, monthlySalary: form.monthlySalary ? Number(form.monthlySalary) : null, institutionType: form.institutionType || "COLLEGE" };
        const { data } = await facultyApi.create(payload);
        toast({ title: "Faculty added", variant: "success" });
        setCredentials({
          email: data.data.email,
          temporaryPassword: data.data.temporaryPassword || form.password || "Set successfully",
        });
      }
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(f) {
    if (!window.confirm(`Remove faculty "${f.fullName}"?`)) return;
    try {
      await facultyApi.delete(f.id);
      toast({ title: "Faculty removed", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  function copyCredentials() {
    if (!credentials) return;
    navigator.clipboard.writeText(`Teacher Username / Email: ${credentials.email}\nPassword: ${credentials.temporaryPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const schoolList = faculty.filter((f) => (f.institutionType || "SCHOOL") === "SCHOOL");
  const collegeList = faculty.filter((f) => f.institutionType === "COLLEGE");
  const univList = faculty.filter((f) => f.institutionType === "UNIVERSITY");

  const allTabs = [
    { id: "SCHOOL", label: "School Faculty Table", count: schoolList.length },
    { id: "COLLEGE", label: "College Faculty Table", count: collegeList.length },
    { id: "UNIVERSITY", label: "University Faculty Table", count: univList.length },
  ];

  const tabs = instType ? allTabs.filter(t => t.id === instType) : allTabs;

  const displayedFaculty = faculty.filter((f) => (f.institutionType || instType || "SCHOOL") === activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty"
        description="Manage teaching staff profiles and login accounts by sector table"
        actions={isAdmin ? <Button onClick={() => openCreate(activeTab)}><Plus className="h-4 w-4" /> Add Faculty</Button> : null}
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

      {loading ? (
        <Spinner full />
      ) : displayedFaculty.length === 0 ? (
        <Card>
          <EmptyState
            icon={UserSquare2}
            title={`No ${activeTab !== "ALL" ? activeTab.toLowerCase() : ""} faculty found`}
            description={isAdmin ? `Add faculty to the ${activeTab !== "ALL" ? activeTab : "system"} table.` : "No profiles found."}
            action={isAdmin ? <Button onClick={() => openCreate(activeTab)}><Plus className="h-4 w-4" /> Add Faculty</Button> : null}
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty</TableHead>
                <TableHead>Organization Type</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Email (Username)</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedFaculty.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium flex items-center gap-2.5">
                    <Avatar>{initials(f.fullName)}</Avatar> {f.fullName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        (f.institutionType || "SCHOOL") === "COLLEGE"
                          ? "bg-purple-500/10 text-purple-600 border-purple-200"
                          : (f.institutionType || "SCHOOL") === "UNIVERSITY"
                          ? "bg-blue-500/10 text-blue-600 border-blue-200"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                      }`}
                    >
                      {f.institutionType || "SCHOOL"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.employeeId}</TableCell>
                  <TableCell>{f.department || "-"}</TableCell>
                  <TableCell>{f.designation || "-"}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{f.email}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(f)}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit Faculty" : "Add Faculty & Teacher Login Account"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name *</Label>
                <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required placeholder="e.g. Dr. Nainika Sharma" />
              </div>
              {!editingId && (
                <>
                  <div className="space-y-1.5">
                    <Label>Teacher Email / Username *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required placeholder="nainika@gmail.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Teacher Password</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Set password (or auto-generated if blank)" />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label>Mobile Number (10 Digits)</Label>
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
                  <Label>Employee ID *</Label>
                  <Input value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} required placeholder="e.g. ENG-01" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Organization Type *</Label>
                <Select
                  value={form.institutionType || "SCHOOL"}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const defaultDept = newType === "SCHOOL" ? "Telugu" : "Computer Science";
                    setForm((f) => ({ ...f, institutionType: newType, department: defaultDept }));
                  }}
                >
                  <option value="SCHOOL">School</option>
                  <option value="COLLEGE">College</option>
                  <option value="UNIVERSITY">University</option>
                </Select>
              </div>
              {(form.institutionType || "SCHOOL") === "SCHOOL" ? (
                <div className="space-y-1.5">
                  <Label>Subject *</Label>
                  <Select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
                    <option value="Telugu">Telugu</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Maths">Maths</option>
                    <option value="Physics">Physics</option>
                    <option value="Biology">Biology</option>
                    <option value="Social">Social</option>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} placeholder="e.g. Computer Science" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Designation</Label>
                <Input value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} placeholder="e.g. Assistant Professor" />
              </div>
              <div className="space-y-1.5">
                <Label>Qualification</Label>
                <Input value={form.qualification} onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))} placeholder="e.g. M.Tech / Ph.D" />
              </div>
              {!editingId && (
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
              )}
              {!editingId && (
                <div className="space-y-1.5">
                  <Label>Joining Date</Label>
                  <Input type="date" value={form.joiningDate} onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Monthly Salary</Label>
                <Input type="number" value={form.monthlySalary} onChange={(e) => setForm((f) => ({ ...f, monthlySalary: e.target.value }))} placeholder="Salary amount" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="City / Address" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save & Create Account"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!credentials} onOpenChange={() => { setCredentials(null); setDialogOpen(false); }}>
        <DialogContent onClose={() => { setCredentials(null); setDialogOpen(false); }}>
          <DialogHeader><DialogTitle>Teacher Login Credentials</DialogTitle></DialogHeader>
          {credentials && (
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm font-mono">
              <p><span className="text-muted-foreground">Teacher Email / Username:</span> {credentials.email}</p>
              <p><span className="text-muted-foreground">Teacher Password:</span> {credentials.temporaryPassword}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={copyCredentials}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy Credentials"}</Button>
            <Button onClick={() => { setCredentials(null); setDialogOpen(false); }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
