# Update Your Supabase Anon Key

## ✅ URL Updated
Your Supabase URL has been updated to: `https://teemloiwfnwrogwnoxsa.supabase.co`

## ⚠️ Action Required: Get Your Anon Key

The code still needs your **anon public key**. Here's how to get it:

### Step 1: Get Your Anon Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (the one with URL `teemloiwfnwrogwnoxsa`)
3. Click **Settings** (gear icon) → **API**
4. Find the **anon public** key (it's a long JWT token starting with `eyJ...`)
5. Copy the entire key

### Step 2: Update the Code

Open `project/app/integrations/supabase/client.ts` and replace:

```typescript
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_ANON_KEY_HERE";
```

With:

```typescript
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-actual-anon-key-here";
```

### Step 3: Restart Your App

After updating, restart your development server:
```bash
# Stop current server (Ctrl+C)
npm start
# or
expo start
```

## Alternative: Use Environment Variables (Recommended)

Instead of hardcoding, create a `.env` file in `project/`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://teemloiwfnwrogwnoxsa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Then restart your dev server.

## Verify It Works

After updating, check your console logs. You should see:
```
🔧 Supabase Configuration:
  URL: ✅ Set
  Key: ✅ Set
  Using env vars: false (or true if using .env)
```

And when loading content:
```
✅ Supabase connection successful!
✅ quran_verses is accessible, count: 103
✅ hadiths is accessible, count: 101
```
