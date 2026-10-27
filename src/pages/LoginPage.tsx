import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  UserCheck, 
  GraduationCap 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, isAdmin, isLoading: isAuthLoading, isConfigured, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (!isAuthLoading && user) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/teacher/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, isAuthLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(cleanEmail, password);

      if (result.success) {
        // Redirect securely based on verified server check
        if (result.isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          // If navigated from a protected page, check state
          const from = (location.state as any)?.from?.pathname || '/teacher/dashboard';
          navigate(from, { replace: true });
        }
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during sign-in.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block transition-transform hover:scale-102">
            <Logo size="lg" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002B5B] tracking-tight">
            Portal Sign In
          </h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Access your Teacher Application Dashboard or Administrator Control Center.
          </p>
        </div>

        {/* Supabase connection alert if unconfigured */}
        {!isConfigured && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Configuration Required: </span>
              Please set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_PUBLISHABLE_KEY</code> in your environment to enable authentication.
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu.bd"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072EA] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your portal password"
                  className="block w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072EA] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isConfigured}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#005B96] via-[#0072EA] to-[#0096C7] hover:from-[#00487C] hover:to-[#0077B6] shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Role Access Information */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50">
              <GraduationCap className="w-4 h-4 text-[#005B96] shrink-0" />
              <span>Teachers: Track status & update profile</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Admins: Verify docs & approve tutors</span>
            </div>
          </div>
        </div>

        {/* Teacher Registration Link */}
        <div className="text-center text-sm text-slate-600">
          <span>Are you a university student looking for tuitions? </span>
          <Link
            to="/teacher-registration"
            className="font-bold text-[#0072EA] hover:text-[#005B96] transition-colors inline-flex items-center gap-1"
          >
            <span>Register as a Teacher</span>
            <UserCheck className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
