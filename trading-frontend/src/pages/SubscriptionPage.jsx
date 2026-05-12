import React, { useState } from "react";
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  Crown,
  Globe2,
  Lock,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import API, { getApiErrorMessage } from "../services/api";

export default function SubscriptionPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.post("subscriptions/create-checkout/");

      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }

      setMessage(res.data.detail || "Subscription checkout is not configured yet.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const plans = [
    {
      name: "Research",
      price: "$0",
      label: "Current workspace",
      description: "For building the basic workflow and testing the platform.",
      features: [
        "Manual agent desk",
        "Trading journal",
        "Watchlists",
        "Basic risk templates",
        "Local analysis workflow",
      ],
      button: "Current Plan",
      disabled: true,
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$19/mo",
      label: "Advanced trading OS",
      description: "For serious traders who want deeper research and review workflows.",
      features: [
        "OpenRouter AI synthesis",
        "Fresh web-search context",
        "SMC / ICT analysis modules",
        "Advanced execution checklist",
        "System builder reports",
        "Risk architecture templates",
        "Trader review loop",
      ],
      button: "Upgrade to Professional",
      disabled: false,
      highlighted: true,
    },
  ];

  const proModules = [
    {
      icon: Bot,
      title: "Multi-Agent Desk",
      text: "Combine fundamentals, technicals, SMC, ICT, risk, and review logic.",
    },
    {
      icon: Globe2,
      title: "Fresh Research",
      text: "Use web-search context for catalysts, macro drivers, and market regime.",
    },
    {
      icon: ShieldCheck,
      title: "Risk Architecture",
      text: "Structure plans around invalidation, max loss, and no-trade conditions.",
    },
    {
      icon: BrainCircuit,
      title: "System Builder",
      text: "Turn analysis into rules, checklists, journal prompts, and review metrics.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-950 to-blue-700/10 p-8 shadow-2xl shadow-cyan-950/30">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr,0.75fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
              <Crown size={16} />
              Professional trading intelligence
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Upgrade from simple research to a complete trading operating system.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              AgentTrade Professional is designed for deeper research, better
              risk planning, structured execution, multi-framework analysis, and
              disciplined trader review.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/10 p-6">
            <Sparkles className="text-cyan-300" size={34} />
            <h3 className="mt-5 text-2xl font-black text-white">
              Built for serious traders
            </h3>
            <p className="mt-3 leading-7 text-slate-300">
              The goal is not random signals. The goal is a repeatable process:
              thesis, confirmation, invalidation, risk, execution, and review.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="whitespace-pre-line rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-cyan-100">
          {message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[2rem] border p-7 shadow-2xl shadow-black/20 ${
              plan.highlighted
                ? "border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 to-blue-600/10"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
                  {plan.label}
                </p>
                <h3 className="mt-3 text-3xl font-black text-white">{plan.name}</h3>
                <p className="mt-2 leading-7 text-slate-400">{plan.description}</p>
              </div>

              {plan.highlighted && (
                <div className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">
                  Best
                </div>
              )}
            </div>

            <p className="text-5xl font-black text-white">{plan.price}</p>

            <div className="mt-8 space-y-4">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="text-cyan-300" size={20} />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className="mt-8 w-full"
              variant={plan.highlighted ? "primary" : "secondary"}
              onClick={plan.highlighted ? subscribe : undefined}
              disabled={loading || plan.disabled}
            >
              {loading && plan.highlighted ? "Opening checkout..." : plan.button}
            </Button>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
            Professional Modules
          </p>
          <h2 className="mt-3 text-4xl font-black text-white">
            What the Pro workflow unlocks.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {proModules.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.title}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  <Icon size={24} />
                </div>

                <h3 className="mt-5 text-xl font-black text-white">
                  {module.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-400">{module.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Card title="Security Note" subtitle="API keys and paid providers">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <Lock size={24} />
          </div>
          <div>
            <p className="font-black text-white">Keep provider keys server-side.</p>
            <p className="mt-2 leading-7 text-slate-400">
              OpenRouter, web-search, and Stripe keys should stay in your Django
              backend environment file. Never expose paid or private keys inside
              React browser code.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}