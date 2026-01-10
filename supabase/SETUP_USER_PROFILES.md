# Setup User Profiles Table

This guide will help you set up the `profiles` table so that usernames are properly saved when users sign up.

**Note:** Your Supabase table is called `profiles`, not `user_profiles`.

## Step 1: Update RLS Policies for Profiles Table

1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Open the file `supabase/fix_user_profiles_rls.sql` (or `supabase/create_user_profiles_table.sql`)
5. Copy the entire contents and paste it into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

This will:
- Set up or update the `profiles` table with `username` field
- Create indexes for fast username lookups
- Configure Row Level Security (RLS) policies
- Grant permissions for authenticated users
- Add DELETE permission for account deletion

## Step 2: Update Existing Users (Optional)

If you have existing users without usernames:

1. Open `supabase/update_existing_users_with_usernames.sql`
2. Copy and paste into SQL Editor
3. Run the query

This will:
- Set usernames for existing users using their email prefix
- Create default usernames for users without emails

## Step 3: Restart Supabase Project

**IMPORTANT:** After running the SQL scripts:

1. Go to **Settings → General** in Supabase dashboard
2. Click **"Pause Project"**
3. Wait 10 seconds
4. Click **"Resume Project"**

This refreshes the PostgREST schema cache.

## Step 4: Verify Setup

Run this query to check if usernames are being saved:

```sql
SELECT 
    user_id,
    username,
    display_name,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
```

You should see usernames for all users.

## How It Works Now

### On Signup:
1. User enters username in signup form
2. Account is created in `auth.users`
3. Username is stored in `user_metadata`
4. **Profile is immediately created in `user_profiles` table with username**

### On Login:
1. If profile doesn't exist, it's created using:
   - Username from `user_metadata` (if available)
   - Email prefix (if no username in metadata)
   - Default "User" (fallback)

### On Invite:
1. App looks up user by username in `profiles` table
2. Username must match exactly (case-insensitive)
3. Invite is created in `community_invites` table

## Troubleshooting

### "Username not saved" issue
- Check console logs for detailed error messages
- Verify `profiles` table exists (not `user_profiles`)
- Check RLS policies are set up correctly
- Restart Supabase project after creating/updating table

### "User not found" when inviting
- Run the verification query above to see all usernames
- Make sure you're using the exact username (case-insensitive)
- Check that the user actually signed up and has a profile

### Existing users don't have usernames
- Run `update_existing_users_with_usernames.sql`
- Or manually update usernames in Supabase dashboard
- New signups will automatically have usernames

### "Table not found" or "PGRST205" error
- Make sure your table is called `profiles` (not `user_profiles`)
- Run the RLS fix script to set up policies
- Restart your Supabase project to refresh schema cache

## Testing

1. **Create a new test account:**
   - Sign up with a username
   - Check console logs for "✅ User profile created successfully"
   - Verify in Supabase that username was saved

2. **Invite a user:**
   - Use the exact username from the database
   - Check that the lookup succeeds
   - Verify invite is created

3. **Check existing users:**
   - Run the verification query
   - All users should have usernames
   - If not, run the update script
