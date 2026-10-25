import React, { useState } from 'react';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Guardian / Student',
    area: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const faqs = [
    {
      q: 'How does Finest Tutors BD verify registered teachers?',
      a: 'During teacher registration, applicants submit their official University/College Student ID card, current academic department details, and optional National ID. Our verification coordinators audit the institutional authenticity before any teacher profile is marked as Approved for public display.',
    },
    {
      q: 'What is the typical honorarium / fee range for tutors in Bangladesh?',
      a: 'Tuition fees vary depending on class level, curriculum (Bangla Medium, English Version, or English Medium), weekly days (e.g. 3 days/week or 4 days/week), and location. Standard honorariums in Dhaka typically range from ৳4,000 to ৳10,000+ BDT per month.',
    },
    {
      q: 'Can guardians request an introductory trial or demo session?',
      a: 'Yes. Once a suitable tutor is matched for your location and subject requirements, an introductory consultation session is scheduled so parents and students can evaluate the teaching style and mutual comfort.',
    },
    {
      q: 'Why are tutor phone numbers and home addresses hidden from the public website?',
      a: 'To guarantee absolute safety for tutors—particularly female university students—and prevent unsolicited contact, all private contact information and residential details remain strictly confidential and are handled only through official Finest Tutors BD coordinators.',
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-cyan-50/70 via-white to-slate-50 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
            Support & Matching Desk
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#002B5B] tracking-tight">
            Contact Finest Tutors BD
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about finding a tutor, our registration review process, or tuition guidelines in Bangladesh? Our team is here to assist you.
          </p>
        </div>
      </section>

      {/* Main Content: Form + Office Details */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact Information Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#0072EA] uppercase tracking-wider">
                Get in Touch
              </span>
              <h2 className="text-2xl font-extrabold text-[#002B5B]">
                We're Here for Bangladeshi Students & Educators
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you need a specialized teacher for HSC Science, Edexcel O-Levels, or primary school foundations, send us a note.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <h4 className="font-bold text-slate-900">Coordination Hub</h4>
                  <p className="text-slate-600">
                    Dhaka, Bangladesh
                  </p>
                  <p className="text-slate-500 text-xs">
                    Serving Dhanmondi, Gulshan, Mirpur, Uttara, Chittagong, and all 64 districts.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005B96] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <h4 className="font-bold text-slate-900">Email Inquiries</h4>
                  <p className="text-slate-600">
                    support@finesttutorsbd.com
                  </p>
                  <p className="text-slate-500 text-xs">
                    Official email for guardian queries & tutor assistance.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <h4 className="font-bold text-slate-900">Operational Hours</h4>
                  <p className="text-slate-600">
                    Saturday – Thursday: 10:00 AM – 8:00 PM
                  </p>
                  <p className="text-slate-500 text-xs">
                    Friday: Closed (Email tickets monitored)
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Safeguard Callout */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-800">Direct Privacy:</strong> All tuition inquiries are processed through our matching coordinator. We never sell your number to unsolicited callers or third-party agencies.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#002B5B]">
                    Message Received (Demo Mode)
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out, {formData.name}! In this frontend demonstration, your inquiry has been simulated and saved to client state.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        role: 'Guardian / Student',
                        area: '',
                        message: '',
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0072EA]"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[#002B5B]">
                      Send a Message to Finest Tutors BD
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fill out the details below and our coordinator will respond promptly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Mahbubur Rahman"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0072EA] focus:outline-none"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Phone Number (BD) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="017XXXXXXXX"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0072EA] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@gmail.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0072EA] focus:outline-none"
                        />
                      </div>

                      {/* Area in BD */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase">
                          Location / Area *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          placeholder="e.g. Dhanmondi, Mirpur, Chittagong"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0072EA] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Inquiry Type */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        I am a...
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0072EA] focus:outline-none bg-white"
                      >
                        <option value="Guardian / Student">Guardian / Student looking for a Tutor</option>
                        <option value="Tutor Applicant">Tutor with questions about registration</option>
                        <option value="General Inquiry">General platform question or collaboration</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase">
                        Your Message / Tuition Requirement *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please describe class level, curriculum (e.g. SSC, HSC, O-Levels), subject needs, and any tutor preferences (e.g. BUET or DU female tutor)..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0072EA] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#005B96] to-[#0072EA] hover:from-[#00487C] hover:to-[#005B96] shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Sending message...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Tuition Inquiry</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Accordion) */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#0072EA] uppercase tracking-wider">
              Answers & Guidance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B5B]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Clear answers regarding tuition arrangements, teacher vetting, and privacy policies.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-[#0072EA] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
