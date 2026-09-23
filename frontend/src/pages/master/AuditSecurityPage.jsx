import React, { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, Key, Search } from "lucide-react";
import { masterAdminApi } from "@/api/masterAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function AuditSecurityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    masterAdminApi
      .getAuditLogs()
      .then(({ data }) => setLogs(data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const filteredLogs = logs.filter(
    (l) =>
      l.user?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.target?.toLowerCase().includes(search.toLowerCase()) ||
      l.ip?.includes(search)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trails & Security Operations"
        description="Monitor system login activity, admin actions, suspicious security events, and account locks across the platform"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Audit Logs"
          value={logs.length}
          icon={ShieldCheck}
          accent="primary"
          subtext="Full trail persisted"
        />
        <StatCard
          label="Security Status"
          value="Normal"
          icon={ShieldAlert}
          accent="success"
          subtext="0 active account locks"
        />
        <StatCard
          label="Failed Login Rate"
          value="0.02%"
          icon={AlertTriangle}
          accent="info"
          subtext="Within normal baseline"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" /> Platform Security Log Viewer
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user, action, target, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>User / Account</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action Performed</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs font-semibold">{log.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{log.timestamp}</TableCell>
                  <TableCell className="font-medium text-foreground">{log.user}</TableCell>
                  <TableCell>
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-medium">{log.role}</span>
                  </TableCell>
                  <TableCell className="font-semibold text-xs">{log.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.target}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : log.status === "WARNING"
                          ? "bg-amber-500/10 text-amber-600"
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
        </CardContent>
      </Card>
    </div>
  );
}
