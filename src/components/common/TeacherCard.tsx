import React from 'react';
import { TeacherProfile } from '../../types';
import { 
  GraduationCap, 
  MapPin, 
  CheckCircle2, 
  BookOpen, 
  Star, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface TeacherCardProps {
  teacher: TeacherProfile;
  onSelect: (teacher: TeacherProfile) => void;
  onRequestTutor?: (teacher: TeacherProfile) => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  onSelect,
  onRequestTutor
}) => {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-cyan-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Banner Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#005B96] via-[#00B4D8] to-[#10B981] group-hover:h-2 transition-all duration-300" />

      <div className="p-5 sm:p-6 space-y-4 flex-1">
        {/* Header: Photo + Name + University */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {teacher.profilePhoto ? (
              <img
                src={teacher.profilePhoto}
                alt={teacher.fullName}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-cyan-400/50 transition-all duration-300 bg-slate-100"
                loading="lazy"
              />
            ) : (
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-cyan-100/80 text-[#005B96] flex items-center justify-center font-bold text-xl ring-2 ring-slate-100 group-hover:ring-cyan-400/50 transition-all duration-300">
                {teacher.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-xs"
              title="Identity & University Vetted"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
            </span>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#002B5B] truncate group-hover:text-[#0072EA] transition-colors">
                {teacher.fullName}
              </h3>
              {teacher.isDemo && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                  Demo
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-700 flex items-start gap-1 line-clamp-1">
              <GraduationCap className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <span className="truncate" title={teacher.university}>
                {teacher.university}
              </span>
            </p>

            <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-600">{teacher.department}</span>
              <span>•</span>
              <span className="text-slate-500">{teacher.academicYear}</span>
            </div>
          </div>
        </div>

        {/* Bio / Intro preview */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed italic">
          "{teacher.bio}"
        </p>

        {/* Subjects Badges */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
              Specialties
            </span>
            <span className="text-[11px] text-slate-400">{teacher.gender}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {teacher.subjects.slice(0, 3).map((sub, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-50 text-cyan-800 border border-cyan-100/80"
              >
                {sub}
              </span>
            ))}
            {teacher.subjects.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                +{teacher.subjects.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Preferred Locations */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {teacher.preferredLocations.slice(0, 3).join(', ')}
            {teacher.preferredLocations.length > 3 ? '...' : ''}
          </span>
        </div>
      </div>

      {/* Card Footer: Honorarium + Action Button */}
      <div className="px-5 py-3.5 sm:px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Expected Fee
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#002B5B]">
            {teacher.expectedSalaryBdt}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(teacher)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-[#005B96] bg-white border border-slate-200 hover:border-[#0072EA] hover:bg-cyan-50 transition-all shadow-2xs group-hover:translate-x-0.5"
        >
          <span>View Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-600" />
        </button>
      </div>
    </div>
  );
};
