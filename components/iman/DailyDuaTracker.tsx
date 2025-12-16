
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

interface Dua {
  id: string;
  name: string;
  arabic: string;
  time: string;
  enabled: boolean;
}

const DEFAULT_DUAS: Dua[] = [
  {
    id: 'morning',
    name: 'Morning Adhkar',
    arabic: 'أَذْكَارُ الصَّبَاحِ',
    time: 'After Fajr',
    enabled: true,
  },
  {
    id: 'evening',
    name: 'Evening Adhkar',
    arabic: 'أَذْكَارُ الْمَسَاءِ',
    time: 'After Asr',
    enabled: true,
  },
  {
    id: 'sleep',
    name: 'Before Sleep',
    arabic: 'أَذْكَارُ النَّوْمِ',
    time: 'Bedtime',
    enabled: true,
  },
];

export default function DailyDuaTracker() {
  const [completedDuas, setCompletedDuas] = useState<Set<string>>(new Set());
  const [duas, setDuas] = useState<Dua[]>(DEFAULT_DUAS);

  useEffect(() => {
    loadDuaData();
  }, []);

  const loadDuaData = async () => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('duaDate');
      
      // Load custom goals
      const savedGoals = await AsyncStorage.getItem('duaGoals');
      const goals = savedGoals ? JSON.parse(savedGoals) : DEFAULT_DUAS;
      setDuas(goals);
      
      if (lastDate !== today) {
        await AsyncStorage.setItem('duaDate', today);
        await AsyncStorage.setItem('completedDuas', JSON.stringify([]));
        setCompletedDuas(new Set());
      } else {
        const saved = await AsyncStorage.getItem('completedDuas');
        if (saved) {
          setCompletedDuas(new Set(JSON.parse(saved)));
        }
      }
    } catch (error) {
      console.log('Error loading dua data:', error);
    }
  };

  const toggleDua = async (duaId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCompleted = new Set(completedDuas);
    
    if (newCompleted.has(duaId)) {
      newCompleted.delete(duaId);
    } else {
      newCompleted.add(duaId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setCompletedDuas(newCompleted);
    await AsyncStorage.setItem('completedDuas', JSON.stringify(Array.from(newCompleted)));
  };

  const enabledDuas = duas.filter(d => d.enabled);
  const completedCount = Array.from(completedDuas).filter(id => 
    enabledDuas.some(d => d.id === id)
  ).length;
  const totalCount = enabledDuas.length;

  if (totalCount === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={colors.gradientInfo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionIconContainer}
          >
            <IconSymbol
              ios_icon_name="text.bubble.fill"
              android_material_icon_name="chat-bubble"
              size={20}
              color={colors.card}
            />
          </LinearGradient>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Daily Duas</Text>
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
            color={colors.info}
          />
          <Text style={styles.emptyText}>Tap to set daily dua goals</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <LinearGradient
          colors={colors.gradientInfo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionIconContainer}
        >
          <IconSymbol
            ios_icon_name="text.bubble.fill"
            android_material_icon_name="chat-bubble"
            size={20}
            color={colors.card}
          />
        </LinearGradient>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Daily Duas</Text>
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

      <View style={styles.duasContainer}>
        {enabledDuas.map((dua, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.duaCard,
                completedDuas.has(dua.id) && styles.duaCardCompleted
              ]}
              onPress={() => toggleDua(dua.id)}
              activeOpacity={0.7}
            >
              <View style={styles.duaCardContent}>
                <View style={[
                  styles.duaCheckCircle,
                  completedDuas.has(dua.id) && styles.duaCheckCircleCompleted
                ]}>
                  {completedDuas.has(dua.id) && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={16}
                      color={colors.card}
                    />
                  )}
                </View>
                <View style={styles.duaInfo}>
                  <Text style={[
                    styles.duaName,
                    completedDuas.has(dua.id) && styles.duaNameCompleted
                  ]}>
                    {dua.name}
                  </Text>
                  <Text style={styles.duaArabic}>{dua.arabic}</Text>
                  <Text style={styles.duaTime}>{dua.time}</Text>
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
  duasContainer: {
    gap: spacing.sm,
  },
  duaCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.small,
  },
  duaCardCompleted: {
    borderColor: colors.info,
    backgroundColor: colors.info + '10',
  },
  duaCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  duaCheckCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duaCheckCircleCompleted: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  duaInfo: {
    flex: 1,
  },
  duaName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  duaNameCompleted: {
    color: colors.info,
  },
  duaArabic: {
    ...typography.caption,
    color: colors.text,
    marginTop: 2,
  },
  duaTime: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
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
