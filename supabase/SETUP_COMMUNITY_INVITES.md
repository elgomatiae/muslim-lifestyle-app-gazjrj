# Setup Community Invites in Supabase

This guide will help you set up the community invites system in your Supabase database.

## Step 1: Create the Invites Table

1. Go to your Supabase project dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Open the file `supabase/create_community_invites_table.sql`
5. Copy the entire contents and paste it into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

This will create:
- `community_invites` table
- Indexes for fast queries
- Row Level Security (RLS) policies
- Permissions for authenticated users

## Step 2: Verify the Table Was Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'community_invites';
```

You should see `community_invites` in the results.

## Step 3: Verify RLS Policies

Run this query to check policies:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'community_invites';
```

You should see 3 policies:
1. "Users can view their own invites"
2. "Users can create invites"
3. "Users can update their own invites"

## Step 4: Test the Setup

After running the migration, restart your Supabase project:
1. Go to **Settings → General**
2. Click **"Pause Project"**
3. Wait 10 seconds
4. Click **"Resume Project"**

This refreshes the PostgREST schema cache.

## How It Works

1. **Sending Invites**: Users can invite others by username
   - The app looks up the user in `user_profiles` table by username
   - Creates an invite record in `community_invites` table
   - The invited user receives the invite

2. **Receiving Invites**: Users see invites in their inbox
   - Fetches all invites where `invited_user_id` matches the current user
   - Shows pending invites first

3. **Accepting/Declining**: Users can respond to invites
   - Updates the invite status in Supabase
   - Adds user to community when accepted

## Troubleshooting

### "Table not found" error
- Make sure you ran the SQL migration
- Restart your Supabase project after creating the table

### "Permission denied" error
- Check that RLS policies are created correctly
- Verify the user is authenticated

### "User not found" when inviting
- Make sure the user has a profile in `user_profiles` table
- Check that the username matches exactly (case-insensitive)
