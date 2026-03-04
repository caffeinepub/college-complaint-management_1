import { Type, Type__1, Type__2, Type__3 } from "../backend.d";

/** Convert nanosecond bigint timestamp to JS Date */
export function nsToDate(ns: bigint): Date {
  return new Date(Number(ns) / 1_000_000);
}

/** Format a nanosecond bigint timestamp to a readable date string */
export function formatDate(ns: bigint): string {
  return nsToDate(ns).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format a nanosecond bigint timestamp to date + time */
export function formatDateTime(ns: bigint): string {
  return nsToDate(ns).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_LABELS: Record<Type, string> = {
  [Type.open]: "Open",
  [Type.inProgress]: "In Progress",
  [Type.resolved]: "Resolved",
  [Type.closed]: "Closed",
};

export const STATUS_CLASS: Record<Type, string> = {
  [Type.open]: "status-open",
  [Type.inProgress]: "status-inprogress",
  [Type.resolved]: "status-resolved",
  [Type.closed]: "status-closed",
};

export const CATEGORY_LABELS: Record<Type__1, string> = {
  [Type__1.academic]: "Academic",
  [Type__1.infrastructure]: "Infrastructure",
  [Type__1.facultyConduct]: "Faculty/Staff Conduct",
  [Type__1.administrative]: "Administrative",
  [Type__1.hostelCanteen]: "Hostel / Canteen",
  [Type__1.itTechnical]: "IT / Technical",
  [Type__1.other]: "Other",
};

export const PRIORITY_LABELS: Record<Type__2, string> = {
  [Type__2.low]: "Low",
  [Type__2.medium]: "Medium",
  [Type__2.high]: "High",
  [Type__2.urgent]: "Urgent",
};

export const PRIORITY_CLASS: Record<Type__2, string> = {
  [Type__2.low]: "priority-low",
  [Type__2.medium]: "priority-medium",
  [Type__2.high]: "priority-high",
  [Type__2.urgent]: "priority-urgent",
};

export const ROLE_LABELS: Record<Type__3, string> = {
  [Type__3.student]: "Student",
  [Type__3.staff]: "Staff",
  [Type__3.admin]: "Admin",
};
