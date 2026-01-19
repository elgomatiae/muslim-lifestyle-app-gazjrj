# Share Cards Installation Guide

## Required Packages

To enable full image sharing functionality for share cards, install these packages:

```bash
npx expo install expo-sharing
npx expo install react-native-view-shot
npx expo install expo-file-system
```

## Current Implementation

The share cards system is currently implemented with:
- ✅ Share card generator with beautiful templates
- ✅ Share modal with platform-specific buttons
- ✅ Integration with streaks and achievements
- ✅ Text-based sharing (works without additional packages)
- ⚠️ Image capture (requires `react-native-view-shot`)

## What Works Now

1. **Share Cards Generated**: All card types are generated correctly
2. **Share Modal**: Beautiful modal with platform options
3. **Text Sharing**: Shares as text message (works on all platforms)
4. **Platform Detection**: Detects installed apps (Instagram, WhatsApp, Snapchat)

## What Requires Packages

1. **Image Capture**: To capture the card as an actual image
2. **File Sharing**: To share the image file directly
3. **Instagram Stories**: Direct image sharing to Instagram Stories

## After Installation

Once you install the packages, update `shareService.ts`:

1. Uncomment the image capture code
2. The share functions will automatically use image sharing
3. Instagram Stories will work with actual images

## Testing

1. Complete an action (prayer, workout, Quran)
2. View your streaks in the Iman Tracker
3. Click the share button on any streak card
4. Select a platform to share
5. The card will be shared (as text now, as image after package installation)
