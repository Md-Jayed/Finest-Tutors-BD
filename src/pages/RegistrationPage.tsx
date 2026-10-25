import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { TeacherRegistrationFormData, Gender } from '../types';
import { POPULAR_UNIVERSITIES, POPULAR_DEPARTMENTS } from '../data/mockTeachers';
import { 
  User, 
  GraduationCap, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  X, 
  Eye, 
  EyeOff,
  KeyRound,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

interface FormErrors {
  [key: string]: string;
}

export const RegistrationPage: React.FC = () => {
  const { 
    submitTeacherRegistration, 
    isSupabaseConnected,
    recentSubmission, 
    clearRecentSubmission 
  } = useRegistration();

  // Form State with initial values
  const [formData, setFormData] = useState<TeacherRegistrationFormData>({
    // Section A: Personal Information
    fullName: '',
    gender: '',
    phoneNumber: '',
    guardianNumber: '',
    emailAddress: '',
    facebookProfileLink: '',
    livingAddress: '',

    // Teacher Account Authentication Credentials
    password: '',
    confirmPassword: '',

    // Section B: Educational Information
    universityName: '',
    department: '',
    academicYear: '',

    // Section C: Document Uploads
    universityIdCardFile: null,
    nidOrBirthCertificateFile: null,
    personalPhotoFile: null,
    universityIdCardPreview: undefined,
    nidOrBirthCertificatePreview: undefined,
    personalPhotoPreview: undefined,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [successReference, setSuccessReference] = useState('');

  // File input refs for trigger
  const universityIdRef = useRef<HTMLInputElement>(null);
  const nidRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Allowed MIME types
  const ALLOWED_PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_DOC_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  // Field change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field as user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Gender Radio handler
  const handleGenderChange = (gender: Gender) => {
    setFormData((prev) => ({ ...prev, gender }));
    if (errors.gender) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.gender;
        return next;
      });
    }
  };

  // Quick fill helper for University
  const selectQuickUniversity = (uni: string) => {
    setFormData((prev) => ({ ...prev, universityName: uni }));
    if (errors.universityName) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.universityName;
        return next;
      });
    }
  };

  // File upload handlers with local preview
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'universityIdCardFile' | 'nidOrBirthCertificateFile' | 'personalPhotoFile',
    previewKey: 'universityIdCardPreview' | 'nidOrBirthCertificatePreview' | 'personalPhotoPreview'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [fieldKey]: 'File size exceeds 5MB limit. Please choose a smaller file.',
      }));
      return;
    }

    // Check MIME type
    if (fieldKey === 'personalPhotoFile' && !ALLOWED_PHOTO_MIMES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [fieldKey]: 'Personal photo must be an image (JPEG, PNG, or WebP).',
      }));
      return;
    }

    if (
      (fieldKey === 'universityIdCardFile' || fieldKey === 'nidOrBirthCertificateFile') &&
      !ALLOWED_DOC_MIMES.includes(file.type)
    ) {
      setErrors((prev) => ({
        ...prev,
        [fieldKey]: 'Document must be a JPEG, PNG, WebP image or PDF file.',
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      [fieldKey]: file,
      [previewKey]: previewUrl,
    }));

    if (errors[fieldKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }
  };

  const removeFile = (
    fieldKey: 'universityIdCardFile' | 'nidOrBirthCertificateFile' | 'personalPhotoFile',
    previewKey: 'universityIdCardPreview' | 'nidOrBirthCertificatePreview' | 'personalPhotoPreview'
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: null,
      [previewKey]: undefined,
    }));
  };

  // Validation function for all 13 fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Please enter at least 3 characters.';
    }

    // 2. Gender
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender.';
    }

    // 3. Phone Number
    const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
    const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phoneNumber = 'Enter a valid Bangladeshi phone number (e.g. 01712345678 or +8801712345678).';
    }

    // 4. Guardian Number
    const cleanGuardian = formData.guardianNumber.replace(/[\s-]/g, '');
    if (!formData.guardianNumber.trim()) {
      newErrors.guardianNumber = 'Guardian Phone Number is required for safety verification.';
    } else if (!phoneRegex.test(cleanGuardian)) {
      newErrors.guardianNumber = 'Enter a valid Bangladeshi guardian number (e.g. 01812345678).';
    } else if (cleanGuardian === cleanPhone) {
      newErrors.guardianNumber = 'Guardian number cannot be identical to your personal number.';
    }

    // 5. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email Address is required.';
    } else if (!emailRegex.test(formData.emailAddress.trim())) {
      newErrors.emailAddress = 'Please enter a valid email address.';
    }

    // 6. Facebook Profile Link
    const fbRegex = /^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/[A-Za-z0-9_.-]+\/?$/i;
    if (!formData.facebookProfileLink.trim()) {
      newErrors.facebookProfileLink = 'Facebook Profile Link is required for identity authenticity.';
    } else if (!formData.facebookProfileLink.includes('facebook.com') && !formData.facebookProfileLink.includes('fb.com')) {
      newErrors.facebookProfileLink = 'Please enter a valid Facebook profile URL (e.g. https://facebook.com/username).';
    }

    // 7. Living Address
    if (!formData.livingAddress.trim()) {
      newErrors.livingAddress = 'Current Living Address in Bangladesh is required.';
    } else if (formData.livingAddress.trim().length < 8) {
      newErrors.livingAddress = 'Please provide detailed address (Area, Thana, District).';
    }

    // 8. University Name
    if (!formData.universityName.trim()) {
      newErrors.universityName = 'University or College Name is required.';
    }

    // 9. Department
    if (!formData.department.trim()) {
      newErrors.department = 'Department / Discipline is required.';
    }

    // 10. Academic Year
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Academic Year is required (e.g. 1st Year, 2nd Year, 3rd Year, 4th Year, Master’s).';
    }

    // 11. University/College ID Card (Required)
    if (!formData.universityIdCardFile) {
      newErrors.universityIdCardFile = 'University / College ID Card photo or PDF is required.';
    }

    // 12. NID/Birth Certificate (Optional - no validation error needed)

    // 13. Personal Photo (Required)
    if (!formData.personalPhotoFile) {
      newErrors.personalPhotoFile = 'A clear personal profile photo is required for your tutor badge.';
    }

    // Teacher Account Authentication Credentials
    if (!formData.password) {
      newErrors.password = 'Password is required to create your teacher portal account.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirming your password is required.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    // Scroll to first error if any
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstErrorEl = document.getElementById(errorKeys[0]);
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions while request is already processing
    if (isSubmitting) {
      return;
    }

    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitTeacherRegistration(formData);
      if (res.success && res.registrationNumber) {
        setSuccessReference(res.registrationNumber);
        setSubmittedSuccess(true);
        setServerError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setServerError(res.message || 'Registration submission failed. Please check the requirements and try again.');
        const errEl = document.getElementById('server-error-alert');
        if (errEl) {
          errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while submitting your registration.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      gender: '',
      phoneNumber: '',
      guardianNumber: '',
      emailAddress: '',
      facebookProfileLink: '',
      livingAddress: '',
      password: '',
      confirmPassword: '',
      universityName: '',
      department: '',
      academicYear: '',
      universityIdCardFile: null,
      nidOrBirthCertificateFile: null,
      personalPhotoFile: null,
      universityIdCardPreview: undefined,
      nidOrBirthCertificatePreview: undefined,
      personalPhotoPreview: undefined,
    });
    setErrors({});
    setServerError(null);
    setSubmittedSuccess(false);
    clearRecentSubmission();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-cyan-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#005B96] font-semibold">Teacher Registration</span>
        </div>

        {/* Confirmation Screen after Submission */}
        {submittedSuccess ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Application Received Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B5B]">
                Thank You, {formData.fullName}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your application has been received and stored securely. Our verification coordinators will review your university student ID card before activating your approved tutor profile.
              </p>
            </div>

            {/* Reference Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tracking Reference</span>
                <span className="font-mono text-base font-bold text-[#0072EA]">{successReference}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Institution:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">{formData.universityName}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Department & Year:</span>
                <span className="font-semibold text-slate-800">{formData.department} ({formData.academicYear})</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Verification Status:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-amber-800 bg-amber-100 text-[11px] font-bold border border-amber-300">
                  Pending Manual Review
                </span>
              </div>
            </div>

            {/* Privacy & Storage Safeguard Notice Box */}
            <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-950 text-left space-y-2 max-w-lg mx-auto">
              <div className="flex items-center gap-2 font-bold text-cyan-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Private & Encrypted Storage Confirmation</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                Your identification documents and guardian contact numbers are stored in private storage buckets. They are strictly inaccessible to the public internet and will never appear on the public directory.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/teacher/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#005B96] via-[#0072EA] to-[#0096C7] hover:from-[#00487C] hover:to-[#0077B6] shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Go to My Teacher Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Submit Another Registration
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Return to Homepage</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Main Registration Form */
          <div className="space-y-8">
            {/* Header Title & Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/50 rounded-full blur-3xl -z-10" />
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                    Official Teacher Registration — 13 Fields
                  </div>
                  {isSupabaseConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Supabase Cloud Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Backend Edge Function Ready
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#002B5B] tracking-tight">
                  Register as a Tutor on Finest Tutors BD
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  Join Bangladesh's premier network of university tutors. Complete the 13 required fields across personal, educational, and document verification details below.
                </p>
              </div>

              {/* Privacy Safeguard Alert */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-cyan-50/90 border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-[#002B5B]">
                    Strict Privacy & Identity Protection
                  </p>
                  <p className="leading-relaxed text-slate-600">
                    Your phone number, guardian number, living address, and verification ID uploads are strictly confidential. Only your approved academic background, department, and verified tutor badge are published to the public search directory.
                  </p>
                </div>
              </div>

              {/* Server-Side Error Alert Banner */}
              {serverError && (
                <div id="server-error-alert" className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in shake duration-300">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Submission Error</p>
                    <p className="leading-relaxed">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Supabase Environment Advisory (if not configured yet) */}
              {!isSupabaseConnected && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Supabase Environment Notice</p>
                    <p className="text-slate-600 leading-relaxed">
                      To submit live teacher registrations, set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_PUBLISHABLE_KEY</code> in your environment, and deploy the <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">submit-teacher-registration</code> Edge Function.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* SECTION A: Personal Information */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    A
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#002B5B]">
                      Section A: Personal Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      7 fields covering personal identity, contact, and living location
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Field 1: Full Name */}
                  <div id="fullName" className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      1. Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Tanvir Ahmed / Nusrat Jahan"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.fullName
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Field 2: Gender */}
                  <div id="gender" className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Male', 'Female', 'Other'] as Gender[]).map((genderOption) => {
                        const isSelected = formData.gender === genderOption;
                        return (
                          <label
                            key={genderOption}
                            onClick={() => handleGenderChange(genderOption)}
                            className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border cursor-pointer font-semibold text-sm transition-all ${
                              isSelected
                                ? 'border-[#0072EA] bg-cyan-50/80 text-[#005B96] ring-2 ring-cyan-200'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={genderOption}
                              checked={isSelected}
                              onChange={() => handleGenderChange(genderOption)}
                              className="text-[#0072EA] focus:ring-[#0072EA]"
                            />
                            <span>{genderOption}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.gender && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Field 3: Phone Number */}
                  <div id="phoneNumber" className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>3. Phone Number <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Private</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="01712345678"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.phoneNumber
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Standard Bangladeshi format (01XXXXXXXXX)
                    </span>
                    {errors.phoneNumber && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Field 4: Guardian Number */}
                  <div id="guardianNumber" className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>4. Guardian Number <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Private</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </div>
                      <input
                        type="tel"
                        name="guardianNumber"
                        value={formData.guardianNumber}
                        onChange={handleInputChange}
                        placeholder="01812345678"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.guardianNumber
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Parent or guardian emergency contact (verification only)
                    </span>
                    {errors.guardianNumber && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.guardianNumber}
                      </p>
                    )}
                  </div>

                  {/* Field 5: Email Address */}
                  <div id="emailAddress" className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>5. Email Address <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Private</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        placeholder="example@gmail.com"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.emailAddress
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                    </div>
                    {errors.emailAddress && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.emailAddress}
                      </p>
                    )}
                  </div>

                  {/* Field 6: Facebook Profile Link */}
                  <div id="facebookProfileLink" className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>6. Facebook Profile Link <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Identity Audit</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600 font-bold text-sm">
                        fb.
                      </div>
                      <input
                        type="url"
                        name="facebookProfileLink"
                        value={formData.facebookProfileLink}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/your.username"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.facebookProfileLink
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                    </div>
                    {errors.facebookProfileLink && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.facebookProfileLink}
                      </p>
                    )}
                  </div>

                  {/* Field 7: Living Address */}
                  <div id="livingAddress" className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>7. Living Address in Bangladesh <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Private</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="livingAddress"
                        value={formData.livingAddress}
                        onChange={handleInputChange}
                        placeholder="e.g. House 42, Road 7, Dhanmondi, Dhaka 1205"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.livingAddress
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                    </div>
                    {errors.livingAddress && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.livingAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* TEACHER ACCOUNT CREDENTIALS (Authentication Inputs) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-lg font-bold text-[#002B5B]">
                        Teacher Portal Account Credentials
                      </h3>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                        Login Authentication
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Create your login password to access your teacher portal once approved. Password fields are authentication inputs and are never displayed on your public profile.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Field: Password */}
                  <div id="password" className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Create Account Password <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Min. 8 characters</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.password
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Must be at least 8 characters long for account security.
                    </p>
                    {errors.password && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Field: Confirm Password */}
                  <div id="confirmPassword" className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Confirm Account Password <span className="text-red-500">*</span></span>
                      {formData.confirmPassword && formData.password && (
                        <span className={`text-[10px] font-bold ${formData.confirmPassword === formData.password ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {formData.confirmPassword === formData.password ? '✓ Passwords match' : 'Must match'}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword || ''}
                        onChange={handleInputChange}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.confirmPassword
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Re-type your password to verify accuracy.
                    </p>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION B: Educational Information */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-sm">
                    B
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#002B5B]">
                      Section B: Educational Information
                    </h3>
                    <p className="text-xs text-slate-500">
                      3 fields detailing your university, department, and current study year
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Field 8: University Name */}
                  <div id="universityName" className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      8. University Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="universityName"
                      value={formData.universityName}
                      onChange={handleInputChange}
                      placeholder="e.g. BUET, University of Dhaka, BRAC University, etc."
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                        errors.universityName
                          ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                          : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                      }`}
                    />

                    {/* Quick Suggestions Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Quick Select:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {['BUET', 'University of Dhaka (DU)', 'Dhaka Medical College (DMC)', 'BRAC University', 'North South University (NSU)', 'Jahangirnagar University (JU)'].map((uni) => (
                          <button
                            key={uni}
                            type="button"
                            onClick={() => selectQuickUniversity(uni)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-100 hover:text-cyan-800 text-slate-700 transition-colors"
                          >
                            {uni}
                          </button>
                        ))}
                      </div>
                    </div>

                    {errors.universityName && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.universityName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {/* Field 9: Department */}
                    <div id="department" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        9. Department <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="e.g. Computer Science, EEE, MBBS, English, BBA"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.department
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                      {errors.department && (
                        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.department}
                        </p>
                      )}
                    </div>

                    {/* Field 10: Academic Year */}
                    <div id="academicYear" className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        10. Academic Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleInputChange}
                        placeholder="e.g. 1st Year, 2nd Year, 3rd Year, 4th Year, Master’s"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none ${
                          errors.academicYear
                            ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-300'
                            : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100'
                        }`}
                      />
                      {errors.academicYear && (
                        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.academicYear}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: Document Uploads */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    C
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#002B5B]">
                      Section C: Document Uploads
                    </h3>
                    <p className="text-xs text-slate-500">
                      3 upload slots for University ID, National ID/Birth Certificate, and Tutor Photo
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Field 11: University/College ID Card (Required) */}
                  <div id="universityIdCardFile" className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>11. University/College ID Card <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Confidential Verification
                      </span>
                    </label>

                    <input
                      type="file"
                      ref={universityIdRef}
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'universityIdCardFile', 'universityIdCardPreview')}
                      className="hidden"
                    />

                    {formData.universityIdCardFile ? (
                      <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {formData.universityIdCardFile.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {(formData.universityIdCardFile.size / 1024).toFixed(1)} KB • Ready for review
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => universityIdRef.current?.click()}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile('universityIdCardFile', 'universityIdCardPreview')}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => universityIdRef.current?.click()}
                        className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer text-center space-y-2 transition-all ${
                          errors.universityIdCardFile
                            ? 'border-red-300 bg-red-50/20 hover:bg-red-50/40'
                            : 'border-slate-300 hover:border-[#0072EA] bg-slate-50/50 hover:bg-cyan-50/30'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0072EA] mx-auto flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          Click to upload University / College ID card
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Supports JPG, PNG, PDF up to 5MB (Kept strictly private)
                        </p>
                      </div>
                    )}

                    {errors.universityIdCardFile && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.universityIdCardFile}
                      </p>
                    )}
                  </div>

                  {/* Field 12: NID/Birth Certificate (Optional) */}
                  <div id="nidOrBirthCertificateFile" className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>12. NID / Birth Certificate <span className="text-slate-400 font-normal">(Optional)</span></span>
                      <span className="text-[10px] text-slate-500 font-normal">Optional document</span>
                    </label>

                    <input
                      type="file"
                      ref={nidRef}
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'nidOrBirthCertificateFile', 'nidOrBirthCertificatePreview')}
                      className="hidden"
                    />

                    {formData.nidOrBirthCertificateFile ? (
                      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {formData.nidOrBirthCertificateFile.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {(formData.nidOrBirthCertificateFile.size / 1024).toFixed(1)} KB • Optional attached
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => nidRef.current?.click()}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile('nidOrBirthCertificateFile', 'nidOrBirthCertificatePreview')}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => nidRef.current?.click()}
                        className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 cursor-pointer text-center space-y-1.5 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-600">
                          Upload NID or Birth Certificate (Optional)
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Accelerates verification tier (Kept strictly private)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Field 13: Personal Photo (Required) */}
                  <div id="personalPhotoFile" className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>13. Personal Photo <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Tutor Profile Badge
                      </span>
                    </label>

                    <input
                      type="file"
                      ref={photoRef}
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'personalPhotoFile', 'personalPhotoPreview')}
                      className="hidden"
                    />

                    {formData.personalPhotoFile && formData.personalPhotoPreview ? (
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-cyan-200 bg-cyan-50/30">
                        <img
                          src={formData.personalPhotoPreview}
                          alt="Personal Photo Preview"
                          className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#0072EA]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {formData.personalPhotoFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {(formData.personalPhotoFile.size / 1024).toFixed(1)} KB • Image Preview Ready
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => photoRef.current?.click()}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile('personalPhotoFile', 'personalPhotoPreview')}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => photoRef.current?.click()}
                        className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer text-center space-y-2 transition-all ${
                          errors.personalPhotoFile
                            ? 'border-red-300 bg-red-50/20 hover:bg-red-50/40'
                            : 'border-slate-300 hover:border-[#0072EA] bg-slate-50/50 hover:bg-cyan-50/30'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          Click to upload your professional personal photo
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Clear frontal face portrait (Will appear on approved tutor profile)
                        </p>
                      </div>
                    )}

                    {errors.personalPhotoFile && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.personalPhotoFile}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submission Notice & Submit Button */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start gap-3 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    By submitting this form, you acknowledge that Finest Tutors BD reviews all academic credentials manually. Registration does not automatically guarantee tuition assignments or immediate approval. All private documents are protected.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">13 Fields + Account Credentials:</span> Verified & Protected
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-[#005B96] via-[#0072EA] to-[#0096C7] hover:from-[#00487C] hover:to-[#0077B6] shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Processing Registration...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Registration for Review</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
