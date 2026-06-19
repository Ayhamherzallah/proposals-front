'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[46%] bg-gradient-to-br from-[#252E5D] to-[#0230F5] text-white flex-col justify-between p-12">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/slides/logo_white_top.png"
            alt="Clicks Digitals"
            className="h-10 object-contain mb-16"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold tracking-tight mb-4">Proposal Studio</h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">
            Create, edit, and deliver client-ready proposals for the MENA market.
          </p>
        </div>
        <p className="text-xs text-white/40">© Clicks Digitals · Internal use only</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-10">
            <p className="text-xl font-bold text-[#252E5D]">Clicks Digitals</p>
            <p className="text-sm text-[#64748b] mt-1">Proposal Studio</p>
          </div>

          <h2 className="text-2xl font-bold text-[#1e293b] mb-1">Sign in</h2>
          <p className="text-sm text-[#64748b] mb-8">Enter your credentials to continue</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#334155] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#d8dee8] bg-white text-[#1e293b] text-sm outline-none focus:border-[#0230F5] focus:ring-2 focus:ring-[#0230F5]/10 transition-shadow"
                placeholder="you@clicksdigitals.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#334155] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-[#d8dee8] bg-white text-[#1e293b] text-sm outline-none focus:border-[#0230F5] focus:ring-2 focus:ring-[#0230F5]/10 transition-shadow"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#252E5D] hover:bg-[#1e2860] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
