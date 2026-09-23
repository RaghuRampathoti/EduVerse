import React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-secondary items-center justify-center text-xs font-semibold text-secondary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
