-- ============================================================================
-- UPDATE EXISTING USERS WITH USERNAMES
-- ============================================================================
-- This script updates existing user profiles that don't have usernames
-- It uses the email prefix or creates a default username
-- ============================================================================

-- Update users without usernames using their email prefix
UPDATE public.profiles
SET 
    username = COALESCE(
        username,
        SPLIT_PART((SELECT email FROM auth.users WHERE id = profiles.user_id), '@', 1),
        'user_' || SUBSTRING(user_id::text, 1, 8)
    ),
    display_name = COALESCE(
        display_name,
        SPLIT_PART((SELECT email FROM auth.users WHERE id = profiles.user_id), '@', 1),
        'User'
    ),
    updated_at = now()
WHERE username IS NULL OR username = '';

-- Verify updates
SELECT 
    user_id,
    username,
    display_name,
    (SELECT email FROM auth.users WHERE id = profiles.user_id) as email
FROM public.profiles
ORDER BY created_at DESC;

-- Count profiles with and without usernames
SELECT 
    COUNT(*) as total_profiles,
    COUNT(username) as profiles_with_username,
    COUNT(*) - COUNT(username) as profiles_without_username
FROM public.profiles;
