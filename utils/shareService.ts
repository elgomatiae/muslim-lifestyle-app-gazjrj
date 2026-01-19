/**
 * ============================================================================
 * SHARE SERVICE
 * ============================================================================
 * 
 * Handles sharing share cards to various platforms
 * Supports: Instagram Stories, Snapchat, WhatsApp, and general sharing
 */

import { Platform, Alert, Share as RNShare, Linking } from 'react-native';
import { ShareCardData } from './shareCardGenerator';

// Try to import view-shot, but handle gracefully if not installed
let captureRef: any = null;
let ViewShot: any = null;
try {
  const viewShot = require('react-native-view-shot');
  // Handle both default export and named export
  ViewShot = viewShot.default || viewShot;
  captureRef = ViewShot?.captureRef || viewShot.captureRef;
  
  if (captureRef) {
    console.log('react-native-view-shot loaded successfully');
  }
} catch (e) {
  // react-native-view-shot not installed, will use text-only sharing
  console.log('react-native-view-shot not installed, using text-only sharing');
}

/**
 * Capture the card as an image
 */
async function captureCardAsImage(cardRef: React.RefObject<any>): Promise<string | null> {
  if (!captureRef || !cardRef.current) {
    return null;
  }

  try {
    const uri = await captureRef(cardRef.current, {
      format: 'png',
      quality: 1.0,
      result: 'tmpfile',
    });
    return uri;
  } catch (error) {
    console.error('Error capturing card as image:', error);
    return null;
  }
}

/**
 * Share a card to various platforms
 * Uses React Native's built-in Share API
 */
export async function shareCard(
  cardRef: React.RefObject<any>,
  data: ShareCardData,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // Try to capture as image first
    const imageUri = await captureCardAsImage(cardRef);
    
    const shareMessage = `${data.title}\n\n${data.subtitle || ''}\n\n${data.description || ''}\n\nShared from Natively`;

    try {
      if (imageUri && Platform.OS === 'ios') {
        // iOS: Share image with message - this will show social apps
        const result = await RNShare.share({
          message: shareMessage,
          url: imageUri, // iOS uses 'url' for images
          title: data.title,
        });

        if (result.action === RNShare.sharedAction) {
          console.log('Content shared successfully');
        }
      } else if (imageUri && Platform.OS === 'android') {
        // Android: Share image with message
        const result = await RNShare.share({
          message: shareMessage,
          url: imageUri, // Android also uses 'url' for images
          title: data.title,
        });

        if (result.action === RNShare.sharedAction) {
          console.log('Content shared successfully');
        }
      } else {
        // Fallback to text-only sharing
        // Note: Text-only sharing may not show all social apps
        // Install react-native-view-shot for full image sharing support
        const result = await RNShare.share({
          message: shareMessage,
          title: data.title,
        });

        if (result.action === RNShare.sharedAction) {
          console.log('Content shared successfully');
        } else {
          // If user cancelled and package isn't installed, show helpful message
          if (!captureRef) {
            console.log('Tip: Install react-native-view-shot for image sharing with social apps');
          }
        }
      }
    } catch (shareError: any) {
      if (shareError.message !== 'User did not share') {
        throw shareError;
      }
    }

  } catch (error) {
    console.error('Error sharing card:', error);
    if (onError) {
      onError(error as Error);
    } else {
      Alert.alert(
        'Share Error',
        'Unable to share the card. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }
}

/**
 * Share to Instagram Stories (iOS only)
 * Note: Direct Instagram Stories sharing requires the app to be installed
 * and uses the native share sheet which includes Instagram as an option
 */
export async function shareToInstagramStories(
  cardRef: React.RefObject<any>,
  data: ShareCardData
): Promise<void> {
  try {
    // Capture the image first
    const imageUri = await captureCardAsImage(cardRef);
    
    if (imageUri && Platform.OS === 'ios') {
      // On iOS, use the share sheet with the image
      // Instagram Stories will appear as an option if Instagram is installed
      const shareMessage = `${data.title}\n\n${data.subtitle || ''}\n\n${data.description || ''}`;
      
      try {
        await RNShare.share({
          message: shareMessage,
          url: imageUri,
          title: data.title,
        });
      } catch (shareError: any) {
        if (shareError.message !== 'User did not share') {
          // Fallback to general share
          await shareCard(cardRef, data);
        }
      }
    } else {
      // Fallback to general share (works on all platforms)
      await shareCard(cardRef, data);
    }
  } catch (error) {
    console.error('Error sharing to Instagram Stories:', error);
    // Fallback to general share
    await shareCard(cardRef, data);
  }
}

/**
 * Share to WhatsApp
 * Uses native share sheet which will show WhatsApp if installed
 */
export async function shareToWhatsApp(
  cardRef: React.RefObject<any>,
  data: ShareCardData
): Promise<void> {
  try {
    // Capture the image first
    const imageUri = await captureCardAsImage(cardRef);
    const shareMessage = `${data.title}\n\n${data.subtitle || ''}\n\n${data.description || ''}`;
    
    if (imageUri) {
      // Share with image - WhatsApp will appear in share sheet if installed
      try {
        await RNShare.share({
          message: shareMessage,
          url: imageUri,
          title: data.title,
        });
      } catch (shareError: any) {
        if (shareError.message !== 'User did not share') {
          // Fallback to general share
          await shareCard(cardRef, data);
        }
      }
    } else {
      // Fallback to general share
      await shareCard(cardRef, data);
    }
  } catch (error) {
    console.error('Error sharing to WhatsApp:', error);
    // Fallback to general share
    await shareCard(cardRef, data);
  }
}

/**
 * Share to Snapchat
 * Uses native share sheet which will show Snapchat if installed
 */
export async function shareToSnapchat(
  cardRef: React.RefObject<any>,
  data: ShareCardData
): Promise<void> {
  try {
    // Capture the image first
    const imageUri = await captureCardAsImage(cardRef);
    const shareMessage = `${data.title}\n\n${data.subtitle || ''}\n\n${data.description || ''}`;
    
    if (imageUri) {
      // Share with image - Snapchat will appear in share sheet if installed
      try {
        await RNShare.share({
          message: shareMessage,
          url: imageUri,
          title: data.title,
        });
      } catch (shareError: any) {
        if (shareError.message !== 'User did not share') {
          // Fallback to general share
          await shareCard(cardRef, data);
        }
      }
    } else {
      // Fallback to general share
      await shareCard(cardRef, data);
    }
  } catch (error) {
    console.error('Error sharing to Snapchat:', error);
    // Fallback to general share
    await shareCard(cardRef, data);
  }
}
