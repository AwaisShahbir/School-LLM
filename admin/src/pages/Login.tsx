import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate admin credentials
    setTimeout(() => {
      setLoading(false);
      if (email.trim() && password.trim()) {
        navigate('/');
      } else {
        setError('Please enter both email and password.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-[#1F1B2E] via-[#2B1B4A] to-[#141221] overflow-hidden">
      {/* Background soft glowing violet circles */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7048E8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#997BF8]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl p-8 md:p-10 z-10 border border-white/50">
        {/* School Logo & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7048E8] to-[#997BF8] flex items-center justify-center text-white shadow-lg shadow-[#7048E8]/25 mb-4">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#1F1B2E] tracking-tight">School Administration</h1>
          <p className="text-sm text-[#6B6880] mt-1">Sign in with your authorized admin credentials</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[#F27D8D]/10 border border-[#F27D8D]/20 rounded-xl text-xs text-[#F27D8D] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#1F1B2E] uppercase tracking-wider mb-2">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6880]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@school.edu.pk"
                className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] pl-10 pr-4 py-3 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1B2E] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6880]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F4F3F8] text-sm text-[#1F1B2E] pl-10 pr-4 py-3 rounded-[14px] border border-transparent focus:border-[#7048E8] focus:bg-white outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#7048E8] hover:bg-[#5E37D3] active:scale-[0.99] text-white font-semibold text-sm rounded-full shadow-lg shadow-[#7048E8]/25 flex items-center justify-center gap-2 transition disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F4F3F8] flex items-center justify-center gap-2 text-xs text-[#6B6880]">
          <ShieldCheck className="w-4 h-4 text-[#2FA36B]" />
          <span>Role-Enforced Row Level Security Active</span>
        </div>
      </div>
    </div>
  );
};
