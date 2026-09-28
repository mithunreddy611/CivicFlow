export default function Card({
  children,
  className = "",
  hoverable = false,
  padding = "md", // "sm" | "md" | "lg" | "none"
  ...props
}) {
  return (
    <div
      className={`ui-card ${hoverable ? "ui-card-hover" : ""} pad-${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, eyebrow, subtitle, action, className = "" }) {
  return (
    <div className={`ui-card-header ${className}`}>
      <div className="card-header-titles">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}
