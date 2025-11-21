import React, { useState } from 'react';
import LoginPage from './LoginPage';

const Feature: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <div className="bg-brand-light-card dark:bg-brand-navy p-6 rounded-lg border border-brand-light-border dark:border-brand-gray/50 text-center transform hover:-translate-y-2 transition-transform duration-300">
    <div className="flex justify-center mb-4 text-brand-red">{icon}</div>
    <h3 className="text-xl font-bold text-brand-light-text dark:text-white mb-2">{title}</h3>
    <p className="text-brand-light-gray dark:text-gray-400 text-sm">{children}</p>
  </div>
);

const PricingCard: React.FC<{
  plan: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  ctaLink: string;
}> = ({ plan, price, description, features, isFeatured, ctaLink }) => {
  return (
    <div
      className={`border rounded-lg p-8 flex flex-col ${
        isFeatured
          ? 'border-brand-red scale-105 bg-brand-navy'
          : 'border-brand-light-border dark:border-brand-gray bg-brand-light-card dark:bg-brand-navy'
      }`}
    >
      <h3 className={`text-2xl font-bold ${isFeatured ? 'text-white' : 'text-brand-light-text dark:text-white'}`}>
        {plan}
      </h3>
      <p className={`mt-2 ${isFeatured ? 'text-gray-300' : 'text-brand-light-gray dark:text-gray-400'}`}>
        {description}
      </p>
      <div className="mt-6">
        <span
          className={`text-5xl font-black tracking-tight ${
            isFeatured ? 'text-white' : 'text-brand-light-text dark:text-white'
          }`}
        >
          ${price}
        </span>
        <span className={isFeatured ? 'text-gray-300' : 'text-brand-light-gray dark:text-gray-400'}> / month</span>
      </div>
      <ul
        className={`mt-8 space-y-4 text-sm flex-grow ${
          isFeatured ? 'text-gray-300' : 'text-brand-light-gray dark:text-gray-300'
        }`}
      >
        {features.map((feature) => (
          <li key={feature} className="flex items-start">
            <svg
              className="w-5 h-5 text-brand-lime mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaLink}
        className={`mt-8 block text-center font-bold py-3 px-4 rounded-lg transition-colors ${
          isFeatured ? 'bg-brand-lime text-brand-ink hover:bg-green-400' : 'bg-brand-blue text-white hover:bg-blue-700'
        }`}
      >
        Get Started
      </a>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href')?.substring(1);
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}
      <div className="bg-brand-light-bg dark:bg-brand-ink text-brand-light-text dark:text-gray-300 font-sans">
        {/* Header */}
        <header className="sticky top-0 bg-brand-light-card/80 dark:bg-brand-navy/80 backdrop-blur-lg border-b border-brand-light-border dark:border-brand-gray z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-black tracking-tighter text-brand-light-text dark:text-white uppercase">
                TRUE<span className="text-brand-red">X</span>PANSE
              </h1>
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" onClick={handleNavClick} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red">
                  Features
                </a>
                <a href="#pricing" onClick={handleNavClick} className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-red">
                  Pricing
                </a>
              </nav>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-brand-blue text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative py-24 sm:py-32 px-4 border-b border-brand-light-border dark:border-brand-gray bg-brand-ink">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 uppercase tracking-wide text-gray-200">
              Massive Action Tracker (MAT)
            </span>
            <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
              Never Let Your Sales Pipeline
              <br className="hidden sm:block" />
              Run Dry Again.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed">
              MAT turns your daily calls, texts, emails, appointments, and revenue into a clear picture of where you are and what to do next — whether you’re a solo closer or leading a growing sales team.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#pricing"
                onClick={handleNavClick}
                className="bg-brand-red text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105 inline-flex items-center shadow-lg text-lg"
              >
                Get Started with MAT
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 sm:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-brand-light-text dark:text-white mb-3">
              Turn Activity Into Predictable Revenue
            </h2>
            <p className="text-center max-w-2xl mx-auto text-sm sm:text-base text-brand-light-gray dark:text-gray-400 mb-12">
              MAT was built for sales pros who are tired of bloated CRMs and guesswork. You get the exact views you need to execute today and coach better tomorrow.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Feature
                title="Own Your Day"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
              >
                See calls, texts, emails, appointments, and wins in one Day View. MAT makes it obvious what you’ve done and what still needs to happen.
              </Feature>
              <Feature
                title="Pipeline, Not Hope"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              >
                Track hot leads, follow-ups, and appointments so no opportunity slips. Watch activity turn into pipeline, then into revenue.
              </Feature>
              <Feature
                title="Built-In AI Sales Partner"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
              >
                Generate marketing images, social posts, outreach scripts, and daily challenges that keep your pipeline full and your skills sharp.
              </Feature>
              <Feature
                title="Coach the Whole Team"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              >
                Add reps, see their EOD reports, compare KPIs, and spot who needs coaching today. Finally manage your team from real numbers, not feelings.
              </Feature>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-24 px-4 bg-brand-light-bg dark:bg-brand-ink">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-light-text dark:text-white">
              Choose the MAT Plan That Matches Your Ambition
            </h2>
            <p className="mt-4 text-brand-light-gray dark:text-gray-400">
              Every plan includes daily KPIs, pipeline tracking, revenue views, and AI-powered support.
            </p>
          </div>
          <div className="max-w-7xl mx-auto mt-16 grid lg:grid-cols-3 gap-8">
            {/* Rep – $39 */}
            <PricingCard
              plan="Rep"
              price="39"
              description="For individual sales reps who want to dominate their own numbers."
              features={[
                '1 user seat',
                'Full Daily Action & KPI Tracking',
                'Pipeline & Revenue Views',
                'AI Content & Script Generation',
                'Daily MAT Challenges',
                '7-day free trial – no card required',
              ]}
              ctaLink="/login"
            />

            {/* Manager – $149 (MOST POPULAR) */}
            <PricingCard
              plan="Manager"
              price="149"
              description="For sales managers and small teams who need the Leadership tab."
              features=[
                'Up to 10 reps ($12 per extra rep)',
                'Everything in Rep',
                'Leadership tab – invite/remove reps',
                'Team leaderboards & EOD reports',
                'Admin controls & reporting',
                '14-day money-back guarantee',
              ]
              isFeatured={true}
              ctaLink="/login"
            />

            {/* Company – $399 */}
            <PricingCard
              plan="Company"
              price="399"
              description="For growing sales organizations that want unlimited seats."
              features=[
                'Unlimited reps',
                'Everything in Manager',
                'Priority support',
                'Custom branding (coming soon)',
                'API access (coming soon)',
                '30-day money-back guarantee',
              ]
              ctaLink="/login"
            />
          </div>

          {/* Powered by Stripe badge */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Secure payments powered by
            </p>
            <img 
              src="https://stripe.com/img/v3/powered_by_stripe/tall.png" 
              alt="Powered by Stripe" 
              className="h-12 mx-auto"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-brand-light-card dark:bg-brand-navy border-t border-brand-light-border dark:border-brand-gray">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} TRUE<span className="text-brand-red">X</span>PANSE. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
