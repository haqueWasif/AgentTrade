import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BrainCircuit, CheckCircle2, Lock, ShieldCheck } from "lucide-react";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import API, { getApiErrorMessage } from "../services/api";
import BrandLogo from "../components/BrandLogo";

export default function LoginPage() {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }

  async function login(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("token/", credentials);

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-0 top-0 h-[480px] w-[520px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[520px] rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr,0.95fr]">
        <div className="hidden border-r border-white/10 bg-white/[0.03] p-12 lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="inline-flex transition hover:opacity-90">
            <BrandLogo size="sm" showTagline />
          </Link>

          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
              Welcome back to the terminal
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-tight">
              Continue your market research workflow.
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
              Login to access your AI agent desk, journal, watchlists, risk
              workflows, and trading system review tools.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              ["AI Desk", BrainCircuit],
              ["Risk First", ShieldCheck],
              ["Secure", Lock],
            ].map(([label, Icon]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <Icon className="text-cyan-300" size={24} />
                <p className="mt-3 text-sm font-black text-white">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Link to="/" className="inline-flex transition hover:opacity-90">
                <BrandLogo size="sm" showTagline={false} />
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-8">
                <p className="text-sm font-black uppercase tracking-widest text-cyan-300">
                  Login
                </p>

                <h2 className="mt-3 text-3xl font-black">Access dashboard</h2>

                <p className="mt-2 text-sm text-slate-400">
                  Use your username and password to enter AgentTrade.
                </p>
              </div>

              {error && (
                <div className="mb-5 whitespace-pre-line rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={login} className="space-y-5">
                <Input
                  label="Username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                  {!loading && <ArrowRight size={18} />}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 text-cyan-300" size={18} />
                  <p className="text-sm leading-6 text-slate-400">
                    Login uses your Django username, not your email address.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-slate-400">
                No account yet?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Create one
                </Link>
              </p>

              <p className="mt-3 text-center text-sm">
                <Link to="/" className="text-slate-500 hover:text-slate-300">
                  Back to home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}