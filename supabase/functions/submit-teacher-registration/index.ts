// Supabase Edge Function: submit-teacher-registration
// Runtime: Deno (Supabase Edge Functions)
//
// Target Table: public.teacher_registrations
// Existing columns:
//   id (uuid, default gen_random_uuid())
//   user_id (uuid)
//   full_name (text)
//   gender (text)
//   phone_number (text)
//   guardian_number (text)
//   email (text)
//   facebook_link (text)
//   living_address (text)
//   university_name (text)
//   department (text)
//   academic_year (text)
//   university_id_file_path (text)
//   nid_birth_certificate_file_path (text, nullable)
//   personal_photo_file_path (text)
//   status (text, 'pending')
//   created_at (timestamptz)
//   updated_at (timestamptz)
//
// Storage Buckets:
//   teacher-documents (private)
//   teacher-photos (private)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

// CORS configuration:
// In production, set the ALLOWED_ORIGIN environment variable to your frontend domain
// (e.g., https://finesttutorsbd.com). Wildcard '*' is a temporary default for development/preview.
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Security constraints
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOC_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const BD_PHONE_REGEX = /^(\+8801|01)[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Enforce POST Method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method Not Allowed. Only POST is accepted.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Track state for transactional rollback across storage files & auth user
  const uploadedDocumentPaths: string[] = [];
  const uploadedPhotoPaths: string[] = [];
  let createdAuthUserId: string | null = null;
  let supabaseAdmin: SupabaseClient | null = null;

  // Cleanup helper: Inspects returned errors from Storage & Auth deletion APIs
  // Logs safe diagnostic messages only; never logs passwords, file paths, or personal info.
  const performCleanup = async (adminClient: SupabaseClient | null) => {
    if (!adminClient) return;

    if (uploadedDocumentPaths.length > 0) {
      try {
        const { error: removeDocsError } = await adminClient.storage
          .from('teacher-documents')
          .remove([...uploadedDocumentPaths]);

        if (removeDocsError) {
          console.error(
            'Storage cleanup failure (teacher-documents):',
            removeDocsError.message || 'Removal failed'
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Storage cleanup unexpected exception (teacher-documents):', message);
      }
    }

    if (uploadedPhotoPaths.length > 0) {
      try {
        const { error: removePhotosError } = await adminClient.storage
          .from('teacher-photos')
          .remove([...uploadedPhotoPaths]);

        if (removePhotosError) {
          console.error(
            'Storage cleanup failure (teacher-photos):',
            removePhotosError.message || 'Removal failed'
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Storage cleanup unexpected exception (teacher-photos):', message);
      }
    }

    if (createdAuthUserId) {
      try {
        const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(createdAuthUserId);

        if (deleteUserError) {
          console.error(
            'Auth user deletion failure:',
            deleteUserError.message || 'Delete user failed'
          );
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Auth user deletion unexpected exception:', message);
      }
    }
  };

  try {
    // 3. Read Server-Side Credentials (never exposed to client)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Server configuration error: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal Server Error: Missing Edge Function backend credentials.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // 4. Parse Multipart Form Data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid multipart/form-data payload.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Extract form fields
    // Passwords must be preserved exactly: do not call .trim() on password input.
    const rawPassword = formData.get('password');
    const password = typeof rawPassword === 'string' ? rawPassword : '';

    const fullName = ((formData.get('full_name') || formData.get('fullName')) as string | null)?.trim() || '';
    const gender = (formData.get('gender') as string | null)?.trim() || '';
    const phoneNumber = ((formData.get('phone_number') || formData.get('phoneNumber')) as string | null)?.trim() || '';
    const guardianNumber = ((formData.get('guardian_number') || formData.get('guardianNumber')) as string | null)?.trim() || '';
    const email = ((formData.get('email') || formData.get('emailAddress')) as string | null)?.trim() || '';
    const facebookLink = ((formData.get('facebook_link') || formData.get('facebookProfileLink')) as string | null)?.trim() || '';
    const livingAddress = ((formData.get('living_address') || formData.get('livingAddress')) as string | null)?.trim() || '';
    const universityName = ((formData.get('university_name') || formData.get('universityName')) as string | null)?.trim() || '';
    const department = (formData.get('department') as string | null)?.trim() || '';
    const academicYear = ((formData.get('academic_year') || formData.get('academicYear')) as string | null)?.trim() || '';

    // File fields
    const universityIdFile = (formData.get('university_id_file') || formData.get('universityIdCardFile')) as File | null;
    const nidBirthCertificateFile = (formData.get('nid_birth_certificate_file') || formData.get('nidOrBirthCertificateFile')) as File | null;
    const personalPhotoFile = (formData.get('personal_photo_file') || formData.get('personalPhotoFile')) as File | null;

    // --- Validation Rules ---
    if (!fullName || fullName.length < 3 || fullName.length > 120) {
      return new Response(
        JSON.stringify({ success: false, error: 'Full name is required (between 3 and 120 characters).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gender must be Male, Female, or Other.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!BD_PHONE_REGEX.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanGuardian = guardianNumber.replace(/[\s-]/g, '');
    if (!BD_PHONE_REGEX.test(cleanGuardian)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid Bangladeshi guardian contact number.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cleanPhone === cleanGuardian) {
      return new Response(
        JSON.stringify({ success: false, error: 'Guardian number cannot be identical to your personal phone number.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanEmail = email.toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Password validation: enforces minimum 8 characters without trimming whitespace
    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password is required and must contain at least 8 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!facebookLink || (!facebookLink.includes('facebook.com') && !facebookLink.includes('fb.com'))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid Facebook profile link is required for identity authenticity.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!livingAddress || livingAddress.length < 8 || livingAddress.length > 300) {
      return new Response(
        JSON.stringify({ success: false, error: 'Living address must be between 8 and 300 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!universityName || universityName.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'University name is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!department || department.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Department is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!academicYear || academicYear.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Academic year is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- File Validations ---
    if (!universityIdFile || !(universityIdFile instanceof File)) {
      return new Response(
        JSON.stringify({ success: false, error: 'University / College ID card file is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (universityIdFile.size > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'University ID document exceeds the 5 MB maximum size limit.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_DOC_MIMES.includes(universityIdFile.type)) {
      return new Response(
        JSON.stringify({ success: false, error: 'University ID card must be a JPEG, PNG, WebP image or PDF document.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!personalPhotoFile || !(personalPhotoFile instanceof File)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Personal profile photo is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (personalPhotoFile.size > MAX_FILE_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'Personal photo exceeds the 5 MB maximum size limit.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_PHOTO_MIMES.includes(personalPhotoFile.type)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Personal photo must be an image (JPEG, PNG, or WebP).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (nidBirthCertificateFile && nidBirthCertificateFile instanceof File && nidBirthCertificateFile.size > 0) {
      if (nidBirthCertificateFile.size > MAX_FILE_SIZE_BYTES) {
        return new Response(
          JSON.stringify({ success: false, error: 'NID / Birth certificate exceeds the 5 MB limit.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!ALLOWED_DOC_MIMES.includes(nidBirthCertificateFile.type)) {
        return new Response(
          JSON.stringify({ success: false, error: 'NID / Birth certificate must be a JPEG, PNG, WebP image or PDF document.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 6. Create Supabase Auth User with email_confirm: true (email confirmation disabled for immediate login)
    // Note: User metadata contains only descriptive name. No permissions/roles are granted via metadata.
    // Administrative authorization remains strictly managed through public.app_admins and public.is_admin().
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error('Supabase Auth createUser failed:', authError.status || authError.name);
      const isDuplicate =
        authError.message.toLowerCase().includes('already') ||
        authError.status === 422;

      return new Response(
        JSON.stringify({
          success: false,
          error: isDuplicate
            ? 'An account with this email address already exists. Please log in or use another email address.'
            : 'Failed to create login account. Please verify your information and try again.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    createdAuthUserId = authData?.user?.id || null;
    if (!createdAuthUserId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to initialize account identity. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Upload files to existing private storage buckets
    const submissionId = crypto.randomUUID();

    // 7a. University ID -> private bucket `teacher-documents`
    const uniIdPath = `university-ids/${submissionId}/${sanitizeFileName(universityIdFile.name)}`;
    const uniIdBuffer = await universityIdFile.arrayBuffer();
    const { error: uniIdUploadError } = await supabaseAdmin.storage
      .from('teacher-documents')
      .upload(uniIdPath, uniIdBuffer, {
        contentType: universityIdFile.type,
        upsert: false,
      });

    if (uniIdUploadError) {
      console.error('Storage upload error for university ID document');
      await performCleanup(supabaseAdmin);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to securely store university ID document. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    uploadedDocumentPaths.push(uniIdPath);

    // 7b. Personal Photo -> private bucket `teacher-photos`
    const photoPath = `photos/${submissionId}/${sanitizeFileName(personalPhotoFile.name)}`;
    const photoBuffer = await personalPhotoFile.arrayBuffer();
    const { error: photoUploadError } = await supabaseAdmin.storage
      .from('teacher-photos')
      .upload(photoPath, photoBuffer, {
        contentType: personalPhotoFile.type,
        upsert: false,
      });

    if (photoUploadError) {
      console.error('Storage upload error for personal photo');
      await performCleanup(supabaseAdmin);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to securely store profile photo. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    uploadedPhotoPaths.push(photoPath);

    // 7c. NID Document (Optional) -> private bucket `teacher-documents`
    let nidPath: string | null = null;
    if (nidBirthCertificateFile && nidBirthCertificateFile instanceof File && nidBirthCertificateFile.size > 0) {
      nidPath = `nid-docs/${submissionId}/${sanitizeFileName(nidBirthCertificateFile.name)}`;
      const nidBuffer = await nidBirthCertificateFile.arrayBuffer();
      const { error: nidUploadError } = await supabaseAdmin.storage
        .from('teacher-documents')
        .upload(nidPath, nidBuffer, {
          contentType: nidBirthCertificateFile.type,
          upsert: false,
        });

      if (nidUploadError) {
        console.error('Storage upload error for NID/birth certificate');
        await performCleanup(supabaseAdmin);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to securely store NID document. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      uploadedDocumentPaths.push(nidPath);
    }

    // 8. Insert Record into `public.teacher_registrations`
    // Uses the EXACT existing columns of the table:
    // id, user_id, full_name, gender, phone_number, guardian_number, email, facebook_link,
    // living_address, university_name, department, academic_year, university_id_file_path,
    // nid_birth_certificate_file_path, personal_photo_file_path, status, created_at, updated_at
    const nowIso = new Date().toISOString();
    const { data: dbData, error: dbInsertError } = await supabaseAdmin
      .from('teacher_registrations')
      .insert({
        user_id: createdAuthUserId,
        full_name: fullName,
        gender: gender,
        phone_number: cleanPhone,
        guardian_number: cleanGuardian,
        email: cleanEmail,
        facebook_link: facebookLink,
        living_address: livingAddress,
        university_name: universityName,
        department: department,
        academic_year: academicYear,
        university_id_file_path: uniIdPath,
        nid_birth_certificate_file_path: nidPath,
        personal_photo_file_path: photoPath,
        status: 'pending',
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select('id')
      .single();

    if (dbInsertError) {
      console.error('Database insert error in teacher_registrations table');
      // Transactional rollback: remove uploaded files & created auth user
      await performCleanup(supabaseAdmin);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database error saving registration details. Uploaded files and account were safely rolled back. Please try again.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Safe Success Response
    // Returns only non-sensitive confirmation details; never returns passwords, file paths, or credentials.
    return new Response(
      JSON.stringify({
        success: true,
        id: dbData?.id,
        message: 'Teacher registration received successfully and queued for admin review.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    console.error('Unhandled Edge Function error during teacher registration');
    if (supabaseAdmin) {
      await performCleanup(supabaseAdmin);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected server error occurred while processing registration. Please try again later.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
