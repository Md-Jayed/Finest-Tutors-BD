import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getTeacherRegistrationByUserId, 
  updateTeacherPermittedFields, 
  getSecureDocumentSignedUrl,
  TeacherRegistrationRecord, 
  PermittedProfileUpdates 
} from '../lib/supabase';
import { 
  GraduationCap, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Image as ImageIcon, 
  LogOut, 
  Edit3, 
  Save, 
  ExternalLink, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const { user, isAdmin, isLoading: isAuthLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState<TeacherRegistrationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<PermittedProfileUpdates>({});

  // Document modal preview state
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [previewModalTitle, setPreviewModalTitle] = useState<string>('');
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);

  // Load teacher registration
  const loadRegistration = useCallback(async (userId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getTeacherRegistrationByUserId(userId);
      setRegistration(data);
      if (data) {
        setFormData({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          guardianNumber: data.guardianNumber,
          livingAddress: data.livingAddress,
          facebookLink: data.facebookLink,
          universityName: data.universityName,
          department: data.department,
          academicYear: data.academicYear,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load teacher registration.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else {
        loadRegistration(user.id);
      }
    }
  }, [user, isAuthLoading, navigate, loadRegistration]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await updateTeacherPermittedFields(user.id, formData);
      if (res.success) {
        setSuccessMessage('Your profile changes have been saved successfully.');
        setIsEditing(false);
        // Reload fresh record from database
        await loadRegistration(user.id);
      } else {
        setErrorMessage(res.message || 'Failed to update profile. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile details.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewDocument = async (
    bucket: 'teacher-documents' | 'teacher-photos',
    filePath: string,
    title: string
  ) => {
    if (!filePath) return;
    setIsLoadingDoc(true);
    setPreviewModalTitle(title);
    try {
      const signedUrl = await getSecureDocumentSignedUrl(bucket, filePath, 300);
      if (signedUrl) {
        setPreviewModalUrl(signedUrl);
      } else {
        setErrorMessage('Unable to generate secure document preview link.');
      }
    } catch {
      setErrorMessage('Could not load secure document preview.');
    } finally {
      setIsLoadingDoc(false);
    }
  };

  if (isAuthLoading || (isLoading && !registration)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#005B96] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-sm font-semibold">Loading your teacher dashboard...</p>
      </div>
    );
  }

  // If user is logged in but hasn't submitted a registration yet
  if (!registration) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-[#005B96] rounded-2xl mx-auto flex items-center justify-center">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002B5B]">
            Welcome to Finest Tutors BD
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            You are signed in as <span className="font-semibold text-slate-800">{user?.email}</span>. No tutor registration was found linked to this account yet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/teacher-registration"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#005B96] to-[#0072EA] hover:shadow-lg transition-all"
          >
            Complete Teacher Registration
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-[#002B5B] bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Open Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#002B5B] to-[#0072EA] text-white flex items-center justify-center text-xl font-extrabold shadow-md shadow-blue-500/20 shrink-0">
              {registration.fullName.charAt(0) || 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#002B5B]">
                  {registration.fullName}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {registration.universityName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{registration.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#005B96] bg-cyan-50 hover:bg-cyan-100 transition-colors"
              >
                Admin Control
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Status Alerts & Notifications */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{successMessage}</div>
          </div>
        )}

        {/* Prominent Verification Status Card */}
        {registration.status === 'pending' && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-amber-900">
                    Application Status: Pending Verification
                  </h2>
                  <p className="text-xs text-amber-800/90">
                    Your 13-field teacher registration and student ID document are queued for administrator review.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                In Review
              </span>
            </div>
            <div className="p-3 bg-white/70 rounded-xl text-xs text-amber-900 leading-relaxed border border-amber-200/50">
              Our academic verification coordinators review applicant student cards and departmental records before publishing tutor profiles to ensure trust for guardians. You will receive access to tuition requests once verified.
            </div>
          </div>
        )}

        {registration.status === 'approved' && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-emerald-950">
                    Application Status: Approved & Verified
                  </h2>
                  <p className="text-xs text-emerald-800/90">
                    Your university student credentials have been confirmed. Your profile is active!
                  </p>
                </div>
              </div>
              <Link
                to="/tutors"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all"
              >
                <span>View Public Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {registration.status === 'rejected' && (
          <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-100 text-rose-800">
                <XCircle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-rose-950">
                  Application Status: Declined / Verification Incomplete
                </h2>
                <p className="text-xs text-rose-800">
                  Your university verification was not approved. Please ensure your profile details match your official student ID, or contact our support team.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Secure Identification Documents (Read-only + Secure Signed URL Preview) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-[#002B5B]">Submitted Documents</h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Stored in encrypted private storage buckets. Accessible only to you and authorized verification administrators.
              </p>

              <div className="space-y-3 pt-2">
                {/* University ID */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#0072EA] shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">University ID Card</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Verified Upload</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePreviewDocument(
                        'teacher-documents',
                        registration.universityIdFilePath,
                        'University ID Card'
                      )
                    }
                    disabled={isLoadingDoc || !registration.universityIdFilePath}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#0072EA] hover:bg-slate-200/60 transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Personal Photo */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">Personal Profile Photo</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Verified Upload</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handlePreviewDocument(
                        'teacher-photos',
                        registration.personalPhotoFilePath,
                        'Personal Profile Photo'
                      )
                    }
                    disabled={isLoadingDoc || !registration.personalPhotoFilePath}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#0072EA] hover:bg-slate-200/60 transition-colors"
                    title="View Photo"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* NID / Birth Certificate */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">NID / Birth Certificate</div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        {registration.nidBirthCertificateFilePath ? 'Submitted (Optional)' : 'Not submitted'}
                      </div>
                    </div>
                  </div>
                  {registration.nidBirthCertificateFilePath && (
                    <button
                      type="button"
                      onClick={() =>
                        handlePreviewDocument(
                          'teacher-documents',
                          registration.nidBirthCertificateFilePath!,
                          'NID / Birth Certificate'
                        )
                      }
                      disabled={isLoadingDoc}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#0072EA] hover:bg-slate-200/60 transition-colors"
                      title="View NID Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Security Guard Notice */}
              <div className="pt-3 text-[11px] text-slate-500 bg-cyan-50/50 p-3 rounded-xl border border-cyan-100 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[#005B96] shrink-0 mt-0.5" />
                <span>
                  For applicant security, document files and verification status cannot be altered directly. Contact support if you need to replace your student ID.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editable Permitted Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#002B5B]">Profile & Academic Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Keep your contact number, address, and academic year up to date.
                  </p>
                </div>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0072EA] bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveChanges} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      disabled={!isEditing}
                      value={formData.fullName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
                    />
                  </div>

                  {/* Gender (Read-only for consistency with ID) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Gender</label>
                    <input
                      type="text"
                      disabled
                      value={registration.gender}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-semibold cursor-not-allowed"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      disabled={!isEditing}
                      value={formData.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
                    />
                  </div>

                  {/* Guardian Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Guardian Contact Number</label>
                    <input
                      type="text"
                      name="guardianNumber"
                      disabled={!isEditing}
                      value={formData.guardianNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address (Account ID)</label>
                    <input
                      type="email"
                      disabled
                      value={registration.email}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-semibold cursor-not-allowed"
                    />
                  </div>

                  {/* Facebook Link */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Facebook Profile Link</label>
                    <input
                      type="url"
                      name="facebookLink"
                      disabled={!isEditing}
                      value={formData.facebookLink || ''}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
                    />
                  </div>

                  {/* University Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">University / College</label>
                    <input
                      type="text"
                      name="universityName"
                      disabled={!isEditing}
                      value={formData.universityName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Department / Discipline</label>
                    <input
                      type="text"
                      name="department"
                      disabled={!isEditing}
                      value={formData.department || ''}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
                    />
                  </div>

                  {/* Academic Year */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Academic Year</label>
                    <input
                      type="text"
                      name="academicYear"
                      disabled={!isEditing}
                      value={formData.academicYear || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. 2nd Year, 3rd Year, Master's"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
                    />
                  </div>

                  {/* Living Address */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Current Living Address</label>
                    <textarea
                      rows={2}
                      name="livingAddress"
                      disabled={!isEditing}
                      value={formData.livingAddress || ''}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#005B96] to-[#0072EA] hover:from-[#00487C] hover:to-[#005B96] shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Document Preview Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">{previewModalTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-50">
              {previewModalUrl.includes('.pdf') ? (
                <iframe
                  src={previewModalUrl}
                  title={previewModalTitle}
                  className="w-full h-[65vh] rounded-xl border border-slate-200"
                />
              ) : (
                <img
                  src={previewModalUrl}
                  alt={previewModalTitle}
                  className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-sm"
                />
              )}
            </div>
            <div className="p-3 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Temporary signed URL expires in 5 minutes</span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="px-4 py-1.5 rounded-lg font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
