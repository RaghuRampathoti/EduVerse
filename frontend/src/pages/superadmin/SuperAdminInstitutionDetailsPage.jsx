import React, { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  ShieldCheck,
  KeyRound,
  Users,
  UserSquare2,
  GraduationCap,
  Calendar,
  Clock,
  Phone,
  Mail,
  Award,
  Filter,
  Search,
  CheckCircle2,
} from "lucide-react";
import { institutionApi } from "@/api/institution";
import { extractErrorMessage } from "@/api/client";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const STORAGE_KEY = "eduverse_superadmin_institutions";

export default function SuperAdminInstitutionDetailsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [myOrg, setMyOrg] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstId, setSelectedInstId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [credentials, setCredentials] = useState(null);

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

        const saved = localStorage.getItem(`${STORAGE_KEY}_${org.id}`);
        let list = [];
        if (saved) {
          try {
            list = JSON.parse(saved);
          } catch {
            list = [];
          }
        }
        setInstitutions(list);
        if (list.length > 0) {
          setSelectedInstId(String(list[0].id));
        }
      } catch (err) {
        toast({ title: "Error loading institution profiles", description: extractErrorMessage(err), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleResetPassword(adminId, email) {
    if (!adminId) {
      toast({ title: "Reset unavailable", description: "No registered backend ID for this admin.", variant: "destructive" });
      return;
    }
    try {
      const { data } = await institutionApi.resetAdminPassword(adminId);
      setCredentials(data.data);
      toast({ title: "Password Reset Success", description: `New password generated for ${email}`, variant: "success" });
    } catch (err) {
      toast({ title: "Failed to reset password", description: extractErrorMessage(err), variant: "destructive" });
    }
  }

  if (loading) return <Spinner full />;

  const filteredList = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedInst = institutions.find((i) => String(i.id) === String(selectedInstId)) || filteredList[0] || institutions[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Details & Profiles"
        description="Comprehensive profile views, campus settings, location details, and administrative assignments for all managed institutions"
        actions={
          institutions.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={selectedInstId} onChange={(e) => setSelectedInstId(e.target.value)} className="w-64">
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.type})
                  </option>
                ))}
              </Select>
            </div>
          )
        }
      />

      {/* Main Grid: Selection Sidebar & Detailed View or Empty State */}
      {institutions.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold">No Institutions Created Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Super Admin has not created any schools, colleges, or universities yet. Once created under the Institutions menu, their profile details and campus configuration will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left List Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Managed Institutions
                </span>
                <span className="text-xs font-normal text-muted-foreground">{institutions.length} Total</span>
              </CardTitle>
              <div className="relative mt-2">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter institution..."
                  className="pl-8 text-xs h-8"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredList.map((inst) => {
                const isSelected = String(inst.id) === String(selectedInst?.id);
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstId(String(inst.id))}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs text-foreground">{inst.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {inst.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {[inst.city, inst.state].filter(Boolean).join(", ") || "Main Location"}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t text-[10px] text-muted-foreground">
                      <span>Admin: {inst.adminFullName || "Assigned Admin"}</span>
                      <StatusBadge status={inst.status || "ACTIVE"} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Right Details Container */}
          {selectedInst && (
            <div className="lg:col-span-2 space-y-6">
              {/* Header Banner Card */}
              <Card className="border-t-4 border-t-primary shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-foreground">{selectedInst.name}</h2>
                        <StatusBadge status={selectedInst.status || "ACTIVE"} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Organization: <strong className="text-foreground">{selectedInst.organizationName || myOrg?.name}</strong> | Academic Year: <strong className="text-foreground">{selectedInst.academicYear || "2026-2027"}</strong>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-muted/50 p-1.5 rounded-lg border">
                        <span className="text-xs font-semibold text-muted-foreground pl-1">Organization Type:</span>
                        <Select
                          value={selectedInst.type || "SCHOOL"}
                          onChange={(e) => {
                            const newType = e.target.value;
                            setInstitutions((prev) =>
                              prev.map((item) => (item.id === selectedInst.id ? { ...item, type: newType } : item))
                            );
                            toast({ title: "Organization Type Updated", description: `Set to ${newType}`, variant: "success" });
                          }}
                          className="h-7 text-xs w-32 font-bold bg-background"
                        >
                          <option value="SCHOOL">School</option>
                          <option value="COLLEGE">College</option>
                          <option value="UNIVERSITY">University</option>
                        </Select>
                      </div>
                      {selectedInst.adminId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(selectedInst.adminId, selectedInst.adminEmail)}
                          className="text-xs gap-1.5 h-8"
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Reset Admin Pass
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-0 text-xs">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary" /> Enrolled Students
                    </span>
                    <p className="text-lg font-bold text-foreground mt-1">{selectedInst.enrolledStudents || 0} / {selectedInst.studentCapacity || 1000}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <UserSquare2 className="h-3.5 w-3.5 text-info" /> Active Faculty
                    </span>
                    <p className="text-lg font-bold text-foreground mt-1">{selectedInst.facultyCount || 0} Teachers</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-600" /> Active Classes
                    </span>
                    <p className="text-lg font-bold text-foreground mt-1">{selectedInst.classCount || 0} Sections</p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Grid: Campus Location & Assigned Admin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Campus Location & Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Campus Address & Contact Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Street Address</span>
                      <span className="font-medium text-foreground">{selectedInst.address || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">City & State</span>
                      <span className="font-medium text-foreground">{[selectedInst.city, selectedInst.state].filter(Boolean).join(", ") || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Country</span>
                      <span className="font-medium text-foreground">{selectedInst.country || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Phone Number</span>
                      <span className="font-mono font-medium text-foreground">{selectedInst.phone || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Timezone</span>
                      <span className="font-mono text-foreground">{selectedInst.timezone || "Asia/Kolkata (IST)"}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Assigned Admin Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" /> Assigned Institution Admin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg border bg-primary/5 border-primary/20 space-y-1">
                      <p className="font-bold text-sm text-foreground">{selectedInst.adminFullName || "Assigned Admin"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{selectedInst.adminEmail}</p>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Account Status</span>
                      <StatusBadge status={selectedInst.status || "ACTIVE"} />
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Access Scope</span>
                      <span className="font-semibold text-primary">Institution Managing Admin</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Role Permissions</span>
                      <span className="text-emerald-600 font-semibold">Classes, Staff, Fees, Students</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credentials Dialog */}
      <Dialog open={!!credentials} onOpenChange={() => setCredentials(null)}>
        <DialogContent onClose={() => setCredentials(null)}>
          <DialogHeader>
            <DialogTitle>Admin Temporary Credentials</DialogTitle>
            <DialogDescription>Share these new login credentials with the Admin.</DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm font-mono border">
              <p><span className="text-muted-foreground">Email:</span> {credentials.email}</p>
              <p><span className="text-muted-foreground">Temporary Password:</span> {credentials.temporaryPassword}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
