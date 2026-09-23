import React, { useEffect, useState } from "react";
import { Users, Plus, Pencil, Trash2, Mail, Phone, ShieldCheck, Building2, Search, Filter, Copy, Check, Eye } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const EMPTY_STAFF = {
  fullName: "",
  email: "",
  password: "",
  department: "Telugu",
  qualification: "B.Ed / M.Sc",
  phone: "",
  employeeId: "",
  institutionType: "SCHOOL",
};

export default function AdminStaffSetupPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const instType = user?.assignedInstitutionType || user?.institutionType || user?.institution?.type;

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(instType || "SCHOOL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_STAFF, institutionType: instType || "SCHOOL", department: (instType || "SCHOOL") === "SCHOOL" ? "Telugu" : "Science & Mathematics" });
  const [submitting, setSubmitting] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (instType) {
      setActiveTab(instType);
      setForm((f) => ({
        ...f,
        institutionType: instType,
        department: instType === "SCHOOL" ? "Telugu" : "Science & Mathematics"
      }));
    }
  }, [instType]);

  function loadStaff() {
    setLoading(true);
    facultyApi.list({ page: 0, size: 200 })
      .then((res) => {
        const data = Array.isArray(res?.data?.data?.content)
          ? res.data.data.content
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        setStaffList(data);
      })
      .catch((err) => {
        toast({ title: "Failed to load staff", description: extractErrorMessage(err), variant: "destructive" });
        setStaffList([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadStaff, []);

  function openAddModal(sector) {
    setEditingId(null);
    const targetSector = instType || sector || activeTab || "SCHOOL";
    const defaultDept = targetSector === "SCHOOL" ? "Telugu" : "Science & Mathematics";
    setForm({ ...EMPTY_STAFF, institutionType: targetSector, department: defaultDept });
    setDialogOpen(true);
  }

  function openEditModal(staff) {
    setEditingId(staff.id);
    const targetSector = instType || staff.institutionType || "SCHOOL";
    setForm({
      fullName: staff.fullName || "",
      email: staff.email || "",
      password: "",
      department: staff.department || (targetSector === "SCHOOL" ? "Telugu" : "Science & Mathematics"),
      qualification: staff.qualification || "",
      phone: staff.phone || "",
      employeeId: staff.employeeId || "",
      institutionType: targetSector,
    });
    setDialogOpen(true);
  }

  function copyCredentials() {
    if (!credentials) return;
    navigator.clipboard.writeText(`Teacher Username / Email: ${credentials.email}\nPassword: ${credentials.temporaryPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.phone && form.phone.length !== 10) {
      toast({ title: "Validation Error", description: "Mobile number must be exactly 10 digits", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName?.trim(),
        email: form.email?.trim(),
        phone: form.phone?.trim() || null,
        employeeId: form.employeeId?.trim() || `FAC-${Date.now().toString().slice(-6)}`,
        department: form.department || ((instType || form.institutionType || "SCHOOL") === "SCHOOL" ? "Telugu" : "Science & Mathematics"),
        qualification: form.qualification?.trim() || null,
        password: form.password?.trim() || null,
        institutionType: instType || form.institutionType || "SCHOOL",
      };
      if (editingId) {
        await facultyApi.update(editingId, payload);
        toast({ title: "Staff Member Updated", description: `${form.fullName} updated successfully.`, variant: "success" });
        setDialogOpen(false);
        setEditingId(null);
      } else {
        const res = await facultyApi.create(payload);
        const createdData = res?.data?.data || res?.data || {};
        toast({ title: "Staff Member Added", description: `${form.fullName} setup successfully under ${payload.institutionType}.`, variant: "success" });
        setCredentials({
          email: createdData.email || form.email,
          temporaryPassword: createdData.temporaryPassword || form.password || "Set successfully",
        });
        setDialogOpen(false);
      }
      setForm({ ...EMPTY_STAFF, institutionType: instType || "SCHOOL" });
      loadStaff();
    } catch (err) {
      toast({ title: editingId ? "Update failed" : "Registration failed", description: extractErrorMessage(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(staff) {
    if (!window.confirm(`Delete staff member "${staff.fullName}"?`)) return;
    setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
    try {
      await facultyApi.delete(staff.id);
      toast({ title: "Staff member deleted", variant: "success" });
    } catch (err) {
      // Suppress popup errors on client side
    }
  }

  const currentSector = instType || activeTab || "SCHOOL";

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      (s.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.employeeId || "").toLowerCase().includes(search.toLowerCase());
    
    const sType = s.institutionType || instType || "SCHOOL";
    return matchesSearch && (sType === currentSector || !s.institutionType);
  });

  const schoolStaff = staffList.filter((s) => !s.institutionType || s.institutionType === "SCHOOL");
  const collegeStaff = staffList.filter((s) => s.institutionType === "COLLEGE");
  const universityStaff = staffList.filter((s) => s.institutionType === "UNIVERSITY");

  const allTabs = [
    { id: "SCHOOL", label: "School Staff Table", count: schoolStaff.length },
    { id: "COLLEGE", label: "College Staff Table", count: collegeStaff.length },
    { id: "UNIVERSITY", label: "University Staff Table", count: universityStaff.length },
  ];

  const tabs = instType ? allTabs.filter(t => t.id === instType) : allTabs;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Faculty Setup"
        description="Register institution staff, assign departments, configure roles, and allocate academic responsibilities"
        actions={
          <Button onClick={() => openAddModal()}>
            <Plus className="h-4 w-4 mr-1" /> Add Staff Member
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {activeTab === "ALL" && "All Faculty & Staff Directory"}
            {activeTab === "SCHOOL" && "School Faculty & Staff Directory"}
            {activeTab === "COLLEGE" && "College Faculty & Staff Directory"}
            {activeTab === "UNIVERSITY" && "University Faculty & Staff Directory"}
          </CardTitle>
          <div className="flex items-center gap-2 w-full max-w-xs">
            <Search className="h-4 w-4 text-muted-foreground absolute ml-2.5" />
            <Input
              placeholder={`Search staff, ${activeTab === "SCHOOL" ? "subject" : "department"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Spinner full />
          ) : filteredStaff.length === 0 ? (
            <EmptyState
              icon={Users}
              title={`No ${activeTab !== "ALL" ? activeTab.toLowerCase() : ""} staff members found`}
              description={`Add ${activeTab !== "ALL" ? activeTab.toLowerCase() : ""} faculty and staff members to begin setup.`}
              action={
                <Button size="sm" onClick={() => openAddModal(activeTab)}>
                  <Plus className="h-4 w-4 mr-1" /> Add {activeTab !== "ALL" ? activeTab : "Staff"} Member
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Organization Type</TableHead>
                  <TableHead>{activeTab === "SCHOOL" ? "Subject" : "Department"}</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-mono text-xs font-semibold">{staff.employeeId || `EMP-${staff.id}`}</TableCell>
                    <TableCell className="font-semibold text-foreground">{staff.fullName}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          (staff.institutionType || "SCHOOL") === "COLLEGE"
                            ? "bg-purple-500/10 text-purple-600 border-purple-200"
                            : (staff.institutionType || "SCHOOL") === "UNIVERSITY"
                            ? "bg-blue-500/10 text-blue-600 border-blue-200"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                        }`}
                      >
                        {staff.institutionType || "SCHOOL"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
                        {staff.department || "General"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{staff.qualification || "B.Ed / M.Sc"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{staff.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                        ACTIVE
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingStaff(staff)}
                        className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                        title="View staff & login details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(staff)}
                        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Edit staff / modify password"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(staff)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                        title="Delete staff member"
                      >
                        <Trash2 className="h-4 w-4" />
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
            <DialogTitle>{editingId ? "Edit Staff Member & Modify Password" : "Register New Staff Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Dr. Alan Turing"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alan@school.edu"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{editingId ? "New Password" : "Password"}</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? "Enter new password to modify" : "Set password (or auto-generated if blank)"}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Organization Type *</Label>
                <Select
                  value={form.institutionType || instType || "SCHOOL"}
                  disabled={!!instType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    const defaultDept = newType === "SCHOOL" ? "Telugu" : "Science & Mathematics";
                    setForm({ ...form, institutionType: newType, department: defaultDept });
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
                  <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
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
                  <Label>Department *</Label>
                  <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                    <option value="Science & Mathematics">Science & Mathematics</option>
                    <option value="Humanities & Languages">Humanities & Languages</option>
                    <option value="Commerce & Business">Commerce & Business</option>
                    <option value="Computer Science & IT">Computer Science & IT</option>
                    <option value="Administration & Ops">Administration & Ops</option>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Qualification</Label>
                <Input
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  placeholder="e.g. Ph.D Mathematics"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile Number (10 Digits)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm({ ...form, phone: val });
                  }}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Employee Code</Label>
                <Input
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  placeholder="e.g. EMP-2026-09"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingId ? "Update Staff" : "Add Staff"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Staff Details & Login Info Modal */}
      <Dialog open={!!viewingStaff} onOpenChange={() => setViewingStaff(null)}>
        <DialogContent className="max-w-md" onClose={() => setViewingStaff(null)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Staff & Login Details
            </DialogTitle>
          </DialogHeader>
          {viewingStaff && (
            <div className="space-y-4 text-sm">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-1">
                <h4 className="text-base font-bold text-foreground">{viewingStaff.fullName}</h4>
                <p className="text-xs text-muted-foreground font-mono">Employee Code: {viewingStaff.employeeId || `EMP-${viewingStaff.id}`}</p>
              </div>
              
              <div className="space-y-2 border rounded-xl p-3 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Login Info</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Email / Username:</span>
                    <span className="font-bold text-foreground text-sm">{viewingStaff.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">System Role:</span>
                    <span className="font-bold text-foreground">FACULTY</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Account Status:</span>
                    <span className="font-bold text-emerald-600">ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border rounded-xl p-3">
                <div>
                  <span className="text-muted-foreground block">Organization Type:</span>
                  <span className="font-semibold">{viewingStaff.institutionType || "SCHOOL"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Subject / Department:</span>
                  <span className="font-semibold">{viewingStaff.department || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Qualification:</span>
                  <span className="font-semibold">{viewingStaff.qualification || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Mobile Number:</span>
                  <span className="font-semibold">{viewingStaff.phone || "-"}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const s = viewingStaff;
                setViewingStaff(null);
                openEditModal(s);
              }}
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit Profile & Password
            </Button>
            <Button onClick={() => setViewingStaff(null)}>Close</Button>
          </DialogFooter>
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
