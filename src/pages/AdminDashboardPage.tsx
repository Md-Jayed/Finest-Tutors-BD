import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRegistration } from '../context/RegistrationContext';
import { 
  getAllTeacherRegistrations, 
  getSecureDocumentSignedUrl,
  getSecureDocumentDownloadUrl,
  approveTeacherRegistration,
  rejectTeacherRegistration,
  TeacherRegistrationRecord, 
  PublishTeacherOptions 
} from '../lib/supabase';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Image as ImageIcon, 
  LogOut, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Check, 
  AlertTriangle,
  GraduationCap,
  Users,
  Download,
  Copy,
  Calendar,
  Building2,
  BookOpen,
  UserCheck,
  Hash,
  User
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, isLoading: isAuthLoading, signOut } = useAuth();
  const { refreshApprovedTeachers } = useRegistration();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState<TeacherRegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & search
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Complete Application Details Modal State
  const [selectedApplication, setSelectedApplication] = useState<TeacherRegistrationRecord | null>(null);
  const [docSignedUrls, setDocSignedUrls] = useState<{
    uniIdUrl: string | null;
    uniIdDownloadUrl: string | null;
    photoUrl: string | null;
    photoDownloadUrl: string | null;
    nidUrl: string | null;
    nidDownloadUrl: string | null;
  }>({
    uniIdUrl: null,
    uniIdDownloadUrl: null,
    photoUrl: null,
    photoDownloadUrl: null,
    nidUrl: null,
    nidDownloadUrl: null,
  });
  const [isLoadingSignedUrls, setIsLoadingSignedUrls] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Approval Modal State
  const [approvalModalReg, setApprovalModalReg] = useState<TeacherRegistrationRecord | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Load all registrations
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAllTeacherRegistrations();
      setRegistrations(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load teacher applications.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (isAdmin) {
        loadData();
      }
    }
  }, [user, isAdmin, isAuthLoading, navigate, loadData]);

  // Open Complete Application Details Modal & fetch signed preview and download URLs
  const handleOpenDetailsModal = async (reg: TeacherRegistrationRecord) => {
    setSelectedApplication(reg);
    setIsLoadingSignedUrls(true);
    setDocSignedUrls({
      uniIdUrl: null,
      uniIdDownloadUrl: null,
      photoUrl: null,
      photoDownloadUrl: null,
      nidUrl: null,
      nidDownloadUrl: null,
    });

    try {
      const cleanName = (reg.fullName || 'teacher').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const [uniUrl, uniDownloadUrl, photoUrl, photoDownloadUrl, nidUrl, nidDownloadUrl] = await Promise.all([
        reg.universityIdFilePath
          ? getSecureDocumentSignedUrl('teacher-documents', reg.universityIdFilePath, 600)
          : Promise.resolve(null),
        reg.universityIdFilePath
          ? getSecureDocumentDownloadUrl('teacher-documents', reg.universityIdFilePath, `university-id-${cleanName}`, 600)
          : Promise.resolve(null),
        reg.personalPhotoFilePath
          ? getSecureDocumentSignedUrl('teacher-photos', reg.personalPhotoFilePath, 600)
          : Promise.resolve(null),
        reg.personalPhotoFilePath
          ? getSecureDocumentDownloadUrl('teacher-photos', reg.personalPhotoFilePath, `personal-photo-${cleanName}`, 600)
          : Promise.resolve(null),
        reg.nidBirthCertificateFilePath
          ? getSecureDocumentSignedUrl('teacher-documents', reg.nidBirthCertificateFilePath, 600)
          : Promise.resolve(null),
        reg.nidBirthCertificateFilePath
          ? getSecureDocumentDownloadUrl('teacher-documents', reg.nidBirthCertificateFilePath, `nid-document-${cleanName}`, 600)
          : Promise.resolve(null),
      ]);

      setDocSignedUrls({
        uniIdUrl: uniUrl,
        uniIdDownloadUrl: uniDownloadUrl,
        photoUrl,
        photoDownloadUrl,
        nidUrl,
        nidDownloadUrl,
      });
    } catch {
      setErrorMessage('Failed to generate temporary signed URLs for documents.');
    } finally {
      setIsLoadingSignedUrls(false);
    }
  };

  // Open Approval Modal
  const handleOpenApprovalModal = (reg: TeacherRegistrationRecord) => {
    setApprovalModalReg(reg);
  };

  // Submit Approval
  const handleConfirmApproval = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!approvalModalReg) return;

    setIsProcessingAction(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const opts: PublishTeacherOptions = {
      registrationId: approvalModalReg.id,
      registrationRecord: approvalModalReg,
      bio: undefined,
      experienceYears: undefined,
      subjects: [],
      preferredClasses: [],
      mediums: [],
      preferredLocations: [],
      expectedSalaryBdt: undefined,
    };

    try {
      const res = await approveTeacherRegistration(opts);
      if (res.success) {
        setSuccessMessage(`Tutor ${approvalModalReg.fullName} has been approved and published.`);
        setApprovalModalReg(null);
        await loadData();
        await refreshApprovedTeachers();
      } else {
        setErrorMessage(res.message || 'Approval failed. Please check RLS permissions.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error approving registration.';
      setErrorMessage(msg);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Submit Rejection
  const handleReject = async (reg: TeacherRegistrationRecord) => {
    if (!confirm(`Are you sure you want to mark the application for "${reg.fullName}" as Rejected?`)) {
      return;
    }

    setIsProcessingAction(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await rejectTeacherRegistration(reg.id, 'Declined during administrator verification review.');
      if (res.success) {
        setSuccessMessage(`Application for ${reg.fullName} marked as rejected.`);
        await loadData();
        await refreshApprovedTeachers();
      } else {
        setErrorMessage(res.message || 'Failed to reject registration.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error rejecting registration.';
      setErrorMessage(msg);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Guard: If not admin
  if (!isAuthLoading && user && !isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-[#002B5B]">Access Denied</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your account (<span className="font-semibold text-slate-800">{user.email}</span>) does not have administrator privileges.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 text-left border border-slate-200">
            Administrator authorization is strictly managed through the database <code className="font-mono text-cyan-800">app_admins</code> table and verified by PostgreSQL security policies.
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/teacher/dashboard"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#005B96] to-[#0072EA] hover:shadow-md transition-all text-center"
            >
              Go to Teacher Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    if (statusFilter !== 'all' && reg.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = reg.fullName.toLowerCase().includes(q);
      const matchEmail = reg.email.toLowerCase().includes(q);
      const matchPhone = reg.phoneNumber.includes(q);
      const matchUni = reg.universityName.toLowerCase().includes(q);
      const matchDept = reg.department.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchUni || matchDept;
    }
    return true;
  });

  const countPending = registrations.filter((r) => r.status === 'pending').length;
  const countApproved = registrations.filter((r) => r.status === 'approved').length;
  const countRejected = registrations.filter((r) => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#002B5B] to-[#0072EA] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#002B5B]">
                  Administrator Control Center
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Verified Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review submitted university student cards, verify applicant authenticity, and publish approved tutor profiles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/teacher/dashboard"
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#005B96] bg-cyan-50 hover:bg-cyan-100 transition-colors"
            >
              Teacher View
            </Link>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{successMessage}</div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</div>
              <div className="text-2xl font-extrabold text-[#002B5B] mt-1">{registrations.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0072EA] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Review</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">{countPending}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved Tutors</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{countApproved}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Rejected</div>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">{countRejected}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-[#002B5B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({registrations.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Pending ({countPending})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Approved ({countApproved})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Rejected ({countRejected})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by name, phone, email, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072EA]"
            />
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#005B96] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No applications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No teacher registration records match the current status filter or search query.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002B5B] to-[#005B96] text-white flex items-center justify-center font-bold text-lg shrink-0">
                      {reg.fullName.charAt(0) || 'T'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{reg.fullName}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {reg.gender}
                        </span>
                        {reg.teacherCode && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-50 text-[#005B96] border border-cyan-200">
                            <span className="font-sans font-semibold text-slate-500 uppercase text-[10px]">Teacher ID:</span>
                            <span>{reg.teacherCode}</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="font-semibold text-slate-700">{reg.universityName}</span>
                        <span>•</span>
                        <span>{reg.department} ({reg.academicYear})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {reg.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review
                      </span>
                    )}
                    {reg.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved
                      </span>
                    )}
                    {reg.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-2xl">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Phone</span>
                    <a href={`tel:${reg.phoneNumber}`} className="font-mono font-semibold text-[#0072EA] hover:underline">
                      {reg.phoneNumber}
                    </a>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Guardian Phone</span>
                    <span className="font-mono font-semibold text-slate-700">{reg.guardianNumber}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Email</span>
                    <span className="truncate block font-semibold text-slate-700" title={reg.email}>
                      {reg.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Facebook</span>
                    {reg.facebookLink ? (
                      <a
                        href={reg.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0072EA] hover:underline flex items-center gap-1 font-semibold truncate"
                      >
                        <span>Profile Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4 border-t border-slate-200/50 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Living Address</span>
                    <span className="text-slate-800">{reg.livingAddress}</span>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  {/* View Details Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenDetailsModal(reg)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0072EA] hover:bg-[#005B96] shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-cyan-200" />
                    <span>View Details</span>
                  </button>

                  {/* Approval / Rejection Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {reg.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleReject(reg)}
                        disabled={isProcessingAction}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    )}

                    {reg.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleOpenApprovalModal(reg)}
                        disabled={isProcessingAction}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:px-8 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002B5B] to-[#0072EA] text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
                  {selectedApplication.fullName.charAt(0) || 'T'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {selectedApplication.fullName}
                    </h3>
                    {selectedApplication.teacherCode && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#005B96] text-white">
                        <span className="font-sans font-normal text-cyan-200">Teacher ID:</span>
                        <span>{selectedApplication.teacherCode}</span>
                      </span>
                    )}
                    {selectedApplication.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        Pending Review
                      </span>
                    )}
                    {selectedApplication.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Approved
                      </span>
                    )}
                    {selectedApplication.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                        Rejected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedApplication.universityName} • {selectedApplication.department} ({selectedApplication.academicYear})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable content displaying all 4 sections */}
            <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-8">
              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <User className="w-4 h-4 text-[#0072EA]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Personal Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Full Name
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {selectedApplication.fullName || '—'}
                    </span>
                  </div>

                  {/* Gender */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Gender
                    </span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                      {selectedApplication.gender || 'Not specified'}
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Phone Number
                      </span>
                      <a
                        href={`tel:${selectedApplication.phoneNumber}`}
                        className="text-sm font-bold font-mono text-[#0072EA] hover:underline mt-0.5 block truncate"
                      >
                        {selectedApplication.phoneNumber || '—'}
                      </a>
                    </div>
                    {selectedApplication.phoneNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedApplication.phoneNumber, 'phone')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
                        title="Copy Phone Number"
                      >
                        {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Guardian Number */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Guardian Number
                      </span>
                      <a
                        href={`tel:${selectedApplication.guardianNumber}`}
                        className="text-sm font-bold font-mono text-slate-800 hover:text-[#0072EA] hover:underline mt-0.5 block truncate"
                      >
                        {selectedApplication.guardianNumber || '—'}
                      </a>
                    </div>
                    {selectedApplication.guardianNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedApplication.guardianNumber, 'guardian')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
                        title="Copy Guardian Number"
                      >
                        {copiedField === 'guardian' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Email Address
                      </span>
                      <a
                        href={`mailto:${selectedApplication.email}`}
                        className="text-sm font-semibold text-[#0072EA] hover:underline mt-0.5 block truncate"
                        title={selectedApplication.email}
                      >
                        {selectedApplication.email || '—'}
                      </a>
                    </div>
                    {selectedApplication.email && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedApplication.email, 'email')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
                        title="Copy Email Address"
                      >
                        {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Facebook Profile Link */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Facebook Profile Link
                    </span>
                    {selectedApplication.facebookLink ? (
                      <a
                        href={selectedApplication.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#0072EA] hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                      >
                        <span className="truncate">{selectedApplication.facebookLink}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400 mt-0.5 block">Not provided</span>
                    )}
                  </div>

                  {/* Living Address */}
                  <div className="sm:col-span-2 lg:col-span-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Living Address
                      </span>
                      <p className="text-sm font-medium text-slate-800 mt-0.5 leading-relaxed">
                        {selectedApplication.livingAddress || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: EDUCATIONAL INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <GraduationCap className="w-4 h-4 text-[#0072EA]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Educational Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* University Name */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      University Name
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {selectedApplication.universityName || '—'}
                    </span>
                  </div>

                  {/* Department */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Department
                    </span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                      {selectedApplication.department || '—'}
                    </span>
                  </div>

                  {/* Academic Year */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Academic Year
                    </span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
                      {selectedApplication.academicYear || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: UPLOADED DOCUMENTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0072EA]" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Uploaded Documents (Private Storage)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Secure temporary signed links (600s TTL)
                  </span>
                </div>

                {isLoadingSignedUrls ? (
                  <div className="py-12 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-[#005B96] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-500">
                      Generating secure signed view and download links...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. University Student ID Card (Required) */}
                    <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-white shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-[#0072EA]" />
                            University Student ID
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Required
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate" title={selectedApplication.universityIdFilePath}>
                          Path: {selectedApplication.universityIdFilePath || 'Not recorded'}
                        </p>
                      </div>

                      <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                        {docSignedUrls.uniIdUrl ? (
                          docSignedUrls.uniIdUrl.includes('.pdf') ? (
                            <iframe
                              src={docSignedUrls.uniIdUrl}
                              title="University ID PDF Preview"
                              className="w-full h-full"
                            />
                          ) : (
                            <img
                              src={docSignedUrls.uniIdUrl}
                              alt="University ID Preview"
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          )
                        ) : (
                          <div className="text-center p-4 text-slate-400 space-y-1">
                            <FileText className="w-8 h-8 mx-auto text-slate-300" />
                            <span className="text-xs">Preview unavailable</span>
                          </div>
                        )}
                      </div>

                      {/* View & Download Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {docSignedUrls.uniIdUrl ? (
                          <a
                            href={docSignedUrls.uniIdUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center text-[#0072EA] bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed"
                          >
                            View
                          </button>
                        )}

                        {docSignedUrls.uniIdDownloadUrl || docSignedUrls.uniIdUrl ? (
                          <a
                            href={docSignedUrls.uniIdDownloadUrl || docSignedUrls.uniIdUrl || '#'}
                            download={`university-id-${selectedApplication.fullName.replace(/\s+/g, '_')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. Personal Profile Photo (Required) */}
                    <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-white shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-purple-600" />
                            Personal Photo
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            Required
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate" title={selectedApplication.personalPhotoFilePath}>
                          Path: {selectedApplication.personalPhotoFilePath || 'Not recorded'}
                        </p>
                      </div>

                      <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                        {docSignedUrls.photoUrl ? (
                          <img
                            src={docSignedUrls.photoUrl}
                            alt="Personal Profile Photo"
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-center p-4 text-slate-400 space-y-1">
                            <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                            <span className="text-xs">Preview unavailable</span>
                          </div>
                        )}
                      </div>

                      {/* View & Download Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {docSignedUrls.photoUrl ? (
                          <a
                            href={docSignedUrls.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center text-[#0072EA] bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed"
                          >
                            View
                          </button>
                        )}

                        {docSignedUrls.photoDownloadUrl || docSignedUrls.photoUrl ? (
                          <a
                            href={docSignedUrls.photoDownloadUrl || docSignedUrls.photoUrl || '#'}
                            download={`personal-photo-${selectedApplication.fullName.replace(/\s+/g, '_')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3. NID / Birth Certificate (Optional) */}
                    <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-white shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            NID / Birth Certificate
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Optional
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate" title={selectedApplication.nidBirthCertificateFilePath || ''}>
                          {selectedApplication.nidBirthCertificateFilePath ? `Path: ${selectedApplication.nidBirthCertificateFilePath}` : 'Not uploaded'}
                        </p>
                      </div>

                      <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                        {selectedApplication.nidBirthCertificateFilePath ? (
                          docSignedUrls.nidUrl ? (
                            docSignedUrls.nidUrl.includes('.pdf') ? (
                              <iframe
                                src={docSignedUrls.nidUrl}
                                title="NID Document PDF Preview"
                                className="w-full h-full"
                              />
                            ) : (
                              <img
                                src={docSignedUrls.nidUrl}
                                alt="NID Document Preview"
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                              />
                            )
                          ) : (
                            <div className="text-center p-4 text-slate-400 space-y-1">
                              <FileText className="w-8 h-8 mx-auto text-slate-300" />
                              <span className="text-xs">Preview unavailable</span>
                            </div>
                          )
                        ) : (
                          <div className="text-center p-4 text-slate-400 space-y-1">
                            <FileText className="w-8 h-8 mx-auto text-slate-200" />
                            <span className="text-xs text-slate-400">Not uploaded</span>
                          </div>
                        )}
                      </div>

                      {/* View & Download Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {docSignedUrls.nidUrl ? (
                          <a
                            href={docSignedUrls.nidUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center text-[#0072EA] bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed"
                          >
                            View
                          </button>
                        )}

                        {docSignedUrls.nidDownloadUrl || docSignedUrls.nidUrl ? (
                          <a
                            href={docSignedUrls.nidDownloadUrl || docSignedUrls.nidUrl || '#'}
                            download={`nid-${selectedApplication.fullName.replace(/\s+/g, '_')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: APPLICATION INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <Hash className="w-4 h-4 text-[#0072EA]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Application Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Teacher ID */}
                  <div className="p-3.5 rounded-2xl bg-cyan-50/80 border border-cyan-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider block">
                        Teacher ID
                      </span>
                      <span className="text-xs font-mono font-extrabold text-[#005B96] mt-0.5 block truncate" title={selectedApplication.teacherCode || ''}>
                        {selectedApplication.teacherCode || (selectedApplication.status === 'approved' ? 'Assigned' : 'Pending Verification')}
                      </span>
                    </div>
                    {selectedApplication.teacherCode && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedApplication.teacherCode!, 'teacherCode')}
                        className="p-1.5 rounded-lg text-cyan-700 hover:text-cyan-900 hover:bg-cyan-100 transition-colors shrink-0"
                        title="Copy Teacher ID"
                      >
                        {copiedField === 'teacherCode' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {/* Application ID */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Application ID
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block truncate" title={selectedApplication.id}>
                        {selectedApplication.id}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedApplication.id, 'appId')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
                      title="Copy Application ID"
                    >
                      {copiedField === 'appId' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Supabase User ID */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Auth User ID
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block truncate" title={selectedApplication.userId || ''}>
                        {selectedApplication.userId || 'Not linked'}
                      </span>
                    </div>
                    {selectedApplication.userId && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedApplication.userId || '', 'userId')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
                        title="Copy Auth User ID"
                      >
                        {copiedField === 'userId' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Registration Date */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Registration Date
                    </span>
                    <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                      {selectedApplication.createdAt ? new Date(selectedApplication.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '—'}
                    </span>
                  </div>

                  {/* Application Status */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Current Status
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider mt-0.5 block">
                      {selectedApplication.status === 'pending' && <span className="text-amber-700">Pending Review</span>}
                      {selectedApplication.status === 'approved' && <span className="text-emerald-700">Approved & Published</span>}
                      {selectedApplication.status === 'rejected' && <span className="text-rose-700">Rejected</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Administrator Actions */}
            <div className="p-4 sm:px-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 text-center sm:text-left">
                Review all documents and verify academic credentials before approval.
              </span>

              <div className="flex items-center gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>

                {selectedApplication.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      const app = selectedApplication;
                      setSelectedApplication(null);
                      handleReject(app);
                    }}
                    disabled={isProcessingAction}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline Application</span>
                  </button>
                )}

                {selectedApplication.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      const app = selectedApplication;
                      setSelectedApplication(null);
                      handleOpenApprovalModal(app);
                    }}
                    disabled={isProcessingAction}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Publish</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval & Publication Modal */}
      {approvalModalReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Approve & Publish Tutor Profile
                </h3>
                <p className="text-xs text-slate-500">
                  {approvalModalReg.fullName} ({approvalModalReg.universityName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApprovalModalReg(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl text-xs text-emerald-950 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Confirm Tutor Approval & Publication</span>
                  </div>
                  <p className="text-emerald-800/90 leading-relaxed">
                    Confirming will mark <strong>{approvalModalReg.fullName}</strong> as approved and publish their profile on Finest Tutors BD. Private documents and guardian contact numbers remain strictly confidential.
                  </p>
                </div>

                {/* Teacher Registration Details for Review */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Teacher Registration Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Full Name
                      </span>
                      <span className="font-semibold text-slate-900">{approvalModalReg.fullName}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Gender
                      </span>
                      <span className="font-semibold text-slate-900">{approvalModalReg.gender}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        University
                      </span>
                      <span className="font-semibold text-slate-900">{approvalModalReg.universityName}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Department & Year
                      </span>
                      <span className="font-semibold text-slate-900">
                        {approvalModalReg.department} ({approvalModalReg.academicYear})
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Phone Number
                      </span>
                      <span className="font-semibold text-slate-900">{approvalModalReg.phoneNumber}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Email Address
                      </span>
                      <span className="font-semibold text-slate-900 truncate block">{approvalModalReg.email}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 sm:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Living Address
                      </span>
                      <span className="font-semibold text-slate-900">{approvalModalReg.livingAddress || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 px-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                {approvalModalReg.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      const reg = approvalModalReg;
                      setApprovalModalReg(null);
                      handleReject(reg);
                    }}
                    disabled={isProcessingAction}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline Application</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setApprovalModalReg(null)}
                    disabled={isProcessingAction}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingAction}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    {isProcessingAction ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Publish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
