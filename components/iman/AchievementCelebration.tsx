/**
 * Achievement Celebration Component
 * Displays animated celebration when an achievement is unlocked
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { getScreenWidth, getScreenHeight } from '@/utils/screenDimensions';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

const SCREEN_WIDTH = getScreenWidth();
const SCREEN_HEIGHT = getScreenHeight();

interface AchievementCelebrationProps {
  visible: boolean;
  achievement: {
    id: string;
    title: string;
    description: string;
    icon_name: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    unlock_message?: string;
    points: number;
  } | null;
  onClose: () => void;
}

export default function AchievementCelebration({
  visible,
  achievement,
  onClose,
}: AchievementCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return ['#A78BFA', '#8B5CF6'];
      case 'gold': return ['#FBBF24', '#F59E0B'];
      case 'silver': return ['#9CA3AF', '#6B7280'];
      case 'bronze': return ['#CD7F32', '#B87333'];
      default: return [colors.primary, colors.primary];
    }
  };

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '🏆';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🎉';
    }
  };

  useEffect(() => {
    if (visible && achievement) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      rotationAnim.setValue(0);
      confettiAnim.setValue(0);
      slideAnim.setValue(50);

      // Animate entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!achievement) return null;

  const tierColors = getTierColor(achievement.tier);
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Confetti Effect */}
          <Animated.View
            style={[
              styles.confettiContainer,
              {
                opacity: confettiAnim,
              },
            ]}
          >
            {[...Array(20)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.confetti,
                  {
                    left: `${(i * 5) % 100}%`,
                    backgroundColor: [
                      '#FFD700',
                      '#FF6B6B',
                      '#4ECDC4',
                      '#45B7D1',
                      '#FFA07A',
                      '#98D8C8',
                    ][i % 6],
                    transform: [
                      {
                        rotate: rotationAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${360 + i * 45}deg`],
                        }),
                      },
                      {
                        translateY: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, SCREEN_HEIGHT],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </Animated.View>

          {/* Main Content */}
          <LinearGradient
            colors={[...tierColors, tierColors[0] + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="close-circle"
                size={28}
                color="rgba(255, 255, 255, 0.9)"
              />
            </TouchableOpacity>

            {/* Achievement Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ rotate: rotation }],
                },
              ]}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.tierEmoji}>{getTierEmoji(achievement.tier)}</Text>
                <IconSymbol
                  ios_icon_name={achievement.icon_name || 'star.fill'}
                  android_material_icon_name="star"
                  size={48}
                  color="#FFFFFF"
                />
              </View>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>Achievement Unlocked!</Text>

            {/* Achievement Name */}
            <Text style={styles.achievementTitle}>{achievement.title}</Text>

            {/* Tier Badge */}
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>
                {achievement.tier.toUpperCase()} • {achievement.points} POINTS
              </Text>
            </View>

            {/* Message */}
            <Text style={styles.message}>
              {achievement.unlock_message || achievement.description}
            </Text>

            {/* Points Display */}
            <View style={styles.pointsContainer}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color="#FFD700"
              />
              <Text style={styles.pointsText}>+{achievement.points} Points</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.large,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
    top: -20,
  },
  gradient: {
    padding: spacing.xl,
    alignItems: 'center',
    paddingTop: spacing.xxl,
    zIndex: 2,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tierEmoji: {
    fontSize: 40,
    position: 'absolute',
    top: -10,
    right: -10,
  },
  title: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  achievementTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: spacing.md,
    textAlign: 'center',
    fontSize: 24,
  },
  tierBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  tierText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 1,
  },
  message: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontSize: 16,
    lineHeight: 24,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  pointsText: {
    ...typography.h4,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
