# Setting Up EAS Secrets for TestFlight Builds

## The Problem
Your app was crashing on TestFlight because Supabase environment variables weren't available in the production build. EAS builds don't automatically include `.env` files.

## The Fix (Temporary)
The app now has fallback Supabase credentials to prevent immediate crashes, but you should properly configure EAS secrets.

## Proper Solution: Set EAS Secrets

### Step 1: Get Your Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long JWT token starting with `eyJ...`)

### Step 2: Set EAS Secrets
Run these commands in your terminal (in the `project/` directory):

```bash
# Set the Supabase URL secret
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value YOUR_SUPABASE_URL

# Set the Supabase Anon Key secret
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY
```

Replace:
- `YOUR_SUPABASE_URL` with your actual Supabase project URL
- `YOUR_ANON_KEY` with your actual anon public key

### Step 3: Verify Secrets Are Set
```bash
eas secret:list
```

You should see both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` listed.

### Step 4: Rebuild Your App
After setting the secrets, rebuild your app:

```bash
eas build --platform ios --profile production
```

Then submit to TestFlight:
```bash
eas submit --platform ios --profile production
```

## Why This Matters

- **Without EAS secrets**: Environment variables are `undefined` in production builds → app crashes
- **With EAS secrets**: Environment variables are available → app works correctly ✅

## Note
The app currently has fallback credentials to prevent crashes, but setting EAS secrets is the proper way to configure environment variables for production builds.
