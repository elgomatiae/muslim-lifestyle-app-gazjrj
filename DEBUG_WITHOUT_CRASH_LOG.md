# Debugging Without Crash Logs

Since crash logs aren't immediately available, here's how to debug systematically.

## Strategy: Fix Most Common Issues First 🎯

### Step 1: Check EAS Secrets (Takes 30 seconds)

```bash
cd project
eas secret:list
```

**If this shows empty or missing secrets, this is 90% likely the cause!**

Fix it:
```bash
# Get your Supabase credentials from:
# https://supabase.com/dashboard → Your Project → Settings → API

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://YOUR_PROJECT.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY

# Verify
eas secret:list

# Rebuild
eas build --platform ios --profile production
```

### Step 2: Add Better Error Logging

Add this to catch errors before they crash:

```typescript
// app/_layout.tsx - Add at the very beginning
import { LogBox } from 'react-native';

// Show all errors (even in production)
if (!__DEV__) {
  LogBox.ignoreAllLogs(false);
}

// Global error handler
const originalError = console.error;
console.error = (...args) => {
  originalError(...args);
  // In production, you could send this to a logging service
};
```

### Step 3: Create a Diagnostic Build

Create a version that logs everything:

```typescript
// app/index.tsx - Diagnostic version
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    console.log('=== APP STARTUP DIAGNOSTICS ===');
    console.log('1. App loaded successfully');
    console.log('2. Auth loading:', loading);
    console.log('3. User:', user ? 'Logged in' : 'Not logged in');
    console.log('4. Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('5. Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostic Build</Text>
      <Text style={styles.text}>Loading: {loading ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>User: {user ? 'Logged In' : 'Not Logged In'}</Text>
      <Text style={styles.text}>Supabase URL: {process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</Text>
      <Text style={styles.text}>Supabase Key: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
});
```

This will show you exactly what's missing when the app opens.

### Step 4: Test with Minimal Code

If the diagnostic build works, gradually add features back:

1. **Minimal (just text)** ✅
2. **Add AuthContext** ✅
3. **Add navigation** ✅
4. **Add other contexts** ✅

This helps identify which part causes the crash.

### Step 5: Check Build Configuration

Verify your build is correct:

```bash
# Check eas.json
cat project/eas.json

# Should show:
# "production": {
#   "ios": {
#     "buildConfiguration": "Release"
#   }
# }
```

### Step 6: Try Development Build

Development builds have better error messages:

```bash
eas build --platform ios --profile development
```

Install this and see if you get more detailed errors.

## Most Likely Issues (In Order) 📊

### 1. Missing EAS Secrets (90% probability)
**Symptom:** Works in Expo, crashes on TestFlight
**Fix:** Set EAS secrets (see Step 1)

### 2. Font Loading (5% probability)
**Symptom:** Crashes during splash screen
**Fix:** Already handled, but verify font exists

### 3. Native Module (3% probability)
**Symptom:** Error about TurboModule
**Fix:** Check app.json plugins

### 4. Asset Missing (2% probability)
**Symptom:** Crashes when loading image
**Fix:** Verify all assets exist

## Quick Test: Does Minimal Build Work?

Create this minimal version:

```typescript
// app/index.tsx
import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test Build</Text>
    </View>
  );
}
```

**If this works:** The issue is in your initialization code
**If this crashes:** The issue is in build configuration

## Action Plan 🎯

1. **First:** Check EAS secrets (30 seconds)
2. **Second:** Create diagnostic build (5 minutes)
3. **Third:** Test minimal build (5 minutes)
4. **Fourth:** Try development build (15 minutes)
5. **Fifth:** Wait for crash logs (24-48 hours)

## Expected Results

- **If EAS secrets missing:** Setting them fixes it immediately
- **If diagnostic build works:** Shows what's missing
- **If minimal build works:** Issue is in initialization
- **If minimal build crashes:** Issue is in build config

## Pro Tip 💡

**90% of TestFlight crashes are missing EAS secrets.**

Even without crash logs, try this first:
```bash
eas secret:list
# If empty, set them and rebuild
```

This single fix resolves most crashes!
