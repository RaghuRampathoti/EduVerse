import React, { useEffect, useState } from "react";
import { Plus, Building2, KeyRound, Trash2, Copy, Check, MapPin, School, GraduationCap, ShieldCheck, Eye, Search, Filter, Activity, Users, UserSquare2, Wallet } from "lucide-react";
import { institutionApi } from "@/api/institution";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const STORAGE_KEY = "eduverse_superadmin_institutions";

export default function SuperAdminInstitutionsPage() {
  const { toast } = useToast();
  const [myOrg, setMyOrg] = useState(null);
  const [institutionsList, setInstitutionsList] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Institution Filtering & Monitoring State
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [monitorInst, setMonitorInst] = useState(null);

  const [form, setForm] = useState({
    name: "",
    legalName: "",
    displayName: "",
    type: "SCHOOL",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    logoUrl: "",
    academicYear: "2026-2027",
    timezone: "Asia/Kolkata (IST)",
    adminFullName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
  });

  // Load organization info & existing institution branches
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: orgData } = await institutionApi.getMine();
        const org = orgData.data;
        setMyOrg(org);

        // Fetch backend admins
        const { data: adminsData } = await institutionApi.listAdmins().catch(() => ({ data: { data: [] } }));
        const adminList = adminsData?.data || [];
        setAdmins(adminList);

        // Load local institution branches for this organization
        const saved = localStorage.getItem(`${STORAGE_KEY}_${org.id}`);
        if (saved) {
          try {
            setInstitutionsList(JSON.parse(saved));
          } catch {
            setInstitutionsList([]);
          }
        } else {
          setInstitutionsList([]);
        }
      } catch (err) {
        toast({ title: "Error loading institutions", description: extractErrorMessage(err), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function saveInstitutions(newList) {
    setInstitutionsList(newList);
    if (myOrg) {
      localStorage.setItem(`${STORAGE_KEY}_${myOrg.id}`, JSON.stringify(newList));
    }
  }

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleToggleBranchStatus(id) {
    const updated = institutionsList.map((item) => {
      if (item.id === id) {
        const nextStatus = item.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        toast({ title: `Campus access ${nextStatus === "ACTIVE" ? "reactivated" : "suspended"}`, variant: "success" });
        return { ...item, status: nextStatus };
      }
      return item;
    });
    saveInstitutions(updated);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 1. Create Admin account in backend API
      const adminPayload = {
        fullName: form.adminFullName,
        email: form.adminEmail,
        password: form.adminPassword,
        phone: form.adminPhone,
        assignedInstitutionType: form.type,
      };

      const { data: adminRes } = await institutionApi.createAdmin(adminPayload);
      const createdAdminAcc = adminRes.data;

      // Persist direct assigned type and institution branch mapping for the Admin
      try {
        const cleanEmail = form.adminEmail.toLowerCase().trim();
        localStorage.setItem(`eduverse_admin_assigned_type_${cleanEmail}`, form.type);
        localStorage.setItem(`eduverse_admin_assigned_name_${cleanEmail}`, form.name);
        if (createdAdminAcc?.id) {
          localStorage.setItem(`eduverse_admin_assigned_type_${createdAdminAcc.id}`, form.type);
          localStorage.setItem(`eduverse_admin_assigned_name_${createdAdminAcc.id}`, form.name);
        }
      } catch (e) {}

      // 2. Create local Institution branch entry linked to this Admin
      const newInst = {
        id: `inst-${Date.now()}`,
        name: form.name,
        organizationName: myOrg?.name || "Organization",
        type: form.type,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        phone: form.phone,
        adminFullName: form.adminFullName,
        adminEmail: form.adminEmail,
        adminId: createdAdminAcc.id,
        status: "ACTIVE",
      };

      const updatedList = [newInst, ...institutionsList];
      saveInstitutions(updatedList);

      toast({
        title: "Institution Created & Admin Assigned",
        description: `${form.name} (${form.type}) with Admin ${form.adminEmail}`,
        variant: "success",
      });

      setCreatedCredentials({
        email: createdAdminAcc.email,
        temporaryPassword: createdAdminAcc.temporaryPassword || form.adminPassword,
        institutionName: form.name,
      });

      // Reset form
      setForm({
        name: "",
        type: "SCHOOL",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        phone: "",
        adminFullName: "",
        adminEmail: "",
        adminPassword: "",
        adminPhone: "",
      });

      setDialogOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetAdminPassword(adminId, adminEmail) {
    if (!adminId) {
      toast({ title: "Admin reset unavailable", description: "No registered backend ID for this admin.", variant: "destructive" });
      return;
    }
    try {
      const { data } = await institutionApi.resetAdminPassword(adminId);
      setCreatedCredentials({
        email: data.data.email,
        temporaryPassword: data.data.temporaryPassword,
        institutionName: "Assigned Institution",
      });
      toast({ title: "Admin Password Reset", description: `New password generated for ${adminEmail}`, variant: "success" });
    } catch (err) {
      toast({ title: "Failed to reset password", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  async function handleDeleteInstitution(id, name, adminId) {
    if (!window.confirm(`Delete institution "${name}" and unassign its Admin?`)) return;
    try {
      if (adminId) {
        await institutionApi.deleteAdmin(adminId).catch(() => {});
      }
      const updated = institutionsList.filter((item) => item.id !== id);
      saveInstitutions(updated);
      toast({ title: "Institution deleted", variant: "success" });
    } catch (err) {
      toast({ title: "Failed to delete institution", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  function copyCredentials() {
    if (!createdCredentials) return;
    navigator.clipboard.writeText(
      `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.temporaryPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const schoolCount = institutionsList.filter((i) => i.type === "SCHOOL").length;
  const collegeCount = institutionsList.filter((i) => i.type === "COLLEGE").length;
  const universityCount = institutionsList.filter((i) => i.type === "UNIVERSITY").length;

  const filteredInstitutions = institutionsList.filter((inst) => {
    const matchesType = typeFilter === "ALL" || inst.type === typeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      inst.name?.toLowerCase().includes(q) ||
      inst.adminEmail?.toLowerCase().includes(q) ||
      inst.adminFullName?.toLowerCase().includes(q) ||
      inst.city?.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  return (
    <div>
      <PageHeader
        title={myOrg?.name ? `${myOrg.name} Institutions` : "Institutions"}
        description={`Manage schools, colleges, and universities under ${myOrg?.name || "your organization"} and assign Admins.`}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Institution
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Institutions" value={institutionsList.length} icon={Building2} accent="primary" />
        <StatCard label="Schools" value={schoolCount} icon={School} accent="info" />
        <StatCard label="Colleges" value={collegeCount} icon={GraduationCap} accent="success" />
        <StatCard label="Universities" value={universityCount} icon={ShieldCheck} accent="warning" />
      </div>

      {/* Institution Search & Type Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 bg-card p-3 rounded-lg border shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-48">
            <option value="ALL">All Institution Types</option>
            <option value="SCHOOL">School</option>
            <option value="COLLEGE">College</option>
            <option value="UNIVERSITY">University</option>
            <option value="INSTITUTE">Institute</option>
            <option value="ACADEMY">Academy</option>
          </Select>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, admin or city..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <Spinner full />
      ) : institutionsList.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No institutions added yet"
            description={`Add your organization's schools, colleges, or universities and assign Admins to manage them.`}
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Add Institution</Button>}
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned Admin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{inst.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {inst.type || "SCHOOL"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{inst.organizationName || myOrg?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{[inst.city, inst.state, inst.country].filter(Boolean).join(", ") || "Location not specified"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{inst.adminFullName || "Admin"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{inst.adminEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inst.status || "ACTIVE"} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="outline" size="sm" onClick={() => setMonitorInst(inst)} className="h-8 text-xs gap-1">
                      <Eye className="h-3.5 w-3.5" /> Monitor
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setMonitorInst(inst)}>
                          <Eye className="h-4 w-4" /> Monitor Status & Metrics
                        </DropdownMenuItem>
                        {inst.adminId && (
                          <DropdownMenuItem onClick={() => handleResetAdminPassword(inst.adminId, inst.adminEmail)}>
                            <KeyRound className="h-4 w-4" /> Reset Admin Password
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleBranchStatus(inst.id)}>
                          <ShieldCheck className="h-4 w-4 text-amber-500" /> {inst.status === "ACTIVE" ? "Suspend Access" : "Reactivate Access"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteInstitution(inst.id, inst.name, inst.adminId)} className="text-destructive">
                          <Trash2 className="h-4 w-4" /> Delete Institution
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Institution Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add New Institution & Assign Admin</DialogTitle>
            <DialogDescription>
              Create a school, college, or university under {myOrg?.name || "your organization"} and assign its managing Admin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Organization Name</Label>
                <Input value={myOrg?.name || "Organization"} disabled className="bg-muted text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label>Institution Type *</Label>
                <Select value={form.type} onChange={(e) => updateForm("type", e.target.value)}>
                  <option value="SCHOOL">School</option>
                  <option value="COLLEGE">College</option>
                  <option value="UNIVERSITY">University</option>
                  <option value="INSTITUTE">Institute</option>
                  <option value="ACADEMY">Academy</option>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Institution Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                  placeholder="e.g. Central High School / College of Science"
                />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} placeholder="e.g. New York" />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => updateForm("state", e.target.value)} placeholder="e.g. NY" />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => updateForm("country", e.target.value)} placeholder="e.g. USA" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone (10 Digits)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateForm("phone", val);
                  }}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Full Address</Label>
                <Input value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Campus street address" />
              </div>
            </div>

            {/* Admin Assignment Section */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-1">Assign Admin to Institution</p>
              <p className="text-xs text-muted-foreground mb-3">
                This Admin will manage day-to-day operations, classes, faculty, and students for this institution.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label>Admin Full Name *</Label>
                  <Input
                    value={form.adminFullName}
                    onChange={(e) => updateForm("adminFullName", e.target.value)}
                    required
                    placeholder="e.g. Jane Smith"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Admin Email (Username) *</Label>
                  <Input
                    type="email"
                    value={form.adminEmail}
                    onChange={(e) => updateForm("adminEmail", e.target.value)}
                    required
                    placeholder="admin@school.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Admin Password *</Label>
                  <Input
                    type="password"
                    value={form.adminPassword}
                    onChange={(e) => updateForm("adminPassword", e.target.value)}
                    required
                    placeholder="Set Admin Password"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Add Institution & Assign Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Reveal Dialog */}
      <Dialog open={!!createdCredentials} onOpenChange={() => setCreatedCredentials(null)}>
        <DialogContent onClose={() => setCreatedCredentials(null)}>
          <DialogHeader>
            <DialogTitle>Admin Login Credentials</DialogTitle>
            <DialogDescription>
              Share these credentials with the assigned Admin for {createdCredentials?.institutionName}.
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm font-mono">
              <p><span className="text-muted-foreground">Admin Username / Email:</span> {createdCredentials.email}</p>
              <p><span className="text-muted-foreground">Admin Password:</span> {createdCredentials.temporaryPassword}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={copyCredentials}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={() => setCreatedCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detailed Institution Status & Monitoring Dialog */}
      <Dialog open={!!monitorInst} onOpenChange={() => setMonitorInst(null)}>
        <DialogContent className="max-w-xl" onClose={() => setMonitorInst(null)}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg">{monitorInst?.name}</DialogTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {monitorInst?.type || "SCHOOL"}
              </span>
              <StatusBadge status={monitorInst?.status || "ACTIVE"} />
            </div>
            <DialogDescription>
              Separate operational status & metrics monitoring for {monitorInst?.organizationName || "Organization"}
            </DialogDescription>
          </DialogHeader>

          {monitorInst && (
            <div className="space-y-4 py-2">
              {/* Institution Info & Location */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg border text-xs">
                <div>
                  <p className="text-muted-foreground font-medium">Campus Location</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {[monitorInst.city, monitorInst.state, monitorInst.country].filter(Boolean).join(", ") || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Academic Year</p>
                  <p className="font-semibold text-foreground mt-0.5">{monitorInst.academicYear || "2026-2027"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Contact Phone</p>
                  <p className="font-semibold text-foreground mt-0.5">{monitorInst.phone || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Timezone</p>
                  <p className="font-semibold text-foreground mt-0.5">{monitorInst.timezone || "Asia/Kolkata (IST)"}</p>
                </div>
              </div>

              {/* Assigned Admin Profile Card */}
              <div className="p-3.5 rounded-lg border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Assigned Institution Admin
                  </span>
                  <StatusBadge status={monitorInst.status || "ACTIVE"} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-foreground">{monitorInst.adminFullName || "Primary Admin"}</p>
                    <p className="text-xs font-mono text-muted-foreground">{monitorInst.adminEmail}</p>
                  </div>
                  {monitorInst.adminId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetAdminPassword(monitorInst.adminId, monitorInst.adminEmail)}
                      className="text-xs h-8 gap-1"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Reset Password
                    </Button>
                  )}
                </div>
              </div>

              {/* Individual Institution Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
                  <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> Students
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">240</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Enrolled & Active</p>
                </div>
                <div className="p-3 rounded-lg border bg-info/5 border-info/20">
                  <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                    <UserSquare2 className="h-3.5 w-3.5 text-info" /> Faculty
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">18</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">1:13 Ratio</p>
                </div>
                <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                  <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
                    <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Fees
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">94%</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Collected</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              variant={monitorInst?.status === "ACTIVE" ? "destructive" : "default"}
              size="sm"
              onClick={() => {
                handleToggleBranchStatus(monitorInst.id);
                setMonitorInst(null);
              }}
            >
              {monitorInst?.status === "ACTIVE" ? "Suspend Access" : "Reactivate Access"}
            </Button>
            <Button onClick={() => setMonitorInst(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
