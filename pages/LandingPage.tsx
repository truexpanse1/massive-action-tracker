// app/page.tsx
import { createUserWithTrial } from '@/lib/actions';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-red-500">TRUE<span className="text-white">XPANSE</span></h1>
        <a href="/login" className="text-white hover:underline">
          Already have an account? Sign in
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Start Your Free Trial</h2>
          <p className="text-xl text-gray-400">Join thousands of sales teams crushing their goals</p>
        </div>

        <form action={createUserWithTrial} className="space-y-8 bg-zinc-900/50 p-10 rounded-2xl border border-zinc-800">
          {/* Company Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name *</label>
                <input name="company" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Size *</label>
                <select name="size" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <option value="">Select size</option>
                  <option>1–10 employees</option>
                  <option>11–50 employees</option>
                  <option>51–200 employees</option>
                  <option>201+ employees</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Industry *</label>
                <select name="industry" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <option value="">Select industry</option>
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Real Estate</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Phone *</label>
                <input name="phone" type="tel" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input name="name" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Your Role *</label>
                <select name="role" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <option value="">Select role</option>
                  <option value="owner">Owner / Founder</option>
                  <option value="sales-manager">Sales Manager</option>
                  <option value="rep">Sales Rep</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input name="email" type="email" required className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <input name="password" type="password" required minLength={8} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg" />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters recommended</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800 rounded-lg p-4 text-center">
            <p className="text-white font-medium">
              Free 7-day trial • Full access to all features • No credit card required
            </p>
          </div>

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-6 rounded-lg transition">
            Start 7-Day Free Trial
          </button>
        </form>
      </main>
    </div>
  );
}
