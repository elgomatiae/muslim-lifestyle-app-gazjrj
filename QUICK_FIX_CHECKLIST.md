# Quick Fix Checklist for TestFlight Crash

## Immediate Actions (Do These First) ⚡

### 1. Check EAS Secrets (30 seconds)
```bash
cd project
eas secret:list
```

**If empty or missing:**
```bash
# Get your Supabase credentials from: https://supabase.com/dashboard → Settings → API
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value YOUR_SUPABASE_URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY
```

### 2. Verify Font File Exists (1 minute)
```bash
# Check if font exists
ls -la project/assets/fonts/SpaceMono-Regular.ttf
```

**If missing:**
- The app will crash on font load
- Either add the font file or remove the font requirement

### 3. Check Build Configuration (2 minutes)
```bash
# Verify eas.json exists and is correct
cat project/eas.json

# Verify app.json is valid
cat project/app.json | jq .
```

## Most Likely Issues (In Order of Probability)

### Issue #1: Missing EAS Secrets (90% probability)
**Symptom:** Works in Expo, crashes immediately on TestFlight

**Fix:**
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://YOUR_PROJECT.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY
eas build --platform ios --profile production
```

### Issue #2: Font File Missing (5% probability)
**Symptom:** Crashes during splash screen

**Fix:**
- Remove font requirement OR
- Add the font file to `assets/fonts/`

### Issue #3: Native Module Issue (3% probability)
**Symptom:** Error about TurboModuleRegistry or native module

**Fix:**
- Check `app.json` plugins are correct
- Ensure all native dependencies are properly configured

### Issue #4: Asset Loading (2% probability)
**Symptom:** Crashes when trying to load images

**Fix:**
- Verify all image paths in code match actual files
- Check `app.json` icon and splash paths

## Step-by-Step Fix Process

### Step 1: Get Crash Log (5 minutes)
1. Open App Store Connect
2. Go to TestFlight → Your App → Crashes
3. Download the .crash file
4. Look at the first few lines of the stack trace

### Step 2: Identify the Error (2 minutes)
- **"Supabase" or "environment"** → Missing EAS secrets
- **"Font" or "SpaceMono"** → Missing font file
- **"TurboModule"** → Native module issue
- **"Asset" or "image"** → Missing asset

### Step 3: Apply Fix (5-10 minutes)
Based on error type, apply the corresponding fix above

### Step 4: Rebuild (15-30 minutes)
```bash
eas build --platform ios --profile production
```

### Step 5: Test (5 minutes)
- Install from TestFlight
- Verify app opens without crashing

## Emergency Fallback: Minimal Build Test

If nothing works, create a minimal test build:

```typescript
// app/index.tsx - Minimal version
import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>App Loaded</Text>
    </View>
  );
}
```

If this works, the issue is in your initialization code. If it still crashes, it's a build configuration issue.

## Verification Commands

```bash
# 1. Check secrets
eas secret:list

# 2. Check build config
cat project/eas.json

# 3. Check app config
cat project/app.json | jq .

# 4. Verify font exists
ls project/assets/fonts/

# 5. Check for syntax errors
cd project && npm run typecheck
```

## Expected Timeline

- **Diagnosis:** 5-10 minutes
- **Fix:** 5-15 minutes
- **Rebuild:** 15-30 minutes
- **Test:** 5 minutes

**Total: 30-60 minutes**

## If Still Crashing

1. **Get the exact crash log** from TestFlight
2. **Share the first 20 lines** of the stack trace
3. **Check device logs** if possible
4. **Try minimal build** to isolate the issue

The crash log is the most important piece of information - it will tell you exactly what's failing.
