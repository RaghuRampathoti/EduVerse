import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, UserCheck, Search, RefreshCw, Clock } from "lucide-react";
import { institutionApi } from "@/api/institution";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function SuperAdminActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    institutionApi
      .getActivityLogs()
      .then(({ data }) => setLogs(data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (loading) return <Spinner full />;

  const filteredLogs = logs.filter(
    (l) =>
      (l.admin || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.campus || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalToday = logs.filter((l) => {
    const d = l.timestamp?.split(" ")[0];
    return d === new Date().toISOString().split("T")[0];
  }).length;

  const activeAdmins = [...new Set(logs.map((l) => l.admin))].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Activity Log & Audit Trail"
        description="Monitor operational actions, student admissions, attendance updates, and fee changes made by assigned Admins across your organization"
        actions={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Admin Actions Today"
          value={totalToday}
          icon={Activity}
          accent="primary"
          subtext="Logged in audit system"
        />
        <StatCard
          label="Active Admin Accounts"
          value={activeAdmins || 0}
          icon={UserCheck}
          accent="success"
          subtext="Seen in activity log"
        />
        <StatCard
          label="Total Audit Entries"
          value={logs.length}
          icon={ShieldCheck}
          accent="info"
          subtext="Full audit trail"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Admin Operations Audit Viewer
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admin, action, details, campus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
              <Clock className="h-8 w-8 opacity-40" />
              <p className="text-sm">No activity logs yet. Actions taken by Admins will appear here in real time.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin Account</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Institution Campus</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Operation Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-semibold">{log.id}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{log.timestamp}</TableCell>
                    <TableCell className="font-medium text-foreground">{log.admin}</TableCell>
                    <TableCell>
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{log.role}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.campus}</TableCell>
                    <TableCell>
                      <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded">{log.action}</span>
                    </TableCell>
                    <TableCell className="text-xs text-foreground max-w-xs truncate">{log.details}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {log.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
