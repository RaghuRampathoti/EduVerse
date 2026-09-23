import React from "react";
import { User, Mail, Phone, MapPin, Award, BookOpen, Calendar, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function FacultyProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and manage your academic profile information"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4 text-primary text-2xl font-bold">
              {user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("") : "FP"}
            </div>
            <h3 className="text-lg font-bold">{user?.fullName || "Dr. Faculty Member"}</h3>
            <p className="text-sm text-muted-foreground">{user?.email || "faculty@eduverse.com"}</p>
            <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
              Senior Faculty
            </span>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Faculty Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground font-medium">Employee ID</p>
                <p className="text-sm font-semibold mt-0.5">TCH-2419</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground font-medium">Department</p>
                <p className="text-sm font-semibold mt-0.5">Physics & Applied Sciences</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground font-medium">Designation</p>
                <p className="text-sm font-semibold mt-0.5">Associate Professor</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground font-medium">Assigned Subjects</p>
                <p className="text-sm font-semibold mt-0.5">4 Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
