export type Gender = 'Male' | 'Female' | 'Other';

export interface TeacherProfile {
  id: string;
  fullName: string;
  gender: Gender;
  university: string;
  department: string;
  academicYear: string;
  profilePhoto: string;
  bio: string;
  experienceYears: number;
  subjects: string[];
  preferredClasses: string[];
  mediums: ('Bangla Medium' | 'English Medium' | 'English Version' | 'Madrasah')[];
  preferredLocations: string[];
  expectedSalaryBdt: string;
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  isDemo: boolean;
  tuitionTypes: ('Home Tutoring' | 'Online' | 'Group Batch')[];
}

export interface TeacherRegistrationFormData {
  // Section A: Personal Information
  fullName: string;
  gender: Gender | '';
  phoneNumber: string;
  guardianNumber: string;
  emailAddress: string;
  facebookProfileLink: string;
  livingAddress: string;

  // Teacher Account Authentication Credentials
  password?: string;
  confirmPassword?: string;

  // Section B: Educational Information
  universityName: string;
  department: string;
  academicYear: string;

  // Section C: Document Uploads
  universityIdCardFile: File | null;
  nidOrBirthCertificateFile: File | null;
  personalPhotoFile: File | null;

  // Preview URLs for UI display
  universityIdCardPreview?: string;
  nidOrBirthCertificatePreview?: string;
  personalPhotoPreview?: string;
}

export interface SearchFilterState {
  searchQuery: string;
  university: string;
  department: string;
  gender: string;
  medium: string;
  location: string;
}
