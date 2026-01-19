# Share Feature Fix Instructions

## Problem
The share feature isn't showing social media apps in the share sheet because it's only sharing text, not images.

## Solution
Install `react-native-view-shot` to enable image capture and sharing:

```bash
cd project
npx expo install react-native-view-shot
```

## After Installation

1. **Rebuild the app**:
   ```bash
   npx expo prebuild --clean
   ```

2. **For iOS**: 
   ```bash
   npx expo run:ios
   ```

3. **For Android**:
   ```bash
   npx expo run:android
   ```

## How It Works

Once `react-native-view-shot` is installed:
- The app will capture the share card as an image
- The native share sheet will show all apps that can handle images
- Instagram, WhatsApp, Snapchat, and other social apps will appear
- Users can share directly to their preferred platform

## Current Behavior (Without Package)

Without `react-native-view-shot`:
- Shares as text only
- Limited app options in share sheet
- Social media apps may not appear

## Testing

1. Open the app
2. Go to Iman Tracker or Home screen
3. Click the share button on any streak card
4. The share sheet should now show Instagram, WhatsApp, Snapchat, etc.
5. Select an app to share the image
