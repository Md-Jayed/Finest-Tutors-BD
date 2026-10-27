import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  PhoneCall, 
  BookOpen, 
  Info, 
  MessageSquareQuote,
  Lock,
  GraduationCap
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/', icon: BookOpen },
    { name: 'Find Tutors', path: '/tutors', icon: Search },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: MessageSquareQuote },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-[#002B5B] via-[#005B96] to-[#0077B6] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Bangladesh
            </span>
            <span className="hidden sm:inline text-slate-200">
              Connecting university mentors with families across Dhaka, Chittagong & all 64 districts.
            </span>
            <span className="sm:hidden text-slate-200 truncate">
              Tuition Platform in Bangladesh
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-200 text-[11px]">
            <a 
              href="tel:01356542184" 
              className="flex items-center gap-1.5 text-cyan-200 hover:text-white transition-colors font-semibold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-300" />
              <span>01356-542184</span>
            </a>
            <span className="hidden md:flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified University Profiles
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group transition-opacity hover:opacity-95"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    active
                      ? 'text-[#005B96] bg-cyan-50/80 font-bold border-b-2 border-[#0072EA]'
                      : 'text-slate-600 hover:text-[#002B5B] hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              to="/tutors"
              className="text-slate-600 hover:text-[#002B5B] px-3 py-2 text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4 text-cyan-600" />
              <span>Explore Tutors</span>
            </Link>

            {/* User portal button or Login button */}
            {user ? (
              isAdmin ? (
                <Link
                  to="/admin"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admin Portal</span>
                </Link>
              ) : (
                <Link
                  to="/teacher/dashboard"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#005B96] bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 transition-colors flex items-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4 text-[#0072EA]" />
                  <span>Teacher Portal</span>
                </Link>
              )
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#002B5B] hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Portal Login</span>
              </Link>
            )}

            <Link
              to="/teacher-registration"
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#005B96] via-[#0072EA] to-[#0096C7] hover:from-[#00487C] hover:to-[#0077B6] shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserPlus className="w-4 h-4 text-cyan-200" />
              <span>Register as a Teacher</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user ? (
              <Link
                to={isAdmin ? '/admin' : '/teacher/dashboard'}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#005B96]"
              >
                Portal
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100"
              >
                Login
              </Link>
            )}
            <Link
              to="/teacher-registration"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0072EA]"
            >
              Register
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                    active
                      ? 'bg-cyan-50 text-[#005B96] font-bold border-l-4 border-[#0072EA]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-cyan-600" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Portal Link */}
            {user ? (
              <Link
                to={isAdmin ? '/admin' : '/teacher/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold bg-cyan-50 text-[#005B96]"
              >
                {isAdmin ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <GraduationCap className="w-5 h-5 text-[#0072EA]" />}
                <span>{isAdmin ? 'Admin Control Center' : 'My Teacher Portal'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Lock className="w-5 h-5 text-slate-500" />
                <span>Portal Sign In</span>
              </Link>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <a
                href="tel:01356542184"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#005B96] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-cyan-600" />
                <span>Helpline: 01356-542184</span>
              </a>

              <Link
                to="/teacher-registration"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#005B96] to-[#0096C7] shadow-md shadow-blue-500/20 text-center"
              >
                <UserPlus className="w-5 h-5 text-cyan-200" />
                <span>Register as a Teacher (Free)</span>
              </Link>
              
              <p className="text-center text-xs text-slate-500 pt-1">
                For Bangladeshi University Students & Experienced Tutors
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
