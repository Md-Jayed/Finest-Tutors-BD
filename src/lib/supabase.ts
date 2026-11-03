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
/**
 * Fetches approved teachers from the secure public database table `approved_teacher_profiles`.
 * Only displays profiles where is_approved = true.
 * Generates secure signed URLs for private profile photos.
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
        registration_id,
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
        is_approved,
        teacher_code
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchApprovedTeachers error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map database fields to TeacherProfile interface and generate secure signed URLs for photos
    const profilesWithSignedPhotos: TeacherProfile[] = await Promise.all(
      data.map(async (record: any) => {
        let photoUrl = record.profile_photo_url || '';

        // If photo path exists and doesn't already have a valid signed token, generate a time-limited signed URL
        if (photoUrl && !photoUrl.startsWith('data:') && !photoUrl.startsWith('blob:') && !photoUrl.includes('token=')) {
          try {
            const signed = await getSecureDocumentSignedUrl('teacher-photos', photoUrl, 7200);
            if (signed) {
              photoUrl = signed;
            } else if (!photoUrl.startsWith('http://') && !photoUrl.startsWith('https://')) {
              // Gracefully fall back to avatar URL if signed photo is unavailable
              photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.full_name || 'Tutor')}&background=005B96&color=fff&size=256&bold=true`;
            }
          } catch (signErr) {
            console.warn('Could not generate signed photo URL for teacher:', signErr);
            if (!photoUrl.startsWith('http://') && !photoUrl.startsWith('https://')) {
              photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.full_name || 'Tutor')}&background=005B96&color=fff&size=256&bold=true`;
            }
          }
        }

        const subjects = Array.isArray(record.subjects) && record.subjects.length > 0
          ? record.subjects
          : [record.department || 'General Academics'];

        const preferredLocations = Array.isArray(record.preferred_locations) && record.preferred_locations.length > 0
          ? record.preferred_locations
          : ['Dhaka', 'Online'];

        const preferredClasses = Array.isArray(record.preferred_classes) && record.preferred_classes.length > 0
          ? record.preferred_classes
          : ['Class 9-10', 'HSC / College'];

        const mediums = Array.isArray(record.mediums) && record.mediums.length > 0
          ? record.mediums
          : ['Bangla Medium', 'English Version'];

        return {
          id: record.id,
          teacherCode: record.teacher_code || record.teacherCode || undefined,
          registrationId: record.registration_id,
          fullName: record.full_name || 'Verified Tutor',
          gender: record.gender || 'Other',
          university: record.university_name || 'Dhaka College',
          department: record.department || 'General',
          academicYear: record.academic_year || '',
          profilePhoto: photoUrl,
          bio: record.bio || `Verified tutor from ${record.university_name || 'Dhaka College'} specializing in ${record.department || 'academic mentoring'}. Available for home and online tuition.`,
          experienceYears:
            record.experience_years !== null && record.experience_years !== undefined
              ? Number(record.experience_years)
              : 1,
          subjects,
          preferredClasses,
          mediums,
          preferredLocations,
          expectedSalaryBdt: record.expected_salary_bdt || 'Negotiable',
          rating: 5.0,
          reviewCount: 1,
          isApproved: Boolean(record.is_approved),
          isDemo: false,
          tuitionTypes: ['Home Tutoring', 'Online'],
        };
      })
    );

    return profilesWithSignedPhotos;
  } catch (err) {
    console.error('Exception fetching approved teachers from Supabase:', err);
    return null;
  }
}

export interface TeacherRegistrationRecord {
  id: string;
  userId?: string;
  teacherCode?: string;
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
    teacherCode: raw.teacher_code || raw.teacherCode || undefined,
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

    const record = normalizeRegistrationRecord(data);

    // Look up associated approved profile to retrieve teacher_code if available
    try {
      const { data: prof } = await supabase
        .from('approved_teacher_profiles')
        .select('teacher_code')
        .eq('registration_id', record.id)
        .maybeSingle();

      if (prof?.teacher_code) {
        record.teacherCode = prof.teacher_code;
      }
    } catch {
      // Continue without teacher_code
    }

    return record;
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
 * Strips leading bucket name prefixes, domain URLs, or extra slashes from stored file paths.
 */
function cleanStoragePath(bucket: string, rawPath: string): string {
  let clean = rawPath.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const url = new URL(clean);
      const bucketMarker = `/${bucket}/`;
      const idx = url.pathname.indexOf(bucketMarker);
      if (idx !== -1) {
        clean = decodeURIComponent(url.pathname.substring(idx + bucketMarker.length));
      }
    } catch {
      // Keep as-is
    }
  }
  // Strip leading bucket name if stored e.g. "teacher-documents/id-cards/..."
  if (clean.startsWith(`${bucket}/`)) {
    clean = clean.slice(bucket.length + 1);
  } else if (clean.startsWith(`/${bucket}/`)) {
    clean = clean.slice(bucket.length + 2);
  }
  // Strip leading slashes
  clean = clean.replace(/^\/+/, '');
  return clean;
}

/**
 * Fetches all teacher registrations for the Admin Dashboard.
 * Requires administrator role verified by RLS.
 * Does not swallow database errors so failures can be diagnosed.
 */
export async function getAllTeacherRegistrations(
  statusFilter?: string
): Promise<TeacherRegistrationRecord[]> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase client is not configured.');
  }

  let query = supabase
    .from('teacher_registrations')
    .select('id, user_id, full_name, gender, phone_number, guardian_number, email, facebook_link, living_address, university_name, department, academic_year, university_id_file_path, nid_birth_certificate_file_path, personal_photo_file_path, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching teacher registrations for admin:', error.message, error.details);
    throw new Error(`Database query error: ${error.message}${error.details ? ` (${error.details})` : ''}`);
  }

  if (!data) return [];
  const records = data.map(normalizeRegistrationRecord);

  // Attach teacher_code from approved_teacher_profiles for verified/approved applications
  try {
    const { data: approvedList } = await supabase
      .from('approved_teacher_profiles')
      .select('registration_id, teacher_code');

    if (approvedList && approvedList.length > 0) {
      const codeMap = new Map<string, string>();
      for (const item of approvedList) {
        if (item.registration_id && item.teacher_code) {
          codeMap.set(item.registration_id, item.teacher_code);
        }
      }
      for (const r of records) {
        if (codeMap.has(r.id)) {
          r.teacherCode = codeMap.get(r.id);
        }
      }
    }
  } catch (profErr) {
    console.warn('Could not retrieve teacher codes from approved_teacher_profiles:', profErr);
  }

  return records;
}

/**
 * Fetches a single teacher registration by its primary key ID.
 */
export async function getTeacherRegistrationById(id: string): Promise<TeacherRegistrationRecord> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabase
    .from('teacher_registrations')
    .select('id, user_id, full_name, gender, phone_number, guardian_number, email, facebook_link, living_address, university_name, department, academic_year, university_id_file_path, nid_birth_certificate_file_path, personal_photo_file_path, status, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error(`Error fetching registration ${id}:`, error?.message);
    throw new Error(error?.message || `Registration with ID "${id}" was not found.`);
  }

  const record = normalizeRegistrationRecord(data);

  // Attach teacher_code if exists in approved_teacher_profiles
  try {
    const { data: prof } = await supabase
      .from('approved_teacher_profiles')
      .select('teacher_code')
      .eq('registration_id', id)
      .maybeSingle();

    if (prof?.teacher_code) {
      record.teacherCode = prof.teacher_code;
    }
  } catch {
    // Ignore error
  }

  return record;
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
    const cleanPath = cleanStoragePath(bucket, filePath);
    if (!cleanPath) return null;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn(`Failed to generate signed URL for bucket ${bucket}, path "${cleanPath}":`, error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn(`Exception generating signed URL for bucket ${bucket}:`, err);
    return null;
  }
}

/**
 * Creates a time-limited signed download URL for private documents or photos.
 */
export async function getSecureDocumentDownloadUrl(
  bucket: 'teacher-documents' | 'teacher-photos',
  filePath: string,
  downloadFileName?: string,
  expiresInSeconds: number = 600
): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured || !filePath) return null;

  try {
    const cleanPath = cleanStoragePath(bucket, filePath);
    if (!cleanPath) return null;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresInSeconds, {
        download: downloadFileName || true,
      });

    if (error || !data?.signedUrl) {
      console.warn(`Failed to generate signed download URL for bucket ${bucket}, path "${cleanPath}":`, error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn(`Exception generating signed download URL for bucket ${bucket}:`, err);
    return null;
  }
}

export interface PublishTeacherOptions {
  registrationId: string;
  registrationRecord?: TeacherRegistrationRecord;
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
 * 1. Calls the deployed database approval RPC `approve_teacher_registration(p_registration_id)`.
 * 2. Ensures the registration status changes to 'approved' in teacher_registrations.
 * 3. Creates or updates the corresponding record in `public.approved_teacher_profiles`.
 * 4. Sets is_approved = true, verified_at, verified_by, and links registration_id.
 */
export async function approveTeacherRegistration(
  opts: PublishTeacherOptions
): Promise<{ success: boolean; message: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    // 1. Call the correct database approval function: approve_teacher_registration
    let rpcErrorMsg: string | null = null;
    let rpcSuccess = false;

    try {
      const { error: rpcError } = await supabase.rpc('approve_teacher_registration', {
        p_registration_id: opts.registrationId,
      });

      if (!rpcError) {
        rpcSuccess = true;
      } else {
        rpcErrorMsg = rpcError.message;
        console.warn('approve_teacher_registration RPC error, will verify table state:', rpcError.message);
      }
    } catch (rpcEx) {
      rpcErrorMsg = rpcEx instanceof Error ? rpcEx.message : 'RPC call failed';
    }

    // 2. Ensure registration status in teacher_registrations is marked 'approved'
    const { error: updateError } = await supabase
      .from('teacher_registrations')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', opts.registrationId);

    if (updateError && !rpcSuccess) {
      return {
        success: false,
        message: `Approval failed: ${rpcErrorMsg || updateError.message}`,
        error: updateError.message,
      };
    }

    // 3. Retrieve registration record details if not provided in opts
    let reg = opts.registrationRecord;
    if (!reg) {
      const { data: dbReg } = await supabase
        .from('teacher_registrations')
        .select('*')
        .eq('id', opts.registrationId)
        .maybeSingle();

      if (dbReg) {
        reg = normalizeRegistrationRecord(dbReg);
      }
    }

    // 4. Retrieve current authenticated administrator identity for audit trail
    const { data: authData } = await supabase.auth.getUser();
    const adminUserId = authData?.user?.id || null;
    const nowIso = new Date().toISOString();

    const photoPath = reg?.personalPhotoFilePath || opts.publicPhotoUrl || '';

    // 5. Ensure record is created/updated in public.approved_teacher_profiles with is_approved = true
    const profilePayload = {
      registration_id: opts.registrationId,
      full_name: reg?.fullName || 'Teacher',
      gender: reg?.gender || 'Other',
      university_name: reg?.universityName || '',
      department: reg?.department || '',
      academic_year: reg?.academicYear || '',
      profile_photo_url: photoPath || null,
      bio: opts.bio || null,
      experience_years: opts.experienceYears ?? null,
      subjects: opts.subjects || [],
      preferred_classes: opts.preferredClasses || [],
      mediums: opts.mediums || [],
      preferred_locations: opts.preferredLocations || [],
      expected_salary_bdt: opts.expectedSalaryBdt || null,
      is_approved: true,
      verified_at: nowIso,
      verified_by: adminUserId,
      updated_at: nowIso,
    };

    const { error: upsertError } = await supabase
      .from('approved_teacher_profiles')
      .upsert(profilePayload, { onConflict: 'registration_id' });

    if (upsertError) {
      console.error('Failed to create/update approved_teacher_profiles record:', upsertError.message);
      return {
        success: false,
        message: `Teacher registration marked as approved, but public directory profile publishing failed: ${upsertError.message}`,
        error: upsertError.message,
      };
    }

    return {
      success: true,
      message: 'Teacher registration approved and published successfully.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Approval failed';
    return { success: false, message: msg, error: msg };
  }
}

/**
 * Rejects a teacher registration.
 * 1. Calls the deployed reject_teacher_registration(p_registration_id) RPC.
 * 2. Fallbacks to updating status in teacher_registrations.
 * 3. Sets is_approved = false in approved_teacher_profiles if a profile exists.
 */
export async function rejectTeacherRegistration(
  registrationId: string,
  _reason?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    let rpcSuccess = false;
    try {
      const { error: rpcErr } = await supabase.rpc('reject_teacher_registration', {
        p_registration_id: registrationId,
      });
      if (!rpcErr) {
        rpcSuccess = true;
      }
    } catch {
      // Continue to fallback
    }

    if (!rpcSuccess) {
      const { error: updateError } = await supabase
        .from('teacher_registrations')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', registrationId);

      if (updateError) {
        return { success: false, message: updateError.message, error: updateError.message };
      }
    }

    // Ensure profile is unpublished if previously approved
    await supabase
      .from('approved_teacher_profiles')
      .update({
        is_approved: false,
        updated_at: new Date().toISOString(),
      })
      .eq('registration_id', registrationId);

    return { success: true, message: 'Teacher registration marked as rejected.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Rejection failed';
    return { success: false, message: msg, error: msg };
  }
}
