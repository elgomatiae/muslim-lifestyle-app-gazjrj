/**
 * ============================================================================
 * ACCESS GATE COMPONENT
 * ============================================================================
 * 
 * Component that shows an ad before allowing access to a feature
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
// Lazy import to avoid loading AdMob module
import type { GatedFeature } from '@/utils/accessGate';
import * as Haptics from 'expo-haptics';

interface AccessGateProps {
  feature: GatedFeature;
  children: React.ReactNode;
  onAccessGranted?: () => void;
}

export default function AccessGate({ feature, children, onAccessGranted }: AccessGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);

  useEffect(() => {
    checkUnlockStatus();
  }, [feature]);

  const checkUnlockStatus = async () => {
    try {
      const accessGate = await import('@/utils/accessGate');
      const unlocked = await accessGate.isFeatureUnlocked(feature);
      setIsUnlocked(unlocked);
    } catch (error) {
      console.error('Error checking unlock status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestAccess = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoadingAd(true);
    setShowAdModal(false);

    try {
      const accessGate = await import('@/utils/accessGate');
      const hasAccess = await accessGate.checkAccessGate(
        feature,
        () => {
          // Access granted after watching ad
          setIsUnlocked(true);
          onAccessGranted?.();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        () => {
          // User cancelled or ad failed
          setIsLoadingAd(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      );

      if (hasAccess) {
        setIsUnlocked(true);
        onAccessGranted?.();
      } else {
        setIsLoadingAd(false);
      }
    } catch (error) {
      console.error('Error checking access gate:', error);
      setIsLoadingAd(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <>
      <View style={styles.lockedContainer}>
        <View style={styles.lockedContent}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={64}
              color={colors.textSecondary}
            />
          </View>
          
          <Text style={styles.lockedTitle}>Watch Ad to Unlock</Text>
          <Text style={styles.lockedDescription}>
            Watch a short ad to access this feature
          </Text>

          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => setShowAdModal(true)}
            disabled={isLoadingAd}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.unlockButtonGradient}
            >
              {isLoadingAd ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="play.circle.fill"
                    android_material_icon_name="play-circle-filled"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.unlockButtonText}>Watch Ad to Unlock</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showAdModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unlock Access</Text>
            <Text style={styles.modalDescription}>
              Watch a short rewarded ad to unlock access to this feature.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAdModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleRequestAccess}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonTextConfirm}>Watch Ad</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  lockedContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  },
  lockedTitle: {
    ...typography.h2,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  lockedDescription: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  unlockButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  unlockButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  unlockButtonText: {
    ...typography.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
  },
  modalTitle: {
    ...typography.h3,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalDescription: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    ...typography.bold,
    fontSize: 16,
    color: colors.text,
  },
  modalButtonTextConfirm: {
    ...typography.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
