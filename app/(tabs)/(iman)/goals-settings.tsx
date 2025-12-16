
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

interface SunnahPrayerGoal {
  id: string;
  name: string;
  rakats: number;
  enabled: boolean;
}

interface DuaGoal {
  id: string;
  name: string;
  arabic: string;
  time: string;
  enabled: boolean;
}

interface WeeklyChallengeGoal {
  id: string;
  title: string;
  description: string;
  points: number;
  enabled: boolean;
}

const DEFAULT_SUNNAH_PRAYERS: SunnahPrayerGoal[] = [
  { id: 'fajr_sunnah', name: 'Fajr Sunnah', rakats: 2, enabled: true },
  { id: 'dhuhr_sunnah_before', name: 'Dhuhr Sunnah (Before)', rakats: 4, enabled: true },
  { id: 'dhuhr_sunnah_after', name: 'Dhuhr Sunnah (After)', rakats: 2, enabled: true },
  { id: 'maghrib_sunnah', name: 'Maghrib Sunnah', rakats: 2, enabled: true },
  { id: 'isha_sunnah', name: 'Isha Sunnah', rakats: 2, enabled: true },
  { id: 'tahajjud', name: 'Tahajjud', rakats: 8, enabled: false },
  { id: 'duha', name: 'Duha', rakats: 2, enabled: false },
];

const DEFAULT_DUAS: DuaGoal[] = [
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
  {
    id: 'wakeup',
    name: 'Upon Waking',
    arabic: 'دُعَاءُ الاِسْتِيقَاظِ',
    time: 'Morning',
    enabled: false,
  },
  {
    id: 'eating',
    name: 'Before Eating',
    arabic: 'دُعَاءُ الطَّعَامِ',
    time: 'Meals',
    enabled: false,
  },
];

const DEFAULT_CHALLENGES: WeeklyChallengeGoal[] = [
  {
    id: 'kahf',
    title: 'Surah Al-Kahf Friday',
    description: 'Recite Surah Al-Kahf on Friday',
    points: 20,
    enabled: true,
  },
  {
    id: 'morning_adhkar',
    title: 'Morning Adhkar Streak',
    description: 'Complete morning adhkar for 7 days',
    points: 30,
    enabled: true,
  },
  {
    id: 'tahajjud',
    title: 'Night Prayer',
    description: 'Pray Tahajjud 3 times this week',
    points: 25,
    enabled: true,
  },
  {
    id: 'charity',
    title: 'Weekly Charity',
    description: 'Give charity at least once this week',
    points: 15,
    enabled: false,
  },
  {
    id: 'quran_memorization',
    title: 'Quran Memorization',
    description: 'Memorize 10 new verses this week',
    points: 35,
    enabled: false,
  },
];

export default function GoalsSettingsScreen() {
  const [sunnahPrayers, setSunnahPrayers] = useState<SunnahPrayerGoal[]>(DEFAULT_SUNNAH_PRAYERS);
  const [duas, setDuas] = useState<DuaGoal[]>(DEFAULT_DUAS);
  const [challenges, setChallenges] = useState<WeeklyChallengeGoal[]>(DEFAULT_CHALLENGES);
  const [weeklyFastingGoal, setWeeklyFastingGoal] = useState('2');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const savedSunnahGoals = await AsyncStorage.getItem('sunnahPrayerGoals');
      const savedDuaGoals = await AsyncStorage.getItem('duaGoals');
      const savedChallengeGoals = await AsyncStorage.getItem('challengeGoals');
      const savedFastingGoal = await AsyncStorage.getItem('weeklyFastingGoal');

      if (savedSunnahGoals) {
        setSunnahPrayers(JSON.parse(savedSunnahGoals));
      }
      if (savedDuaGoals) {
        setDuas(JSON.parse(savedDuaGoals));
      }
      if (savedChallengeGoals) {
        setChallenges(JSON.parse(savedChallengeGoals));
      }
      if (savedFastingGoal) {
        setWeeklyFastingGoal(savedFastingGoal);
      }
    } catch (error) {
      console.log('Error loading goals:', error);
    }
  };

  const saveGoals = async () => {
    try {
      await AsyncStorage.setItem('sunnahPrayerGoals', JSON.stringify(sunnahPrayers));
      await AsyncStorage.setItem('duaGoals', JSON.stringify(duas));
      await AsyncStorage.setItem('challengeGoals', JSON.stringify(challenges));
      await AsyncStorage.setItem('weeklyFastingGoal', weeklyFastingGoal);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your goals have been saved!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log('Error saving goals:', error);
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    }
  };

  const toggleSunnahPrayer = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSunnahPrayers(prev => 
      prev.map(prayer => 
        prayer.id === id ? { ...prayer, enabled: !prayer.enabled } : prayer
      )
    );
  };

  const toggleDua = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDuas(prev => 
      prev.map(dua => 
        dua.id === id ? { ...dua, enabled: !dua.enabled } : dua
      )
    );
  };

  const toggleChallenge = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === id ? { ...challenge, enabled: !challenge.enabled } : challenge
      )
    );
  };

  const updateFastingGoal = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 7) {
      setWeeklyFastingGoal(value);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize Goals</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveGoals}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.info}
          />
          <Text style={styles.infoText}>
            Customize your spiritual goals. The five daily prayers are fixed and cannot be changed.
          </Text>
        </View>

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
            <Text style={styles.sectionTitle}>Sunnah Prayer Goals</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select which Sunnah prayers you want to track daily
          </Text>

          {sunnahPrayers.map((prayer, index) => (
            <React.Fragment key={index}>
              <View style={styles.goalItem}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>{prayer.name}</Text>
                  <Text style={styles.goalDetail}>{prayer.rakats} Rakats</Text>
                </View>
                <Switch
                  value={prayer.enabled}
                  onValueChange={() => toggleSunnahPrayer(prayer.id)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.card}
                />
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={colors.gradientPurple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIconContainer}
            >
              <IconSymbol
                ios_icon_name="moon.fill"
                android_material_icon_name="nightlight"
                size={20}
                color={colors.card}
              />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Weekly Fasting Goal</Text>
          </View>
          <Text style={styles.sectionDescription}>
            How many days per week do you want to fast?
          </Text>

          <View style={styles.fastingGoalContainer}>
            <Text style={styles.fastingGoalLabel}>Days per week:</Text>
            <TextInput
              style={styles.fastingGoalInput}
              value={weeklyFastingGoal}
              onChangeText={updateFastingGoal}
              keyboardType="number-pad"
              maxLength={1}
              placeholder="0-7"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.fastingGoalUnit}>/ 7 days</Text>
          </View>

          <View style={styles.recommendationBox}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={16}
              color={colors.accent}
            />
            <Text style={styles.recommendationText}>
              Recommended: Fast on Mondays and Thursdays (Sunnah)
            </Text>
          </View>
        </View>

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
            <Text style={styles.sectionTitle}>Daily Dua Goals</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select which daily duas you want to track
          </Text>

          {duas.map((dua, index) => (
            <React.Fragment key={index}>
              <View style={styles.goalItem}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>{dua.name}</Text>
                  <Text style={styles.goalArabic}>{dua.arabic}</Text>
                  <Text style={styles.goalDetail}>{dua.time}</Text>
                </View>
                <Switch
                  value={dua.enabled}
                  onValueChange={() => toggleDua(dua.id)}
                  trackColor={{ false: colors.border, true: colors.info }}
                  thumbColor={colors.card}
                />
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[colors.accent, colors.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIconContainer}
            >
              <IconSymbol
                ios_icon_name="trophy.fill"
                android_material_icon_name="emoji-events"
                size={20}
                color={colors.card}
              />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Weekly Challenges</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select which weekly challenges you want to participate in
          </Text>

          {challenges.map((challenge, index) => (
            <React.Fragment key={index}>
              <View style={styles.goalItem}>
                <View style={styles.goalInfo}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.goalName}>{challenge.title}</Text>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>+{challenge.points}</Text>
                    </View>
                  </View>
                  <Text style={styles.goalDetail}>{challenge.description}</Text>
                </View>
                <Switch
                  value={challenge.enabled}
                  onValueChange={() => toggleChallenge(challenge.id)}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.card}
                />
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  saveButtonText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.info + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginLeft: 44,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  goalInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  goalName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalArabic: {
    ...typography.caption,
    color: colors.text,
    marginBottom: 2,
  },
  goalDetail: {
    ...typography.small,
    color: colors.textSecondary,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pointsBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  pointsText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '700',
  },
  fastingGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  fastingGoalLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginRight: spacing.md,
  },
  fastingGoalInput: {
    ...typography.h3,
    color: colors.text,
    backgroundColor: colors.highlight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    minWidth: 60,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fastingGoalUnit: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  recommendationText: {
    ...typography.small,
    color: colors.accent,
    flex: 1,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
