// pages/LandingPage.tsx
import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight">
            TRUE<span className="text-red-500">XPANSE</span>
          </span>
          <span className="hidden md:inline text-xs uppercase tracking-[0.2em] text-zinc-400">
            Massive Action Tracker
          </span>
        </div>
        <a href="/login" className="text-sm text-zinc-200 hover:text-white underline-offset-4 hover:underline">
          Already have an account? <span className="font-semibold">Sign in</span>
        </a>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 md:py-16 grid lg:grid-cols-[1.1fr,0.9fr] gap-12">
        {/* Left: Hero + packages + proof */}
        <section className="space-y-10">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.25em] text-red-400 uppercase">
              7-Day Free Trial
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Never let your sales pipeline run dry again.
            </h1>
            <p className="text-lg text-zinc-300 max-w-xl">
              Massive Action Tracker (MAT) gives your team one place to track daily KPIs,
              pipeline, revenue, and coaching — so you can scale past 7-figures with clarity.
            </p>
          </div>

          {/* Packages highlight */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-sm font-semibold mb-1">MAT Starter</h3>
              <p className="text-xs text-zinc-400 mb-3">Solo closer or small team.</p>
              <p className="text-lg font-bold">$29<span className="text-sm text-zinc-400">/user·mo</span></p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-300">
                <li>• Daily KPIs & pipeline</li>
                <li>• Revenue dashboard</li>
                <li>• Basic AI content tools</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-red-500/70 bg-red-950/40 p-4 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-red-500/10 via-transparent to-red-500/10" />
              <div className="relative">
                <h3 className="text-sm font-semibold mb-1">MAT Pro</h3>
                <p className="text-xs text-zinc-200 mb-3">Most popular for growing teams.</p>
                <p className="text-lg font-bold">$49<span className="text-sm text-zinc-300">/user·mo</span></p>
                <ul className="mt-3 space-y-1 text-xs text-zinc-100">
                  <li>• Everything in Starter</li>
                  <li>• Team dashboards & EOD reports</li>
                  <li>• Advanced AI coaching & content</li>
                </ul>
                <span className="inline-flex mt-3 px-2 py-1 rounded-full bg-red-600 text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Recommended
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-sm font-semibold mb-1">MAT Elite</h3>
              <p className="text-xs text-zinc-400 mb-3">For 10X-driven sales orgs.</p>
              <p className="text-lg font-bold">Talk to us</p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-300">
                <li>• Multi-team rollouts</li>
                <li>• Custom KPIs & coaching</li>
                <li>• 1:1 implementation support</li>
              </ul>
            </div>
          </div>

          {/* Social proof / bullets */}
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-zinc-300">
            <div>
              <p className="font-semibold text-zinc-100">Daily clarity.</p>
              <p className="text-zinc-400">Reps see their targets, activity, and wins in one place.</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-100">Manager visibility.</p>
              <p className="text-zinc-400">Drill into individual performance and coach with data.</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-100">AI-powered.</p>
              <p className="text-zinc-400">Content, coaching, and challenges woven into the workflow.</p>
            </div>
          </div>
        </section>

        {/* Right: Trial form */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-red-900/20">
          <h2 className="text-2xl font-semibold mb-2">Start your 7-day free trial</h2>
          <p className="text-sm text-zinc-400 mb-6">
            No credit card required. Get your team onboarded in minutes.
          </p>

          <form
            action="/api/trial"
            method="POST"
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                name="company"
                required
                className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-zinc-700 text-sm
                           focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">
                Industry
              </label>
              <input
                name="industry"
                className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-zinc-700 text-sm
                           focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-zinc-700 text-sm
                             focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-black/40 border border-zinc-700 text-sm
                             focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold
                         tracking-wide uppercase"
            >
              Start Free Trial
            </button>

            <p className="text-[11px] text-zinc-500 text-center">
              By starting a trial you agree to receive onboarding emails from TrueXpanse.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
