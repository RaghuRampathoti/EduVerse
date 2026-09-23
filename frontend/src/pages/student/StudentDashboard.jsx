import React, { useEffect, useState } from "react";
import { CalendarCheck, Wallet, Megaphone } from "lucide-react";
import { studentApi } from "@/api/students";
import { announcementApi } from "@/api/announcements";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Spinner } from "@/components/shared/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [fees, setFees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    Promise.all([
      studentApi.me(),
      studentApi.myAttendanceSummary(),
      studentApi.myFees(),
      announcementApi.list({ page: 0, size: 5 }),
    ])
      .then(([me, sum, fee, ann]) => {
        setProfile(me.data.data);
        setSummary(sum.data.data);
        setFees(fee.data.data);
        setAnnouncements(ann.data.data.content || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const pendingTotal = fees.reduce((sum, f) => sum + (f.balance || 0), 0);

  return (
    <div>
      <PageHeader title={`Hi, ${profile?.fullName?.split(" ")[0]} 👋`} description={`${profile?.className || ""} ${profile?.sectionName || ""} · Roll No. ${profile?.rollNumber || "-"}`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Attendance %" value={`${summary?.percentagePresent?.toFixed(1) || 0}%`} icon={CalendarCheck} accent="primary" />
        <StatCard label="Days Present" value={summary?.present || 0} icon={CalendarCheck} accent="success" />
        <StatCard label="Fees Pending" value={formatCurrency(pendingTotal)} icon={Wallet} accent="warning" />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4" /> Announcements</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
          {announcements.map((a) => (
            <div key={a.id} className="border-b last:border-0 pb-3 last:pb-0">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(a.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
