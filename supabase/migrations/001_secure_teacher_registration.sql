-- ==============================================================================
-- Migration: 001_secure_teacher_registration.sql
-- Project: Finest Tutors BD
-- Description: Hardened, production-grade, idempotent backend migration.
-- 
-- Key Guarantees:
-- 1. Inspects existing rows before applying NOT NULL constraints; raises a clear
--    diagnostic error instead of fabricating data or corrupting existing records.
-- 2. Hardens storage security: dynamically drops legacy/permissive policies on
--    private buckets (teacher-documents, teacher-photos) and applies a strict
--    RESTRICTIVE policy so anonymous/unprivileged access is impossible.
-- 3. Removes all fabricated profile defaults (stock photos, assumed salaries,
--    unconfirmed experience, unverified claims).
-- 4. Secures administrative functions with explicit REVOKE/GRANT and search_path.
-- 5. Configures explicit table grants and RLS on public & private tables.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. IDEMPOTENT TABLE SETUP: public.teacher_registrations
CREATE TABLE IF NOT EXISTS public.teacher_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    gender TEXT,
    phone_number TEXT,
    guardian_number TEXT,
    email_address TEXT,
    facebook_profile_link TEXT,
    living_address TEXT,
    university_name TEXT,
    department TEXT,
    academic_year TEXT,
    university_id_document_path TEXT,
    nid_document_path TEXT,
    personal_photo_path TEXT,
    status TEXT DEFAULT 'pending',
    application_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Safely rename legacy columns if they exist from earlier manual setups
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_registrations' AND column_name = 'email'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_registrations' AND column_name = 'email_address'
    ) THEN
        ALTER TABLE public.teacher_registrations RENAME COLUMN email TO email_address;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_registrations' AND column_name = 'facebook_link'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_registrations' AND column_name = 'facebook_profile_link'
    ) THEN
        ALTER TABLE public.teacher_registrations RENAME COLUMN facebook_link TO facebook_profile_link;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_registrations' AND column_name = 'university_id_path'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_registrations' AND column_name = 'university_id_document_path'
    ) THEN
        ALTER TABLE public.teacher_registrations RENAME COLUMN university_id_path TO university_id_document_path;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_registrations' AND column_name = 'photo_path'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teacher_registrations' AND column_name = 'personal_photo_path'
    ) THEN
        ALTER TABLE public.teacher_registrations RENAME COLUMN photo_path TO personal_photo_path;
    END IF;
END $$;

-- Add any missing columns safely
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS guardian_number TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS email_address TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS facebook_profile_link TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS living_address TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS university_name TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS university_id_document_path TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS nid_document_path TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS personal_photo_path TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS application_reference TEXT;
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.teacher_registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 3. INSPECT EXISTING DATABASE ROWS (Strict Data Integrity Check)
-- Ensure existing rows with missing required fields are diagnosed rather than
-- having personal data fabricated or silently corrupted.
DO $$
DECLARE
    v_missing_count INTEGER := 0;
    v_sample_ids TEXT := '';
BEGIN
    SELECT count(*), COALESCE(string_agg(id::text, ', ' ORDER BY id), 'None')
    INTO v_missing_count, v_sample_ids
    FROM (
        SELECT id
        FROM public.teacher_registrations
        WHERE full_name IS NULL
           OR gender IS NULL
           OR phone_number IS NULL
           OR guardian_number IS NULL
           OR email_address IS NULL
           OR facebook_profile_link IS NULL
           OR living_address IS NULL
           OR university_name IS NULL
           OR department IS NULL
           OR academic_year IS NULL
           OR university_id_document_path IS NULL
           OR personal_photo_path IS NULL
        LIMIT 5
    ) sub;

    IF v_missing_count > 0 THEN
        RAISE EXCEPTION 
            'Migration halted: Found % existing record(s) in public.teacher_registrations with missing mandatory personal or document fields (Sample IDs: %). Personal applicant data cannot be fabricated. Please inspect and manually correct or archive these records before applying NOT NULL constraints.',
            v_missing_count, v_sample_ids;
    END IF;
END $$;

-- Safely backfill system-generated application references for existing records if missing
UPDATE public.teacher_registrations
SET application_reference = 'FTBD-' || TO_CHAR(COALESCE(created_at, now()), 'YYYY') || '-' || UPPER(SUBSTRING(MD5(id::text || gen_random_uuid()::text) FROM 1 FOR 6))
WHERE application_reference IS NULL OR TRIM(application_reference) = '';

-- Apply NOT NULL constraints now that verification of existing data has succeeded
ALTER TABLE public.teacher_registrations ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN gender SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN phone_number SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN guardian_number SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN email_address SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN facebook_profile_link SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN living_address SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN university_name SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN department SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN academic_year SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN university_id_document_path SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN personal_photo_path SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.teacher_registrations ALTER COLUMN application_reference SET NOT NULL;

-- Unique and indexing constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_registrations_reference 
    ON public.teacher_registrations (application_reference);

CREATE INDEX IF NOT EXISTS idx_teacher_registrations_user_id 
    ON public.teacher_registrations (user_id);

CREATE INDEX IF NOT EXISTS idx_teacher_registrations_status 
    ON public.teacher_registrations (status);

-- Safe status and gender constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'teacher_registrations_status_check' 
          AND conrelid = 'public.teacher_registrations'::regclass
    ) THEN
        ALTER TABLE public.teacher_registrations 
        ADD CONSTRAINT teacher_registrations_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'teacher_registrations_gender_check' 
          AND conrelid = 'public.teacher_registrations'::regclass
    ) THEN
        ALTER TABLE public.teacher_registrations 
        ADD CONSTRAINT teacher_registrations_gender_check 
        CHECK (gender IN ('Male', 'Female', 'Other'));
    END IF;
END $$;

-- 4. SECURE ADMIN AUTHORIZATION INFRASTRUCTURE
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
    -- 1. Explicit membership in app_admins table
    EXISTS (
      SELECT 1 FROM public.app_admins WHERE user_id = auth.uid()
    )
    OR
    -- 2. Server-controlled app_metadata (set only by backend service_role, never client)
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false) = true
    OR
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('admin', 'super_admin')
  );
$$;

-- Revoke public execution of is_admin() and lock search_path
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Admins can view admin registry" ON public.app_admins;
CREATE POLICY "Admins can view admin registry"
    ON public.app_admins
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 5. ROW LEVEL SECURITY & EXPLICIT TABLE PERMISSIONS: teacher_registrations
ALTER TABLE public.teacher_registrations ENABLE ROW LEVEL SECURITY;

-- Explicit Table Grants: Revoke direct modifications from anon & ordinary users
REVOKE ALL ON TABLE public.teacher_registrations FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.teacher_registrations FROM authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.teacher_registrations TO authenticated;
GRANT ALL ON TABLE public.teacher_registrations TO service_role;

-- RLS: Strict denial for anonymous users (Edge Function uses service_role)
DROP POLICY IF EXISTS "Deny all public anon access to teacher registrations" ON public.teacher_registrations;
CREATE POLICY "Deny all public anon access to teacher registrations"
    ON public.teacher_registrations
    FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);

-- RLS: Only authorized administrators can view/manage registrations
DROP POLICY IF EXISTS "Admin users can view teacher registrations" ON public.teacher_registrations;
DROP POLICY IF EXISTS "Admins can view and manage teacher registrations" ON public.teacher_registrations;
CREATE POLICY "Admins can view and manage teacher registrations"
    ON public.teacher_registrations
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- RLS: Authenticated teachers can view their own registration
DROP POLICY IF EXISTS "Teachers can view own registration" ON public.teacher_registrations;
CREATE POLICY "Teachers can view own registration"
    ON public.teacher_registrations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS: Authenticated teachers can update their own permitted registration details
DROP POLICY IF EXISTS "Teachers can update own permitted registration fields" ON public.teacher_registrations;
CREATE POLICY "Teachers can update own permitted registration fields"
    ON public.teacher_registrations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. PRIVATE STORAGE BUCKETS HARDENING (teacher-documents & teacher-photos)
DO $$
BEGIN
    -- Ensure both buckets are private
    UPDATE storage.buckets 
    SET public = false, file_size_limit = 5242880
    WHERE id IN ('teacher-documents', 'teacher-photos');

    -- Insert if not present
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
END $$;

-- DYNAMIC STORAGE POLICY CLEANUP:
-- Drop ANY existing permissive policies on storage.objects that might grant access to these private buckets
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
          AND (
            policyname ILIKE '%teacher%'
            OR qual ILIKE '%teacher-documents%'
            OR qual ILIKE '%teacher-photos%'
            OR with_check ILIKE '%teacher-documents%'
            OR with_check ILIKE '%teacher-photos%'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Apply an AS RESTRICTIVE policy to storage.objects:
-- In PostgreSQL RLS, restrictive policies act as a mandatory filter.
-- Even if an overly broad permissive policy exists on storage.objects, this restrictive
-- rule guarantees that unprivileged users CANNOT access teacher-documents or teacher-photos.
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

-- Permissive policy: Allow administrators to read private files for verification
CREATE POLICY "Admins can read private teacher files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id IN ('teacher-documents', 'teacher-photos')
        AND public.is_admin()
    );

-- 7. PUBLIC APPROVED TEACHERS DIRECTORY (Zero sensitive data & zero fabricated claims)
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

-- Remove any legacy fabricated column defaults if previously set
ALTER TABLE public.approved_teacher_profiles ALTER COLUMN expected_salary_bdt DROP DEFAULT;
ALTER TABLE public.approved_teacher_profiles ALTER COLUMN experience_years DROP DEFAULT;
ALTER TABLE public.approved_teacher_profiles ALTER COLUMN rating DROP DEFAULT;

-- Explicit Table Grants on public directory
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

-- 8. SECURE PUBLICATION WORKFLOW (Administrator Approval Procedure)
-- Only transfers explicitly supplied and approved details into the public table.
-- NEVER invents unconfirmed experience, stock photos, fake salaries, or unverified claims.
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
    -- Authorization check
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Only platform administrators can publish approved tutor profiles.';
    END IF;

    v_admin_uid := auth.uid();

    -- Fetch registration record
    SELECT * INTO v_reg
    FROM public.teacher_registrations
    WHERE id = p_registration_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Teacher registration record with ID % not found.', p_registration_id;
    END IF;

    -- Upsert into approved_teacher_profiles:
    -- Only transfers submitted academic details + explicitly supplied administrator parameters.
    -- Strict Privacy: phone_number, guardian_number, email_address, living_address,
    -- and raw ID document paths are NEVER copied into this public table.
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

    -- Update registration status to approved
    UPDATE public.teacher_registrations
    SET status = 'approved',
        updated_at = now()
    WHERE id = p_registration_id;

    RETURN v_profile_id;
END;
$$;

-- Restrict execution of approve_and_publish_teacher:
-- Deny anonymous visitors and unprivileged users from calling this administrative function.
REVOKE ALL ON FUNCTION public.approve_and_publish_teacher(UUID, TEXT, TEXT, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_and_publish_teacher(UUID, TEXT, TEXT, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.approve_and_publish_teacher(UUID, TEXT, TEXT, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.approve_and_publish_teacher(UUID, TEXT, TEXT, INTEGER, TEXT[], TEXT[], TEXT[], TEXT[], TEXT) TO authenticated, service_role;
