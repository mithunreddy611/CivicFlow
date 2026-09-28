import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Flame,
  ArrowUpRight,
} from "lucide-react";

export function StatusBadge({ status, className = "" }) {
  const normalized = (status || "").toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case "CLOSED":
        return {
          icon: <CheckCircle2 size={13} strokeWidth={2.4} />,
          label: "Resolved",
          className: "badge-closed",
        };
      case "AWAITING_VERIFICATION":
        return {
          icon: <AlertCircle size={13} strokeWidth={2.4} />,
          label: "Awaiting Verification",
          className: "badge-verification",
        };
      case "IN_PROGRESS":
        return {
          icon: <Clock size={13} strokeWidth={2.4} />,
          label: "In Progress",
          className: "badge-progress",
        };
      case "ASSIGNED":
        return {
          icon: <ClipboardList size={13} strokeWidth={2.4} />,
          label: "Assigned",
          className: "badge-assigned",
        };
      case "REOPENED":
        return {
          icon: <AlertTriangle size={13} strokeWidth={2.4} />,
          label: "Reopened",
          className: "badge-reopened",
        };
      case "REPORTED":
      default:
        return {
          icon: <ClipboardList size={13} strokeWidth={2.4} />,
          label: normalized ? normalized.replaceAll("_", " ") : "Reported",
          className: "badge-reported",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`ui-badge ${config.className} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority, className = "" }) {
  const normalized = (priority || "MEDIUM").toUpperCase();

  const getPriorityConfig = () => {
    switch (normalized) {
      case "CRITICAL":
        return {
          icon: <Flame size={12} strokeWidth={2.4} />,
          label: "Critical",
          className: "priority-critical",
        };
      case "HIGH":
        return {
          icon: <ArrowUpRight size={12} strokeWidth={2.4} />,
          label: "High",
          className: "priority-high",
        };
      case "MEDIUM":
        return {
          icon: null,
          label: "Medium",
          className: "priority-medium",
        };
      case "LOW":
      default:
        return {
          icon: null,
          label: "Low",
          className: "priority-low",
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <span className={`ui-priority-badge ${config.className} ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

export function CategoryPill({ category, className = "" }) {
  const formatted = (category || "").replaceAll("_", " ");
  return (
    <span className={`ui-category-pill ${className}`}>
      {formatted}
    </span>
  );
}
