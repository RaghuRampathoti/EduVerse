import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon: Icon, trend, className, accent = "primary" }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-1.5">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        {Icon && (
          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", `bg-${accent}/10`)}>
            <Icon className={cn("h-5 w-5", `text-${accent}`)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
