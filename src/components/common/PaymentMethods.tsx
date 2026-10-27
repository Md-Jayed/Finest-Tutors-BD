import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';

interface PaymentMethodsProps {
  className?: string;
  showHeader?: boolean;
  centeredTitle?: boolean;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  className = '',
  showHeader = true,
  centeredTitle = false,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const paymentNumber = '01356-542184';
  const cleanNumber = '01356542184';

  const handleCopy = (index: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(paymentNumber);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const methods = [
    {
      id: 'bkash',
      name: 'bKash',
      type: 'Personal',
      logo: '/assets/aistudio/bkash_4cec4bc3.png',
      logoAlt: 'bKash Mobile Banking',
      color: '#e2136e',
      instruction: 'Send money to this number',
    },
    {
      id: 'nagad',
      name: 'Nagad',
      type: 'Personal',
      logo: '/assets/aistudio/nagad_fa6c4b2e.png',
      logoAlt: 'Nagad Mobile Banking',
      color: '#f7941d',
      instruction: 'Send money to this number',
    },
    {
      id: 'rocket',
      name: 'Rocket',
      type: 'DBBL Mobile Banking',
      logo: '/assets/aistudio/rocket_13ecbfe6.png',
      logoAlt: 'Rocket DBBL Mobile Banking',
      color: '#8c3494',
      instruction: 'Send money to this number',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className={`space-y-1 ${centeredTitle ? 'text-center' : 'text-left'}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#002B5B] tracking-tight">
            Payment Methods
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Official mobile financial channels for Finest Tutors BD
          </p>
        </div>
      )}

      {/* 3 Payment Method Cards exactly styled as requested */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method, index) => {
          const isCopied = copiedIndex === index;

          return (
            <div
              key={method.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Top Section: Logo + Name + Account Type + Phone Number */}
              <div className="p-5 sm:p-6 flex items-center gap-4 sm:gap-6 min-h-[110px]">
                {/* Brand Logo Container */}
                <div className="w-24 sm:w-28 flex items-center justify-center shrink-0">
                  <img
                    src={method.logo}
                    alt={method.logoAlt}
                    className="max-h-12 sm:max-h-14 w-auto object-contain transition-transform duration-200 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Account Info Details (Left-aligned as in screenshot) */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {method.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-tight">
                    {method.type}
                  </p>
                  <div className="pt-0.5">
                    <span className="font-bold text-base sm:text-lg text-slate-900 font-mono tracking-tight block">
                      {paymentNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Instruction Bar */}
              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-slate-500">
                  {method.instruction}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(index)}
                  title="Copy number"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    isCopied
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Verification Guarantee */}
      <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-100 flex items-center gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-[#0072EA] shrink-0" />
        <span>
          <strong className="text-slate-800">Security Notice:</strong> Always confirm the official number <strong className="text-[#0072EA] font-mono font-bold">01356-542184</strong> before completing any transaction. Finest Tutors BD never asks for payments to unlisted personal accounts.
        </span>
      </div>
    </div>
  );
};
