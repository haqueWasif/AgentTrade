import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  NotebookPen,
  Radar,
  ShieldCheck,
} from "lucide-react";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import API, { getApiErrorMessage } from "../services/api";
import BrandLogo from "../components/BrandLogo";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function register(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("register/", form);

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/3 top-0 h-[520px] w-[620px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[520px] rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[0.95fr,1.05fr]">
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-8">
                <Link
                  to="/"
                  className="mb-8 inline-flex transition hover:opacity-90"
                >
                  <BrandLogo size="sm" showTagline={false} />
                </Link>

                <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
                  Create account
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Start trading smarter
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Create your account to access agents, journal, and watchlists.
                </p>
              </div>

              {error && (
                <div className="mb-5 whitespace-pre-line rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              <form onSubmit={register} className="space-y-5">
                <Input
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required
                />

                <Input
                  label="Confirm password"
                  name="password_confirm"
                  type="password"
                  value={form.password_confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                />

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                  {!loading && <ArrowRight size={18} />}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="hidden border-l border-white/10 bg-white/[0.03] p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex justify-end">
            <Link to="/" className="inline-flex transition hover:opacity-90">
              <BrandLogo size="sm" showTagline />
            </Link>
          </div>

          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
              Free account setup
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-tight">
              Build your own AI-powered trading workflow.
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
              Register once, then use your dashboard to run analysis, save
              journal notes, create watchlists, and evaluate market decisions.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm text-slate-400">Included after signup</p>

            <div className="mt-5 grid gap-4">
              {[
                ["AI agent dashboard", Bot],
                ["Trading journal", NotebookPen],
                ["Watchlist management", Radar],
                ["Risk calculation workflow", ShieldCheck],
              ].map(([item, Icon]) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Icon size={18} />
                  </div>
                  <p className="text-slate-200">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={18} />
                <p className="text-sm leading-6 text-slate-300">
                  AgentTrade is a research and workflow tool. It does not
                  guarantee profits or replace risk management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}