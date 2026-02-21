import { cn } from "@/lib/utils";

type StatusType = "available" | "on_trip" | "in_shop" | "retired" | "draft" | "dispatched" | "completed" | "cancelled" | "on_duty" | "off_duty" | "suspended" | "active" | "pending";

const STATUS_STYLES: Record<StatusType, string> = {
  available: "bg-success/15 text-success",
  on_trip: "bg-info/15 text-info",
  in_shop: "bg-warning/15 text-warning",
  retired: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  dispatched: "bg-info/15 text-info",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
  on_duty: "bg-success/15 text-success",
  off_duty: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/15 text-destructive",
  active: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
};

const STATUS_LABELS: Record<StatusType, string> = {
  available: "Available",
  on_trip: "On Trip",
  in_shop: "In Shop",
  retired: "Retired",
  draft: "Draft",
  dispatched: "Dispatched",
  completed: "Completed",
  cancelled: "Cancelled",
  on_duty: "On Duty",
  off_duty: "Off Duty",
  suspended: "Suspended",
  active: "Active",
  pending: "Pending",
};

interface StatusPillProps {
  status: StatusType;
  className?: string;
}

export default function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status] || "bg-muted text-muted-foreground", className)}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export type { StatusType };
