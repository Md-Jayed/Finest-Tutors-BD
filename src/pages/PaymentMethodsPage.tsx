import React from 'react';
import { Link } from 'react-router-dom';
import { PaymentMethods } from '../components/common/PaymentMethods';
import { 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  PhoneCall, 
  ArrowRight,
  AlertCircle,
  CreditCard
} from 'lucide-react';

export const PaymentMethodsPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-cyan-50/70 via-white to-slate-50 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-[#005B96] border border-cyan-200">
            <CreditCard className="w-3.5 h-3.5 text-[#0072EA]" />
            Official Accounts & Verification
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#002B5B] tracking-tight">
            Official Payment Methods
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Verify official mobile financial accounts for Finest Tutors BD. All payments, matching charges, and honorarium deposits must only be sent to our verified number.
          </p>
        </div>
      </section>

      {/* Main Payment Methods Display */}
      <section className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* The Exact 3 Payment Cards (bKash, Nagad, Rocket) */}
        <PaymentMethods showHeader={true} />

        {/* Step-by-Step Payment Instructions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[#002B5B]">
              How to Send Money via Mobile Banking
            </h3>
            <p className="text-sm text-slate-600">
              Follow these simple steps from your mobile banking app or USSD menu:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0072EA] font-extrabold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Select "Send Money"</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open your bKash, Nagad, or Rocket app, or dial *247# (bKash) / *167# (Nagad) / *322# (Rocket). Choose the <strong>Send Money</strong> option.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 font-extrabold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Enter Official Number</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Input recipient number <strong className="text-slate-900 font-mono">01356-542184</strong> (or 01356542184) and your specified tuition/service amount.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Keep TrxID for Confirmation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your secret PIN to confirm. Save the SMS Transaction ID (TrxID) or screenshot and share it with your coordination manager.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Anti-Fraud Notice */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Finest Tutors BD Safety Guarantee
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To protect guardians, students, and tutors from fraud, Finest Tutors BD operates <strong>only one unified official number</strong> (<span className="text-cyan-300 font-mono font-bold">01356-542184</span>) across bKash, Nagad, and Rocket Personal accounts.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No other personal numbers are authorized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant payment verification upon receipt</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official receipts issued for tuition security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated helpline available for questions</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <a
              href="tel:01356542184"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-[#002B5B] bg-cyan-400 hover:bg-cyan-300 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Helpline: 01356-542184</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
            >
              <span>Contact Matching Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
