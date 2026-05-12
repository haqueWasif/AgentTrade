import React from "react";

export default function BrandLogo({
  size = "md",
  showTagline = true,
  className = "",
}) {
  const sizes = {
    sm: {
      wrap: "gap-3",
      icon: "h-11 w-11",
      title: "text-xl",
      subtitle: "text-[11px]",
      stroke: 1.8,
    },
    md: {
      wrap: "gap-4",
      icon: "h-14 w-14",
      title: "text-[1.85rem]",
      subtitle: "text-xs",
      stroke: 2,
    },
    lg: {
      wrap: "gap-4",
      icon: "h-16 w-16",
      title: "text-[2.1rem]",
      subtitle: "text-sm",
      stroke: 2.2,
    },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center ${s.wrap} ${className}`}>
      <div className="relative shrink-0">
        <div className="absolute inset-0 rounded-[1.4rem] bg-cyan-400/25 blur-xl" />

        <div
          className={`relative ${s.icon} overflow-hidden rounded-[1.35rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_30%_20%,rgba(103,232,249,0.35),transparent_45%),linear-gradient(135deg,#0f172a_0%,#0b1227_38%,#0a1f2e_100%)] shadow-[0_12px_32px_rgba(6,182,212,0.18)]`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:10px_10px] opacity-35" />

          <svg
            viewBox="0 0 64 64"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            <rect
              x="6"
              y="6"
              width="52"
              height="52"
              rx="16"
              stroke="rgba(255,255,255,0.08)"
            />

            <line
              x1="18"
              y1="40"
              x2="18"
              y2="22"
              stroke="rgba(103,232,249,0.85)"
              strokeWidth={s.stroke}
              strokeLinecap="round"
            />
            <rect
              x="15"
              y="27"
              width="6"
              height="10"
              rx="2"
              fill="rgba(103,232,249,0.88)"
            />

            <line
              x1="29"
              y1="45"
              x2="29"
              y2="18"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth={s.stroke}
              strokeLinecap="round"
            />
            <rect
              x="26"
              y="23"
              width="6"
              height="14"
              rx="2"
              fill="rgba(255,255,255,0.95)"
            />

            <line
              x1="40"
              y1="38"
              x2="40"
              y2="15"
              stroke="rgba(34,211,238,0.95)"
              strokeWidth={s.stroke}
              strokeLinecap="round"
            />
            <rect
              x="37"
              y="20"
              width="6"
              height="10"
              rx="2"
              fill="rgba(34,211,238,0.95)"
            />

            <path
              d="M14 43C19 40 22 40 26 35C29 31 33 30 37 27C41 24 44 22 49 18"
              stroke="rgba(34,211,238,0.95)"
              strokeWidth={s.stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M45.5 18H49V21.5"
              stroke="rgba(34,211,238,0.95)"
              strokeWidth={s.stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1
            className={`${s.title} leading-none font-black tracking-tight text-white`}
          >
            AgentTrade
          </h1>

          <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.75)]" />
        </div>

        {showTagline && (
          <p
            className={`mt-2 ${s.subtitle} font-medium tracking-wide text-slate-400`}
          >
            Institutional AI Trading Terminal
          </p>
        )}
      </div>
    </div>
  );
}