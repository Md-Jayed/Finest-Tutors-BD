-- ==============================================================================
-- Finest Tutors BD — Master Supabase Schema & Security Setup
-- ==============================================================================
-- Note: If tables already exist in your Supabase project, execute:
-- `supabase/migrations/001_secure_teacher_registration.sql`
-- which is fully idempotent and inspects existing rows safely without data loss.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: public.teacher_registrations
CREATE TABLE IF NOT EXISTS public.teacher_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    phone_number TEXT NOT NULL,
    guardian_number TEXT NOT NULL,
    email_address TEXT NOT NULL,
    facebook_profile_link TEXT NOT NULL,
    living_address TEXT NOT NULL,
    university_name TEXT NOT NULL,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    university_id_document_path TEXT NOT NULL,
    nid_document_path TEXT,
    personal_photo_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    application_reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_teacher_registrations_user_id 
    ON public.teacher_registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_registrations_reference 
    ON public.teacher_registrations (application_reference);
CREATE INDEX IF NOT EXISTS idx_teacher_registrations_status 
    ON public.teacher_registrations (status);

-- 3. SECURE ADMIN AUTHORIZATION INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.app_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.app_admins WHERE user_id = auth.uid()
    )
    OR
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
    OR
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'super_admin')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Admins can view admin registry" ON public.app_admins;
CREATE POLICY "Admins can view admin registry"
    ON public.app_admins
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 4. ROW LEVEL SECURITY & EXPLICIT TABLE PERMISSIONS: teacher_registrations
ALTER TABLE public.teacher_registrations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.teacher_registrations FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.teacher_registrations FROM authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.teacher_registrations TO authenticated;
GRANT ALL ON TABLE public.teacher_registrations TO service_role;

DROP POLICY IF EXISTS "Deny all public anon access to teacher registrations" ON public.teacher_registrations;
CREATE POLICY "Deny all public anon access to teacher registrations"
    ON public.teacher_registrations
    FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);

DROP POLICY IF EXISTS "Admin users can view teacher registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Admins can view and manage teacher registrations" ON public.teacher_registrations;
CREATE POLICY "Admins can view and manage teacher registrations"
    ON public.teacher_registrations
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Teachers can view own registration" ON public.teacher_registrations;
CREATE POLICY "Teachers can view own registration"
    ON public.teacher_registrations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Teachers can update own permitted registration fields" ON public.teacher_registrations;
CREATE POLICY "Teachers can update own permitted registration fields"
    ON public.teacher_registrations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. PRIVATE STORAGE BUCKETS (teacher-documents & teacher-photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'teacher-documents', 
        'teacher-documents', 
        false, 
        5242880, 
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    ),
    (
        'teacher-photos', 
        'teacher-photos', 
        false, 
        5242880, 
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = 5242880;

DROP POLICY IF EXISTS "Restrictive gate for private teacher buckets" ON storage.objects;
CREATE POLICY "Restrictive gate for private teacher buckets"
    ON storage.objects
    AS RESTRICTIVE
    FOR ALL
    TO public
    USING (
        bucket_id NOT IN ('teacher-documents', 'teacher-photos')
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can read private teacher files" ON storage.objects;
CREATE POLICY "Admins can read private teacher files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id IN ('teacher-documents', 'teacher-photos')
        AND public.is_admin()
    );

-- 6. PUBLIC APPROVED TEACHERS DIRECTORY (Zero sensitive data exposure)
CREATE TABLE IF NOT EXISTS public.approved_teacher_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID UNIQUE REFERENCES public.teacher_registrations(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    university_name TEXT NOT NULL,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    profile_photo_url TEXT,
    bio TEXT,
    experience_years INTEGER,
    subjects TEXT[] DEFAULT '{}',
    preferred_classes TEXT[] DEFAULT '{}',
    mediums TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    expected_salary_bdt TEXT,
    rating NUMERIC(2,1),
    review_count INTEGER DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

REVOKE ALL ON TABLE public.approved_teacher_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.approved_teacher_profiles TO anon, authenticated;
GRANT ALL ON TABLE public.approved_teacher_profiles TO service_role;

ALTER TABLE public.approved_teacher_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved teacher profiles" ON public.approved_teacher_profiles;
CREATE POLICY "Public can view approved teacher profiles"
    ON public.approved_teacher_profiles
    FOR SELECT
    TO anon, authenticated
    USING (is_approved = true);

DROP POLICY IF EXISTS "Admins can manage approved profiles" ON public.approved_teacher_profiles;
CREATE POLICY "Admins can manage approved profiles"
    ON public.approved_teacher_profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. SECURE PUBLICATION WORKFLOW
CREATE OR REPLACE FUNCTION public.approve_and_publish_teacher(
    p_registration_id UUID,
    p_public_photo_url TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_experience_years INTEGER DEFAULT NULL,
    p_subjects TEXT[] DEFAULT '{}',
    p_preferred_classes TEXT[] DEFAULT '{}',
    p_mediums TEXT[] DEFAULT '{}',
    p_preferred_locations TEXT[] DEFAULT '{}',
    p_expected_salary_bdt TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_reg RECORD;
    v_profile_id UUID;
    v_admin_uid UUID;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Only platform administrators can publish approved tutor profiles.';
    END IF;

    v_admin_uid := auth.uid();

    SELECT * INTO v_reg
    FROM public.teacher_registrations
    WHERE id = p_registration_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Teacher registration record with ID % not found.', p_registration_id;
    END IF;

    INSERT INTO public.approved_teacher_profiles (
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
        verified_at,
        verified_by,
        updated_at
    )
    VALUES (
        v_reg.id,
        v_reg.full_name,
        v_reg.gender,
        v_reg.university_name,
        v_reg.department,
        v_reg.academic_year,
        p_public_photo_url,
        p_bio,
        p_experience_years,
        COALESCE(p_subjects, '{}'),
        COALESCE(p_preferred_classes, '{}'),
        COALESCE(p_mediums, '{}'),
        COALESCE(p_preferred_locations, '{}'),
        p_expected_salary_bdt,
        true,
        now(),
        v_admin_uid,
        now()
    )
    ON CONFLICT (registration_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        gender = EXCLUDED.gender,
        university_name = EXCLUDED.university_name,
        department = EXCLUDED.department,
        academic_year = EXCLUDED.academic_year,
        profile_photo_url = EXCLUDED.profile_photo_url,
        bio = EXCLUDED.bio,
        experience_years = EXCLUDED.experience_years,
        subjects = EXCLUDED.subjects,
        preferred_classes = EXCLUDED.preferred_classes,
        mediums = EXCLUDED.mediums,
        preferred_locations = EXCLUDED.preferred_locations,
        expected_salary_bdt = EXCLUDED.expected_salary_bdt,
        is_approved = true,
        verified_at = now(),
        verified_by = v_admin_uid,
        updated_at = now()
    RETURNING id INTO v_profile_id;

    UPDATE public.teacher_registrations
    SET status = 'approved',
        updated_at = now()
    WHERE id = p_registration_id;

    RETURN v_profile_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_and_publish_teacher(UUID, TEXT, TEXT, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_and_publish_teacher(UUID, TEXT, TEXT, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.approve_and_publish_teacher(UUID, TEXT, TEXT, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.approve_and_publish_teacher(UUID, TEXT, TEXT, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) TO authenticated, service_role;
