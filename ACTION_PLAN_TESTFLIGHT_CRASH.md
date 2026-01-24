# Action Plan: Fix TestFlight Crash

## 🎯 Goal
Identify and fix the immediate crash on TestFlight while the app works fine in Expo.

## 📋 Phase 1: Diagnosis (10-15 minutes)

### Step 1.1: Get Crash Logs ⚠️ CRITICAL
**This is the most important step!**

1. Open **App Store Connect** → **TestFlight**
2. Select your app → **Crashes** tab
3. Download the latest crash report (.crash file)
4. Open the crash file and look for:
   - **Exception Type** (e.g., `EXC_BAD_ACCESS`, `NSException`)
   - **Exception Message**
   - **First few stack frames** (these show where it crashed)

**What to look for:**
- `Supabase` → Missing environment variables
- `Font` or `SpaceMono` → Font loading issue
- `TurboModule` → Native module problem
- `Asset` or `image` → Missing asset file
- `undefined is not an object` → Null reference error

### Step 1.2: Check EAS Secrets (30 seconds)
```bash
cd project
eas secret:list
```

**Expected:** Should show:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**If missing:** This is likely 90% of crashes - set them immediately!

### Step 1.3: Verify Critical Files Exist
```bash
# Check font file
ls project/assets/fonts/SpaceMono-Regular.ttf

# Check app.json
cat project/app.json | jq .

# Check eas.json
cat project/eas.json | jq .
```

## 🔧 Phase 2: Quick Fixes (5-10 minutes)

### Fix #1: Set EAS Secrets (Most Common Issue)
**If `eas secret:list` shows missing secrets:**

```bash
# Get credentials from: https://supabase.com/dashboard → Settings → API

# Set Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://YOUR_PROJECT.supabase.co

# Set Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY_HERE

# Verify
eas secret:list
```

### Fix #2: Make Font Loading Safe
**If crash mentions font loading:**

The font is already handled, but let's make it even safer:

```typescript
// app/_layout.tsx - Already fixed, but verify it looks like this:
const [loaded, fontError] = useFonts({
  SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
});

// Handle font errors
React.useEffect(() => {
  if (fontError) {
    console.warn('Font loading error (continuing without custom font):', fontError);
  }
}, [fontError]);

// Continue even if font fails
if (!loaded && !fontError) {
  return null; // Still loading
}
// Continue with app even if fontError exists
```

### Fix #3: Add Additional Safety Checks
**Wrap all context providers in error boundaries:**

Already done, but verify:
- ✅ `ErrorBoundary` wraps entire app
- ✅ `AuthContext` has try-catch
- ✅ `WidgetContext` has try-catch
- ✅ `Supabase client` uses fallbacks

## 🛠️ Phase 3: Systematic Testing (15-20 minutes)

### Test 1: Minimal Build Test
Create a minimal version to isolate the issue:

```typescript
// app/index.tsx - Temporary minimal version
import { View, Text, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>App Loaded Successfully</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**If this works:** Issue is in initialization code
**If this crashes:** Issue is in build configuration

### Test 2: Check Build Configuration
```bash
# Verify production build config
cat project/eas.json

# Should show:
# "production": {
#   "ios": {
#     "buildConfiguration": "Release"
#   }
# }
```

### Test 3: Verify All Imports Are Safe
Check for top-level imports that might fail:

```bash
# Search for potentially problematic imports
grep -r "require(" project/app/_layout.tsx
grep -r "import.*from" project/app/_layout.tsx
```

## 📊 Phase 4: Based on Crash Type

### If Crash Shows "Supabase" or "Environment"
**Fix:** Set EAS secrets (see Fix #1 above)

### If Crash Shows "Font" or "SpaceMono"
**Fix:** 
1. Verify font file exists: `ls project/assets/fonts/SpaceMono-Regular.ttf`
2. If missing, either:
   - Add the font file, OR
   - Remove font requirement from `app/_layout.tsx`

### If Crash Shows "TurboModule" or Native Module
**Fix:**
1. Check `app.json` plugins are correct
2. Verify all native dependencies in `package.json` are compatible
3. Ensure `npx expo prebuild` was run (if using bare workflow)

### If Crash Shows "Asset" or Image Path
**Fix:**
1. Verify all image paths in code match actual files
2. Check `app.json` icon and splash screen paths

### If Crash Shows "undefined is not an object"
**Fix:**
1. Check the stack trace for the exact line
2. Add null checks to that code
3. Verify all context providers handle undefined values

## 🚀 Phase 5: Rebuild and Test (30 minutes)

### Step 5.1: Rebuild
```bash
cd project
eas build --platform ios --profile production
```

### Step 5.2: Submit to TestFlight
```bash
eas submit --platform ios --profile production
```

### Step 5.3: Test
1. Install from TestFlight
2. Open the app
3. Verify it doesn't crash immediately
4. Check device logs if possible

## 📝 Phase 6: If Still Crashing

### Get More Information
1. **Enable verbose logging:**
   - Add console.logs at critical points
   - Check device logs via Xcode

2. **Try development build:**
   ```bash
   eas build --platform ios --profile development
   ```
   - Development builds have better error messages

3. **Check App Store Connect:**
   - Look for additional crash reports
   - Check for patterns (specific devices, iOS versions)

4. **Create minimal repro:**
   - Strip down to bare minimum
   - Add features back one by one
   - Identify which feature causes crash

## ✅ Success Criteria

The app is fixed when:
- ✅ Opens without crashing on TestFlight
- ✅ Shows login screen (or appropriate first screen)
- ✅ No errors in device logs
- ✅ All critical features work

## 🎯 Most Likely Solution (90% of cases)

**Missing EAS Secrets**

```bash
# This single command fixes most crashes:
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value YOUR_URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_KEY
eas build --platform ios --profile production
```

## 📚 Reference Files

- `TESTFLIGHT_CRASH_DEBUGGING_PLAN.md` - Detailed debugging guide
- `QUICK_FIX_CHECKLIST.md` - Quick reference
- `TESTFLIGHT_CRASH_FIX.md` - Previous fixes applied
- `app/integrations/supabase/client.ts` - Supabase configuration
- `contexts/AuthContext.tsx` - Auth initialization
- `app/_layout.tsx` - Root layout

## ⏱️ Estimated Time

- **Diagnosis:** 10-15 minutes
- **Fix:** 5-10 minutes  
- **Rebuild:** 15-30 minutes
- **Test:** 5 minutes

**Total: 35-60 minutes**

## 🆘 Need Help?

If still stuck after following this plan:
1. Share the **first 20 lines** of the crash log
2. Share output of `eas secret:list`
3. Share any error messages from device logs
4. Describe exactly when it crashes (immediately? after splash? etc.)
