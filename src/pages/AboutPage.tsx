import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  HeartHandshake, 
  Target, 
  BookOpen, 
  Users, 
  UserPlus, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock,
  Building
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-cyan-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
            About Finest Tutors BD
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#002B5B] tracking-tight">
            Empowering Education Across Bangladesh
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Finest Tutors BD was founded with a singular purpose: to bring dignity, transparency, and academic excellence to tuition networking in Bangladesh.
          </p>
        </div>
      </section>

      {/* Mission & Story */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#0072EA] uppercase tracking-wider">
              Our Story & Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B5B]">
              Bridging University Scholars with Aspiring Learners
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              In Bangladesh, private tuition is not merely supplementary education—it is a vital bridge that shapes university admission success, board examination performance, and academic self-confidence.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Yet, guardians often struggle to find trustworthy, verified mentors, while university students face informal, unregulated matchmaking with zero safety or confidentiality. Finest Tutors BD was created to solve both challenges through a structured, respectful platform.
            </p>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-[#002B5B] flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-600" />
              Our Core Mission
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              To cultivate an organized, merit-driven academic ecosystem where every Bangladeshi student receives personalized guidance, and university tutors are recognized and rewarded fairly.
            </p>
            <div className="pt-2 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified university credentials (BUET, DU, Medical, Top Private)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Protection for female tutors and family environments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Clear curriculum specialization (Bangla, English Version & Medium)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Guiding Values */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xs font-bold text-[#0072EA] uppercase tracking-wider">
              What Defines Us
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#002B5B]">
              Our Operating Values
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005B96] flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Academic Merit</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We prioritize strong subject fundamentals, problem-solving skills, and pedagogical patience over marketing hype.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Uncompromising Privacy</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tutor and student safety is paramount. Contact numbers and living addresses are shielded from public exposure.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Fair Honorarium</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Respecting tutors' time with clear, market-aligned remuneration in Bangladeshi Taka (BDT ৳).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">National Reach</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connecting students in Dhaka metropolitan areas as well as regional districts via verified online tutoring.
              </p>
            </div>
          </div>
        </div>

        {/* Commitment to Safety & Dignity */}
        <div className="bg-gradient-to-r from-blue-900 via-[#002B5B] to-[#005B96] rounded-3xl p-8 sm:p-12 text-white space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Guardian & Tutor Trust Code
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Safety, Verification & Ethical Conduct
            </h3>
            <p className="text-sm text-cyan-100 leading-relaxed">
              Every tutor application goes through verification of their university student identity card and academic profile. We never distribute teacher data or guardian contact information to unsolicited third parties.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <Link
              to="/teacher-registration"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-[#002B5B] bg-white hover:bg-cyan-50 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#0072EA]" />
              <span>Apply to Join as a Tutor</span>
            </Link>

            <Link
              to="/tutors"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Approved Profiles</span>
              <ArrowRight className="w-4 h-4 text-cyan-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
