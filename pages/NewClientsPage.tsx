import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0E0E11] text-white">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center">
          <Image
            src="/public-truexpanse-logo.png"
            width={180}
            height={60}
            alt="TrueXpanse Logo"
          />
        </div>

        <nav className="flex items-center gap-10 text-sm">
          <Link href="#features" className="hover:text-red-500 transition">Features</Link>
          <Link href="#pricing" className="hover:text-red-500 transition">Pricing</Link>
          <Link 
            href="/login" 
            className="px-5 py-2 rounded-lg font-semibold bg-white text-black hover:bg-red-500 hover:text-white transition"
          >
            Login
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto text-center px-8 py-24">
        
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Your Team Is Closer to Consistency Than You Think
        </h1>

        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Most sales teams don’t fail because of skill — they fail because they 
          can’t stay consistent. The Massive Action Tracker removes the guesswork, 
          builds iron-clad daily habits, and gives you complete visibility into 
          KPIs, effort, pipeline and results in minutes a day.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="#pricing"
            className="px-10 py-4 bg-red-600 rounded-xl font-semibold text-lg hover:bg-red-700 transition"
          >
            Start Your 7-Day Free Trial
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-[#151518]">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Built for Teams Who Need Results This Quarter</h2>

          <div className="grid md:grid-cols-3 gap-12">
            <Feature
              title="Daily Accountability That Sticks"
              text="Turn KPI tracking into a fast, addictive habit. No spreadsheets. No chaos. Just clarity."
            />
            <Feature
              title="Pipeline Tracking That Actually Helps"
              text="See your entire pipeline at a glance with zero confusion. Every rep knows exactly what to do next."
            />
            <Feature
              title="Manager Visibility in Real Time"
              text="Instant access to rep performance, daily activity, and appointments — without chasing anyone down."
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-[#0E0E11]">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-white/70 mb-16">Simple pricing. Powerful results. No long-term contracts.</p>

          <div className="grid md:grid-cols-3 gap-10">
            <PriceCard
              title="Starter"
              price="$39/mo"
              description="Perfect for individual operators or solo reps who want to build consistency fast."
            />
            <PriceCard
              title="Team"
              price="$149/mo"
              highlight
              description="Up to 10 users. Built for sales teams who want accountability, visibility, and results."
            />
            <PriceCard
              title="Team + Coaching"
              price="$399/mo"
              description="Up to 10 users plus one monthly group coaching call with Don."
            />
          </div>

          <div className="mt-16">
            <Link 
              href="/signup"
              className="px-10 py-4 text-lg font-semibold bg-red-600 rounded-xl hover:bg-red-700 transition"
            >
              Start Your 7-Day Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-white/40 text-sm">
        © {new Date().getFullYear()} TrueXpanse. All rights reserved.
      </footer>
    </div>
  );
}

/* COMPONENTS */

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-[#1D1D21] p-8 rounded-xl border border-white/5">
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-white/60 leading-relaxed">{text}</p>
    </div>
  );
}

function PriceCard({
  title,
  price,
  description,
  highlight,
}: {
  title: string;
  price: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-2xl border transition ${
        highlight
          ? "border-red-600 bg-white/5 scale-105"
          : "border-white/10 bg-white/5"
      }`}
    >
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-4xl font-bold mb-4">{price}</p>
      <p className="text-white/60 mb-8">{description}</p>

      <Link
        href="/signup"
        className={`block py-3 rounded-lg font-semibold transition ${
          highlight
            ? "bg-red-600 hover:bg-red-700"
            : "bg-white text-black hover:bg-red-600 hover:text-white"
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}
