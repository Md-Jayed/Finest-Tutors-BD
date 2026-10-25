import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeacherProfile, TeacherRegistrationFormData } from '../types';
import { MOCK_APPROVED_TEACHERS } from '../data/mockTeachers';
import { 
  isSupabaseConfigured, 
  supabase,
  submitRegistrationToEdgeFunction, 
  fetchApprovedTeachersFromSupabase 
} from '../lib/supabase';

export interface RegistrationSubmissionResult {
  success: boolean;
  registrationNumber?: string;
  autoLoggedIn?: boolean;
  message: string;
  error?: string;
}

export interface RecentSubmissionSummary {
  registrationNumber: string;
  submissionDate: string;
  fullName: string;
  universityName: string;
  department: string;
  academicYear: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  isLiveSubmission: boolean;
}

interface RegistrationContextType {
  approvedTeachers: TeacherProfile[];
  isSupabaseConnected: boolean;
  isLoadingTeachers: boolean;
  submitTeacherRegistration: (data: TeacherRegistrationFormData) => Promise<RegistrationSubmissionResult>;
  recentSubmission: RecentSubmissionSummary | null;
  clearRecentSubmission: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [approvedTeachers, setApprovedTeachers] = useState<TeacherProfile[]>(MOCK_APPROVED_TEACHERS);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [recentSubmission, setRecentSubmission] = useState<RecentSubmissionSummary | null>(null);

  // Attempt to load approved teachers from Supabase if configured
  useEffect(() => {
    let isMounted = true;

    async function loadTeachers() {
      if (!isSupabaseConfigured) return;
      setIsLoadingTeachers(true);
      try {
        const liveTeachers = await fetchApprovedTeachersFromSupabase();
        if (isMounted && liveTeachers && liveTeachers.length > 0) {
          setApprovedTeachers(liveTeachers);
        }
      } catch (err) {
        console.warn('Could not load approved teachers from Supabase; using demo records:', err);
      } finally {
        if (isMounted) setIsLoadingTeachers(false);
      }
    }

    loadTeachers();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Submits teacher registration to the Supabase Edge Function `submit-teacher-registration`.
   * Security enforcement:
   * - Never saves sensitive files or guardian data into localStorage.
   * - Does not directly write to private database tables or storage buckets from the browser.
   * - Returns live server application reference on success.
   */
  const submitTeacherRegistration = async (
    data: TeacherRegistrationFormData
  ): Promise<RegistrationSubmissionResult> => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        message: 'Supabase configuration is required to submit registrations. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment, then deploy the Edge Function.',
        error: 'Supabase environment variables are missing.',
      };
    }

    const response = await submitRegistrationToEdgeFunction(data);

    if (response.success && response.application_reference) {
      let autoLoggedIn = false;

      // Immediate login: Sign the teacher in with their email and password
      if (supabase && data.password) {
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.emailAddress.trim(),
            password: data.password,
          });
          if (!signInError) {
            autoLoggedIn = true;
          } else {
            console.warn('Auto-login following registration encountered an issue:', signInError.message);
          }
        } catch (authErr) {
          console.warn('Exception during post-registration auto-login:', authErr);
        }
      }

      const summary: RecentSubmissionSummary = {
        registrationNumber: response.application_reference,
        submissionDate: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        fullName: data.fullName.trim(),
        universityName: data.universityName.trim(),
        department: data.department.trim(),
        academicYear: data.academicYear.trim(),
        status: 'Pending Review',
        isLiveSubmission: true,
      };

      setRecentSubmission(summary);

      return {
        success: true,
        registrationNumber: response.application_reference,
        autoLoggedIn,
        message: response.message || 'Application submitted successfully.',
      };
    }

    return {
      success: false,
      message: response.message || 'Registration submission failed. Please try again.',
      error: response.error,
    };
  };

  const clearRecentSubmission = () => {
    setRecentSubmission(null);
  };

  return (
    <RegistrationContext.Provider
      value={{
        approvedTeachers,
        isSupabaseConnected: isSupabaseConfigured,
        isLoadingTeachers,
        submitTeacherRegistration,
        recentSubmission,
        clearRecentSubmission,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};
