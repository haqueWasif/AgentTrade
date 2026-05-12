import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CandlestickChart,
  CheckCircle2,
  Globe2,
  LineChart,
  Lock,
  NotebookPen,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";

import Button from "../components/ui/Button";
import BrandLogo from "../components/BrandLogo";

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.06]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
        <Icon size={24} />
      </div>

      <h3 className="text-xl font-black text-white">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

export default function HomePage() {
  const features = [
    {
      icon: Bot,
      title: "Agentic Research Desk",
      text: "Run technical, sentiment, fundamental, strategy, risk, web-search, and AI synthesis from one trading terminal.",
    },
    {
      icon: Globe2,
      title: "Fresh Market Context",
      text: "Use current web-search powered context for market catalysts, macro events, sentiment, and risk factors.",
    },
    {
      icon: ShieldCheck,
      title: "Risk-First Analysis",
      text: "Every brief includes invalidation, risk points, max-loss thinking, and a practical action plan.",
    },
    {
      icon: NotebookPen,
      title: "Trading Journal",
      text: "Track trade reasoning, emotions, notes, lessons, and review patterns across your trading process.",
    },
    {
      icon: Radar,
      title: "Watchlists",
      text: "Organize assets by theme, strategy, volatility, sector, catalyst, or trading style.",
    },
    {
      icon: BrainCircuit,
      title: "AI Copilot",
      text: "Ask follow-up questions about entries, thesis quality, invalidation, catalysts, and risk.",
    },
  ];

  const pipeline = [
    [
      "01",
      "Market Intake",
      "Symbol, market type, style, timeframe, risk profile, and objective.",
    ],
    [
      "02",
      "Web Research",
      "Fresh market context, catalysts, sentiment, macro drivers, and risk events.",
    ],
    [
      "03",
      "Agent Stack",
      "Technical, sentiment, strategy, fundamental, smart money, and risk modules.",
    ],
    [
      "04",
      "Trading Brief",
      "Recommendation, thesis, risks, invalidation, execution plan, and review rules.",
    ],
  ];

  const agentCards = [
    ["Technical Agent", "Trend, momentum, structure", TrendingUp],
    ["Risk Agent", "Position logic and invalidation", ShieldCheck],
    ["Sentiment Agent", "Narrative and market tone", Sparkles],
    ["Strategy Agent", "Setup classification", Target],
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[520px] rounded-full bg-blue-700/20 blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="transition hover:opacity-90">
            <BrandLogo size="sm" showTagline />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-300 lg:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#terminal" className="hover:text-white">
              Terminal
            </a>
            <a href="#workflow" className="hover:text-white">
              Workflow
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>

            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr,0.95fr] lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
              <Zap size={16} />
              AI-powered trading research terminal
            </div>

            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
              Trade with a full AI research desk, not a blank chart.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              AgentTrade brings agentic market research, live context, trading
              journals, watchlists, risk planning, and professional reports into
              one modern dark trading workspace.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  Start Free
                  <ArrowRight size={18} />
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Open Terminal
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Stat label="Agent modules" value="7+" />
              <Stat label="Workflow mode" value="Manual" />
              <Stat label="Risk template" value="2%" />
            </div>
          </div>

          <div
            id="terminal"
            className="rounded-[2rem] border border-cyan-400/20 bg-white/[0.04] p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur"
          >
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  AgentTrade Terminal
                </p>
              </div>

              <div className="p-5">
                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["BTC/USD", "Watching"],
                    ["Risk", "Balanced"],
                    ["Search", "Live"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-1 font-black text-cyan-300">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="relative h-64 overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950">
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(34,211,238,.15)_1px,transparent_1px)] bg-[length:100%_20px]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,.07)_1px,transparent_1px)] bg-[length:44px_100%]" />

                  <svg
                    viewBox="0 0 700 280"
                    className="absolute inset-0 h-full w-full"
                  >
                    <path
                      d="M0 210 C 80 180, 110 198, 170 130 S 260 78, 330 142 S 430 230, 505 110 S 610 74, 700 42"
                      fill="none"
                      stroke="rgb(34 211 238)"
                      strokeWidth="5"
                    />
                    <path
                      d="M0 210 C 80 180, 110 198, 170 130 S 260 78, 330 142 S 430 230, 505 110 S 610 74, 700 42 L700 280 L0 280 Z"
                      fill="rgba(34,211,238,.13)"
                    />
                  </svg>

                  <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-bold text-cyan-200 backdrop-blur">
                    AI signal map
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {agentCards.map(([title, text, Icon]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                          <Icon size={18} />
                        </div>
                        <p className="font-black text-white">{title}</p>
                      </div>

                      <p className="text-sm text-slate-400">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 p-5 text-slate-950">
                  <p className="text-xs font-black uppercase tracking-widest">
                    Generated brief
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    Thesis, risk, invalidation, and next action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
              Platform features
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Everything a modern AI trading workflow needs.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
                Workflow
              </p>

              <h2 className="mt-3 text-4xl font-black md:text-5xl">
                From market idea to research brief in minutes.
              </h2>

              <p className="mt-5 leading-8 text-slate-300">
                AgentTrade hides complex indicators by default. You provide the
                trading objective and risk profile; the agent desk handles the
                research pipeline.
              </p>
            </div>

            <div className="space-y-4">
              {pipeline.map(([step, title, text]) => (
                <div
                  key={step}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                >
                  <div className="flex gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 font-black text-slate-950">
                      {step}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{title}</h3>
                      <p className="mt-2 text-slate-400">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
              <LineChart className="text-cyan-300" size={34} />
              <h3 className="mt-5 text-2xl font-black">Market analysis</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Build briefs around symbols, timeframes, catalysts, liquidity,
                and risk.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
              <WalletCards className="text-cyan-300" size={34} />
              <h3 className="mt-5 text-2xl font-black">Risk templates</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Use conservative, balanced, or aggressive risk profiles.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
              <CandlestickChart className="text-cyan-300" size={34} />
              <h3 className="mt-5 text-2xl font-black">Trading terminal</h3>
              <p className="mt-3 leading-7 text-slate-400">
                A dark, data-dense interface built for active research.
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-blue-600/15 p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
                  Start now
                </p>

                <h2 className="mt-3 text-4xl font-black md:text-5xl">
                  Build a more disciplined trading process.
                </h2>

                <p className="mt-5 max-w-2xl leading-8 text-slate-300">
                  Create an account, run your first AI trading brief, save
                  notes, build watchlists, and start improving your research
                  workflow.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/register">
                    <Button size="lg" className="gap-2">
                      Create Account
                      <ArrowRight size={18} />
                    </Button>
                  </Link>

                  <Link to="/login">
                    <Button size="lg" variant="outline">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
                <h3 className="text-2xl font-black">Included</h3>

                <div className="mt-5 space-y-4">
                  {[
                    "AI agent desk",
                    "Fresh web-search context",
                    "Watchlists",
                    "Trading journal",
                    "Risk-first reports",
                    "Professional dark terminal UI",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="text-cyan-300" size={20} />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 px-6 py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <Link to="/" className="transition hover:opacity-90">
              <BrandLogo size="sm" showTagline />
            </Link>

            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <a href="#features" className="hover:text-white">
                Features
              </a>
              <a href="#workflow" className="hover:text-white">
                Workflow
              </a>
              <Link to="/login" className="hover:text-white">
                Login
              </Link>
              <Link to="/register" className="hover:text-white">
                Register
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Lock size={16} />
              Research tool only. Not financial advice.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}