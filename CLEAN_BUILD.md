# Clean Build Instructions

## The Problem
EAS is still trying to resolve `react-native-google-mobile-ads` plugin even though it's been removed from `app.json` and `package.json`. This is due to cached files.

## Solution: Clean Everything

Run these commands in order:

### Step 1: Clean node_modules and reinstall
```powershell
cd project
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Step 2: Clear Expo cache
```powershell
npx expo start --clear
```
(Press Ctrl+C to stop it)

### Step 3: Clear EAS cache and rebuild
```powershell
eas build --platform ios --profile production --clear-cache
```

### Step 4: Try submitting again
```powershell
eas submit --platform ios
```

## Alternative: Quick Fix
If you just want to submit an existing build:

```powershell
# Make sure you have a build first
eas build --platform ios --profile production --clear-cache

# Then submit
eas submit --platform ios
```

The `--clear-cache` flag will force EAS to rebuild everything from scratch, which should resolve the plugin issue.
