import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BrainCircuit,
  CandlestickChart,
  Crosshair,
  Globe2,
  Layers3,
  Newspaper,
  Radar,
  ShieldCheck,
  Zap,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function TerminalChart() {
  return (
    <div className="relative h-[390px] overflow-hidden rounded-[1.75rem] border border-cyan-400/20 bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(34,211,238,.13)_1px,transparent_1px)] bg-[length:100%_22px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,.07)_1px,transparent_1px)] bg-[length:54px_100%]" />

      <svg viewBox="0 0 900 390" className="absolute inset-0 h-full w-full">
        <path
          d="M0 285 C90 250 135 310 210 190 S340 90 420 178 S550 312 650 138 S760 92 900 58"
          fill="none"
          stroke="rgb(34 211 238)"
          strokeWidth="5"
        />
        <path
          d="M0 285 C90 250 135 310 210 190 S340 90 420 178 S550 312 650 138 S760 92 900 58 L900 390 L0 390 Z"
          fill="rgba(34,211,238,.12)"
        />
        <line x1="0" y1="116" x2="900" y2="116" stroke="rgba(248,113,113,.45)" strokeDasharray="8 8" />
        <line x1="0" y1="274" x2="900" y2="274" stroke="rgba(52,211,153,.45)" strokeDasharray="8 8" />
      </svg>

      <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Smart Money Map
        </p>
        <p className="mt-1 text-lg font-black text-white">
          Liquidity · FVG · Order Flow
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
        <Icon size={22} />
      </div>
      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const workflow = [
    ["01", "Market Selection", "Choose asset class, session, volatility profile, and catalyst environment."],
    ["02", "Bias Formation", "Combine macro, fundamentals, sentiment, and higher-timeframe structure."],
    ["03", "Liquidity Map", "Mark equal highs/lows, inducement, FVGs, order blocks, and premium/discount."],
    ["04", "Execution Model", "Wait for confirmation: sweep, displacement, MSS, retest, or continuation."],
    ["05", "Risk Architecture", "Define invalidation first, max loss, stop logic, partials, and no-trade rules."],
    ["06", "Review Loop", "Journal thesis quality, emotions, setup category, rule adherence, and outcome."],
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-950 to-blue-700/10 p-8 shadow-2xl shadow-cyan-950/30">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 grid gap-8 2xl:grid-cols-[0.9fr,1.1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
              <Zap size={16} />
              Advanced Trading Operating System
            </div>

            <h1 className="max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Build, test, and refine a trader-grade decision system.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              AgentTrade combines multi-asset market coverage, fundamentals,
              technicals, smart money concepts, ICT-style liquidity mapping,
              execution planning, risk architecture, and journaling into one AI trading terminal.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/agents">
                <Button size="lg">Launch Agent Desk</Button>
              </Link>
              <Link to="/journal">
                <Button size="lg" variant="outline">
                  Open Review Journal
                </Button>
              </Link>
            </div>
          </div>

          <TerminalChart />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Market Coverage" value="FX · Futures · Crypto" icon={Globe2} />
        <MetricCard label="Risk Model" value="Invalidation First" icon={ShieldCheck} />
        <MetricCard label="Execution" value="Confirmation Based" icon={Crosshair} />
        <MetricCard label="Review Loop" value="Journal Driven" icon={Radar} />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.1fr,0.9fr]">
        <Card
          title="Professional Chart Workspace"
          subtitle="Liquidity pools, market structure, FVG, order-block logic, invalidation, and execution zones"
        >
          <TerminalChart />
        </Card>

        <Card
          title="Trader System Workflow"
          subtitle="Repeatable process for building a disciplined trading system"
        >
          <div className="grid gap-3">
            {workflow.map(([step, title, text]) => (
              <div
                key={step}
                className="flex gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 font-black text-slate-950">
                  {step}
                </div>
                <div>
                  <p className="font-black text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {[
          ["Fundamental Engine", "Macro, news catalysts, rates, risk-on/risk-off conditions, and data gaps.", Newspaper],
          ["Technical Engine", "Trend, structure, momentum, support, resistance, volatility, and confirmation.", CandlestickChart],
          ["Smart Money Concepts", "Liquidity pools, displacement, order blocks, FVGs, inducement, and premium/discount.", Layers3],
          ["ICT Execution Model", "Kill zones, session timing, liquidity raids, MSS, displacement, and retracement.", Crosshair],
          ["Risk Architecture", "Max loss rules, invalidation-first setups, stop logic, and no-trade conditions.", ShieldCheck],
          ["Review Loop", "Journal thesis quality, rule adherence, emotional state, and setup statistics.", BrainCircuit],
        ].map(([title, text, Icon]) => (
          <div
            key={title}
            className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Icon size={24} />
            </div>
            <h3 className="text-xl font-black text-white">{title}</h3>
            <p className="mt-3 leading-7 text-slate-400">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}