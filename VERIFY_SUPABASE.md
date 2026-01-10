# Verify Your Supabase Connection

## The Issue
The app might not be connecting to YOUR actual Supabase instance. Let's verify the connection is correct.

## Step 1: Check Your Supabase Credentials

### Get Your Real Supabase URL and Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long JWT token starting with `eyJ...`)

## Step 2: Verify the Code is Using Correct Values

Open `project/app/integrations/supabase/client.ts` and check:

```typescript
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://nihdqtamrfivlhxqdszf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJ...";
```

**Question:** Does `https://nihdqtamrfivlhxqdszf.supabase.co` match YOUR Supabase project URL?

- ✅ **If YES**: The credentials are correct, the issue is likely RLS/permissions
- ❌ **If NO**: Update the hardcoded values or set environment variables

## Step 3: Update Credentials

### Option A: Update Hardcoded Values (Quick Fix)

Edit `project/app/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "YOUR_ACTUAL_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_ACTUAL_ANON_KEY";
```

### Option B: Use Environment Variables (Recommended)

1. Create `.env` file in `project/` directory:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

2. Restart your dev server

## Step 4: Test the Connection

When you run the app, check the console logs. You should see:

```
🔍 Testing Supabase connection...
📍 Supabase URL: https://your-project.supabase.co
✅ Supabase connection successful!
```

If you see:
```
❌ Supabase connection failed!
```

Then the credentials are wrong or the project is paused.

## Step 5: Verify Tables Exist in YOUR Supabase

1. Go to Supabase Dashboard → **Table Editor**
2. Verify these tables exist:
   - `quran_verses` (should have 103 rows based on your CSV)
   - `hadiths` (should have 101 rows based on your CSV)
   - `lectures`
   - `recitations`

3. If tables don't exist, you need to create them or import your data

## Need Help?

If you want me to verify the connection, share:
1. Your Supabase project URL (the `https://xxxxx.supabase.co` part)
2. Or confirm if `https://nihdqtamrfivlhxqdszf.supabase.co` is correct

I can then verify the code is pointing to the right instance.
