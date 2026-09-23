import React from "react";
import { Folder, File, Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MATERIALS = [
  { id: 1, name: "Quantum_Mechanics_Lecture_Notes.pdf", size: "4.2 MB", subject: "Quantum Mechanics", uploaded: "01 Aug 2026" },
  { id: 2, name: "Thermodynamics_Question_Bank.pdf", size: "2.8 MB", subject: "Thermodynamics", uploaded: "28 Jul 2026" },
];

export default function FacultyStudyMaterialsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials"
        description="Share course notes, PDFs, and study resources with students"
        action={
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" /> Upload Resource
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MATERIALS.map((mat) => (
          <Card key={mat.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <File className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold truncate max-w-[200px] sm:max-w-xs">{mat.name}</h4>
                  <p className="text-xs text-muted-foreground">{mat.subject} • {mat.size}</p>
                </div>
              </div>
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
