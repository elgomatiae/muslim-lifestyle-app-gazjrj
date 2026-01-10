
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface PhysicalWellnessSectionProps {
  waterCompleted: number;
  waterGoal: number;
  exerciseCompleted: number;
  exerciseGoal: number;
}

export default function PhysicalWellnessSection({
  waterCompleted,
  waterGoal,
  exerciseCompleted,
  exerciseGoal,
}: PhysicalWellnessSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <LinearGradient
          colors={colors.gradientAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionIconContainer}
        >
          <IconSymbol
            ios_icon_name="figure.run"
            android_material_icon_name="directions-run"
            size={20}
            color={colors.card}
          />
        </LinearGradient>
        <Text style={styles.sectionTitle}>Physical Wellness</Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/(wellness)/physical-health' as any);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalsContainer}>
        {/* Water Intake */}
        <View style={styles.goalSubsection}>
          <View style={styles.goalHeader}>
            <IconSymbol
              ios_icon_name="drop.fill"
              android_material_icon_name="water-drop"
              size={20}
              color={colors.info}
            />
            <Text style={styles.goalSubsectionTitle}>
              Water Intake ({waterCompleted}/{waterGoal} glasses)
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${waterGoal > 0 ? Math.min(100, (waterCompleted / waterGoal) * 100) : 0}%`,
                  backgroundColor: colors.info,
                }
              ]} 
            />
          </View>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/(wellness)/physical-health' as any);
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={colors.gradientInfo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trackButtonGradient}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={16}
                color={colors.card}
              />
              <Text style={styles.trackButtonText}>Track Water</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Exercise */}
        <View style={styles.goalSubsection}>
          <View style={styles.goalHeader}>
            <IconSymbol
              ios_icon_name="figure.mixed.cardio"
              android_material_icon_name="fitness-center"
              size={20}
              color={colors.warning}
            />
            <Text style={styles.goalSubsectionTitle}>
              Exercise ({exerciseCompleted}/{exerciseGoal} min)
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${exerciseGoal > 0 ? Math.min(100, (exerciseCompleted / exerciseGoal) * 100) : 0}%`,
                  backgroundColor: colors.warning,
                }
              ]} 
            />
          </View>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/(wellness)/physical-health' as any);
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={colors.gradientWarning}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trackButtonGradient}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={16}
                color={colors.card}
              />
              <Text style={styles.trackButtonText}>Log Exercise</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  viewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
  },
  viewButtonText: {
    ...typography.caption,
    color: colors.card,
    fontWeight: '600',
  },
  goalsContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
    gap: spacing.lg,
  },
  goalSubsection: {
    gap: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalSubsectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  trackButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  trackButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  trackButtonText: {
    ...typography.caption,
    color: colors.card,
    fontWeight: '600',
  },
});
