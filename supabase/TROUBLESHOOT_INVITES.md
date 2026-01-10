# Troubleshooting Community Invites

If invites aren't working when you enter usernames, follow these steps:

## Step 1: Check Console Logs

When you try to invite a user, check the console/terminal for these logs:
- `🔍 Looking up user by username: "username"`
- `✅ Found user` or `⚠️ User not found`
- Any error messages

## Step 2: Verify User Profiles Exist

Run this query in Supabase SQL Editor to see all usernames:

```sql
SELECT 
    user_id,
    username,
    display_name,
    created_at
FROM profiles
WHERE username IS NOT NULL
ORDER BY username;
```

**Check:**
- Do the usernames you're trying to invite exist in this list?
- Are the usernames spelled exactly as they appear (case-sensitive)?
- Do users have `username` field populated (not NULL)?

## Step 3: Fix RLS (Row Level Security) Issues

If you see errors like "permission denied" or "PGRST205", run this script:

1. Open `supabase/fix_user_profiles_rls.sql`
2. Copy and paste into Supabase SQL Editor
3. Run the query
4. **RESTART your Supabase project** (Settings → General → Pause → Resume)

## Step 4: Verify Table Access

Run this diagnostic query:

```sql
-- Check if table exists and is accessible
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles'
        ) THEN '✅ Exists'
        ELSE '❌ Missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';
```

## Step 5: Test Username Lookup

The app now shows available usernames when a lookup fails. If you see:
- "Available usernames: ..." - Use one of those exact usernames
- "No usernames found in database" - Users need to create profiles first

## Common Issues

### Issue 1: "User not found" but user exists
**Solution:**
- Check username spelling (case-sensitive)
- Verify the username column is not NULL
- Make sure RLS policies allow reading user_profiles

### Issue 2: "Permission denied" error
**Solution:**
- Run `fix_user_profiles_rls.sql` script
- Restart Supabase project
- Verify policies were created

### Issue 3: Table not found (PGRST205)
**Solution:**
- Verify `user_profiles` table exists
- Restart Supabase project to refresh schema cache
- Check table name matches exactly

### Issue 4: No usernames in database
**Solution:**
- Users need to sign up and create profiles
- Profiles are created automatically on first login
- Check that `initializeUserProfile` is being called

## Quick Test

1. Run this query to see all usernames:
```sql
SELECT username FROM user_profiles WHERE username IS NOT NULL;
```

2. Copy one of the usernames exactly (including case)
3. Try inviting that user
4. Check console logs for detailed error messages

## Still Not Working?

Share with me:
1. The exact error message from console
2. The output of the username query above
3. Whether RLS policies exist (run the check query in fix_user_profiles_rls.sql)
