
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

interface SunnahPrayer {
  id: string;
  name: string;
  rakats: number;
  enabled: boolean;
}

const DEFAULT_SUNNAH_PRAYERS: SunnahPrayer[] = [
  { id: 'fajr_sunnah', name: 'Fajr Sunnah', rakats: 2, enabled: true },
  { id: 'dhuhr_sunnah_before', name: 'Dhuhr Sunnah (Before)', rakats: 4, enabled: true },
  { id: 'dhuhr_sunnah_after', name: 'Dhuhr Sunnah (After)', rakats: 2, enabled: true },
  { id: 'maghrib_sunnah', name: 'Maghrib Sunnah', rakats: 2, enabled: true },
  { id: 'isha_sunnah', name: 'Isha Sunnah', rakats: 2, enabled: true },
  { id: 'tahajjud', name: 'Tahajjud', rakats: 8, enabled: false },
  { id: 'duha', name: 'Duha', rakats: 2, enabled: false },
];

export default function SunnahPrayerTracker() {
  const [completedPrayers, setCompletedPrayers] = useState<Set<string>>(new Set());
  const [sunnahPrayers, setSunnahPrayers] = useState<SunnahPrayer[]>(DEFAULT_SUNNAH_PRAYERS);

  useEffect(() => {
    loadSunnahPrayers();
  }, []);

  const loadSunnahPrayers = async () => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('sunnahPrayersDate');
      
      // Load custom goals
      const savedGoals = await AsyncStorage.getItem('sunnahPrayerGoals');
      const goals = savedGoals ? JSON.parse(savedGoals) : DEFAULT_SUNNAH_PRAYERS;
      setSunnahPrayers(goals);
      
      if (lastDate !== today) {
        await AsyncStorage.setItem('sunnahPrayersDate', today);
        await AsyncStorage.setItem('sunnahPrayers', JSON.stringify([]));
        setCompletedPrayers(new Set());
      } else {
        const saved = await AsyncStorage.getItem('sunnahPrayers');
        if (saved) {
          setCompletedPrayers(new Set(JSON.parse(saved)));
        }
      }
    } catch (error) {
      console.log('Error loading sunnah prayers:', error);
    }
  };

  const togglePrayer = async (prayerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCompleted = new Set(completedPrayers);
    
    if (newCompleted.has(prayerId)) {
      newCompleted.delete(prayerId);
    } else {
      newCompleted.add(prayerId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setCompletedPrayers(newCompleted);
    await AsyncStorage.setItem('sunnahPrayers', JSON.stringify(Array.from(newCompleted)));
  };

  const enabledPrayers = sunnahPrayers.filter(p => p.enabled);
  const completedCount = Array.from(completedPrayers).filter(id => 
    enabledPrayers.some(p => p.id === id)
  ).length;
  const totalCount = enabledPrayers.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (totalCount === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionIconContainer}
          >
            <IconSymbol
              ios_icon_name="hands.sparkles.fill"
              android_material_icon_name="auto-awesome"
              size={20}
              color={colors.card}
            />
          </LinearGradient>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Sunnah Prayers</Text>
            <Text style={styles.sectionSubtitle}>No goals set</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.emptyCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/(iman)/goals-settings');
          }}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add-circle"
            size={32}
            color={colors.primary}
          />
          <Text style={styles.emptyText}>Tap to set Sunnah prayer goals</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionIconContainer}
        >
          <IconSymbol
            ios_icon_name="hands.sparkles.fill"
            android_material_icon_name="auto-awesome"
            size={20}
            color={colors.card}
          />
        </LinearGradient>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Sunnah Prayers</Text>
          <Text style={styles.sectionSubtitle}>{completedCount}/{totalCount} completed</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/(iman)/goals-settings');
          }}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="gear"
            android_material_icon_name="settings"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      <View style={styles.prayersGrid}>
        {enabledPrayers.map((prayer, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.prayerCard,
                completedPrayers.has(prayer.id) && styles.prayerCardCompleted
              ]}
              onPress={() => togglePrayer(prayer.id)}
              activeOpacity={0.7}
            >
              <View style={styles.prayerCardContent}>
                <View style={[
                  styles.checkCircle,
                  completedPrayers.has(prayer.id) && styles.checkCircleCompleted
                ]}>
                  {completedPrayers.has(prayer.id) && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={16}
                      color={colors.card}
                    />
                  )}
                </View>
                <View style={styles.prayerInfo}>
                  <Text style={[
                    styles.prayerName,
                    completedPrayers.has(prayer.id) && styles.prayerNameCompleted
                  ]}>
                    {prayer.name}
                  </Text>
                  <Text style={styles.prayerRakats}>{prayer.rakats} Rakats</Text>
                </View>
              </View>
            </TouchableOpacity>
          </React.Fragment>
        ))}
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
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    marginBottom: spacing.lg,
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
  prayersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  prayerCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.small,
  },
  prayerCardCompleted: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  prayerNameCompleted: {
    color: colors.primary,
  },
  prayerRakats: {
    ...typography.small,
    color: colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    ...shadows.small,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
