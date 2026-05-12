import React from "react";

function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-medium text-slate-300">
          {label}
        </span>
      )}

      <input
        className={`w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 ${className}`}
        {...props}
      />

      {error && (
        <span className="mt-2 block text-sm text-red-300">
          {error}
        </span>
      )}
    </label>
  );
}

export default Input;