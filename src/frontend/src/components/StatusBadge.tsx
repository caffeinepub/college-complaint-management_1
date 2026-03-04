import type { Type, Type__3 } from "../backend.d";
import {
  PRIORITY_CLASS,
  PRIORITY_LABELS,
  STATUS_CLASS,
  STATUS_LABELS,
} from "../lib/formatters";

interface StatusBadgeProps {
  status: Type;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-ui ${STATUS_CLASS[status]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {STATUS_LABELS[status]}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Type__3;
  className?: string;
}

export function PriorityBadge({
  priority,
  className = "",
}: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-ui ${PRIORITY_CLASS[priority]} ${className}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
