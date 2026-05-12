import React from "react";

function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  const variants = {
    primary:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300 focus:ring-cyan-400 shadow-lg shadow-cyan-500/20",
    secondary:
      "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 focus:ring-slate-500",
    outline:
      "border border-cyan-400/50 text-cyan-200 hover:bg-cyan-400/10 focus:ring-cyan-400",
    danger:
      "bg-red-500 text-white hover:bg-red-400 focus:ring-red-500 shadow-lg shadow-red-500/20",
    ghost:
      "text-slate-300 hover:bg-white/10 hover:text-white focus:ring-slate-500",
  };

  return (
    <button
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;