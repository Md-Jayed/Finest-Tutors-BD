import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { TeacherRegistrationFormData, Gender } from '../types';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface FormErrors {
  [key: string]: string;
}

export const RegistrationPage: React.FC = () => {
  const { 
    submitTeacherRegistration, 
    clearRecentSubmission 
  } = useRegistration();

  // Form State with initial values
  const [formData, setFormData] = useState<TeacherRegistrationFormData>({
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
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#002B5B]">
                Teacher Registration
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Fill out the form below to register as a tutor on Finest Tutors BD.
              </p>

              {/* Server-Side Error Alert */}
              {serverError && (
                <div id="server-error-alert" className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Submission Error</p>
                    <p className="leading-relaxed">{serverError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Single Continuous Form */}
            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Full Name */}
                <div id="fullName" className="md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.fullName
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* 2. Gender */}
                <div id="gender" className="md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Male', 'Female', 'Other'] as Gender[]).map((genderOption) => {
                      const isSelected = formData.gender === genderOption;
                      return (
                        <label
                          key={genderOption}
                          onClick={() => handleGenderChange(genderOption)}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer font-medium text-sm transition-all ${
                            isSelected
                              ? 'border-[#0072EA] bg-blue-50/70 text-[#005B96] ring-1 ring-[#0072EA]'
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
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.gender}
                    </p>
                  )}
                </div>

                {/* 3. Phone Number */}
                <div id="phoneNumber" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.phoneNumber
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* 4. Guardian Number */}
                <div id="guardianNumber" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Guardian Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="guardianNumber"
                    value={formData.guardianNumber}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.guardianNumber
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.guardianNumber && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.guardianNumber}
                    </p>
                  )}
                </div>

                {/* 5. Email Address */}
                <div id="emailAddress" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.emailAddress
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.emailAddress && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.emailAddress}
                    </p>
                  )}
                </div>

                {/* 6. Facebook Profile Link */}
                <div id="facebookProfileLink" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Facebook Profile Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="facebookProfileLink"
                    value={formData.facebookProfileLink}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.facebookProfileLink
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.facebookProfileLink && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.facebookProfileLink}
                    </p>
                  )}
                </div>

                {/* 7. Living Address */}
                <div id="livingAddress" className="md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Living Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="livingAddress"
                    value={formData.livingAddress}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.livingAddress
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.livingAddress && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.livingAddress}
                    </p>
                  )}
                </div>

                {/* 8. University Name */}
                <div id="universityName" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    University Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="universityName"
                    value={formData.universityName}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.universityName
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.universityName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.universityName}
                    </p>
                  )}
                </div>

                {/* 9. Department */}
                <div id="department" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.department
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.department && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* 10. Academic Year */}
                <div id="academicYear" className="md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    placeholder=""
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                      errors.academicYear
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.academicYear && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.academicYear}
                    </p>
                  )}
                </div>

                {/* 11. Password */}
                <div id="password" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      placeholder=""
                      autoComplete="new-password"
                      className={`w-full px-4 pr-11 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                        errors.password
                          ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* 12. Confirm Password */}
                <div id="confirmPassword" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword || ''}
                      onChange={handleInputChange}
                      placeholder=""
                      autoComplete="new-password"
                      className={`w-full px-4 pr-11 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                        errors.confirmPassword
                          ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-300 focus:border-[#0072EA] focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* 13. University/College ID Card (Required File) */}
                <div id="universityIdCardFile" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    University/College ID Card <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={universityIdRef}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'universityIdCardFile', 'universityIdCardPreview')}
                    className="hidden"
                  />
                  {formData.universityIdCardFile ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {formData.universityIdCardFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {(formData.universityIdCardFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => universityIdRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile('universityIdCardFile', 'universityIdCardPreview')}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => universityIdRef.current?.click()}
                      className={`w-full p-4 rounded-xl border border-dashed text-center flex flex-col items-center justify-center gap-1.5 transition-colors ${
                        errors.universityIdCardFile
                          ? 'border-red-300 bg-red-50/20 text-red-600'
                          : 'border-slate-300 hover:border-[#0072EA] bg-slate-50/60 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-medium">Choose file</span>
                    </button>
                  )}
                  {errors.universityIdCardFile && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.universityIdCardFile}
                    </p>
                  )}
                </div>

                {/* 14. Personal Photo (Required File) */}
                <div id="personalPhotoFile" className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Personal Photo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={photoRef}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'personalPhotoFile', 'personalPhotoPreview')}
                    className="hidden"
                  />
                  {formData.personalPhotoFile && formData.personalPhotoPreview ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-cyan-200 bg-cyan-50/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={formData.personalPhotoPreview}
                          alt="Preview"
                          className="w-10 h-10 rounded-lg object-cover ring-1 ring-cyan-300 shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {formData.personalPhotoFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {(formData.personalPhotoFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => photoRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile('personalPhotoFile', 'personalPhotoPreview')}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => photoRef.current?.click()}
                      className={`w-full p-4 rounded-xl border border-dashed text-center flex flex-col items-center justify-center gap-1.5 transition-colors ${
                        errors.personalPhotoFile
                          ? 'border-red-300 bg-red-50/20 text-red-600'
                          : 'border-slate-300 hover:border-[#0072EA] bg-slate-50/60 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-medium">Choose file</span>
                    </button>
                  )}
                  {errors.personalPhotoFile && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.personalPhotoFile}
                    </p>
                  )}
                </div>

                {/* 15. NID/Birth Certificate (Optional File) */}
                <div id="nidOrBirthCertificateFile" className="md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    NID / Birth Certificate <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    ref={nidRef}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'nidOrBirthCertificateFile', 'nidOrBirthCertificatePreview')}
                    className="hidden"
                  />
                  {formData.nidOrBirthCertificateFile ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-slate-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {formData.nidOrBirthCertificateFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {(formData.nidOrBirthCertificateFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => nidRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile('nidOrBirthCertificateFile', 'nidOrBirthCertificatePreview')}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => nidRef.current?.click()}
                      className="w-full p-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-center flex flex-col items-center justify-center gap-1.5 bg-slate-50/60 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-medium">Choose file</span>
                    </button>
                  )}
                  {errors.nidOrBirthCertificateFile && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.nidOrBirthCertificateFile}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#005B96] via-[#0072EA] to-[#0096C7] hover:from-[#00487C] hover:to-[#0077B6] shadow-md shadow-blue-500/20 transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
