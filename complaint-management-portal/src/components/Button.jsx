import { Loader2 } from "lucide-react";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`button button-${variant} button-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="button-spinner" size={17} />}
      {children}
    </button>
  );
}