// src/pages/LandingPage.tsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LandingPage: React.FC = () => {
  // --- Login state ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoginLoading(false);

    if (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Unable to sign in. Please try again.');
      return;
    }

    // App.tsx is listening to auth state; once session exists,
    // it will switch from LandingPage to the main MAT workspace.
    // A light reload is a safe fallback:
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            TRUE<span className="text-red-500">XPANSE</span>
          </span>
          <span className="hidden sm:inline-block text-xs text-zinc-400 border-l border-zinc-700 pl-3">
            Massive Action Tracker
          </span>
        </div>

        {/* Small “Sign in” link that scrolls to login card */}
        <button
          onClick={() => {
            const el = document.getElementById('mat-login-card');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="text-sm text-zinc-200 hover:text-white underline-offset-4 hover:underline"
        >
          Already have an account? Sign in
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr,1fr] items-start">
          {/* LEFT: Hero + packages/benefits */}
          <section>
            <p className="text-xs font-semibold tracking-[0.2em] text-red-400 mb-3 uppercase">
              Massive Action Tracker
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Turn your sales chaos
              <br />
              into a <span className="text-red-500">clear pipeline</span>.
            </h1>
            <p className="text-lg text-zinc-300 mb-8 max-w-xl">
              MAT gives your team one battle station to track calls, texts, emails,
              appointments, demos and revenue—so you can coach to real activity and
              crush your targets.
            </p>

            {/* Simple package highlights */}
            <div className="grid gap-4 md:grid-cols-3 mb-10">
              <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/40">
                <h3 className="font-semibold mb-1 text-sm text-zinc-100">
                  Solo Rep
                </h3>
                <p className="text-xs text-zinc-400 mb-2">Perfect for closers and SDRs.</p>
                <p className="text-sm">
                  Track daily KPIs, pipeline, and revenue in one simple view.
                </p>
              </div>
              <div className="border border-red-500/60 rounded-2xl p-4 bg-red-500/5">
                <h3 className="font-semibold mb-1 text-sm text-zinc-100">
                  Sales Team
                </h3>
                <p className="text-xs text-zinc-400 mb-2">
                  Small teams & growing companies.
                </p>
                <p className="text-sm">
                  Manager dashboard for coaching by metrics, not feelings.
                </p>
              </div>
              <div className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/40">
                <h3 className="font-semibold mb-1 text-sm text-zinc-100">
                  10X Coaching
                </h3>
                <p className="text-xs text-zinc-400 mb-2">For serious scale-ups.</p>
                <p className="text-sm">
                  Plug in TrueXpanse coaching with MAT for full 10X execution.
                </p>
              </div>
            </div>

            {/* Trial CTA */}
            <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-7">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Start your 7-day free trial
                  </h2>
                  <p className="text-sm text-zinc-400">
                    No credit card required. Get your workspace and invite your team.
                  </p>
                </div>
              </div>

              {/* This posts to your future backend; safe even if not wired yet */}
              <form
                action="/api/trial"
                method="POST"
                className="grid gap-4 md:grid-cols-3"
              >
                <input
                  name="company"
                  required
                  placeholder="Company name *"
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm
                             focus:outline-none focus:border-red-500"
                />
                <input
                  name="name"
                  required
                  placeholder="Your name *"
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm
                             focus:outline-none focus:border-red-500"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Work email *"
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm
                             focus:outline-none focus:border-red-500"
                />

                <button
                  type="submit"
                  className="md:col-span-3 mt-2 inline-flex items-center justify-center px-4 py-3
                             rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold
                             transition-colors"
                >
                  Start 7-Day Free Trial — No Card Required
                </button>
              </form>
            </section>
          </section>

          {/* RIGHT: Login card for existing accounts */}
          <section
            id="mat-login-card"
            className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 md:p-7"
          >
            <h2 className="text-xl font-semibold mb-1">Sign in to your MAT workspace</h2>
            <p className="text-sm text-zinc-400 mb-5">
              Existing TrueXpanse / MAT users can log in here with their email and password.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm
                             focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-sm
                             focus:outline-none focus:border-red-500"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl
                           bg-white text-black text-sm font-semibold hover:bg-zinc-100
                           disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loginLoading ? 'Signing you in…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-4 text-[11px] text-zinc-500">
              Trouble signing in? Make sure you use the same email you used when your
              TrueXpanse / MAT account was created.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
