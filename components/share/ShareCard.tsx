/**
 * ============================================================================
 * SHARE CARD COMPONENT
 * ============================================================================
 * 
 * Beautiful, interactive shareable card component with animations
 */

import React, { forwardRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, typography } from '@/styles/commonStyles';
import { ShareCardData, getShareCardIcon, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT } from '@/utils/shareCardGenerator';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShareCardProps {
  data: ShareCardData;
  width?: number;
  height?: number;
}

const ShareCard = forwardRef<View, ShareCardProps>(({ data, width = SCREEN_WIDTH, height = SCREEN_WIDTH * 1.777 }, ref) => {
  const icon = getShareCardIcon(data.type);
  const gradient = data.gradient || ['#6366F1', '#4F46E5', '#4338CA'];

  // Animations
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const glowAnim = useMemo(() => new Animated.Value(0), []);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);
  const sparkleAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation for decorative circles
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, glowAnim, rotateAnim, sparkleAnim]);

  const iconScale = pulseAnim;
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View ref={ref} style={[styles.container, { width, height }]} collapsable={false}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated decorative elements */}
        <Animated.View 
          style={[
            styles.decorativeCircle1,
            {
              transform: [{ rotate }],
              opacity: glowOpacity,
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle2,
            {
              transform: [{ rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-360deg'],
              }) }],
              opacity: glowOpacity,
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle3,
            {
              opacity: sparkleOpacity,
            }
          ]} 
        />

        {/* Sparkle particles */}
        <Animated.View style={[styles.sparkle1, { opacity: sparkleOpacity }]} />
        <Animated.View style={[styles.sparkle2, { opacity: sparkleOpacity }]} />
        <Animated.View style={[styles.sparkle3, { opacity: sparkleOpacity }]} />
        <Animated.View style={[styles.sparkle4, { opacity: sparkleOpacity }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Animated Icon with glow */}
          <View style={styles.iconContainer}>
            <Animated.View 
              style={[
                styles.iconGlow,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: iconScale }],
                }
              ]}
            />
            <Animated.View 
              style={[
                styles.iconBackground,
                {
                  transform: [{ scale: iconScale }],
                }
              ]}
            >
              <IconSymbol
                ios_icon_name={icon.ios}
                android_material_icon_name={icon.android}
                size={width * 0.15}
                color="#FFFFFF"
              />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { fontSize: width * 0.06 }]} numberOfLines={2}>
            {data.title}
          </Text>

          {/* Subtitle */}
          {data.subtitle && (
            <Text style={[styles.subtitle, { fontSize: width * 0.035 }]} numberOfLines={1}>
              {data.subtitle}
            </Text>
          )}

          {/* Animated Value */}
          <Animated.View 
            style={[
              styles.valueContainer,
              {
                transform: [{ scale: pulseAnim }],
              }
            ]}
          >
            <Text style={[styles.value, { fontSize: width * 0.2 }]}>
              {data.value}
            </Text>
            {typeof data.value === 'number' && (
              <Text style={[styles.valueLabel, { fontSize: width * 0.04 }]}>
                {data.value === 1 ? 'Day' : 'Days'}
              </Text>
            )}
          </Animated.View>

          {/* Description */}
          {data.description && (
            <Text style={[styles.description, { fontSize: width * 0.04 }]} numberOfLines={2}>
              {data.description}
            </Text>
          )}

          {/* Progress indicator for streaks */}
          {typeof data.value === 'number' && data.value > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (data.value / 30) * 100)}%`,
                      opacity: glowOpacity,
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {data.value < 30 ? `${30 - data.value} days until 30-day milestone` : '30-day milestone achieved! 🎉'}
              </Text>
            </View>
          )}

          {/* App branding */}
          <View style={styles.branding}>
            <View style={styles.brandingLine} />
            <Text style={[styles.brandingText, { fontSize: width * 0.025 }]}>
              Natively
            </Text>
            <View style={styles.brandingLine} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 0,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -150,
    right: -150,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -100,
    left: -100,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '40%',
    right: -50,
  },
  sparkle1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    top: '20%',
    left: '15%',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  sparkle2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    top: '60%',
    right: '20%',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  sparkle3: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    bottom: '30%',
    left: '25%',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  sparkle4: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
    top: '45%',
    right: '30%',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 7,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    zIndex: 1,
  },
  title: {
    ...typography.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...typography.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  value: {
    ...typography.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  valueLabel: {
    ...typography.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    ...typography.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  branding: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandingLine: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  brandingText: {
    ...typography.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 30,
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  progressText: {
    ...typography.caption,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
