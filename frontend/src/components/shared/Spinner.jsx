import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, full }) {
  if (full) {
    return (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center">
        <Loader2 className={cn("h-6 w-6 animate-spin text-primary", className)} />
      </div>
    );
  }
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}
