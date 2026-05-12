import React from "react";

function Card({ title, subtitle, children, className = "" }) {
  return (
    <div className={`terminal-card rounded-[1.75rem] p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-xl font-black text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}

      {children}
    </div>
  );
}

export default Card;