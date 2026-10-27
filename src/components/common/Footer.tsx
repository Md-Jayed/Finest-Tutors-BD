import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone,
  Clock, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001D3D] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & Bio (2 cols wide on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="lg" lightText={true} />
            </Link>
            
            <p className="text-sm text-slate-300/90 leading-relaxed max-w-sm">
              Finest Tutors BD connects students and families across Bangladesh with qualified university mentors and seasoned educators. Dedicated to academic excellence, safety, and personalized learning.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                BUET • DU • DMC • BRAC • NSU
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Strict Privacy Enforced
              </span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-cyan-500" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tutors" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-cyan-500" />
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-cyan-500" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-cyan-500" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Teachers & Tutors */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">For Teachers</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  to="/teacher-registration" 
                  className="text-cyan-300 font-semibold hover:text-cyan-200 transition-colors flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                  Teacher Registration
                </Link>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Verification Guidelines
                </span>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Tuition Safety Code
                </span>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Student Mentorship Standards
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Platform Hub</h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Azimpur-1205,Dhaka, Bangladesh<br /><span className="text-slate-400 text-[11px]">(Serving all 64 districts & Online)</span></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="tel:01356542184" className="hover:text-cyan-300 font-medium transition-colors">
                  01356-542184
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>support@finesttutorsbd.com</span>
              </li>
              
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Privacy Assurance */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Finest Tutors BD. All rights reserved. Made for Bangladesh education.</p>
          
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Registration</span>
            <span>•</span>
            <span className="text-emerald-400">Identity Protection Guaranteed</span>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Data & Privacy Notice:</strong> Finest Tutors BD strictly protects the personal data of all registered teachers. Guardian contact numbers, residential addresses, personal phone numbers, and identity document uploads are kept private and never exposed to the public web. Public profiles only display verified university credentials and academic specialties.
        </div>
      </div>
    </footer>
  );
};
