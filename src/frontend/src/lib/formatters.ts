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

// Type__2 = Category enum
export const CATEGORY_LABELS: Record<Type__2, string> = {
  [Type__2.academic]: "Academic",
  [Type__2.infrastructure]: "Infrastructure",
  [Type__2.facultyConduct]: "Faculty/Staff Conduct",
  [Type__2.administrative]: "Administrative",
  [Type__2.hostelCanteen]: "Hostel / Canteen",
  [Type__2.itTechnical]: "IT / Technical",
  [Type__2.other]: "Other",
};

// Type__3 = Priority enum
export const PRIORITY_LABELS: Record<Type__3, string> = {
  [Type__3.low]: "Low",
  [Type__3.medium]: "Medium",
  [Type__3.high]: "High",
  [Type__3.urgent]: "Urgent",
};

export const PRIORITY_CLASS: Record<Type__3, string> = {
  [Type__3.low]: "priority-low",
  [Type__3.medium]: "priority-medium",
  [Type__3.high]: "priority-high",
  [Type__3.urgent]: "priority-urgent",
};

// Type__1 = UserType enum (student/staff/admin)
export const ROLE_LABELS: Record<Type__1, string> = {
  [Type__1.student]: "Student",
  [Type__1.staff]: "Staff",
  [Type__1.admin]: "Admin",
};
