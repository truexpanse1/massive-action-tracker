import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message);
        setIsLoggingIn(false);
        return;
      }

      // Let App.tsx pick up the new session and route user into the app
      window.location.reload();
    } catch (err: any) {
      setLoginError(err?.message || 'Unexpected error logging in.');
      setIsLoggingIn(false);
    }
  };

  const openLogin = () => {
    setShowLogin(true);
    setLoginError(null);
  };

  return (
    <div className="min-h-screen bg-[#050316] text-white">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 bg-[#050316]/80 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center text-xs font-black tracking-tight">
              MAT
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-[0.18em] uppercase text-fuchsia-400">
                TRUEXPANSE
              </div>
              <div className="text-lg font-bold">Massive Action Tracker</div>
            </div>
          </div>

          {/* Nav + Login */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#tools" className="hover:text-white transition">
              Tools
            </a>
            <a href="#proof" className="hover:text-white transition">
              Proof
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openLogin}
              className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-medium border border-white/20 hover:border-white/60 hover:bg-white/5 transition"
            >
              Login
            </button>
            <a
              href="#pricing"
              className="px-4 sm:px-6 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/40 hover:shadow-fuchsia-500/70 transition"
            >
              Start 7-Day Free Trial
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        {/* HERO */}
        <section className="pt-16 pb-20 lg:pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 text-xs font-semibold tracking-[0.2em] uppercase text-fuchsia-200 mb-6">
            <span className="text-lg">⚡</span>
            <span>New AI-powered sales OS for closers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black leading-tight tracking-tight mb-5">
            Slash sales anxiety<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-indigo-500">
              with a thriving pipeline
            </span>{' '}
            in 30 days.
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mb-8">
            Massive Action Tracker (MAT) is your daily command center: track every call,
            text, email, demo, dollar, and win — while AI helps you prospect, follow-up,
            and stay on attack all day long.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <a
              href="#pricing"
              className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/40 hover:shadow-fuchsia-500/70 transition"
            >
              Start Free • 7-Day Trial
            </a>
            <button
              type="button"
              onClick={openLogin}
              className="text-sm text-white/70 hover:text-white underline-offset-4 hover:underline"
            >
              Already a customer? Login
            </button>
          </div>

          <p className="text-xs sm:text-sm text-white/50">
            No contracts • Cancel anytime • Built for sales killers, teams, and coaches.
          </p>
        </section>

        {/* TOOL / BENEFITS */}
        <section id="tools" className="py-16 border-t border-white/5">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                One workspace to track{' '}
                <span className="text-fuchsia-400">every move you make</span>.
              </h2>
              <p className="text-white/70 mb-6">
                Most reps have numbers in five different places. MAT pulls your entire day
                into one dashboard — and turns raw activity into momentum, pipeline, and
                revenue.
              </p>

              <ul className="space-y-4 text-sm text-white/80">
                <li className="flex gap-3">
                  <span className="mt-0.5 text-fuchsia-400">✓</span>
                  <span>
                    <strong>Daily activity tracker</strong> for calls, texts, emails,
                    appointments, demos, and closes — with instant KPI targets so you
                    always know if you’re ahead or behind.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-fuchsia-400">✓</span>
                  <span>
                    <strong>Pipeline & follow-up engine</strong> that turns every contact
                    into a trackable opportunity with reminders, stages, and EOD roll-ups.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-fuchsia-400">✓</span>
                  <span>
                    <strong>AI content studio</strong> for outbound messages, follow-ups,
                    social posts, and scripts — built right into your daily workspace.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-fuchsia-400">✓</span>
                  <span>
                    <strong>Manager dashboards</strong> so leaders see every rep’s daily
                    grind — activity, pipeline, and revenue — in one click.
                  </span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-fuchsia-500/20 rounded-3xl -z-10" />
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-fuchsia-500/20">
                <p className="text-xs font-semibold text-fuchsia-200 tracking-[0.22em] uppercase mb-3">
                  Live snapshot
                </p>
                <h3 className="text-xl font-bold mb-4">
                  Today&apos;s Massive Action Overview
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mb-4">
                  <div className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3">
                    <div className="text-white/50 mb-1">Calls</div>
                    <div className="text-2xl font-bold text-emerald-400">42</div>
                    <div className="text-[0.65rem] text-emerald-300">
                      +17 vs daily target
                    </div>
                  </div>
                  <div className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3">
                    <div className="text-white/50 mb-1">New Leads</div>
                    <div className="text-2xl font-bold text-cyan-300">19</div>
                    <div className="text-[0.65rem] text-cyan-200">
                      6 booked on the calendar
                    </div>
                  </div>
                  <div className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/60">Revenue today</span>
                      <span className="text-xs text-emerald-300">On-track</span>
                    </div>
                    <div className="text-2xl font-bold">$5,930</div>
                    <div className="text-[0.7rem] text-white/50">
                      Projected month: <span className="text-emerald-300">$148,500</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-black/60 border border-white/10 px-4 py-3">
                  <div className="text-xs font-semibold text-white/70 mb-2">
                    Today&apos;s Top 6 Targets
                  </div>
                  <ul className="space-y-1 text-xs text-white/70">
                    <li>• 25 new cold calls to high-value targets</li>
                    <li>• 3 follow-up demos re-set from last week</li>
                    <li>• 10 warm texts to pipeline stuck in &quot;thinking&quot;</li>
                    <li>• 5 social DMs to past buyers</li>
                    <li>• 1 big offer video to your list</li>
                    <li>• 15 minutes of skill training</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF / BEFORE & AFTER STYLE */}
        <section id="proof" className="py-16 border-t border-white/5">
          <h2 className="text-3xl font-bold mb-2">
            Before MAT vs after MAT inside your team.
          </h2>
          <p className="text-white/70 mb-8 max-w-2xl">
            The difference isn&apos;t &quot;more software&quot;. It&apos;s giving every
            rep a simple target, a scoreboard, and a coach in their pocket.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="rounded-3xl bg-[#1a1024] border border-red-500/40 p-6">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-red-300 mb-3">
                Old way
              </p>
              <ul className="space-y-3 text-white/80">
                <li>• KPIs scattered across spreadsheets and CRMs.</li>
                <li>• Reps &quot;busy&quot; but pipeline stays thin.</li>
                <li>• No real EOD accountability or coaching leverage.</li>
                <li>• Activity drops every time life gets loud.</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-[#071821] border border-emerald-400/40 p-6">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-emerald-300 mb-3">
                MAT method
              </p>
              <ul className="space-y-3 text-white/80">
                <li>
                  • Every rep sees exactly what to hit today: calls, texts, emails,
                  demos, revenue.
                </li>
                <li>
                  • Leaders see activity, pipeline, and closes in real-time — no more
                  guessing.
                </li>
                <li>
                  • AI helps generate messages, content, and follow-up scripts on the fly.
                </li>
                <li>
                  • Culture of Massive Action — everyone chasing targets, daily.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-16 border-t border-white/5">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              Pick your MAT plan. <span className="text-fuchsia-400">Grow fast.</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              All plans include the full Massive Action Tracker platform, AI content tools,
              pipeline tracking, and manager dashboards. Choose the level of firepower your
              team needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-1">Solo Closer</h3>
              <p className="text-sm text-white/60 mb-4">
                For individual killers who want iron-clad daily discipline.
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold">$39</span>
                <span className="text-sm text-white/60"> /month</span>
              </div>
              <ul className="text-sm text-white/75 space-y-2 mb-6 flex-1">
                <li>• 1 user seat</li>
                <li>• Full MAT daily dashboard</li>
                <li>• AI content & follow-up tools</li>
                <li>• Basic revenue + KPI reports</li>
              </ul>
              <a
                href="#"
                className="inline-flex justify-center items-center px-4 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-sm font-semibold shadow-lg shadow-fuchsia-500/40 hover:shadow-fuchsia-500/70 transition"
              >
                Start Solo Plan
              </a>
            </div>

            {/* Team (most popular) */}
            <div className="rounded-3xl border border-fuchsia-400/70 bg-[#140822] p-6 flex flex-col relative overflow-hidden">
              <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-fuchsia-500 text-[0.68rem] font-semibold tracking-[0.16em] uppercase">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold mb-1">Team Engine</h3>
              <p className="text-sm text-white/70 mb-4">
                Up to 10 reps running at full tilt, with leadership visibility.
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold">$149</span>
                <span className="text-sm text-white/60"> /month</span>
              </div>
              <ul className="text-sm text-white/80 space-y-2 mb-6 flex-1">
                <li>• Up to 10 user seats</li>
                <li>• Full MAT dashboards for every rep</li>
                <li>• Manager performance dashboard & EOD reports</li>
                <li>• AI content studio for the entire team</li>
                <li>• Priority support</li>
              </ul>
              <a
                href="#"
                className="inline-flex justify-center items-center px-4 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-sm font-semibold shadow-lg shadow-fuchsia-500/40 hover:shadow-fuchsia-500/70 transition"
              >
                Start Team Engine
              </a>
            </div>

            {/* Elite + Coaching */}
            <div className="rounded-3xl border border-emerald-400/60 bg-[#041c18] p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-1">Elite + Coaching</h3>
              <p className="text-sm text-white/70 mb-4">
                10 seats of MAT plus monthly coaching to drive execution.
              </p>
              <div className="mb-4">
                <span className="text-4xl font-bold">$399</span>
                <span className="text-sm text-white/60"> /month</span>
              </div>
              <ul className="text-sm text-white/80 space-y-2 mb-6 flex-1">
                <li>• Up to 10 user seats</li>
                <li>• Everything in Team Engine</li>
                <li>• 1 group coaching call / month</li>
                <li>• Deep KPI review & game-plan</li>
                <li>• Designed for teams serious about 7-figure growth</li>
              </ul>
              <a
                href="#"
                className="inline-flex justify-center items-center px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-sm font-semibold shadow-lg shadow-emerald-500/40 hover:shadow-emerald-500/70 transition"
              >
                Apply for Elite
              </a>
            </div>
          </div>

          <div className="mt-10 text-center text-sm text-white/60 space-y-3">
            <p>
              <button
                type="button"
                onClick={openLogin}
                className="text-fuchsia-300 hover:text-fuchsia-100 underline-offset-4 hover:underline"
              >
                Already a MAT customer? Login to your workspace
              </button>
            </p>
            <p>No setup fees. Upgrade or downgrade anytime as your team scales.</p>
          </div>
        </section>
      </main>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#050316] border border-white/10 p-6 relative">
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="absolute top-3 right-3 text-white/50 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-1">Login to Massive Action Tracker</h2>
            <p className="text-xs text-white/60 mb-5">
              Enter the email and password you used when your MAT account was created.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-sm focus:outline-none focus:border-fuchsia-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-sm focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-fuchsia-500 to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Logging in…' : 'Login'}
              </button>
            </form>

            <p className="mt-3 text-[0.7rem] text-white/50">
              Having trouble? Make sure you&apos;re using the same credentials your MAT
              account was created with, or contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
