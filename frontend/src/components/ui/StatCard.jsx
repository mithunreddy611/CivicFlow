import { isValidElement } from "react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  variant = "default", // "default" | "fin" | "warning" | "success" | "purple"
  subtext,
  className = "",
}) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (isValidElement(Icon)) return Icon;
    const Component = Icon;
    return <Component size={20} strokeWidth={2.2} />;
  };

  return (
    <div className={`stat-card stat-variant-${variant} ${className}`}>
      {Icon && (
        <div className="stat-icon">
          {renderIcon()}
        </div>
      )}

      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
    </div>
  );
}
