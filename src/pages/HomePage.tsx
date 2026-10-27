import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { TeacherCard } from '../components/common/TeacherCard';
import { TeacherDetailModal } from '../components/common/TeacherDetailModal';
import { TeacherProfile } from '../types';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Clock, 
  MapPin, 
  UserPlus, 
  Compass, 
  FileCheck2, 
  HelpCircle,
  Filter,
  X,
  Building2,
  CalendarCheck
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { approvedTeachers } = useRegistration();

  // Search & Filter state for teacher grid
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Selected teacher for detail modal
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered teachers logic
  const filteredTeachers = useMemo(() => {
    return approvedTeachers.filter((teacher) => {
      // Search term
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = teacher.fullName.toLowerCase().includes(query);
        const matchesSubject = teacher.subjects.some((s) => s.toLowerCase().includes(query));
        const matchesUni = teacher.university.toLowerCase().includes(query);
        const matchesDept = teacher.department.toLowerCase().includes(query);
        const matchesLoc = teacher.preferredLocations.some((l) => l.toLowerCase().includes(query));
        if (!matchesName && !matchesSubject && !matchesUni && !matchesDept && !matchesLoc) {
          return false;
        }
      }

      // University Filter
      if (selectedUniversity !== 'All') {
        if (!teacher.university.toLowerCase().includes(selectedUniversity.toLowerCase())) {
          return false;
        }
      }

      // Department Filter
      if (selectedDepartment !== 'All') {
        if (!teacher.department.toLowerCase().includes(selectedDepartment.toLowerCase())) {
          return false;
        }
      }

      // Gender Filter
      if (selectedGender !== 'All') {
        if (teacher.gender !== selectedGender) {
          return false;
        }
      }

      // Location Filter
      if (selectedLocation !== 'All') {
        if (!teacher.preferredLocations.some((loc) => loc.toLowerCase().includes(selectedLocation.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [approvedTeachers, searchQuery, selectedUniversity, selectedDepartment, selectedGender, selectedLocation]);

  const handleOpenDetail = (teacher: TeacherProfile) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedUniversity('All');
    setSelectedDepartment('All');
    setSelectedGender('All');
    setSelectedLocation('All');
  };

  return (
    <div className="bg-white min-h-screen text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-50/60 via-white to-slate-50/50 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-100">
        {/* Soft Background Radial Blurs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-100/40 via-cyan-100/40 to-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100/80 text-[#005B96] text-xs font-bold border border-cyan-200">
                <span className="w-2 h-2 rounded-full bg-[#0072EA] animate-pulse" />
                Bangladesh's Dedicated Academic Tuition Network
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#002B5B] tracking-tight leading-[1.15]">
                Trusted Tuition Platform in Bangladesh
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Finest Tutors BD bridges passionate university scholars from BUET, Dhaka University, medical colleges, and top institutions with students seeking personalized, trustworthy home and online tutoring.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/teacher-registration"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-[#005B96] via-[#0072EA] to-[#0096C7] hover:from-[#00487C] hover:to-[#0077B6] shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <UserPlus className="w-5 h-5 text-cyan-200" />
                  <span>Register as a Teacher</span>
                </Link>

                <a
                  href="#tutors"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base text-[#002B5B] bg-white border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 shadow-xs transition-all duration-200"
                >
                  <Search className="w-5 h-5 text-cyan-600" />
                  <span>Find Tutors</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Pre-screened University IDs
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Strict Privacy Enforced
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  BDT (৳) Transparent Honorarium
                </span>
              </div>
            </div>

            {/* Right Visual Column (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Card Stack with Bangladesh Academic context */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-100 relative z-10 space-y-5">
                  {/* Top Bar with Brand Badge */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#005B96] to-[#00B4D8] flex items-center justify-center text-white">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#002B5B]">Tutor Match Desk</h4>
                        <p className="text-[11px] text-slate-500">Dhaka & Nationwide Coverage</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Active Network
                    </span>
                  </div>

                  {/* Sample Tutor Mini-Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-cyan-50/60 border border-blue-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                        alt="Tutor"
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">Tanvir Ahmed</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 truncate">
                          BUET • Electrical & Electronic Engg.
                        </p>
                        <p className="text-[10px] text-cyan-700 font-semibold">
                          Class 9-12 Physics & Higher Math
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-blue-200/50">
                      <span className="text-slate-500">Location: Dhanmondi, Dhaka</span>
                      <span className="font-bold text-[#002B5B]">৳6,000 - ৳8,000 / mo</span>
                    </div>
                  </div>

                  {/* Highlight pill rows */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span className="font-medium text-slate-700 text-[11px]">Public & Private Unis</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-700 text-[11px]">Strict ID Verification</span>
                    </div>
                  </div>

                  {/* Secondary Sample Tutor Mini-Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                        alt="Tutor 2"
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Nusrat Jahan</p>
                        <p className="text-[10px] text-slate-500">DU English • O/A Level Specialist</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Available
                    </span>
                  </div>
                </div>

                {/* Decorative floating badges */}
                <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-100 z-20 flex items-center gap-2.5 max-w-[200px]">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <strong className="block text-slate-800 font-bold">100% Private</strong>
                    <span className="text-slate-500">Guardian data protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM HIGHLIGHTS SECTION */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold text-[#0072EA] uppercase tracking-wider">
              Core Pillars of Finest Tutors BD
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#002B5B]">
              Designed for Quality Education in Bangladesh
            </h3>
            <p className="text-sm text-slate-600">
              Built specifically to serve Bangladeshi learners, parents, and university students seeking tuition opportunities.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#005B96] text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#002B5B]">Qualified Tutors</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tutors from leading engineering, medical, general, and private universities across Bangladesh with verified academic records.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-50/50 to-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#00B4D8] text-white flex items-center justify-center shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#002B5B]">University Students</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Empowering bright undergraduate and graduate students with respectable part-time teaching honorariums.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#002B5B]">Personalized Tuition</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                One-on-one attention adapted to Bangla Medium, English Version, and English Medium curricula (Edexcel/Cambridge).
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#002B5B] text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#002B5B]">Trusted Connections</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Direct coordinator assistance, safety-first policies, and zero disclosure of confidential guardian or student details.
              </p>
            </div>
          </div>

          {/* Editable Mock Statistics Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 mb-6">
              <div>
                <span className="text-[11px] font-bold text-[#0072EA] uppercase tracking-wider">
                  Platform Growth Targets (Demo Figures)
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  Target Coverage Across Bangladesh
                </h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-semibold">
                Illustrative Metrics
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#005B96]">10000+</p>
                <p className="text-xs text-slate-600 font-medium">Verified Tutors</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#00B4D8]">15+</p>
                <p className="text-xs text-slate-600 font-medium">Top Universities</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#10B981]">64</p>
                <p className="text-xs text-slate-600 font-medium">Districts Outreach</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#002B5B]">100%</p>
                <p className="text-xs text-slate-600 font-medium">Confidential Data Handling</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REGISTERED TEACHERS SECTION */}
      <section id="tutors" className="py-16 sm:py-24 bg-slate-50/80 border-y border-slate-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
                <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                Approved Profiles Only
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002B5B]">
                Meet Our Registered Tutors
              </h2>
              <p className="text-sm text-slate-600 max-w-xl">
                Browse approved tutors from premier institutions. Filter by university, department, gender, or location.
              </p>
            </div>

            {/* Quick Demo Label */}
            <div className="text-xs text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 self-start md:self-auto">
              Showing <span className="font-bold text-slate-800">{filteredTeachers.length}</span> of {approvedTeachers.length} sample tutors
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Keyword */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, subject (e.g. Physics, Math, English)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#0072EA] focus:ring-2 focus:ring-cyan-100 focus:outline-none"
                />
              </div>

              {/* University Select */}
              <div>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#0072EA] focus:outline-none bg-white"
                >
                  <option value="All">All Universities</option>
                  <option value="BUET">BUET</option>
                  <option value="Dhaka">University of Dhaka (DU)</option>
                  <option value="Medical">Dhaka Medical College</option>
                  <option value="BRAC">BRAC University</option>
                  <option value="North South">North South University (NSU)</option>
                  <option value="Jahangirnagar">Jahangirnagar University</option>
                  <option value="SUST">SUST</option>
                </select>
              </div>

              {/* Gender Filter */}
              <div>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#0072EA] focus:outline-none bg-white"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male Tutors</option>
                  <option value="Female">Female Tutors</option>
                </select>
              </div>

              {/* Location Select */}
              <div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#0072EA] focus:outline-none bg-white"
                >
                  <option value="All">All Locations</option>
                  <option value="Dhanmondi">Dhanmondi</option>
                  <option value="Gulshan">Gulshan / Banani</option>
                  <option value="Uttara">Uttara</option>
                  <option value="Mirpur">Mirpur</option>
                  <option value="Mohammadpur">Mohammadpur</option>
                  <option value="Bashundhara">Bashundhara R/A</option>
                  <option value="Online">Online / Remote</option>
                </select>
              </div>
            </div>

            {/* Filter tags & Reset */}
            {(searchQuery || selectedUniversity !== 'All' || selectedGender !== 'All' || selectedLocation !== 'All') && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 flex-wrap gap-2">
                <span className="text-slate-500">Active filters applied</span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Teacher Grid */}
          {filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTeachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  onSelect={handleOpenDetail}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center">
                <Search className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No matching tutors found</h4>
              <p className="text-xs text-slate-500">
                Try loosening your filters or search keywords to view other qualified mentors.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0072EA]"
              >
                Reset Search Filters
              </button>
            </div>
          )}

          {/* CTA Banner After Teacher Grid */}
          <div className="mt-12 bg-gradient-to-r from-[#002B5B] via-[#005B96] to-[#0077B6] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-200 border border-white/20">
                Are You a University Student or Tutor?
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Share Your Knowledge & Earn Respectfully
              </h3>
              <p className="text-sm text-cyan-100 max-w-xl">
                Join our roster of tutors across Bangladesh. Simple 13-field registration with strict privacy for all your confidential documents.
              </p>
            </div>

            <Link
              to="/teacher-registration"
              className="shrink-0 px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-[#002B5B] bg-white hover:bg-cyan-50 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5 text-[#0072EA]" />
              <span>Register as a Teacher</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#0072EA] uppercase tracking-wider">
              Transparent & Thorough
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002B5B]">
              How It Works
            </h2>
            <p className="text-sm text-slate-600">
              A straightforward three-step onboarding procedure. Please note that registration does not automatically mean approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-[#005B96] font-extrabold text-xl flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-[#002B5B]">
                Register with the Form
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fill in the 13 dedicated fields on our teacher registration page covering your personal contact and living address.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0072EA] font-extrabold text-xl flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-[#002B5B]">
                Submit Academic & ID Details
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide your university, department, study year, and upload your student ID card along with a clear profile photo.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#10B981] font-extrabold text-xl flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-[#002B5B]">
                Audit & Profile Approval
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our verification coordinators review your student credentials. Only approved academic details are published publicly.
              </p>
            </div>
          </div>

          {/* Clarification Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 max-w-3xl mx-auto">
            <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <strong className="font-bold">Important Notice:</strong> Submission of the registration form initiates a manual verification process. Profiles are only approved and featured after academic and identification documents have been verified by the Finest Tutors BD audit team.
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US SECTION */}
      <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#0072EA] uppercase tracking-wider">
              The Finest Standard
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002B5B]">
              Why Choose Finest Tutors BD
            </h2>
            <p className="text-sm text-slate-600">
              Clear academic standards, an effortless registration pathway, and an uncompromising student-focused mission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005B96] flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Ease of Registration</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A single-page form with all 13 standard fields. No convoluted multi-step routing or unnecessary questionnaires.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Academic Transparency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Genuine focus on university background, study departments, and subject competencies relevant to Bangladesh curricula.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Straightforward Process</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear expectations without exaggerated claims or speculative guarantees of instant tuition placements.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Student-Focused Mission</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prioritizing the academic growth, mentor-student rapport, and academic safety of children across Dhaka and all districts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Profile Detail Modal */}
      <TeacherDetailModal
        teacher={selectedTeacher}
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};
