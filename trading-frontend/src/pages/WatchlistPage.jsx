import React, { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  // Flame,
  NotebookPen,
  // PieChart,
  ShieldCheck,
  // Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import API, { getApiErrorMessage } from "../services/api";

function ScoreCard({ label, value, icon: Icon, tone = "cyan" }) {
  const tones = {
    cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    red: "text-red-300 bg-red-400/10 border-red-400/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    symbol: "",
    setup: "Liquidity sweep",
    bias: "Long",
    emotion: "Calm",
    outcome: "Pending",
    rule_followed: "Yes",
    content: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await API.get("journal/entries/");
      setEntries(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function addEntry(e) {
    e.preventDefault();
    setError("");

    const content = `
Symbol: ${form.symbol || "N/A"}
Setup: ${form.setup}
Bias: ${form.bias}
Emotion: ${form.emotion}
Outcome: ${form.outcome}
Rule Followed: ${form.rule_followed}

Review:
${form.content}
`.trim();

    try {
      await API.post("journal/entries/", { content });
      setForm({
        symbol: "",
        setup: "Liquidity sweep",
        bias: "Long",
        emotion: "Calm",
        outcome: "Pending",
        rule_followed: "Yes",
        content: "",
      });
      fetchEntries();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  const stats = useMemo(() => {
    const total = entries.length;
    const followed = entries.filter((entry) =>
      entry.content?.toLowerCase().includes("rule followed: yes")
    ).length;
    const wins = entries.filter((entry) =>
      entry.content?.toLowerCase().includes("outcome: win")
    ).length;
    const losses = entries.filter((entry) =>
      entry.content?.toLowerCase().includes("outcome: loss")
    ).length;

    return {
      total,
      followed,
      wins,
      losses,
      discipline: total ? Math.round((followed / total) * 100) : 0,
    };
  }, [entries]);

  const reviewPrompts = [
    "Did I wait for the planned confirmation?",
    "Was invalidation clear before entry?",
    "Did I chase price after displacement?",
    "Was this trade aligned with session context?",
    "What mistake should I eliminate next time?",
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-950 to-blue-700/10 p-8 shadow-2xl shadow-cyan-950/30">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr,0.8fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
              <NotebookPen size={16} />
              Trader review engine
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Turn every trade into system feedback.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Track thesis quality, setup type, rule adherence, emotion,
              invalidation, execution mistakes, and outcome. A profitable system
              requires a serious review loop.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreCard label="Journal Entries" value={stats.total} icon={NotebookPen} />
            <ScoreCard label="Discipline Score" value={`${stats.discipline}%`} icon={ShieldCheck} tone="emerald" />
            <ScoreCard label="Wins Logged" value={stats.wins} icon={TrendingUp} tone="emerald" />
            <ScoreCard label="Losses Logged" value={stats.losses} icon={TrendingDown} tone="red" />
          </div>
        </div>
      </section>

      {error && (
        <div className="whitespace-pre-line rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[460px,1fr,380px]">
        <Card title="New Trade Review" subtitle="Structured journal entry">
          <form onSubmit={addEntry} className="space-y-4">
            <Input
              label="Symbol"
              value={form.symbol}
              onChange={(e) => setForm((prev) => ({ ...prev, symbol: e.target.value }))}
              placeholder="EUR/USD, XAU/USD, BTC/USD..."
            />

            <div className="grid grid-cols-2 gap-3">
              {[
                ["setup", "Setup", ["Liquidity sweep", "Breakout", "FVG retest", "Order block", "Trend continuation", "No setup"]],
                ["bias", "Bias", ["Long", "Short", "Neutral", "No trade"]],
                ["emotion", "Emotion", ["Calm", "Confident", "Anxious", "FOMO", "Revenge", "Tired"]],
                ["outcome", "Outcome", ["Pending", "Win", "Loss", "Breakeven", "Missed"]],
                ["rule_followed", "Rule Followed", ["Yes", "No", "Partially"]],
              ].map(([name, label, options]) => (
                <label key={name} className={name === "rule_followed" ? "col-span-2" : ""}>
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    {label}
                  </span>
                  <select
                    value={form[name]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Trade review
              </span>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={8}
                placeholder="What was the thesis? Where was liquidity? What was invalidation? Did you follow the plan?"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
                required
              />
            </label>

            <Button type="submit" className="w-full">
              Save Review
            </Button>
          </form>
        </Card>

        <Card title="Journal Timeline" subtitle="Trade reviews and behavior records">
          {entries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <NotebookPen className="mx-auto text-cyan-300" size={44} />
              <p className="mt-4 text-xl font-black text-white">
                No journal entries yet
              </p>
              <p className="mt-2 text-slate-400">
                Start logging trades to build your review loop.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                        <BrainCircuit size={20} />
                      </div>
                      <div>
                        <p className="font-black text-white">Trade Review</p>
                        <p className="text-xs text-slate-500">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
                      Review
                    </span>
                  </div>

                  <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {entry.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Review Prompts" subtitle="Questions serious traders ask">
            <div className="space-y-3">
              {reviewPrompts.map((prompt) => (
                <div
                  key={prompt}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={18} />
                  <p className="text-sm leading-6 text-slate-300">{prompt}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="System Metrics" subtitle="What to track next">
            <div className="space-y-3">
              {[
                ["Setup quality", "A+ / B / C"],
                ["Rule adherence", "Yes / No"],
                ["Session quality", "Asia / London / NY"],
                ["Mistake type", "Chase / Early / Late"],
                ["Emotional state", "Calm / FOMO / Revenge"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}