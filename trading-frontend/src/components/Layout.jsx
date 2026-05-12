import BrandLogo from "./BrandLogo";
import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  ChevronRight,
  Crown,
  Gauge,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Radio,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const menu = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      description: "Terminal summary",
    },
    {
      path: "/agents",
      label: "AI Agents",
      icon: Bot,
      description: "Research desk",
    },
    {
      path: "/journal",
      label: "Journal",
      icon: NotebookPen,
      description: "Review loop",
    },
    {
      path: "/watchlists",
      label: "Watchlists",
      icon: Radio,
      description: "Market universe",
    },
    {
      path: "/subscription",
      label: "Pro Plan",
      icon: Crown,
      description: "Upgrade engine",
    },
  ];

  const tickers = [
    ["EUR/USD", "FX", "Watch"],
    ["GBP/USD", "FX", "London"],
    ["XAU/USD", "Metal", "Volatile"],
    ["ES", "Futures", "Risk"],
    ["NQ", "Futures", "Momentum"],
    ["BTC/USD", "Crypto", "24/7"],
    ["CL", "Energy", "Catalyst"],
  ];

  const activeItem = menu.find((item) => item.path === pathname) || menu[0];

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    navigate("/login");
  }

  return (
    <div className="min-h-screen trading-grid bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 border-r border-white/10 bg-slate-950/95 p-5 backdrop-blur-xl xl:block">
         <Link
          to="/"
          className="group mb-6 block rounded-[1.9rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(8,15,33,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.30)] backdrop-blur-xl transition duration-300 hover:border-cyan-300/20"
        >
          <div className="rounded-[1.4rem] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-1">
          <BrandLogo size="md" showTagline />
           </div>
        </Link>

          <div className="mb-6 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-300">
                  Terminal Status
                </p>
                <p className="mt-2 text-lg font-black text-white">Operational</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <Zap size={21} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-slate-500">Mode</p>
                <p className="text-sm font-bold text-emerald-200">Research</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-slate-500">Risk</p>
                <p className="text-sm font-bold text-emerald-200">Manual</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                    active
                      ? "border-cyan-400/40 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                      : "border-transparent bg-white/[0.025] text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} />
                    <div>
                      <p className="text-sm font-black">{item.label}</p>
                      <p
                        className={`text-xs ${
                          active ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/10 p-4">
            <div className="mb-4 flex items-center gap-2 text-cyan-300">
              <Sparkles size={18} />
              <p className="text-xs font-black uppercase tracking-widest">
                Trading Framework
              </p>
            </div>

            <div className="space-y-3">
              {[
                ["Macro / Fundamentals", "Context"],
                ["Market Structure", "Trend"],
                ["Liquidity / SMC", "Zones"],
                ["ICT Execution", "Timing"],
                ["Risk Architecture", "Control"],
                ["Journal Review", "Feedback"],
              ].map(([name, status]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{name}</span>
                  <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-200">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-white/10 bg-slate-950/90 px-5 py-2 backdrop-blur-xl">
            <div className="flex gap-6 overflow-x-auto text-sm">
              {tickers.map(([symbol, group, tag]) => (
                <div key={symbol} className="flex shrink-0 items-center gap-2">
                  <span className="font-black text-slate-200">{symbol}</span>
                  <span className="text-xs text-slate-500">{group}</span>
                  <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs font-bold text-cyan-300">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 px-5 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <activeItem.icon size={22} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                    AgentTrade Terminal
                  </p>
                  <h1 className="mt-1 text-2xl font-black">{activeItem.label}</h1>
                </div>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2">
                  <p className="text-xs text-slate-500">Execution</p>
                  <p className="text-sm font-bold text-white">Confirmation Based</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2">
                  <p className="text-xs text-slate-500">Protection</p>
                  <p className="flex items-center gap-1 text-sm font-bold text-cyan-300">
                    <ShieldCheck size={14} />
                    Risk First
                  </p>
                </div>

                <button
                  onClick={logout}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto xl:hidden">
              {menu.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
                      pathname === item.path
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="flex-1 p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;