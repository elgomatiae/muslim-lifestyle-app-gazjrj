-- ============================================================================
-- CREATE COMMUNITY INVITES TABLE
-- ============================================================================
-- This table stores community invites sent between users
-- Matches your schema patterns: UUID primary keys, foreign keys to profiles.id
-- ============================================================================

-- Drop table if it exists (for clean recreation)
DROP TABLE IF EXISTS public.community_invites CASCADE;

-- Create community_invites table
-- Note: profiles.id IS auth.users.id, so user_ids reference profiles.id
CREATE TABLE public.community_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id TEXT NOT NULL,
    community_name TEXT NOT NULL,
    invited_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invited_by_username TEXT NOT NULL, -- Stores full_name from profiles table
    invited_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invited_username TEXT NOT NULL, -- Stores full_name from profiles table
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for fast queries (matching your schema patterns)
CREATE INDEX idx_community_invites_invited_user ON public.community_invites(invited_user_id);
CREATE INDEX idx_community_invites_invited_by ON public.community_invites(invited_by_user_id);
CREATE INDEX idx_community_invites_community ON public.community_invites(community_id);
CREATE INDEX idx_community_invites_status ON public.community_invites(status);
CREATE INDEX idx_community_invites_pending ON public.community_invites(invited_user_id, status) WHERE status = 'pending';

-- Prevent duplicate pending invites using partial unique index
-- This ensures only one pending invite per community per user
CREATE UNIQUE INDEX idx_community_invites_unique_pending 
    ON public.community_invites(community_id, invited_user_id) 
    WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.community_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own invites" ON public.community_invites;
DROP POLICY IF EXISTS "Users can create invites" ON public.community_invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON public.community_invites;
DROP POLICY IF EXISTS "Users can delete their own invites" ON public.community_invites;

-- Create policies
-- Policy 1: Users can view invites where they are the invitee OR inviter
CREATE POLICY "Users can view their own invites" ON public.community_invites
    FOR SELECT
    USING (
        auth.uid() = invited_user_id OR 
        auth.uid() = invited_by_user_id
    );

-- Policy 2: Users can create invites (must be the inviter)
CREATE POLICY "Users can create invites" ON public.community_invites
    FOR INSERT
    WITH CHECK (auth.uid() = invited_by_user_id);

-- Policy 3: Users can update invites where they are the invitee (to accept/decline)
CREATE POLICY "Users can update their own invites" ON public.community_invites
    FOR UPDATE
    USING (auth.uid() = invited_user_id)
    WITH CHECK (auth.uid() = invited_user_id);

-- Policy 4: Users can delete invites where they are the inviter or invitee (for account deletion cleanup)
CREATE POLICY "Users can delete their own invites" ON public.community_invites
    FOR DELETE
    USING (
        auth.uid() = invited_user_id OR 
        auth.uid() = invited_by_user_id
    );

-- Grant permissions to roles (matching your schema permission patterns)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_invites TO anon, authenticated;

-- Add comment
COMMENT ON TABLE public.community_invites IS 'Stores community invites sent between users';

-- ============================================================================
-- VERIFY TABLE CREATION
-- ============================================================================

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'community_invites'
        ) THEN '✅ community_invites table exists'
        ELSE '❌ community_invites table does NOT exist'
    END as table_status;

-- Check RLS status
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '⚠️ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'community_invites';

-- Show existing policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'community_invites';

-- ============================================================================
-- VERIFY CONSTRAINTS (should show 2 foreign keys to profiles.id)
-- ============================================================================

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'community_invites';

-- Show sample data (if any)
SELECT 
    id,
    community_id,
    community_name,
    invited_by_user_id,
    invited_by_username,
    invited_user_id,
    invited_username,
    status,
    created_at
FROM public.community_invites
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- NOTES
-- ============================================================================
-- IMPORTANT: After running this script:
-- 1. RESTART your Supabase project (Settings → General → Pause → Resume)
--    This refreshes the PostgREST schema cache so the table is visible
-- 2. Verify the table exists and RLS is enabled
-- 3. Test the invite functionality
-- 
-- Table Structure (matches your schema patterns):
-- - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- - community_id: TEXT NOT NULL (community identifier)
-- - community_name: TEXT NOT NULL (community name for display)
-- - invited_by_user_id: UUID NOT NULL → FOREIGN KEY to profiles.id (who sent the invite)
-- - invited_by_username: TEXT NOT NULL (full_name of inviter, stored for display)
-- - invited_user_id: UUID NOT NULL → FOREIGN KEY to profiles.id (who was invited)
-- - invited_username: TEXT NOT NULL (full_name of invitee, stored for display)
-- - status: TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined'))
-- - created_at: TIMESTAMP WITH TIME ZONE DEFAULT now()
-- - responded_at: TIMESTAMP WITH TIME ZONE (nullable, when invite was accepted/declined)
-- 
-- Constraints:
-- - Primary Key: id (UUID)
-- - Foreign Keys: invited_by_user_id, invited_user_id → profiles.id (with CASCADE DELETE)
-- - Unique Index: Prevents duplicate pending invites (community_id + invited_user_id where status='pending')
-- - Check Constraint: status must be 'pending', 'accepted', or 'declined'
-- ============================================================================
