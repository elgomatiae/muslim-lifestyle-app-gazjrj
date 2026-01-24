# How to Get Crash Logs from TestFlight

## Method 1: App Store Connect (Primary Method) 📱

### Step-by-Step Instructions:

1. **Go to App Store Connect**
   - Visit: https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account

2. **Navigate to Your App**
   - Click **"My Apps"**
   - Select your app (Natively)

3. **Go to TestFlight Section**
   - Click **"TestFlight"** tab at the top
   - You'll see different sections: Testers, Builds, Crashes, etc.

4. **Access Crash Reports**
   - Click **"Crashes"** in the left sidebar (or top navigation)
   - You'll see a list of crashes organized by build version

5. **View Crash Details**
   - Click on a crash report
   - You'll see:
     - **Crash Count** (how many times it happened)
     - **Affected Devices** (which devices/iOS versions)
     - **Crash Time** (when it occurred)

6. **Download Crash Log**
   - Click the **"Download"** button (usually a download icon)
   - The file will be a `.crash` file
   - Open it in a text editor to see the stack trace

### What You'll See in the Crash Log:

```
Exception Type: EXC_BAD_ACCESS
Exception Subtype: KERN_INVALID_ADDRESS
Crashed Thread: 0

Thread 0 Crashed:
0   YourAppName                   0x0000000100123456 function_name + 123
1   YourAppName                   0x0000000100123457 another_function + 456
...
```

**Look for:**
- The first few lines of "Thread 0 Crashed" (main thread)
- Function names that mention: Supabase, Font, Module, Asset, etc.
- Line numbers if available

## Method 2: Xcode Organizer (If You Have Xcode) 💻

1. **Open Xcode**
2. **Go to Window → Organizer** (or press `Cmd + Shift + 2`)
3. **Click "Crashes" tab**
4. **Select your app** from the list
5. **View crash reports** - Xcode will show symbolicated crash logs

## Method 3: Device Logs (If You Have Physical Device) 📲

### Using Xcode:

1. **Connect your iPhone/iPad** to your Mac
2. **Open Xcode**
3. **Go to Window → Devices and Simulators** (`Cmd + Shift + 2`)
4. **Select your device** from the left sidebar
5. **Click "Open Console"** button
6. **Filter by your app's bundle ID**: `com.createinc.70b3026932584f00a21b8830ccd84bfa`
7. **Reproduce the crash** on the device
8. **View the error** in the console

### Using Console.app (macOS):

1. **Open Console.app** (Applications → Utilities → Console)
2. **Connect your device** via USB
3. **Select your device** from the left sidebar
4. **Filter by your app name** or bundle ID
5. **Reproduce the crash**
6. **View the error** in real-time

## Method 4: Add Crash Reporting (Recommended for Future) 🛠️

Since TestFlight crash logs can be delayed, add crash reporting to your app:

### Option A: Sentry (Recommended)

1. **Install Sentry:**
   ```bash
   cd project
   npx expo install @sentry/react-native
   ```

2. **Initialize in your app:**
   ```typescript
   // app/_layout.tsx
   import * as Sentry from '@sentry/react-native';
   
   Sentry.init({
     dsn: 'YOUR_SENTRY_DSN', // Get from sentry.io
     enableInExpoDevelopment: false,
     debug: false,
   });
   ```

3. **Get real-time crash reports** in Sentry dashboard

### Option B: Firebase Crashlytics

1. **Install Firebase:**
   ```bash
   npx expo install @react-native-firebase/app @react-native-firebase/crashlytics
   ```

2. **Initialize in your app**
3. **View crashes** in Firebase Console

## Method 5: Add Console Logging (Quick Debug) 📝

Add detailed logging to catch errors:

```typescript
// app/_layout.tsx - Add at the very top
if (!__DEV__) {
  // In production, log to a file or remote service
  const originalError = console.error;
  console.error = (...args) => {
    originalError(...args);
    // Send to your logging service
  };
}

// Wrap critical sections
try {
  // Your initialization code
} catch (error) {
  console.error('CRITICAL ERROR:', error);
  // This will show in device logs
}
```

## Method 6: Check TestFlight Build Details 📊

1. **Go to App Store Connect → TestFlight**
2. **Click on the build** that's crashing
3. **Check "Build Information"**
   - Look for warnings or errors
   - Check build logs if available

## What to Do If Crash Logs Aren't Available Yet ⏰

### Option 1: Wait (Usually 24-48 hours)
- Crash logs can take time to appear in App Store Connect
- Check back in a few hours

### Option 2: Use Alternative Methods
- Try Method 3 (Device Logs) if you have a physical device
- Add crash reporting (Method 4) for future builds

### Option 3: Systematic Testing
Since you can't see the crash log yet, try these fixes in order:

#### Fix #1: Check EAS Secrets (Most Common)
```bash
cd project
eas secret:list
```

If empty, set them:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value YOUR_URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_KEY
```

#### Fix #2: Add More Error Handling
The app already has error handling, but we can add more:

```typescript
// Wrap the entire app initialization
try {
  // App code
} catch (error) {
  console.error('App initialization error:', error);
  // Show error screen instead of crashing
}
```

#### Fix #3: Test with Minimal Code
Create a minimal version to isolate the issue (see ACTION_PLAN_TESTFLIGHT_CRASH.md)

## Quick Checklist While Waiting for Crash Logs ✅

While waiting for crash logs to appear:

- [ ] Check EAS secrets: `eas secret:list`
- [ ] Verify font file exists: `ls project/assets/fonts/SpaceMono-Regular.ttf`
- [ ] Check app.json is valid: `cat project/app.json | jq .`
- [ ] Verify eas.json is correct: `cat project/eas.json | jq .`
- [ ] Try building a development build (better error messages)
- [ ] Add Sentry or similar for future builds

## Understanding Crash Log Format 📖

When you get the crash log, look for:

```
Exception Type: EXC_BAD_ACCESS
  ↓
  This means accessing invalid memory (null pointer, etc.)

Thread 0 Crashed:
0   YourApp    0x123456 function_name + 123
  ↓
  This is where it crashed - function_name is the key!

Binary Images:
YourApp 0x100000000 - 0x100FFFFFF
  ↓
  Your app's memory range
```

**Key things to find:**
1. **Exception Type** - What kind of error
2. **First function in "Thread 0 Crashed"** - Where it crashed
3. **Function names** - Look for Supabase, Font, Module, etc.

## Next Steps 🚀

1. **Try to access crash logs** using Method 1 (App Store Connect)
2. **If not available**, use Method 3 (Device Logs) if you have a device
3. **While waiting**, apply the most common fixes (EAS secrets)
4. **For future builds**, add crash reporting (Method 4)

## Pro Tip 💡

**Most TestFlight crashes are due to missing EAS secrets.** 

Even without the crash log, try this first:

```bash
eas secret:list
# If empty, set them and rebuild
```

This fixes 90% of TestFlight crashes!
