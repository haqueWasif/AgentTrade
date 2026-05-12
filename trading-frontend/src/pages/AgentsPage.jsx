import React, { useMemo, useState } from "react";
import {
  BrainCircuit,
  CandlestickChart,
  Crosshair,
  Layers3,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare,
  Zap,
} from "lucide-react";

import API, { getApiErrorMessage } from "../services/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MarkdownRenderer from "../components/ui/MarkdownRenderer";

const QUICK_SYMBOLS = [
  "BTC/USD",
  "ETH/USD",
  "EUR/USD",
  "GBP/USD",
  "XAU/USD",
  "ES",
  "NQ",
  "CL",
  "AAPL",
  "NVDA",
];

const FRAMEWORKS = [
  ["fundamentals", "Fundamentals", "Macro, news, earnings, rates, catalysts", Newspaper],
  ["technical-analysis", "Technicals", "Trend, structure, momentum, levels", CandlestickChart],
  ["smart-money-concepts", "Smart Money", "Liquidity, FVG, OB, displacement", Layers3],
  ["ict-liquidity", "ICT Liquidity", "Kill zones, sweep, MSS, premium/discount", Crosshair],
  ["risk-model", "Risk Model", "Invalidation, max loss, no-trade rules", ShieldCheck],
  ["trade-journal-review", "Review Loop", "Rules, journal prompts, system feedback", BrainCircuit],
];

function TerminalChart({ recommendation }) {
  const color =
    recommendation === "buy"
      ? "rgb(52 211 153)"
      : recommendation === "sell"
        ? "rgb(248 113 113)"
        : "rgb(34 211 238)";

  return (
    <div className="relative h-80 overflow-hidden rounded-[1.5rem] border border-cyan-400/20 bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(34,211,238,.13)_1px,transparent_1px)] bg-[length:100%_22px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,.07)_1px,transparent_1px)] bg-[length:54px_100%]" />

      <svg viewBox="0 0 900 330" className="absolute inset-0 h-full w-full">
        <path
          d="M0 235 C90 205 125 252 200 165 S325 80 395 155 S530 272 625 128 S750 92 900 58"
          fill="none"
          stroke={color}
          strokeWidth="5"
        />
        <path
          d="M0 235 C90 205 125 252 200 165 S325 80 395 155 S530 272 625 128 S750 92 900 58 L900 330 L0 330 Z"
          fill="rgba(34,211,238,.12)"
        />
        <line x1="0" y1="108" x2="900" y2="108" stroke="rgba(248,113,113,.45)" strokeDasharray="8 8" />
        <line x1="0" y1="245" x2="900" y2="245" stroke="rgba(52,211,153,.45)" strokeDasharray="8 8" />
        <rect x="552" y="110" width="150" height="64" rx="14" fill="rgba(34,211,238,.12)" stroke="rgba(34,211,238,.45)" />
      </svg>

      <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Live Structure Model
        </p>
        <p className="mt-1 font-black text-white">Liquidity · FVG · Invalidation</p>
      </div>
    </div>
  );
}

function SelectPill({ value, label, current, setValue }) {
  const active = value === current;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={`rounded-full border px-4 py-2 text-sm font-black transition ${
        active
          ? "border-cyan-400 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export default function AgentsPage() {
  const [form, setForm] = useState({
    symbol: "BTC/USD",
    asset_class: "crypto",
    session: "New York",
    timeframe: "swing",
    trade_style: "liquidity-to-trend",
    risk_profile: "balanced",
    account_size: "10000",
    system_objective:
      "Build a repeatable plan with bias, liquidity map, entry trigger, invalidation, risk model, and journal review.",
    research_goal:
      "Analyze the current setup using fundamentals, technicals, smart money concepts, ICT liquidity, and risk management.",
    notes: "",
    use_web_search: true,
    strategy_frameworks: [
      "fundamentals",
      "technical-analysis",
      "smart-money-concepts",
      "ict-liquidity",
      "risk-model",
      "trade-journal-review",
    ],
  });

  const [analysis, setAnalysis] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  const report = analysis?.ai_report;
  const provider = analysis?.provider_status?.synthesis_provider || "standby";
  const recommendation = report?.recommendation?.toLowerCase();

  const signalColor = useMemo(() => {
    if (recommendation === "buy") return "text-emerald-300";
    if (recommendation === "sell") return "text-red-300";
    if (recommendation === "wait") return "text-yellow-300";
    return "text-cyan-300";
  }, [recommendation]);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleFramework(value) {
    setForm((prev) => {
      const current = prev.strategy_frameworks || [];
      return {
        ...prev,
        strategy_frameworks: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  }

  async function runAnalysis() {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const payload = {
        ...form,
        capital: form.account_size,
        news: form.notes,
        journal_entry: form.notes,
      };

      const res = await API.post("agents/run/", payload);
      setAnalysis(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function askAgent(e) {
    e.preventDefault();

    if (!chatMessage.trim()) return;

    setChatLoading(true);
    setError("");

    try {
      const res = await API.post("agents/chat/", {
        message: chatMessage,
        symbol: form.symbol,
        use_web_search: true,
      });

      setChatAnswer(res.data.answer);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-950 to-blue-700/10 p-8 shadow-2xl shadow-cyan-950/30">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 grid gap-8 2xl:grid-cols-[0.9fr,1.1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
              <TerminalSquare size={16} />
              Institutional agent command desk
            </div>

            <h1 className="max-w-5xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Build a trading plan from market context, liquidity, and risk.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Select the instrument, session, execution model, and analysis
              frameworks. AgentTrade turns it into a structured trading brief
              with thesis, risks, invalidation, and review rules.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {QUICK_SYMBOLS.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => update("symbol", symbol)}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                    form.symbol === symbol
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/30">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Terminal Signal</p>
                <p className={`mt-1 text-5xl font-black uppercase ${signalColor}`}>
                  {report?.recommendation || "READY"}
                </p>
              </div>

              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                {report ? `${report.confidence}% confidence` : "Awaiting run"}
              </div>
            </div>

            <TerminalChart recommendation={recommendation} />

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                ["Provider", provider],
                ["Session", form.session],
                ["Risk", form.risk_profile],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-black capitalize text-cyan-300">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="whitespace-pre-line rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-6 2xl:grid-cols-[430px,1fr,430px]">
        <Card title="Desk Configuration" subtitle="Strategy settings without form clutter">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">
                Asset class
              </p>
              <div className="flex flex-wrap gap-2">
                {["crypto", "forex", "futures", "commodity", "stock", "index"].map((item) => (
                  <SelectPill
                    key={item}
                    value={item}
                    label={item}
                    current={form.asset_class}
                    setValue={(value) => update("asset_class", value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">
                Session
              </p>
              <div className="flex flex-wrap gap-2">
                {["Asia", "London", "New York", "Full day"].map((item) => (
                  <SelectPill
                    key={item}
                    value={item}
                    label={item}
                    current={form.session}
                    setValue={(value) => update("session", value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">
                Timeframe
              </p>
              <div className="flex flex-wrap gap-2">
                {["scalp", "intraday", "swing", "position"].map((item) => (
                  <SelectPill
                    key={item}
                    value={item}
                    label={item}
                    current={form.timeframe}
                    setValue={(value) => update("timeframe", value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">
                Execution model
              </p>
              <div className="grid gap-2">
                {[
                  ["liquidity-to-trend", "Liquidity to trend"],
                  ["sweep-and-reversal", "Sweep and reversal"],
                  ["breakout-continuation", "Breakout continuation"],
                  ["mean-reversion", "Mean reversion"],
                  ["macro-directional", "Macro directional"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("trade_style", value)}
                    className={`rounded-2xl border p-3 text-left text-sm font-bold transition ${
                      form.trade_style === value
                        ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={runAnalysis} className="w-full" disabled={loading}>
              {loading ? "Running Agent Desk..." : "Generate Trading Plan"}
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Framework Stack" subtitle="Select the engines this analysis should use">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {FRAMEWORKS.map(([value, label, description, Icon]) => {
                const active = form.strategy_frameworks.includes(value);

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleFramework(value)}
                    className={`rounded-[1.5rem] border p-5 text-left transition ${
                      active
                        ? "border-cyan-400/40 bg-cyan-400/10"
                        : "border-white/10 bg-white/[0.03] hover:border-cyan-400/25 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                        <Icon size={22} />
                      </div>
                      {active && (
                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          active
                        </span>
                      )}
                    </div>

                    <p className="font-black text-white">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Decision Report" subtitle="Structured output from the agent desk">
            {!report ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                <Sparkles className="mx-auto text-cyan-300" size={44} />
                <p className="mt-5 text-xl font-black text-white">
                  No trading plan generated yet
                </p>
                <p className="mx-auto mt-2 max-w-md text-slate-400">
                  Configure the desk and run the agent pipeline to generate a
                  professional report.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-cyan-400 p-5 text-slate-950">
                    <p className="text-xs font-black uppercase tracking-widest">
                      Recommendation
                    </p>
                    <p className="mt-2 text-3xl font-black uppercase">
                      {report.recommendation}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Confidence
                    </p>
                    <p className="mt-2 text-3xl font-black text-white">
                      {report.confidence}%
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Regime
                    </p>
                    <p className="mt-2 text-lg font-black text-cyan-300">
                      {report.market_regime || "Unclear"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Provider
                    </p>
                    <p className="mt-2 text-lg font-black text-cyan-300">
                      {provider}
                    </p>
                  </div>
                </div>

                <ReportSection title="Trading Thesis" data={report.thesis} icon={Target} />
                <ReportSection title="Fundamentals / Macro" data={report.fundamental_analysis} icon={Newspaper} />
                <ReportSection title="Technicals" data={report.technical_analysis} icon={CandlestickChart} />
                <ReportSection title="Smart Money / ICT" data={report.smart_money_analysis} icon={Layers3} />
                <ReportSection title="Execution Plan" data={report.execution_plan} icon={Crosshair} />
                <ReportSection title="Risk Model" data={report.risk_model} icon={ShieldCheck} />
                <ReportSection title="System Builder" data={report.system_builder} icon={BrainCircuit} />
              </div>
            )}
          </Card>
        </div>

        <Card title="Copilot" subtitle="Formatted answers, not raw markdown">
          <form onSubmit={askAgent} className="space-y-4">
            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask: Map liquidity, build an ICT checklist, define invalidation..."
              rows={5}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            />

            <Button type="submit" className="w-full" disabled={chatLoading}>
              {chatLoading ? "Thinking..." : "Ask Copilot"}
            </Button>
          </form>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Advanced prompts
            </p>

            <div className="mt-3 space-y-2">
              {[
                "Map the liquidity and invalidation zones.",
                "Build an ICT-style execution checklist.",
                "What would make this a no-trade setup?",
                "How should I journal this setup after execution?",
                "Create a rule-based strategy from this analysis.",
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => setChatMessage(question)}
                  className="block w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {chatAnswer && (
            <div className="mt-5 max-h-[620px] overflow-auto rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <MarkdownRenderer content={chatAnswer} />
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function ReportSection({ title, data, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-3">
        <Icon size={20} className="text-cyan-300" />
        <h3 className="font-black text-white">{title}</h3>
      </div>

      {typeof data === "string" ? (
        <p className="leading-7 text-slate-300">{data}</p>
      ) : data ? (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                {key.replaceAll("_", " ")}
              </p>

              {Array.isArray(value) ? (
                <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
                  {value.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              ) : typeof value === "object" && value !== null ? (
                <pre className="mt-2 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-300">{value}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No data returned.</p>
      )}
    </div>
  );
}