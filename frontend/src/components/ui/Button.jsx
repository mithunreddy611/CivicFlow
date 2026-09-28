import { forwardRef, isValidElement } from "react";
import { Loader2 } from "lucide-react";

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary", // "fin" | "primary" | "secondary" | "danger" | "ghost"
    size = "md", // "sm" | "md" | "lg"
    className = "",
    icon: Icon,
    iconPosition = "left",
    loading = false,
    disabled = false,
    type = "button",
    ...props
  },
  ref
) {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const isDisabled = disabled || loading;

  const renderIcon = () => {
    if (!Icon) return null;
    if (isValidElement(Icon)) return Icon;
    const Component = Icon;
    return <Component size={size === "sm" ? 15 : 18} />;
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`ui-btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="btn-spinner" size={size === "sm" ? 14 : 18} />
      ) : Icon && iconPosition === "left" ? (
        <span className="btn-icon">{renderIcon()}</span>
      ) : null}

      <span className="btn-text">{children}</span>

      {!loading && Icon && iconPosition === "right" ? (
        <span className="btn-icon">{renderIcon()}</span>
      ) : null}
    </button>
  );
});

export default Button;
