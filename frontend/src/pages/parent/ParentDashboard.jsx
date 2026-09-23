import React, { useEffect, useState } from "react";
import { Baby, Megaphone } from "lucide-react";
import { parentApi } from "@/api/parent";
import { announcementApi } from "@/api/announcements";
import { PageHeader } from "@/components/shared/PageHeader";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { initials, formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    Promise.all([parentApi.children(), announcementApi.list({ page: 0, size: 5 })])
      .then(([ch, ann]) => {
        setChildren(ch.data.data);
        setAnnouncements(ann.data.data.content || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div>
      <PageHeader title="Parent Dashboard" description="Keep track of your children's progress" />

      {children.length === 0 ? (
        <Card><EmptyState icon={Baby} title="No children linked" description="Contact your organization's admin to link your children's accounts." /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {children.map((c) => (
            <Link to="/parent/children" key={c.id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-3">
                  <Avatar className="h-12 w-12 text-sm">{initials(c.fullName)}</Avatar>
                  <div>
                    <p className="text-sm font-semibold">{c.fullName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.className} {c.sectionName} · Roll {c.rollNumber || "-"}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

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
