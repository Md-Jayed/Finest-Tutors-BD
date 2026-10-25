import React from 'react';
import { TeacherProfile } from '../../types';
import { 
  X, 
  GraduationCap, 
  MapPin, 
  Award, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  ShieldCheck, 
  Banknote,
  Send,
  Star,
  Sparkles
} from 'lucide-react';

interface TeacherDetailModalProps {
  teacher: TeacherProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestTutor?: (teacher: TeacherProfile) => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  teacher,
  isOpen,
  onClose,
  onRequestTutor
}) => {
  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8 animate-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#002B5B] via-[#005B96] to-[#0077B6] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {teacher.profilePhoto ? (
              <img
                src={teacher.profilePhoto}
                alt={teacher.fullName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-md bg-slate-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-2xl ring-4 ring-white/30 shadow-md">
                {teacher.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{teacher.fullName}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <CheckCircle className="w-3 h-3 text-emerald-300" />
                  Verified Mentor
                </span>
                {teacher.isDemo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-400/20 text-amber-200 border border-amber-300/30">
                    Sample Profile
                  </span>
                )}
              </div>

              <p className="text-cyan-100 text-sm font-medium flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>{teacher.university}</span>
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-200 flex-wrap pt-0.5">
                <span>{teacher.department}</span>
                <span>•</span>
                <span>{teacher.academicYear}</span>
                <span>•</span>
                <span>Gender: {teacher.gender}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Experience</p>
              <p className="text-sm font-bold text-[#002B5B]">{teacher.experienceYears}+ Years Active</p>
            </div>
            <div className="border-x border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Expected Honorarium</p>
              <p className="text-sm font-bold text-emerald-600">{teacher.expectedSalaryBdt}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Satisfaction</p>
              <p className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {teacher.rating} ({teacher.reviewCount} reviews)
              </p>
            </div>
          </div>

          {/* About / Bio */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              Tutor Profile & Teaching Approach
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-cyan-50/40 p-4 rounded-xl border border-cyan-100/60">
              {teacher.bio}
            </p>
          </div>

          {/* Subjects Taught */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-600" />
              Subjects & Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>

          {/* Mediums & Classes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Classes / Levels</h4>
              <div className="flex flex-wrap gap-1.5">
                {teacher.preferredClasses.map((cls, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700">
                    {cls}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Curriculum / Mediums</h4>
              <div className="flex flex-wrap gap-1.5">
                {teacher.mediums.map((med, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                    {med}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Areas & Delivery Mode */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Preferred Tutoring Locations
            </h4>
            <div className="flex flex-wrap gap-2">
              {teacher.preferredLocations.map((loc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                >
                  <MapPin className="w-3 h-3 text-cyan-600" />
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Privacy Protection Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Privacy Safeguard:</strong> Direct contact details (phone, email, guardian info) are protected to maintain safety. To hire or request an introductory session with {teacher.fullName}, submit a tuition request through the Finest Tutors BD matching desk.
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>ID: {teacher.id}</span> • <span>Approved by Finest Tutors BD</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (onRequestTutor) {
                  onRequestTutor(teacher);
                } else {
                  alert(`Tuition request initiated for ${teacher.fullName}! The Finest Tutors BD coordinator will contact you.`);
                }
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#005B96] to-[#0072EA] hover:from-[#00487C] hover:to-[#005B96] shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Request this Tutor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
