import React, { useEffect, useState } from "react";
import { Plus, ShieldCheck, KeyRound, Trash2, Copy, Check, MoreHorizontal } from "lucide-react";
import { institutionApi } from "@/api/institution";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const EMPTY_FORM = { fullName: "", username: "", email: "", phone: "", password: "", assignedInstitutionType: "SCHOOL" };

export default function AdminsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    institutionApi
      .listAdmins()
      .then(({ data }) => setAdmins(data.data || []))
      .catch((err) => {
        toast({ title: "Failed to load admins", description: extractErrorMessage(err), variant: "destructive" });
        setAdmins([]);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (form.phone && form.phone.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await institutionApi.createAdmin(form);
      const cleanEmail = form.email.toLowerCase().trim();
      try {
        localStorage.setItem(`eduverse_admin_assigned_type_${cleanEmail}`, form.assignedInstitutionType || "SCHOOL");
        if (data.data?.id) {
          localStorage.setItem(`eduverse_admin_assigned_type_${data.data.id}`, form.assignedInstitutionType || "SCHOOL");
        }
      } catch (e) {}

      toast({ title: "Admin account created", variant: "success" });
      setCredentials(data.data);
      setForm(EMPTY_FORM);
      setDialogOpen(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(admin) {
    const newStatus = admin.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await institutionApi.updateAdminStatus(admin.id, newStatus);
      toast({ title: "Status updated", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  async function handleDelete(admin) {
    if (!window.confirm(`Remove admin "${admin.fullName}"?`)) return;
    try {
      await institutionApi.deleteAdmin(admin.id);
      toast({ title: "Admin removed", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  async function handleResetPassword(admin) {
    try {
      const { data } = await institutionApi.resetAdminPassword(admin.id);
      setCredentials(data.data);
    } catch (err) {
      toast({ title: "Failed", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  function copyCredentials() {
    if (!credentials) return;
    const text = `Username: ${credentials.username || credentials.email}\nEmail: ${credentials.email}\nPassword: ${credentials.temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Manage the Admin accounts for your organization"
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Admin</Button>}
      />

      {loading ? (
        <Spinner full />
      ) : admins.length === 0 ? (
        <Card>
          <EmptyState icon={ShieldCheck} title="No admins yet" description="Create an Admin account to help manage your organization's day-to-day operations." />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username / Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Assigned Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Organization Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium flex items-center gap-2.5">
                    <Avatar>{initials(admin.fullName)}</Avatar>
                    {admin.fullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div>{admin.email}</div>
                    {admin.username && <div className="text-xs text-muted-foreground font-mono">@{admin.username}</div>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{admin.phone || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">Full Admin Access</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={admin.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {admin.institutionName || admin.institution?.name || user?.institutionName || user?.institution?.name || "Organization"}
                      </span>
                      {(() => {
                        const directType = localStorage.getItem(`eduverse_admin_assigned_type_${admin.email?.toLowerCase().trim()}`) ||
                                           (admin.id && localStorage.getItem(`eduverse_admin_assigned_type_${admin.id}`)) ||
                                           admin.assignedInstitutionType;
                        return directType ? (
                          <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-200">
                            {directType}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                          <KeyRound className="h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(admin)}>
                          {admin.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(admin)} className="text-destructive">
                          <Trash2 className="h-4 w-4" /> Remove
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create Admin Account</DialogTitle>
            <DialogDescription>Specify admin details and login credentials below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="e.g. Ramu Kumar" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="e.g. ramu" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="ramu@gmail.com" required />
              </div>
            </div>
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
            <div className="space-y-1.5">
              <Label>Assigned Organization / Institution Type *</Label>
              <Select
                value={form.assignedInstitutionType}
                onChange={(e) => setForm((f) => ({ ...f, assignedInstitutionType: e.target.value }))}
              >
                <option value="SCHOOL">School</option>
                <option value="COLLEGE">College</option>
                <option value="UNIVERSITY">University</option>
                <option value="INSTITUTE">Institute</option>
                <option value="ACADEMY">Academy</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Leave blank to auto-generate" />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Admin"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!credentials} onOpenChange={() => { setCredentials(null); }}>
        <DialogContent onClose={() => { setCredentials(null); }}>
          <DialogHeader>
            <DialogTitle>Admin Login Credentials</DialogTitle>
            <DialogDescription>Share these credentials securely so the admin can log in.</DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm font-mono border">
              {credentials.username && (
                <p><span className="text-muted-foreground">Username:</span> <strong className="text-foreground">{credentials.username}</strong></p>
              )}
              <p><span className="text-muted-foreground">Email:</span> <strong className="text-foreground">{credentials.email}</strong></p>
              <p><span className="text-muted-foreground">Password:</span> <strong className="text-foreground">{credentials.temporaryPassword}</strong></p>
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
    </div>
  );
}
