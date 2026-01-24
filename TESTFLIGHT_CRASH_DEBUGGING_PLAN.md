# TestFlight Crash Debugging Plan

## Phase 1: Gather Crash Information 🔍

### Step 1.1: Get Crash Logs from TestFlight
1. Open **App Store Connect**
2. Go to **TestFlight** → Your App → **Crashes**
3. Download the crash report (.crash file)
4. Look for:
   - **Exception Type** (e.g., EXC_BAD_ACCESS, NSException)
   - **Exception Message**
   - **Stack Trace** (first few frames are most important)
   - **Thread 0** (main thread) - this is usually where the crash occurs

### Step 1.2: Check Device Logs (if possible)
- Connect device to Mac
- Open **Console.app**
- Filter for your app's bundle ID
- Look for errors right before crash

### Step 1.3: Identify Crash Pattern
- Does it crash immediately on launch?
- Does it crash after splash screen?
- Does it crash on first screen render?
- Does it crash on first user interaction?

## Phase 2: Common TestFlight Crash Causes 🎯

### Cause 1: Missing Environment Variables (Most Likely)
**Symptoms:**
- Works in Expo Go
- Crashes immediately on TestFlight
- No visible error screen

**Diagnosis:**
```bash
# Check if EAS secrets are set
eas secret:list

# If empty or missing, this is likely the issue
```

**Fix:**
```bash
# Set Supabase secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value YOUR_URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_KEY

# Rebuild
eas build --platform ios --profile production
```

### Cause 2: Native Module Not Initialized
**Symptoms:**
- Works in Expo Go (uses JS fallbacks)
- Crashes in native build
- Error mentions "TurboModuleRegistry" or native module

**Diagnosis:**
- Check crash log for module names
- Look for imports of native modules at top level

**Fix:**
- Ensure all native modules are properly configured in `app.json`
- Check `package.json` for native dependencies
- Verify `npx expo prebuild` was run (if using bare workflow)

### Cause 3: Asset Loading Failure
**Symptoms:**
- Crashes during splash screen
- Error about missing images/fonts

**Diagnosis:**
- Check if all assets exist in `assets/` folder
- Verify asset paths in code match actual files

**Fix:**
- Ensure all referenced assets exist
- Check `app.json` for correct asset paths
- Verify fonts are properly loaded

### Cause 4: Code That Only Works in Dev
**Symptoms:**
- Uses `__DEV__` checks incorrectly
- Accesses dev-only APIs
- Console.log that might cause issues

**Diagnosis:**
- Search for `__DEV__` usage
- Check for dev-only code paths

**Fix:**
- Ensure production code paths are safe
- Remove or guard dev-only code

### Cause 5: Missing Permissions/Info.plist
**Symptoms:**
- Crashes when accessing location/camera/etc.
- Error about missing permissions

**Diagnosis:**
- Check `app.json` → `ios.infoPlist`
- Verify all required permissions are declared

**Fix:**
- Add missing permission descriptions
- Ensure permissions match actual usage

## Phase 3: Systematic Debugging Steps 🔧

### Step 3.1: Add Crash Reporting
Add Sentry or similar to catch errors:

```typescript
// In app/_layout.tsx or index.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_DSN',
  enableInExpoDevelopment: false,
  debug: false,
});
```

### Step 3.2: Add Defensive Checks
Wrap critical initialization in try-catch:

```typescript
// Example: Safe Supabase initialization
try {
  const { data, error } = await supabase.auth.getSession();
} catch (error) {
  console.error('Supabase init error:', error);
  // Show error screen instead of crashing
}
```

### Step 3.3: Test with Minimal Code
Create a test build with minimal code to isolate the issue:

```typescript
// Minimal app/index.tsx
export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>App Loaded Successfully</Text>
    </View>
  );
}
```

### Step 3.4: Check Build Configuration
Verify `eas.json` and `app.json`:

```json
// eas.json - ensure production profile is correct
{
  "build": {
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

## Phase 4: Specific Fixes Based on Crash Type 🛠️

### Fix A: Immediate Crash (Before Any Screen)
**Most Likely:** Module initialization error

**Action:**
1. Check `app/_layout.tsx` for top-level code
2. Ensure all imports are safe
3. Wrap provider initialization in try-catch
4. Check for synchronous operations that might fail

### Fix B: Crash After Splash Screen
**Most Likely:** First screen render error

**Action:**
1. Check `app/index.tsx`
2. Verify `AuthContext` handles errors
3. Ensure navigation is safe
4. Check for missing data dependencies

### Fix C: Crash on First Interaction
**Most Likely:** Feature-specific issue

**Action:**
1. Identify which feature triggers crash
2. Check that feature's error handling
3. Verify all dependencies are available

## Phase 5: Verification Checklist ✅

Before rebuilding:

- [ ] EAS secrets are set and verified
- [ ] All native modules are properly configured
- [ ] All assets exist and paths are correct
- [ ] No dev-only code in production paths
- [ ] Error boundaries are in place
- [ ] All critical operations have try-catch
- [ ] Build configuration is correct
- [ ] App.json is valid

## Quick Fix Priority Order

If you need to fix quickly, try in this order:

1. **Check EAS Secrets** (5 min)
   ```bash
   eas secret:list
   ```

2. **Add Error Boundaries** (10 min)
   - Already done in `app/_layout.tsx`

3. **Wrap Critical Initialization** (15 min)
   - Supabase client ✅ (already fixed)
   - AuthContext ✅ (already fixed)
   - WidgetContext ✅ (already fixed)

4. **Test Minimal Build** (30 min)
   - Create minimal version to isolate issue

5. **Add Crash Reporting** (1 hour)
   - Sentry or similar for better diagnostics

## Next Steps

1. **Get the crash log** from TestFlight (most important!)
2. **Check EAS secrets** - run `eas secret:list`
3. **Review the crash stack trace** to identify the exact line
4. **Apply fixes** based on crash type
5. **Rebuild and test** incrementally

## Files to Check

1. `app/_layout.tsx` - Root layout initialization
2. `app/index.tsx` - Initial routing
3. `app/integrations/supabase/client.ts` - Supabase setup
4. `contexts/AuthContext.tsx` - Auth initialization
5. `contexts/WidgetContext.tsx` - Widget setup
6. `app.json` - Build configuration
7. `eas.json` - EAS build configuration

## Expected Outcome

After following this plan:
- ✅ Identify the exact cause of the crash
- ✅ Apply targeted fix
- ✅ Verify fix with new build
- ✅ App runs successfully on TestFlight
