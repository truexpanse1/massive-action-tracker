import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { startStripeCheckout } from '../services/billingService';

// Stripe Price IDs - Update these with your actual price IDs
const SOLO_PRICE_ID = 'price_1SVlc7AF9E77pmGU1ZadSw1A';   // $39 Solo Closer
const TEAM_PRICE_ID = 'price_1SVIo3AF9E77pmGUWmOiZw0';   // $149 Team Engine
const ELITE_PRICE_ID = 'price_1SVIo3AF9E77pmGUVxM0u4z1'; // $399 Elite / Company plan

interface PlanInfo {
  id: 'solo' | 'team' | 'elite';
  name: string;
  price: number;
  priceId: string;
  description: string;
  features: string[];
  buttonColor: string;
  buttonHoverColor: string;
}

const PLANS: Record<string, PlanInfo> = {
  solo: {
    id: 'solo',
    name: 'Solo Closer',
    price: 39,
    priceId: SOLO_PRICE_ID,
    description: 'For the person ready to win every day',
    features: [
      'Daily dashboard with smart reminders',
      'Full pipeline tracking',
      'AI content & image studio',
      'Revenue & win tracking',
      'Private community access',
    ],
    buttonColor: 'bg-blue-600',
    buttonHoverColor: 'hover:bg-blue-700',
  },
  team: {
    id: 'team',
    name: 'Team Engine',
    price: 149,
    priceId: TEAM_PRICE_ID,
    description: 'For teams who grow together',
    features: [
      'Everything in Solo',
      'Manager EOD reports',
      'Team leaderboards',
      'Pipeline heatmaps',
      'Priority support',
    ],
    buttonColor: 'bg-blue-600',
    buttonHoverColor: 'hover:bg-blue-700',
  },
  elite: {
    id: 'elite',
    name: 'Elite + Coaching',
    price: 399,
    priceId: ELITE_PRICE_ID,
    description: 'For teams who want expert help',
    features: [
      'Everything in Team',
      'Monthly live coaching from a 10X business coach',
      'Custom team strategy',
      'Quarterly calls',
      'Early access to new AI tools',
    ],
    buttonColor: 'bg-green-600',
    buttonHoverColor: 'hover:bg-green-700',
  },
};

const LandingPage: React.FC = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    email: '',
    name: '',
    company: '',
    phone: '',
  });
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ============================================
  // PURCHASE FLOW
  // ============================================

  const openPurchaseModal = (plan: PlanInfo) => {
    setSelectedPlan(plan);
    setPurchaseForm({ email: '', name: '', company: '', phone: '' });
    setPurchaseError(null);
    setShowPurchaseModal(true);
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedPlan(null);
    setPurchaseForm({ email: '', name: '', company: '', phone: '' });
    setPurchaseError(null);
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError(null);

    // Validation
    if (!purchaseForm.email || !purchaseForm.name) {
      setPurchaseError('Email and name are required.');
      return;
    }

    if (!purchaseForm.email.includes('@')) {
      setPurchaseError('Please enter a valid email address.');
      return;
    }

    if (!selectedPlan) {
      setPurchaseError('No plan selected.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create user account in Supabase Auth
      // We assume a 'companies' table exists and a 'profiles' table with a 'company_id' foreign key.
      const companyName = purchaseForm.company || purchaseForm.name + "'s Company";
      
// 1a: Create or get Company ID (Simplified for client-side, ideally this is an API call)
	// **MULTI-TENANCY NOTE**: The current implementation is a client-side placeholder.
	// For a production app, this logic should be moved to a Supabase Edge Function
	// to securely create the company record and assign the company_id to the user's profile.
	const companyIdentifier = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
	
	// FIX: Ensure companyIdentifier is a string, not a number, for metadata
	const companyIdString = String(companyIdentifier);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: purchaseForm.email,
        password: Math.random().toString(36).slice(-12), // Generate temporary password
        options: {
          data: {
            name: purchaseForm.name,
            company: companyName,
            company_id: companyIdString, // Placeholder for multi-tenancy
            phone: purchaseForm.phone,
            plan: selectedPlan.id,
          },
        },
      });

      if (authError) {
        // If user already exists, that's okay - we'll still proceed to checkout
        if (!authError.message.includes('already registered')) {
          throw authError;
        }
      }

// Step 2: Ensure user is not logged in before redirecting to Stripe
	// The sign-up should not auto-login. If it does, the user will be logged out by the next step.
	// We will rely on the instant redirect to Stripe to prevent the app from loading.

      // Step 3: Redirect to Stripe checkout
      await startStripeCheckout(selectedPlan.priceId, purchaseForm.email);
      // Note: startStripeCheckout redirects the page, so code after this won't execute
    } catch (err: any) {
      console.error('Error during purchase:', err);
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setPurchaseError(errorMessage);
      setIsProcessing(false);
    }
  };

  // ============================================
  // LOGIN FLOW
  // ============================================

  const openLoginModal = () => {
    setLoginForm({ email: '', password: '' });
    setLoginError(null);
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginForm({ email: '', password: '' });
    setLoginError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginForm.email || !loginForm.password) {
      setLoginError('Email and password are required.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        setLoginError(error.message);
        setIsLoggingIn(false);
        return;
      }

      // Reload to let App.tsx pick up the new session
      window.location.reload();
    } catch (err: any) {
      setLoginError(err?.message || 'Unexpected error logging in.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* ============================================ */}
      {/* PURCHASE MODAL */}
      {/* ============================================ */}
      {showPurchaseModal && selectedPlan && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closePurchaseModal}
        >
          <div
            className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl md:text-3xl font-black mb-2 text-center text-gray-900">
              {selectedPlan.name}
            </h2>
            <p className="text-center text-gray-600 mb-6">
              ${selectedPlan.price}/month
            </p>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={purchaseForm.email}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={purchaseForm.name}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={purchaseForm.company}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, company: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={purchaseForm.phone}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                  placeholder="(555) 123-4567"
                />
              </div>

              {purchaseError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{purchaseError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closePurchaseModal}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 py-3 rounded-xl font-bold text-white text-lg transition ${
                    selectedPlan.buttonColor
                  } ${selectedPlan.buttonHoverColor} ${
                    isProcessing ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Complete Order'}
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              You'll be redirected to Stripe to securely complete your payment.
            </p>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* LOGIN MODAL */}
      {/* ============================================ */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeLoginModal}
        >
          <div
            className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl md:text-3xl font-black mb-2 text-center text-gray-900">
              Login
            </h2>
            <p className="text-center text-gray-600 mb-6 text-sm">
              Enter your credentials to access your account
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
                  placeholder="••••••••"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{loginError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className={`flex-1 py-3 rounded-xl font-bold text-white text-lg bg-blue-600 hover:bg-blue-700 transition ${
                    isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
          <div className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900">
            TRUE<span className="text-red-600">X</span>PANSE
          </div>
          <button
            onClick={openLoginModal}
            className="px-6 md:px-8 py-2 md:py-3 rounded-full border-2 border-gray-400 hover:border-gray-600 font-semibold text-sm md:text-base transition text-gray-900 whitespace-nowrap"
          >
            Login
          </button>
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="pt-20 md:pt-32 pb-24 md:pb-40 text-center px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight mb-8 text-gray-900">
            The daily system<br />
            that turns <span className="text-blue-600">Massive Action</span><br />
            into real results.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-12">
            10 years in the making. Built by closers who know: action is everything.<br />
            Massive Action Tracker helps you do the right things every day — so you win more.
          </p>
          <button
            onClick={() => openPurchaseModal(PLANS.team)}
            className="px-8 md:px-16 py-4 md:py-6 rounded-full bg-blue-600 text-xl md:text-2xl font-black text-white shadow-xl hover:bg-blue-700 transition"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-20 md:space-y-32">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <img
           src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/uGojrZQFwEYwfaXX.jpg"
              alt="End of Day Report"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Your Daily Win Report
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                See everything you did today in one simple report. It tracks every call, text, and win. You will know exactly what works to make you win more. You can even look back at any day you want!
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Know Your Money Flow
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                See your money grow in real-time! Find out which products sell the best and when. You can change the dates to see trends and know what to sell next. This helps you sell smarter, not just harder.
              </p>
            </div>
            <img
         src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/HAJnAsRVWQxIpIei.jpg"
              alt="Revenue Center"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/TKIMNfRJfmBDifrH.jpg"
              alt="New Clients List"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Meet Your New Clients Page
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                See all your new clients on one simple page. This is a list of every client your team has closed. You can see the exact day they became a paying client. It’s the perfect way to celebrate and keep track of your wins!
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                The Power Dashboard
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                This special chart helps managers see how their team is doing. Pick any five numbers, like "money made" and "meetings set," to see how they work together. This shows you the clear path to making more money.
              </p>
            </div>
            <img
         src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/PRyIpAjeiuhiPTeR.jpg"
              alt="Performance Dashboard"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
          </div>

          {/* Feature 5 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/FkVOuvmuxkkghaMP.jpg"
              alt="Prospecting List"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Build Your Money Pipeline
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                This is where you build your future money. Every time you click a button here, it saves the data forever. This helps you build a strong list of future customers that will bring in steady money. It's simple: track your work, and the money will follow.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
                Create Like a Pro — Instantly
              </h3>
              <p className="text-lg md:text-xl text-gray-600">
                Quickly make great images for social media, emails, and flyers. This tool is in the Marketing section. It helps you make eye-catching posts fast, so you can spend more time selling and less time designing.
              </p>
            </div>
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663033216620/uGojrZQFwEYwfaXX.jpg"
              alt="End of Day Report"
              className="rounded-3xl shadow-lg border border-gray-200 object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRICING SECTION */}
      {/* ============================================ */}
      <section className="py-20 md:py-32 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-center mb-16 text-gray-900">
            Choose Your Plan
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Solo Plan */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-gray-200 hover:border-blue-400 transition flex flex-col">
              <h3 className="text-2xl md:text-3xl font-black mb-3 text-gray-900">
                {PLANS.solo.name}
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                {PLANS.solo.description}
              </p>
              <div className="text-4xl md:text-5xl font-black mb-8 text-gray-900">
                ${PLANS.solo.price}
                <span className="text-lg md:text-xl text-gray-500">/mth</span>
              </div>
              <ul className="text-left space-y-3 text-sm md:text-base text-gray-700 mb-8 flex-grow">
                {PLANS.solo.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openPurchaseModal(PLANS.solo)}
                className="w-full py-4 md:py-5 rounded-2xl bg-blue-600 text-lg md:text-xl font-bold text-white hover:bg-blue-700 transition"
              >
                Start Solo
              </button>
            </div>

            {/* Team Plan (Most Popular) */}
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl pt-16 md:pt-20 pb-8 md:pb-12 px-8 md:px-10 border-4 border-blue-500 shadow-2xl flex flex-col">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm md:text-base">
                MOST POPULAR
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-3 text-gray-900">
                {PLANS.team.name}
              </h3>
              <p className="text-base md:text-lg text-gray-700 mb-6">
                {PLANS.team.description}
              </p>
              <div className="text-5xl md:text-6xl font-black mb-8 text-gray-900">
                ${PLANS.team.price}
                <span className="text-xl md:text-2xl text-gray-600">/mth</span>
              </div>
              <ul className="text-left space-y-3 text-sm md:text-base text-gray-700 mb-8 flex-grow">
                {PLANS.team.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openPurchaseModal(PLANS.team)}
                className="w-full py-5 md:py-6 rounded-2xl bg-blue-600 text-lg md:text-2xl font-black text-white shadow-lg hover:bg-blue-700 transition"
              >
                Start Team Now
              </button>
            </div>

            {/* Elite Plan */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-gray-200 hover:border-green-400 transition flex flex-col">
              <h3 className="text-2xl md:text-3xl font-black mb-3 text-gray-900">
                {PLANS.elite.name}
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                {PLANS.elite.description}
              </p>
              <div className="text-4xl md:text-5xl font-black mb-8 text-gray-900">
                ${PLANS.elite.price}
                <span className="text-lg md:text-xl text-gray-500">/mth</span>
              </div>
              <ul className="text-left space-y-3 text-sm md:text-base text-gray-700 mb-8 flex-grow">
                {PLANS.elite.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openPurchaseModal(PLANS.elite)}
                className="w-full py-4 md:py-5 rounded-2xl bg-green-600 text-lg md:text-xl font-bold text-white hover:bg-green-700 transition"
              >
                Apply for Elite
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="py-12 md:py-20 text-center text-gray-600 bg-white border-t border-gray-200">
        <p className="text-lg md:text-2xl font-bold text-gray-900">© 2025 TrueXpanse</p>
        <p className="mt-3 md:mt-4 text-base md:text-lg">
          Massive Action Tracker • Built to help you win
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
