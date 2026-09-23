import React, { useEffect, useState } from "react";
import { Plus, Building2, KeyRound, Trash2, Copy, Check, Pencil, MoreHorizontal } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const EMPTY_FORM = {
  name: "", code: "", type: "SCHOOL", phone: "", address: "", city: "", state: "",
  country: "", postalCode: "", establishedYear: "", maxStudents: 1000,
  superAdminFullName: "", superAdminEmail: "", superAdminPhone: "", superAdminPassword: "",
};

const EMPTY_EDIT_FORM = {
  name: "", code: "", type: "SCHOOL", phone: "", address: "", city: "", state: "",
  country: "", postalCode: "", establishedYear: "", maxStudents: 1000, status: "ACTIVE",
};

export default function InstitutionsPage() {
  const { toast } = useToast();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Edit organization states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingInst, setEditingInst] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  function load() {
    setLoading(true);
    masterAdminApi
      .listInstitutions()
      .then(({ data }) => setInstitutions(data.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function updateForm(key, value) {
    if (key === "phone" || key === "superAdminPhone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateEditForm(key, value) {
    if (key === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setEditForm((f) => ({ ...f, [key]: value }));
  }

  function handleOpenEdit(inst) {
    setEditingInst(inst);
    setEditForm({
      name: inst.name || "",
      code: inst.code || "",
      type: inst.type || "SCHOOL",
      phone: inst.phone || "",
      address: inst.address || "",
      city: inst.city || "",
      state: inst.state || "",
      country: inst.country || "",
      postalCode: inst.postalCode || "",
      establishedYear: inst.establishedYear ?? "",
      maxStudents: inst.maxStudents ?? 1000,
      status: inst.status || "ACTIVE",
    });
    setEditError("");
    setEditDialogOpen(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        establishedYear: form.establishedYear ? Number(form.establishedYear) : null,
        maxStudents: form.maxStudents ? Number(form.maxStudents) : 1000,
      };
      const { data } = await masterAdminApi.createInstitution(payload);
      toast({ title: "Organization created", description: form.name, variant: "success" });
      setCreatedCredentials(data.data.superAdminAccount);
      setForm(EMPTY_FORM);
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingInst) return;
    setEditError("");
    setEditSubmitting(true);
    try {
      const payload = {
        ...editForm,
        establishedYear: editForm.establishedYear ? Number(editForm.establishedYear) : null,
        maxStudents: editForm.maxStudents ? Number(editForm.maxStudents) : 1000,
      };
      await masterAdminApi.updateInstitution(editingInst.id, payload);
      toast({ title: "Organization updated", description: editForm.name, variant: "success" });
      setEditDialogOpen(false);
      setEditingInst(null);
      load();
    } catch (err) {
      setEditError(extractErrorMessage(err));
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This removes all its data permanently.`)) return;
    try {
      await masterAdminApi.deleteInstitution(id);
      toast({ title: "Organization deleted", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed to delete", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  async function handleToggleStatus(inst) {
    const newStatus = inst.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await masterAdminApi.updateInstitution(inst.id, { status: newStatus });
      toast({ title: `Organization ${newStatus === "ACTIVE" ? "activated" : "suspended"}`, variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed to update", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  async function handleResetPassword(id) {
    try {
      const { data } = await masterAdminApi.resetSuperAdminPassword(id);
      setCreatedCredentials(data.data);
    } catch (err) {
      toast({ title: "Failed to reset password", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  function copyCredentials() {
    if (!createdCredentials) return;
    navigator.clipboard.writeText(
      `Email: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Create and manage schools, colleges and universities on the platform"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Organization
          </Button>
        }
      />

      {loading ? (
        <Spinner full />
      ) : institutions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No organizations yet"
            description="Create your first organization to automatically provision its Super Admin account."
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Organization</Button>}
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Organization Type</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="font-medium">{inst.name}</TableCell>
                  <TableCell className="text-muted-foreground">{inst.code}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {inst.type || "SCHOOL"}
                    </span>
                  </TableCell>
                  <TableCell>{inst.studentCount}</TableCell>
                  <TableCell>{inst.facultyCount}</TableCell>
                  <TableCell><StatusBadge status={inst.status} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      onClick={() => handleDelete(inst.id, inst.name)}
                      title="Delete Organization"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleOpenEdit(inst)}>
                          <Pencil className="h-4 w-4" /> Edit Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(inst.id)}>
                          <KeyRound className="h-4 w-4" /> Reset Super Admin Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(inst)}>
                          {inst.status === "ACTIVE" ? "Suspend Organization" : "Activate Organization"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(inst.id, inst.name)} className="text-destructive">
                          <Trash2 className="h-4 w-4" /> Delete
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

      {/* Create Organization Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              This creates the organization and automatically provisions its first Super Admin login.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Organization Name *</Label>
                <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Short Code *</Label>
                <Input value={form.code} onChange={(e) => updateForm("code", e.target.value.toUpperCase())} required placeholder="e.g. GHS001" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Phone</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => updateForm("state", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => updateForm("country", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Postal Code</Label>
                <Input value={form.postalCode} onChange={(e) => updateForm("postalCode", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Established Year</Label>
                <Input type="number" value={form.establishedYear} onChange={(e) => updateForm("establishedYear", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Max Students</Label>
                <Input type="number" value={form.maxStudents} onChange={(e) => updateForm("maxStudents", e.target.value)} />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Assign Super Admin Account</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label>Super Admin Full Name *</Label>
                  <Input value={form.superAdminFullName} onChange={(e) => updateForm("superAdminFullName", e.target.value)} required placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-1.5">
                  <Label>Super Admin Email (Username) *</Label>
                  <Input type="email" value={form.superAdminEmail} onChange={(e) => updateForm("superAdminEmail", e.target.value)} required placeholder="superadmin@org.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Super Admin Password *</Label>
                  <Input type="password" value={form.superAdminPassword || ""} onChange={(e) => updateForm("superAdminPassword", e.target.value)} required placeholder="Enter password" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={form.superAdminPhone}
                    onChange={(e) => updateForm("superAdminPhone", e.target.value)}
                    placeholder="e.g. 9876543210 (Optional)"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Organization"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl" onClose={() => setEditDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Modify organization type, contact information, and system parameters.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Organization Name *</Label>
                <Input value={editForm.name} onChange={(e) => updateEditForm("name", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Short Code *</Label>
                <Input value={editForm.code} onChange={(e) => updateEditForm("code", e.target.value.toUpperCase())} required />
              </div>
              <div className="space-y-1.5">
                <Label>Organization Type *</Label>
                <Select value={editForm.type} onChange={(e) => updateEditForm("type", e.target.value)}>
                  <option value="SCHOOL">School</option>
                  <option value="COLLEGE">College</option>
                  <option value="UNIVERSITY">University</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status *</Label>
                <Select value={editForm.status} onChange={(e) => updateEditForm("status", e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Phone</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={editForm.phone}
                  onChange={(e) => updateEditForm("phone", e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Address</Label>
                <Input value={editForm.address} onChange={(e) => updateEditForm("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={editForm.city} onChange={(e) => updateEditForm("city", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={editForm.state} onChange={(e) => updateEditForm("state", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={editForm.country} onChange={(e) => updateEditForm("country", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Postal Code</Label>
                <Input value={editForm.postalCode} onChange={(e) => updateEditForm("postalCode", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Established Year</Label>
                <Input type="number" value={editForm.establishedYear} onChange={(e) => updateEditForm("establishedYear", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Max Students</Label>
                <Input type="number" value={editForm.maxStudents} onChange={(e) => updateEditForm("maxStudents", e.target.value)} />
              </div>
            </div>

            {editError && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{editError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editSubmitting}>{editSubmitting ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Reveal Dialog */}
      <Dialog open={!!createdCredentials} onOpenChange={() => { setCreatedCredentials(null); setDialogOpen(false); }}>
        <DialogContent onClose={() => { setCreatedCredentials(null); setDialogOpen(false); }}>
          <DialogHeader>
            <DialogTitle>Login Credentials Generated</DialogTitle>
            <DialogDescription>
              Share these with the Super Admin securely. They'll be asked to set a new password on first login.
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm font-mono">
              <p><span className="text-muted-foreground">Email:</span> {createdCredentials.email}</p>
              <p><span className="text-muted-foreground">Password:</span> {createdCredentials.temporaryPassword}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={copyCredentials}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={() => { setCreatedCredentials(null); setDialogOpen(false); }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

