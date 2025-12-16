
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { getCurrentImanScore, getScoreBreakdown } from "@/utils/imanScoreCalculator";
import * as Haptics from 'expo-haptics';

interface ImanRingsDisplayProps {
  prayerProgress: number;
  quranProgress: number;
  dhikrProgress: number;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string;
  };
  prayerCompleted: number;
  prayerTotal: number;
  quranCompleted: number;
  quranTotal: number;
  dhikrCompleted: number;
  dhikrTotal: number;
}

export default function ImanRingsDisplay({
  prayerProgress,
  quranProgress,
  dhikrProgress,
  streakData,
  prayerCompleted,
  prayerTotal,
  quranCompleted,
  quranTotal,
  dhikrCompleted,
  dhikrTotal,
}: ImanRingsDisplayProps) {
  const pulseAnim = useState(new Animated.Value(1))[0];
  const glowAnim = useState(new Animated.Value(0))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];
  
  const [imanScore, setImanScore] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 60000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    loadImanScore();
    const interval = setInterval(loadImanScore, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [prayerProgress, quranProgress, dhikrProgress]);

  const loadImanScore = async () => {
    const score = await getCurrentImanScore();
    setImanScore(score);
    
    const breakdown = await getScoreBreakdown();
    setScoreBreakdown(breakdown);
  };

  const totalPercentage = Math.round(imanScore);

  const getAchievementBadge = (percentage: number) => {
    if (percentage >= 100) return { icon: "star.fill", color: colors.accent, label: "Perfect" };
    if (percentage >= 80) return { icon: "flame.fill", color: colors.warning, label: "On Fire" };
    if (percentage >= 60) return { icon: "bolt.fill", color: colors.info, label: "Strong" };
    return { icon: "leaf.fill", color: colors.primary, label: "Growing" };
  };

  const getDailyInsight = () => {
    if (imanScore >= 100) {
      return { text: "Perfect! All goals completed! 🎉", color: colors.success };
    }
    if (imanScore >= 90) {
      return { text: "Almost perfect! Keep going! 💪", color: colors.success };
    }
    if (prayerProgress === 1) {
      return { text: "All prayers completed! 🤲", color: colors.primary };
    }
    if (quranProgress === 1) {
      return { text: "Quran goals achieved! 📖", color: colors.accent };
    }
    if (dhikrProgress === 1) {
      return { text: "Dhikr goal reached! ✨", color: colors.info };
    }
    if (imanScore >= 70) {
      return { text: "Great progress today! 💫", color: colors.primary };
    }
    if (imanScore >= 50) {
      return { text: "Keep building momentum! 🌱", color: colors.textSecondary };
    }
    if (imanScore >= 30) {
      return { text: "Every step counts! 🚀", color: colors.warning };
    }
    return { text: "Begin your journey today! 🌙", color: colors.textSecondary };
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 100) return "Masha'Allah! Perfect day! 🌟";
    if (percentage >= 90) return "Outstanding! Almost there! 💪";
    if (percentage >= 80) return "Excellent progress! Keep going! ✨";
    if (percentage >= 70) return "Great effort! You're doing well! 🌟";
    if (percentage >= 60) return "Good progress! Stay consistent! 💫";
    if (percentage >= 50) return "Halfway there! Don't give up! 🌱";
    if (percentage >= 40) return "Keep pushing forward! 🚀";
    if (percentage >= 30) return "Every action counts! 💪";
    if (percentage >= 20) return "Start small, grow big! 🌱";
    return "Begin your journey today! 🌙";
  };

  const getDecayWarning = () => {
    if (imanScore < 30) {
      return { text: "⚠️ Low Iman score! Complete goals to increase.", color: colors.error };
    }
    if (imanScore < 50) {
      return { text: "⏰ Score decaying. Stay active!", color: colors.warning };
    }
    return null;
  };

  const badge = getAchievementBadge(totalPercentage);
  const insight = getDailyInsight();
  const decayWarning = getDecayWarning();

  const centerX = 170;
  const centerY = 170;
  
  const prayerRadius = 140;
  const prayerStroke = 20;
  const prayerCircumference = 2 * Math.PI * prayerRadius;
  const prayerOffset = prayerCircumference * (1 - prayerProgress);
  
  const quranRadius = 100;
  const quranStroke = 18;
  const quranCircumference = 2 * Math.PI * quranRadius;
  const quranOffset = quranCircumference * (1 - quranProgress);
  
  const dhikrRadius = 60;
  const dhikrStroke = 16;
  const dhikrCircumference = 2 * Math.PI * dhikrRadius;
  const dhikrOffset = dhikrCircumference * (1 - dhikrProgress);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const toggleBreakdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBreakdown(!showBreakdown);
  };

  return (
    <LinearGradient
      colors={['#F8F8FF', '#E8E8F8', '#F8F8FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.ringsWrapper}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width={340} height={340}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={badge.color} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={badge.color} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            
            <Animated.View style={{ opacity: glowOpacity }}>
              <Circle
                cx={centerX}
                cy={centerY}
                r={150}
                fill="url(#glow)"
              />
            </Animated.View>
            
            <Circle
              cx={centerX}
              cy={centerY}
              r={prayerRadius}
              stroke="#808080"
              strokeWidth={prayerStroke}
              fill="none"
              opacity={0.6}
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={prayerRadius}
              stroke={colors.primary}
              strokeWidth={prayerStroke}
              fill="none"
              strokeDasharray={prayerCircumference}
              strokeDashoffset={prayerOffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${centerX}, ${centerY}`}
            />
            
            <Circle
              cx={centerX}
              cy={centerY}
              r={quranRadius}
              stroke="#808080"
              strokeWidth={quranStroke}
              fill="none"
              opacity={0.6}
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={quranRadius}
              stroke={colors.accent}
              strokeWidth={quranStroke}
              fill="none"
              strokeDasharray={quranCircumference}
              strokeDashoffset={quranOffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${centerX}, ${centerY}`}
            />
            
            <Circle
              cx={centerX}
              cy={centerY}
              r={dhikrRadius}
              stroke="#808080"
              strokeWidth={dhikrStroke}
              fill="none"
              opacity={0.6}
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={dhikrRadius}
              stroke={colors.info}
              strokeWidth={dhikrStroke}
              fill="none"
              strokeDasharray={dhikrCircumference}
              strokeDashoffset={dhikrOffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${centerX}, ${centerY}`}
            />
          </Svg>
        </Animated.View>
        
        <TouchableOpacity 
          style={styles.centerContentWrapper}
          onPress={toggleBreakdown}
          activeOpacity={0.8}
        >
          <Animated.View 
            style={[
              styles.centerContent,
              {
                transform: [{ scale: pulseAnim }],
              }
            ]}
          >
            <Text style={styles.centerTitle}>Iman Score</Text>
            <Text style={[styles.centerPercentage, { color: badge.color }]}>{totalPercentage}%</Text>
            <Text style={styles.centerHint}>Tap for details</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      {decayWarning && (
        <LinearGradient
          colors={[decayWarning.color + '20', decayWarning.color + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.warningContainer}
        >
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={20}
            color={decayWarning.color}
          />
          <Text style={[styles.warningText, { color: decayWarning.color }]}>
            {decayWarning.text}
          </Text>
        </LinearGradient>
      )}
      
      <LinearGradient
        colors={[insight.color + '20', insight.color + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.insightContainer}
      >
        <IconSymbol
          ios_icon_name="lightbulb.fill"
          android_material_icon_name="lightbulb"
          size={20}
          color={insight.color}
        />
        <Text style={[styles.insightText, { color: insight.color }]}>
          {insight.text}
        </Text>
      </LinearGradient>
      
      <View style={styles.motivationalContainer}>
        <Text style={styles.motivationalText}>
          {getMotivationalMessage(totalPercentage)}
        </Text>
      </View>
      
      {showBreakdown && scoreBreakdown && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Score Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Daily Goals (85%)</Text>
            <Text style={styles.breakdownValue}>{scoreBreakdown.dailyTotal.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownSubRow}>
            <Text style={styles.breakdownSubLabel}>• Prayer (30%)</Text>
            <Text style={styles.breakdownSubValue}>{scoreBreakdown.daily.prayer.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownSubRow}>
            <Text style={styles.breakdownSubLabel}>• Quran (25%)</Text>
            <Text style={styles.breakdownSubValue}>{scoreBreakdown.daily.quran.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownSubRow}>
            <Text style={styles.breakdownSubLabel}>• Dhikr (20%)</Text>
            <Text style={styles.breakdownSubValue}>{scoreBreakdown.daily.dhikr.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownSubRow}>
            <Text style={styles.breakdownSubLabel}>• Sunnah Prayers (10%)</Text>
            <Text style={styles.breakdownSubValue}>{scoreBreakdown.daily.sunnahPrayers.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownSubRow}>
            <Text style={styles.breakdownSubLabel}>• Daily Duas (5%)</Text>
            <Text style={styles.breakdownSubValue}>{scoreBreakdown.daily.dailyDuas.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownSubRow}>
            <Text style={styles.breakdownSubLabel}>• Fasting (5%)</Text>
            <Text style={styles.breakdownSubValue}>{scoreBreakdown.daily.fasting.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownSubRow}>
            <Text style={styles.breakdownSubLabel}>• Charity (5%)</Text>
            <Text style={styles.breakdownSubValue}>{scoreBreakdown.daily.charity.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Weekly Goals (15%)</Text>
            <Text style={styles.breakdownValue}>{scoreBreakdown.weekly.toFixed(1)}%</Text>
          </View>
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownTotalLabel}>Total Score</Text>
            <Text style={[styles.breakdownTotalValue, { color: badge.color }]}>
              {scoreBreakdown.total.toFixed(1)}%
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.ringLabelsContainer}>
        <View style={styles.ringLabel}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ringLabelDot}
          />
          <View style={styles.ringLabelContent}>
            <Text style={styles.ringLabelText}>Prayer</Text>
            <Text style={styles.ringLabelProgress}>{prayerCompleted}/{prayerTotal} completed</Text>
          </View>
          <View style={styles.ringLabelPercentage}>
            <Text style={[styles.ringLabelPercentText, { color: colors.primary }]}>
              {Math.round(prayerProgress * 100)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.ringLabel}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ringLabelDot}
          />
          <View style={styles.ringLabelContent}>
            <Text style={styles.ringLabelText}>Quran</Text>
            <Text style={styles.ringLabelProgress}>
              {quranCompleted}/{quranTotal} completed
            </Text>
          </View>
          <View style={styles.ringLabelPercentage}>
            <Text style={[styles.ringLabelPercentText, { color: colors.accent }]}>
              {Math.round(quranProgress * 100)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.ringLabel}>
          <LinearGradient
            colors={colors.gradientInfo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ringLabelDot}
          />
          <View style={styles.ringLabelContent}>
            <Text style={styles.ringLabelText}>Dhikr</Text>
            <Text style={styles.ringLabelProgress}>{dhikrCompleted}/{dhikrTotal} counted</Text>
          </View>
          <View style={styles.ringLabelPercentage}>
            <Text style={[styles.ringLabelPercentText, { color: colors.info }]}>
              {Math.round(dhikrProgress * 100)}%
            </Text>
          </View>
        </View>
      </View>
      
      {streakData.currentStreak > 0 && (
        <View style={styles.streakContainer}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.streakBadge}
          >
            <IconSymbol
              ios_icon_name="flame.fill"
              android_material_icon_name="local-fire-department"
              size={24}
              color={colors.card}
            />
            <View>
              <Text style={styles.streakText}>{streakData.currentStreak} Day Streak!</Text>
              {streakData.longestStreak > streakData.currentStreak && (
                <Text style={styles.streakSubtext}>
                  Best: {streakData.longestStreak} days
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.large,
  },
  ringsWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 340,
    height: 340,
  },
  centerContentWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  centerPercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 52,
  },
  centerHint: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  warningText: {
    ...typography.bodyBold,
    flex: 1,
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  insightText: {
    ...typography.bodyBold,
    flex: 1,
  },
  motivationalContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  motivationalText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  breakdownContainer: {
    marginTop: spacing.lg,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.medium,
  },
  breakdownTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  breakdownLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  breakdownValue: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  breakdownSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginLeft: spacing.md,
  },
  breakdownSubLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  breakdownSubValue: {
    ...typography.caption,
    color: colors.text,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  breakdownTotalLabel: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  breakdownTotalValue: {
    ...typography.h3,
    fontWeight: '700',
  },
  ringLabelsContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
    width: '100%',
  },
  ringLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  ringLabelDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  ringLabelContent: {
    flex: 1,
  },
  ringLabelText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  ringLabelProgress: {
    ...typography.small,
    color: colors.textSecondary,
  },
  ringLabelPercentage: {
    paddingHorizontal: spacing.sm,
  },
  ringLabelPercentText: {
    ...typography.captionBold,
    fontSize: 16,
  },
  streakContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  streakText: {
    ...typography.h4,
    color: colors.card,
    fontWeight: '700',
  },
  streakSubtext: {
    ...typography.small,
    color: colors.card,
    opacity: 0.9,
  },
});
