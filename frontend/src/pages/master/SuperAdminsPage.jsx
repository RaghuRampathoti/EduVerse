import React, { useEffect, useState } from "react";
import { ShieldCheck, KeyRound, Copy, Check, Building2, UserCheck, Trash2, MoreHorizontal } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
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

export default function SuperAdminsPage() {
  const { toast } = useToast();
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetCredentials, setResetCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    masterAdminApi
      .listSuperAdmins()
      .then(({ data }) => {
        setSuperAdmins(data.data || []);
      })
      .catch((err) => {
        toast({ title: "Failed to load Super Admins", description: extractErrorMessage(err), variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleResetPassword(institutionId, name) {
    if (!institutionId) {
      toast({ title: "Cannot reset password", description: "No associated organization found", variant: "destructive" });
      return;
    }
    try {
      const { data } = await masterAdminApi.resetSuperAdminPassword(institutionId);
      setResetCredentials(data.data);
      toast({ title: "Password Reset Generated", description: `Temporary password generated for ${name}`, variant: "success" });
    } catch (err) {
      toast({ title: "Failed to reset password", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  async function handleDeleteSuperAdmin(sa) {
    if (!window.confirm(`Delete Super Admin "${sa.fullName || sa.email}"? This removes their user account.`)) return;
    try {
      await masterAdminApi.deleteSuperAdmin(sa.id);
      toast({ title: "Super Admin deleted", description: sa.fullName || sa.email, variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Failed to delete", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  function copyCredentials() {
    if (!resetCredentials) return;
    navigator.clipboard.writeText(
      `Email: ${resetCredentials.email}\nTemporary Password: ${resetCredentials.temporaryPassword}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeCount = superAdmins.filter((s) => s.status === "ACTIVE").length;
  const uniqueOrgCount = new Set(superAdmins.map((s) => s.institutionId).filter(Boolean)).size;

  return (
    <div>
      <PageHeader
        title="Super Admins"
        description="Monitor all Super Admin accounts, active statuses, and assigned organizations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Super Admins" value={superAdmins.length} icon={ShieldCheck} accent="primary" />
        <StatCard label="Active Super Admins" value={activeCount} icon={UserCheck} accent="success" />
        <StatCard label="Organizations Handled" value={uniqueOrgCount} icon={Building2} accent="info" />
      </div>

      {loading ? (
        <Spinner full />
      ) : superAdmins.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title="No Super Admins found"
            description="Create an organization in the Organizations module to provision its Super Admin account."
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Super Admin Name</TableHead>
                <TableHead>Email (Username)</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Organization Handled</TableHead>
                <TableHead>Organization Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {superAdmins.map((sa) => (
                <TableRow key={sa.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {sa.fullName ? sa.fullName.substring(0, 2).toUpperCase() : "SA"}
                    </div>
                    {sa.fullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{sa.email}</TableCell>
                  <TableCell>{sa.phone || "—"}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{sa.institutionName || "—"}</span>
                    {sa.institutionCode && (
                      <span className="ml-1.5 text-xs text-muted-foreground">({sa.institutionCode})</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {sa.institutionType || "SCHOOL"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sa.status || "ACTIVE"} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      onClick={() => handleDeleteSuperAdmin(sa)}
                      title="Delete Super Admin"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleResetPassword(sa.institutionId, sa.fullName)}>
                          <KeyRound className="h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSuperAdmin(sa)}>
                          <Trash2 className="h-4 w-4" /> Delete Super Admin
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

      {/* Credentials Reveal Dialog */}
      <Dialog open={!!resetCredentials} onOpenChange={() => setResetCredentials(null)}>
        <DialogContent onClose={() => setResetCredentials(null)}>
          <DialogHeader>
            <DialogTitle>Temporary Password Generated</DialogTitle>
            <DialogDescription>
              Share these new login credentials with the Super Admin.
            </DialogDescription>
          </DialogHeader>
          {resetCredentials && (
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm font-mono">
              <p><span className="text-muted-foreground">Username / Email:</span> {resetCredentials.email}</p>
              <p><span className="text-muted-foreground">Temporary Password:</span> {resetCredentials.temporaryPassword}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={copyCredentials}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={() => setResetCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
