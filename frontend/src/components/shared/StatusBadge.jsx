import React from "react";
import { Badge } from "@/components/ui/badge";

const MAP = {
  ACTIVE: "success",
  PRESENT: "success",
  PAID: "success",
  INACTIVE: "secondary",
  SUSPENDED: "destructive",
  ABSENT: "destructive",
  OVERDUE: "destructive",
  PENDING: "warning",
  PARTIAL: "warning",
  LATE: "warning",
  HALF_DAY: "warning",
  ON_LEAVE: "secondary",
};

export function StatusBadge({ status }) {
  const variant = MAP[status] || "outline";
  return <Badge variant={variant}>{status?.replaceAll("_", " ")}</Badge>;
}
