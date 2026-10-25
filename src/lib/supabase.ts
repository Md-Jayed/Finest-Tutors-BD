import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeacherProfile, TeacherRegistrationFormData } from '../types';

// Read configuration from environment variables with fallback
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://ubtubqtfcmlsralilynl.supabase.co';
const supabaseUrl = rawUrl
  ? rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  : undefined;

const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_RN14glbyXHXKBHbvgKeoIA_R2JQb5SB') as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.trim() !== '' &&
  supabasePublishableKey.trim() !== '' &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabasePublishableKey.includes('your-anon-or-publishable-key')
);

// Instantiate client only if environment variables are provided
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface EdgeFunctionSubmitResponse {
  success: boolean;
  id?: string;
  application_reference?: string;
  message: string;
  error?: string;
}

/**
 * Submits the teacher registration payload and authentication credentials securely via multipart/form-data
 * directly to the Supabase Edge Function `submit-teacher-registration` using the Supabase client.
 *
 * Exact Field Names:
 * - full_name, gender, phone_number, guardian_number, email, password,
 *   facebook_link, living_address, university_name, department, academic_year
 * - university_id_file, nid_birth_certificate_file, personal_photo_file
 */
export async function submitRegistrationToEdgeFunction(
  formData: TeacherRegistrationFormData
): Promise<EdgeFunctionSubmitResponse> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
    );
  }

  // Build multipart form data with exact required field names
  const body = new FormData();
  body.append('full_name', formData.fullName.trim());
  body.append('gender', formData.gender);
  body.append('phone_number', formData.phoneNumber.trim());
  body.append('guardian_number', formData.guardianNumber.trim());
  body.append('email', formData.emailAddress.trim());
  body.append('password', formData.password || '');
  body.append('facebook_link', formData.facebookProfileLink.trim());
  body.append('living_address', formData.livingAddress.trim());
  body.append('university_name', formData.universityName.trim());
  body.append('department', formData.department.trim());
  body.append('academic_year', formData.academicYear.trim());

  if (formData.universityIdCardFile) {
    body.append('university_id_file', formData.universityIdCardFile);
  }
  if (formData.nidOrBirthCertificateFile) {
    body.append('nid_birth_certificate_file', formData.nidOrBirthCertificateFile);
  }
  if (formData.personalPhotoFile) {
    body.append('personal_photo_file', formData.personalPhotoFile);
  }

  try {
    // Invoke the submit-teacher-registration Edge Function using the Supabase client
    const { data, error } = await supabase.functions.invoke('submit-teacher-registration', {
      body,
    });

    if (error) {
      let errorMessage = error.message || 'Failed to submit registration.';
      // Try to parse detailed error response if returned by Edge Function
      if ('context' in error && error.context) {
        try {
          const parsed = await (error.context as Response).json();
          if (parsed?.error) {
            errorMessage = parsed.error;
          } else if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          // Response body already read or non-JSON
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }

    const confirmationId = data?.id || data?.application_reference;

    if (data?.success === false || !confirmationId) {
      return {
        success: false,
        message: data?.error || data?.message || 'The server did not return a valid registration confirmation.',
        error: data?.error || 'Invalid server response',
      };
    }

    return {
      success: true,
      application_reference: confirmationId,
      message: data.message || 'Application submitted successfully.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error communicating with Supabase Edge Function.';
    return {
      success: false,
      message,
      error: message,
    };
  }
}

/**
 * Fetches approved teachers from the secure public database view `approved_teacher_profiles`.
 * Returns null if Supabase is not configured or if the query fails, allowing smooth fallback to demo profiles.
 */
export async function fetchApprovedTeachersFromSupabase(): Promise<TeacherProfile[] | null> {
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('approved_teacher_profiles')
      .select(`
        id,
        full_name,
        gender,
        university_name,
        department,
        academic_year,
        profile_photo_url,
        bio,
        experience_years,
        subjects,
        preferred_classes,
        mediums,
        preferred_locations,
        expected_salary_bdt,
        rating,
        review_count,
        is_approved
      `)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    // Map database fields to application TeacherProfile interface without fabricating unverified claims
    return data.map((record: any) => ({
      id: record.id,
      fullName: record.full_name,
      gender: record.gender || 'Other',
      university: record.university_name,
      department: record.department,
      academicYear: record.academic_year,
      profilePhoto: record.profile_photo_url || '',
      bio: record.bio || '',
      experienceYears: record.experience_years !== null && record.experience_years !== undefined ? Number(record.experience_years) : 0,
      subjects: Array.isArray(record.subjects) ? record.subjects : [],
      preferredClasses: Array.isArray(record.preferred_classes) ? record.preferred_classes : [],
      mediums: Array.isArray(record.mediums) ? record.mediums : [],
      preferredLocations: Array.isArray(record.preferred_locations) ? record.preferred_locations : [],
      expectedSalaryBdt: record.expected_salary_bdt || 'Negotiable',
      rating: record.rating !== null && record.rating !== undefined ? Number(record.rating) : 0,
      reviewCount: record.review_count || 0,
      isApproved: Boolean(record.is_approved),
      isDemo: false,
      tuitionTypes: ['Home Tutoring', 'Online'],
    }));
  } catch {
    return null;
  }
}

export interface TeacherRegistrationRecord {
  id: string;
  userId?: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  guardianNumber: string;
  email: string;
  facebookLink: string;
  livingAddress: string;
  universityName: string;
  department: string;
  academicYear: string;
  universityIdFilePath: string;
  nidBirthCertificateFilePath?: string | null;
  personalPhotoFilePath: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface PermittedProfileUpdates {
  fullName?: string;
  phoneNumber?: string;
  guardianNumber?: string;
  livingAddress?: string;
  facebookLink?: string;
  universityName?: string;
  department?: string;
  academicYear?: string;
}

/**
 * Normalizes raw SQL rows to TeacherRegistrationRecord, safely handling legacy or standardized column names.
 */
export function normalizeRegistrationRecord(raw: any): TeacherRegistrationRecord {
  return {
    id: raw.id,
    userId: raw.user_id || undefined,
    fullName: raw.full_name || '',
    gender: raw.gender || 'Other',
    phoneNumber: raw.phone_number || '',
    guardianNumber: raw.guardian_number || '',
    email: raw.email || raw.email_address || '',
    facebookLink: raw.facebook_link || raw.facebook_profile_link || '',
    livingAddress: raw.living_address || '',
    universityName: raw.university_name || '',
    department: raw.department || '',
    academicYear: raw.academic_year || '',
    universityIdFilePath: raw.university_id_file_path || raw.university_id_document_path || '',
    nidBirthCertificateFilePath: raw.nid_birth_certificate_file_path || raw.nid_document_path || null,
    personalPhotoFilePath: raw.personal_photo_file_path || raw.personal_photo_path || '',
    status: (raw.status as 'pending' | 'approved' | 'rejected') || 'pending',
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/**
 * Verifies whether a given authenticated user has admin privileges.
 * Strictly queries the server-controlled `app_admins` table and `public.is_admin()` RPC.
 * Never trusts editable user metadata.
 */
export async function checkUserIsAdmin(userId?: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  // 1. First attempt the secure database RPC is_admin()
  try {
    const { data: isRpcAdmin, error: rpcError } = await supabase.rpc('is_admin');
    if (!rpcError && isRpcAdmin === true) {
      return true;
    }
  } catch {
    // Continue to direct table query
  }

  // 2. Fall back to inspecting the server-controlled `app_admins` table directly
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('app_admins')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data && data.role) {
        return true;
      }
    } catch {
      // Table check failed
    }
  }

  return false;
}

/**
 * Fetches the authenticated teacher's own registration record from `teacher_registrations`.
 */
export async function getTeacherRegistrationByUserId(
  userId: string
): Promise<TeacherRegistrationRecord | null> {
  if (!supabase || !isSupabaseConfigured || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('teacher_registrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return normalizeRegistrationRecord(data);
  } catch {
    return null;
  }
}

/**
 * Updates permitted profile fields for the teacher's own registration.
 * Explicitly guards against changing status, user_id, or registration ID.
 */
export async function updateTeacherPermittedFields(
  userId: string,
  updates: PermittedProfileUpdates
): Promise<{ success: boolean; message: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  // Whitelist only safe, permitted fields
  const payload: Record<string, string> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.fullName !== undefined) payload.full_name = updates.fullName.trim();
  if (updates.phoneNumber !== undefined) payload.phone_number = updates.phoneNumber.trim();
  if (updates.guardianNumber !== undefined) payload.guardian_number = updates.guardianNumber.trim();
  if (updates.livingAddress !== undefined) payload.living_address = updates.livingAddress.trim();
  if (updates.facebookLink !== undefined) {
    payload.facebook_link = updates.facebookLink.trim();
    payload.facebook_profile_link = updates.facebookLink.trim();
  }
  if (updates.universityName !== undefined) payload.university_name = updates.universityName.trim();
  if (updates.department !== undefined) payload.department = updates.department.trim();
  if (updates.academicYear !== undefined) payload.academic_year = updates.academicYear.trim();

  try {
    const { error } = await supabase
      .from('teacher_registrations')
      .update(payload)
      .eq('user_id', userId);

    if (error) {
      return { success: false, message: error.message, error: error.message };
    }

    return { success: true, message: 'Profile updated successfully.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update profile';
    return { success: false, message: msg, error: msg };
  }
}

/**
 * Fetches all teacher registrations for the Admin Dashboard.
 * Requires administrator role verified by RLS.
 */
export async function getAllTeacherRegistrations(
  statusFilter?: string
): Promise<TeacherRegistrationRecord[]> {
  if (!supabase || !isSupabaseConfigured) return [];

  try {
    let query = supabase
      .from('teacher_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.warn('Error fetching teacher registrations for admin:', error?.message);
      return [];
    }

    return data.map(normalizeRegistrationRecord);
  } catch (err) {
    console.error('Failed to load teacher registrations for admin:', err);
    return [];
  }
}

/**
 * Creates a time-limited signed URL for viewing private documents or photos.
 * Private buckets: `teacher-documents` and `teacher-photos`.
 */
export async function getSecureDocumentSignedUrl(
  bucket: 'teacher-documents' | 'teacher-photos',
  filePath: string,
  expiresInSeconds: number = 600
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured || !filePath) return null;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn('Failed to generate signed URL for path:', filePath, error?.message);
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}

export interface PublishTeacherOptions {
  registrationId: string;
  publicPhotoUrl?: string;
  bio?: string;
  experienceYears?: number;
  subjects?: string[];
  preferredClasses?: string[];
  mediums?: string[];
  preferredLocations?: string[];
  expectedSalaryBdt?: string;
}

/**
 * Executes teacher approval and publication.
 * Uses `public.approve_and_publish_teacher` RPC if present, or falls back to updating status to approved.
 */
export async function approveTeacherRegistration(
  opts: PublishTeacherOptions
): Promise<{ success: boolean; message: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    // 1. Try calling the database function `approve_and_publish_teacher`
    const { error: rpcError } = await supabase.rpc('approve_and_publish_teacher', {
      p_registration_id: opts.registrationId,
      p_public_photo_url: opts.publicPhotoUrl || null,
      p_bio: opts.bio || null,
      p_experience_years: opts.experienceYears || 0,
      p_subjects: opts.subjects || [],
      p_preferred_classes: opts.preferredClasses || [],
      p_mediums: opts.mediums || [],
      p_preferred_locations: opts.preferredLocations || [],
      p_expected_salary_bdt: opts.expectedSalaryBdt || null,
    });

    if (!rpcError) {
      return { success: true, message: 'Teacher registration approved and published successfully.' };
    }

    // 2. If the RPC function didn't succeed (e.g., signature variance or not deployed),
    // update status directly in teacher_registrations
    const { error: updateError } = await supabase
      .from('teacher_registrations')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', opts.registrationId);

    if (updateError) {
      return { success: false, message: updateError.message, error: updateError.message };
    }

    return { success: true, message: 'Teacher registration status marked as approved.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Approval failed';
    return { success: false, message: msg, error: msg };
  }
}

/**
 * Rejects a teacher registration.
 */
export async function rejectTeacherRegistration(
  registrationId: string,
  reason?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    // Check if reject_teacher_registration RPC exists
    try {
      const { error: rpcErr } = await supabase.rpc('reject_teacher_registration', {
        reg_id: registrationId,
        reason: reason || 'Application rejected by administrator',
      });
      if (!rpcErr) {
        return { success: true, message: 'Teacher registration rejected.' };
      }
    } catch {
      // Fallback to table update
    }

    const { error } = await supabase
      .from('teacher_registrations')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId);

    if (error) {
      return { success: false, message: error.message, error: error.message };
    }

    return { success: true, message: 'Teacher registration marked as rejected.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Rejection failed';
    return { success: false, message: msg, error: msg };
  }
}
