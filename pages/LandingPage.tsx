import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

type AuthMode = 'login' | 'signup';

const LandingPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        // App.tsx listens for auth changes and will switch to the main app view.
        setMessage('Logged in successfully. Loading your MAT workspace...');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (signUpError) throw signUpError;

        setMessage(
          'Account created. Check your email (if confirmation is required), then log in with your credentials.'
        );
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-6xl w-full mx-auto grid gap-12 lg:grid-cols-2 items-center">
        {/* Left side: Hero / big promise */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Massive Action Tracker
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Turn your sales activity into predictable revenue. Track calls,
            appointments, deals, and coaching wins in one simple dashboard.
          </p>

          <ul className="space-y-3 text-gray-700 mb-8">
            <li className="flex items-start">
              <span className="mt-1 mr-2 text-brand-accent">✔</span>
              <span>
                Daily <strong>Activity & Pipeline</strong> view so reps know
                exactly what to do today.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mt-1 mr-2 text-brand-accent">✔</span>
              <span>
                Real-time <strong>Revenue & KPI dashboards</strong> for owners
                and sales leaders.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mt-1 mr-2 text-brand-accent">✔</span>
              <span>
                Built-in <strong>AI coaching & content tools</strong> to help
                reps prospect and follow up faster.
              </span>
            </li>
          </ul>

          <p className="text-sm text-gray-500">
            Once you’re signed in, use the top navigation to move between
            Activity, Pipeline, Marketing, Leadership, and the EOD Report.
          </p>
        </div>

        {/* Right side: Auth card */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'login' ? 'Log in to your workspace' : 'Create your MAT account'}
            </h2>
            <div className="text-sm">
              {mode === 'login' ? (
                <span>
                  New here?{' '}
                  <button
                    type="button"
                    className="text-brand-accent hover:underline font-semibold"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      setMessage(null);
                    }}
                  >
                    Create account
                  </button>
                </span>
              ) : (
                <span>
                  Already a member?{' '}
                  <button
                    type="button"
                    className="text-brand-accent hover:underline font-semibold"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setMessage(null);
                    }}
                  >
                    Log in
                  </button>
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent px-3 py-2"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent px-3 py-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent px-3 py-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? mode === 'login'
                  ? 'Logging in...'
                  : 'Creating account...'
                : mode === 'login'
                ? 'Log in'
                : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-400">
            By continuing, you agree to the standard terms of service and privacy policies
            associated with your MAT account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
