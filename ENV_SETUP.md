# Environment Variables Setup

## Supabase Configuration

Your app needs Supabase environment variables to connect to your database.

### Step 1: Create `.env` File

In your project root (`project/`), create a `.env` file:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://nihdqtamrfivlhxqdszf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paGRxdGFtcmZpdmxoeHFkc3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjExNDQsImV4cCI6MjA4MTQzNzE0NH0.XQM7sZ4cPwBomqoMDtrjD9jDTJ4Mxp15cd02A_ApoLU
```

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase Dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Restart Your Development Server

After creating/updating `.env`:
```bash
# Stop your current dev server (Ctrl+C)
# Then restart:
npm start
# or
expo start
```

## Important Notes

### ✅ Use `EXPO_PUBLIC_` Prefix
- **Required** for Expo/React Native
- Without this prefix, variables will be `undefined` at runtime
- Example: `EXPO_PUBLIC_SUPABASE_URL` ✅ (works)
- Example: `SUPABASE_URL` ❌ (won't work in Expo)

### ✅ Add `.env` to `.gitignore`
Make sure `.env` is in your `.gitignore` to keep secrets safe:
```
.env
.env.local
```

### ✅ Verify It's Working

Check your console logs when the app starts. You should see:
```
🔧 Supabase Configuration:
  URL: ✅ Set
  Key: ✅ Set
  Using env vars: true
```

If you see:
```
⚠️ Using hardcoded Supabase URL
```
Then your `.env` file isn't being read - check the file path and variable names.

## Troubleshooting

### Issue: "SUPABASE URL undefined"
**Solution:**
1. Make sure `.env` file is in `project/` directory (same level as `package.json`)
2. Use `EXPO_PUBLIC_` prefix
3. Restart dev server after creating/updating `.env`
4. Check for typos in variable names

### Issue: "Still using hardcoded values"
**Solution:**
1. Verify `.env` file exists in correct location
2. Check variable names match exactly (case-sensitive)
3. Restart Expo dev server completely
4. Clear Expo cache: `expo start -c`

### Issue: "Can't find Supabase tables"
**Solution:**
This is a different issue (RLS/permissions). See `FIX_DAILY_CONTENT.md` for that fix.
