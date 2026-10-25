import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { TeacherCard } from '../components/common/TeacherCard';
import { TeacherDetailModal } from '../components/common/TeacherDetailModal';
import { TeacherProfile } from '../types';
import { 
  Search, 
  GraduationCap, 
  Filter, 
  X, 
  UserPlus, 
  Sparkles,
  MapPin,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

export const TutorsDirectoryPage: React.FC = () => {
  const { approvedTeachers } = useRegistration();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedMedium, setSelectedMedium] = useState('All');

  const [selectedTeacher, setSelectedTeacher] = useState<TeacherProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTeachers = useMemo(() => {
    return approvedTeachers.filter((teacher) => {
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

      if (selectedUniversity !== 'All') {
        if (!teacher.university.toLowerCase().includes(selectedUniversity.toLowerCase())) {
          return false;
        }
      }

      if (selectedDepartment !== 'All') {
        if (!teacher.department.toLowerCase().includes(selectedDepartment.toLowerCase())) {
          return false;
        }
      }

      if (selectedGender !== 'All') {
        if (teacher.gender !== selectedGender) {
          return false;
        }
      }

      if (selectedLocation !== 'All') {
        if (!teacher.preferredLocations.some((l) => l.toLowerCase().includes(selectedLocation.toLowerCase()))) {
          return false;
        }
      }

      if (selectedMedium !== 'All') {
        if (!teacher.mediums.some((m) => m.toLowerCase().includes(selectedMedium.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [approvedTeachers, searchQuery, selectedUniversity, selectedDepartment, selectedGender, selectedLocation, selectedMedium]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedUniversity('All');
    setSelectedDepartment('All');
    setSelectedGender('All');
    setSelectedLocation('All');
    setSelectedMedium('All');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-cyan-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#005B96] font-semibold">Find Tutors</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-900 border border-cyan-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
              Verified Tutor Directory
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#002B5B]">
              Find Qualified University Tutors
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore approved mentors from BUET, Dhaka University, Medical Colleges, BRAC, and NSU across all subjects, mediums, and districts.
            </p>
          </div>

          <Link
            to="/teacher-registration"
            className="shrink-0 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#005B96] to-[#0072EA] hover:from-[#00487C] hover:to-[#005B96] shadow-md transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-cyan-200" />
            <span>Register as a Tutor</span>
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input (2 cols) */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutor, subject (e.g. Physics, Math)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#0072EA] focus:outline-none"
              />
            </div>

            {/* University */}
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
                <option value="North South">North South University</option>
                <option value="Jahangirnagar">Jahangirnagar Univ.</option>
                <option value="SUST">SUST</option>
              </select>
            </div>

            {/* Medium / Curriculum */}
            <div>
              <select
                value={selectedMedium}
                onChange={(e) => setSelectedMedium(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-[#0072EA] focus:outline-none bg-white"
              >
                <option value="All">All Curricula</option>
                <option value="Bangla Medium">Bangla Medium</option>
                <option value="English Version">English Version</option>
                <option value="English Medium">English Medium</option>
              </select>
            </div>

            {/* Gender */}
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

            {/* Location */}
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
                <option value="Online">Online / All BD</option>
              </select>
            </div>
          </div>

          {/* Active status & reset */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
            <span>Showing <strong className="text-slate-800">{filteredTeachers.length}</strong> approved tutor profiles</span>
            {(searchQuery || selectedUniversity !== 'All' || selectedMedium !== 'All' || selectedGender !== 'All' || selectedLocation !== 'All') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Tutor Card Grid */}
        {filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onSelect={(t) => {
                  setSelectedTeacher(t);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 mx-auto flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No tutors match the criteria</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your university, subject, or location filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0072EA]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <TeacherDetailModal
        teacher={selectedTeacher}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTeacher(null);
        }}
      />
    </div>
  );
};
