import { createUserWithTrial } from '@/lib/actions';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 font-black text-xs">
            TX
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-zinc-400 uppercase">
              TrueXpanse
            </p>
            <p className="text-xs text-zinc-500 tracking-wide">
              Massive Action Tracker
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <a href="#how-it-works" className="text-zinc-400 hover:text-white">
            How it works
          </a>
          <a href="#packages" className="text-zinc-400 hover:text-white">
            Packages
          </a>
          <a href="#social-proof" className="text-zinc-400 hover:text-white">
            Results
          </a>
          <a
            href="/login"
            className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-100 hover:border-red-500 hover:text-red-400"
          >
            Already a member? Sign in
          </a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {/* HERO */}
        <section className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-start">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-red-400 uppercase mb-4">
              7–Day Free Trial – No Card Required
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              Never wake up to an
              <span className="text-red-500"> empty pipeline</span> again.
            </h1>
            <p className="text-lg text-zinc-300 mb-6 max-w-xl">
              Massive Action Tracker gives your sales team a clear,
              KPI-driven game plan every day—so calls, appointments,
              and deals stack up instead of slipping through the cracks.
            </p>

            <ul className="grid gap-3 text-sm text-zinc-300 mb-8">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>
                  Daily Activity &amp; Pipeline dashboard so reps always know
                  exactly what to do next.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>
                  Manager view of calls, appointments, demos, and closed deals
                  across the whole team.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-xs">
                  ✓
                </span>
                <span>
                  Built-in AI tools for prospecting messages, follow-up scripts,
                  and content that actually gets replies.
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Setup in under 5 minutes
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1">
                No credit card • Cancel anytime
              </span>
            </div>
          </div>

          {/* TRIAL FORM */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-red-900/20">
            <h2 className="text-xl font-semibold mb-2">
              Start your 7-Day Free Trial
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Tell us a little about your company and we’ll spin up your MAT
              workspace. You’ll be inside the app in about 60 seconds.
            </p>

            <form
              action={createUserWithTrial}
              method="POST"
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-300">
                  Company Name *
                </label>
                <input
                  name="company"
                  required
                  placeholder="Acme Painting & Co."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Industry
                  </label>
                  <input
                    name="industry"
                    placeholder="Painting / HVAC / Roofing / etc."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Team Size
                  </label>
                  <select
                    name="teamSize"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="1">Solo producer</option>
                    <option value="2-5">2–5 reps</option>
                    <option value="6-15">6–15 reps</option>
                    <option value="16+">16+ reps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-300">
                    Work Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* PACKAGE SELECTION */}
              <fieldset className="space-y-3" id="packages">
                <legend className="block text-xs font-medium text-zinc-300">
                  Choose your starting package
                </legend>

                <p className="text-[11px] text-zinc-500">
                  You’ll get full access for 7 days. You can upgrade, downgrade,
                  or cancel anytime.
                </p>

                <div className="grid grid-cols-1 gap-3 text-xs">
                  <label className="flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-3 hover:border-red-500 cursor-pointer">
                    <input
                      type="radio"
                      name="package"
                      value="bronze"
                      defaultChecked
                      className="mt-1 accent-red-600"
                    />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-zinc-100">
                          Bronze – Individual Rep
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          $49/mo after trial
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Solo producers who want a simple, powerful daily KPI
                        tracker and revenue dashboard.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-red-600 bg-red-600/10 px-3 py-3 hover:border-red-400 cursor-pointer">
                    <input
                      type="radio"
                      name="package"
                      value="silver"
                      className="mt-1 accent-red-600"
                    />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-zinc-100">
                          Silver – Small Team
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600/20 px-2 py-0.5 text-[10px] text-red-300">
                          Most popular
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          $149/mo after trial
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Up to 5 reps with full manager dashboards, EOD reports,
                        and AI prospecting tools.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-3 hover:border-red-500 cursor-pointer">
                    <input
                      type="radio"
                      name="package"
                      value="gold"
                      className="mt-1 accent-red-600"
                    />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-zinc-100">
                          Gold – Sales Organization
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Custom pricing
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Larger teams needing advanced reporting, onboarding
                        support, and 10X-style coaching integration.
                      </p>
                    </div>
                  </label>
                </div>
              </fieldset>

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500"
              >
                Start 7-Day Free Trial — No Card Required
              </button>

              <p className="text-[11px] text-zinc-500 text-center">
                We’ll send your login link and onboarding checklist to the email
                you provide.
              </p>
            </form>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="mt-16 grid gap-8 lg:grid-cols-3 text-sm text-zinc-300"
        >
          <div>
            <h3 className="text-base font-semibold mb-2">
              1. Plug MAT into your day
            </h3>
            <p className="text-zinc-400">
              Reps start and end every day inside MAT. Calls, texts, emails,
              appointments, and revenue are all tracked in minutes—not hours.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-2">
              2. Watch KPIs in real time
            </h3>
            <p className="text-zinc-400">
              Owners and sales leaders see exactly who’s winning, who’s stuck,
              and where coaching is needed—without chasing spreadsheets.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-2">
              3. Scale with confidence
            </h3>
            <p className="text-zinc-400">
              Once your team is locked into daily massive action, revenue
              becomes predictable. Add reps, not chaos.
            </p>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section
          id="social-proof"
          className="mt-16 border-t border-zinc-900 pt-8 text-sm text-zinc-300"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-4">
            Built by a 10X business coach
          </p>
          <p className="max-w-3xl text-zinc-400 mb-4">
            Massive Action Tracker was designed for real-world sales teams in
            home services, contracting, and B2B. It’s built around the same
            habits and KPIs that top producers use to hit 7- and 8-figure
            goals—without adding more software complexity to their day.
          </p>
        </section>
      </main>

      {/* FOOTER CTA */}
      <footer className="border-t border-zinc-900 px-6 py-4 text-xs text-zinc-500 flex flex-col md:flex-row items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} TrueXpanse. Keep Expanding.</span>
        <a
          href="#top"
          className="rounded-full border border-zinc-700 px-3 py-1 hover:border-red-500 hover:text-red-400"
        >
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}
