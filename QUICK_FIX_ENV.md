# Quick Fix: Supabase Environment Variables

## The Problem
If your Supabase client isn't working, it might be because environment variables aren't configured correctly for Expo.

## Quick Check

Add this temporarily to your code to verify:

```typescript
console.log("SUPABASE URL", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("SUPABASE KEY", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing");
```

If both print `undefined`, that's your issue!

## The Fix

### 1. Create `.env` file in `project/` directory

Create a file called `.env` in your `project/` folder (same level as `package.json`):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://nihdqtamrfivlhxqdszf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paGRxdGFtcmZpdmxoeHFkc3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjExNDQsImV4cCI6MjA4MTQzNzE0NH0.XQM7sZ4cPwBomqoMDtrjD9jDTJ4Mxp15cd02A_ApoLU
```

### 2. Restart Your Dev Server

**IMPORTANT:** You must restart Expo after creating/updating `.env`:

```bash
# Stop current server (Ctrl+C)
# Then:
npm start
# or
expo start
```

### 3. Verify It Works

Check your console - you should see:
```
🔧 Supabase Configuration:
  URL: ✅ Set
  Key: ✅ Set
  Using env vars: true
```

## Why This Matters

- **Without `EXPO_PUBLIC_` prefix**: Variables are `undefined` → Supabase can't connect
- **With `EXPO_PUBLIC_` prefix**: Variables are available → Supabase works ✅

The code now has fallback values, but using env vars is the proper way.
