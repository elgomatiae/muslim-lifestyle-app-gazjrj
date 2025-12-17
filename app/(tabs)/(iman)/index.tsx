
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

import ImanRingsDisplay from "@/components/iman/ImanRingsDisplay";
import { 
  resetDailyGoals, 
  resetWeeklyGoals, 
  updateSectionScores,
  loadPrayerGoals,
  loadDhikrGoals,
  loadQuranGoals,
  savePrayerGoals,
  saveDhikrGoals,
  saveQuranGoals,
  type PrayerGoals,
  type DhikrGoals,
  type QuranGoals,
} from "@/utils/imanScoreCalculator";
import { syncLocalToSupabase, syncSupabaseToLocal, initializeImanTrackerForUser } from "@/utils/imanSupabaseSync";

export default function ImanTrackerScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [prayerGoals, setPrayerGoals] = useState<PrayerGoals | null>(null);
  const [dhikrGoals, setDhikrGoals] = useState<DhikrGoals | null>(null);
  const [quranGoals, setQuranGoals] = useState<QuranGoals | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // If user is logged in, sync with Supabase first
      if (user && !syncing) {
        setSyncing(true);
        await syncSupabaseToLocal(user.id);
        setSyncing(false);
      }

      const lastDate = await AsyncStorage.getItem('lastImanDate');
      const today = new Date().toDateString();
      
      if (lastDate !== today) {
        await resetDailyGoals();
        await AsyncStorage.setItem('lastImanDate', today);
      }
      
      const currentWeek = getWeekNumber(new Date());
      const lastWeek = await AsyncStorage.getItem('lastImanWeek');
      
      if (lastWeek !== currentWeek.toString()) {
        await resetWeeklyGoals();
        await AsyncStorage.setItem('lastImanWeek', currentWeek.toString());
      }
      
      await updateSectionScores();
      
      const prayer = await loadPrayerGoals();
      const dhikr = await loadDhikrGoals();
      const quran = await loadQuranGoals();
      
      setPrayerGoals(prayer);
      setDhikrGoals(dhikr);
      setQuranGoals(quran);
    } catch (error) {
      console.log('Error loading iman data:', error);
    }
  }, [user, syncing]);

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    if (user) {
      initializeImanTrackerForUser(user.id).then(() => {
        loadData();
      });
    } else {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    const scoreInterval = setInterval(async () => {
      await updateSectionScores();
    }, 60000);
    
    return () => clearInterval(scoreInterval);
  }, []);

  const syncToSupabase = useCallback(async () => {
    if (user) {
      await syncLocalToSupabase(user.id);
    }
  }, [user]);

  const toggleFardPrayer = async (prayer: keyof PrayerGoals['fardPrayers']) => {
    if (!prayerGoals) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedGoals = {
      ...prayerGoals,
      fardPrayers: {
        ...prayerGoals.fardPrayers,
        [prayer]: !prayerGoals.fardPrayers[prayer],
      },
    };
    setPrayerGoals(updatedGoals);
    await savePrayerGoals(updatedGoals);
    await syncToSupabase();
  };

  const incrementSunnah = async () => {
    if (!prayerGoals) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedGoals = {
      ...prayerGoals,
      sunnahCompleted: Math.min(prayerGoals.sunnahCompleted + 1, prayerGoals.sunnahDailyGoal),
    };
    setPrayerGoals(updatedGoals);
    await savePrayerGoals(updatedGoals);
    await syncToSupabase();
  };

  const incrementTahajjud = async () => {
    if (!prayerGoals) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedGoals = {
      ...prayerGoals,
      tahajjudCompleted: Math.min(prayerGoals.tahajjudCompleted + 1, prayerGoals.tahajjudWeeklyGoal),
    };
    setPrayerGoals(updatedGoals);
    await savePrayerGoals(updatedGoals);
    await syncToSupabase();
  };

  const incrementDhikr = async (amount: number) => {
    if (!dhikrGoals) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedGoals = {
      ...dhikrGoals,
      dailyCompleted: dhikrGoals.dailyCompleted + amount,
      weeklyCompleted: dhikrGoals.weeklyCompleted + amount,
    };
    setDhikrGoals(updatedGoals);
    await saveDhikrGoals(updatedGoals);
    await syncToSupabase();
  };

  const incrementQuranPages = async (amount: number) => {
    if (!quranGoals) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedGoals = {
      ...quranGoals,
      dailyPagesCompleted: Math.min(quranGoals.dailyPagesCompleted + amount, quranGoals.dailyPagesGoal),
    };
    setQuranGoals(updatedGoals);
    await saveQuranGoals(updatedGoals);
    await syncToSupabase();
  };

  const incrementQuranVerses = async (amount: number) => {
    if (!quranGoals) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedGoals = {
      ...quranGoals,
      dailyVersesCompleted: Math.min(quranGoals.dailyVersesCompleted + amount, quranGoals.dailyVersesGoal),
    };
    setQuranGoals(updatedGoals);
    await saveQuranGoals(updatedGoals);
    await syncToSupabase();
  };

  const incrementQuranMemorization = async (amount: number) => {
    if (!quranGoals) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedGoals = {
      ...quranGoals,
      weeklyMemorizationCompleted: Math.min(quranGoals.weeklyMemorizationCompleted + amount, quranGoals.weeklyMemorizationGoal),
    };
    setQuranGoals(updatedGoals);
    await saveQuranGoals(updatedGoals);
    await syncToSupabase();
  };

  const fardPrayers = [
    { key: 'fajr' as const, name: 'Fajr', time: 'Dawn' },
    { key: 'dhuhr' as const, name: 'Dhuhr', time: 'Noon' },
    { key: 'asr' as const, name: 'Asr', time: 'Afternoon' },
    { key: 'maghrib' as const, name: 'Maghrib', time: 'Sunset' },
    { key: 'isha' as const, name: 'Isha', time: 'Night' },
  ];

  const fardCompleted = prayerGoals ? Object.values(prayerGoals.fardPrayers).filter(Boolean).length : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.header}>Iman Tracker</Text>
            <Text style={styles.subtitle}>Track your spiritual journey</Text>
          </View>
        </View>

        <ImanRingsDisplay onRefresh={onRefresh} />

        {/* PRAYER SECTION */}
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
            <Text style={styles.sectionTitle}>Prayer</Text>
            <TouchableOpacity
              style={styles.setGoalsButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/(iman)/prayer-goals');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.setGoalsButtonText}>Set Goals</Text>
            </TouchableOpacity>
          </View>

          {prayerGoals && (
            <View style={styles.goalsContainer}>
              <View style={styles.goalSubsection}>
                <Text style={styles.goalSubsectionTitle}>Five Daily Prayers ({fardCompleted}/5)</Text>
                <View style={styles.prayersGrid}>
                  {fardPrayers.map((prayer, index) => (
                    <React.Fragment key={index}>
                      <TouchableOpacity
                        style={[
                          styles.prayerCard,
                          prayerGoals.fardPrayers[prayer.key] && styles.prayerCardCompleted
                        ]}
                        onPress={() => toggleFardPrayer(prayer.key)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.checkCircle,
                          prayerGoals.fardPrayers[prayer.key] && styles.checkCircleCompleted
                        ]}>
                          {prayerGoals.fardPrayers[prayer.key] && (
                            <IconSymbol
                              ios_icon_name="checkmark"
                              android_material_icon_name="check"
                              size={16}
                              color={colors.card}
                            />
                          )}
                        </View>
                        <Text style={[
                          styles.prayerName,
                          prayerGoals.fardPrayers[prayer.key] && styles.prayerNameCompleted
                        ]}>
                          {prayer.name}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  ))}
                </View>
              </View>

              <View style={styles.goalSubsection}>
                <Text style={styles.goalSubsectionTitle}>
                  Sunnah Prayers ({prayerGoals.sunnahCompleted}/{prayerGoals.sunnahDailyGoal} today)
                </Text>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${prayerGoals.sunnahDailyGoal > 0 ? (prayerGoals.sunnahCompleted / prayerGoals.sunnahDailyGoal) * 100 : 0}%`,
                        backgroundColor: colors.primary,
                      }
                    ]} 
                  />
                </View>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={incrementSunnah}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.incrementButtonGradient}
                  >
                    <IconSymbol
                      ios_icon_name="plus"
                      android_material_icon_name="add"
                      size={16}
                      color={colors.card}
                    />
                    <Text style={styles.incrementButtonText}>Mark Sunnah</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.goalSubsection}>
                <Text style={styles.goalSubsectionTitle}>
                  Tahajjud ({prayerGoals.tahajjudCompleted}/{prayerGoals.tahajjudWeeklyGoal} this week)
                </Text>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${prayerGoals.tahajjudWeeklyGoal > 0 ? (prayerGoals.tahajjudCompleted / prayerGoals.tahajjudWeeklyGoal) * 100 : 0}%`,
                        backgroundColor: colors.primary,
                      }
                    ]} 
                  />
                </View>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={incrementTahajjud}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={colors.gradientPurple}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.incrementButtonGradient}
                  >
                    <IconSymbol
                      ios_icon_name="plus"
                      android_material_icon_name="add"
                      size={16}
                      color={colors.card}
                    />
                    <Text style={styles.incrementButtonText}>Mark Tahajjud</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* QURAN SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={[colors.accent, colors.accentDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIconContainer}
            >
              <IconSymbol
                ios_icon_name="book.fill"
                android_material_icon_name="book"
                size={20}
                color={colors.card}
              />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Quran</Text>
            <TouchableOpacity
              style={styles.setGoalsButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/(iman)/quran-goals');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.setGoalsButtonText}>Set Goals</Text>
            </TouchableOpacity>
          </View>

          {quranGoals && (
            <View style={styles.goalsContainer}>
              <View style={styles.goalSubsection}>
                <Text style={styles.goalSubsectionTitle}>
                  Daily Pages ({quranGoals.dailyPagesCompleted}/{quranGoals.dailyPagesGoal})
                </Text>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${quranGoals.dailyPagesGoal > 0 ? (quranGoals.dailyPagesCompleted / quranGoals.dailyPagesGoal) * 100 : 0}%`,
                        backgroundColor: colors.accent,
                      }
                    ]} 
                  />
                </View>
                <View style={styles.counterGrid}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementQuranPages(1)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+1</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementQuranPages(5)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+5</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.goalSubsection}>
                <Text style={styles.goalSubsectionTitle}>
                  Daily Verses ({quranGoals.dailyVersesCompleted}/{quranGoals.dailyVersesGoal})
                </Text>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${quranGoals.dailyVersesGoal > 0 ? (quranGoals.dailyVersesCompleted / quranGoals.dailyVersesGoal) * 100 : 0}%`,
                        backgroundColor: colors.accent,
                      }
                    ]} 
                  />
                </View>
                <View style={styles.counterGrid}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementQuranVerses(1)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+1</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementQuranVerses(5)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+5</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementQuranVerses(10)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+10</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.goalSubsection}>
                <Text style={styles.goalSubsectionTitle}>
                  Weekly Memorization ({quranGoals.weeklyMemorizationCompleted}/{quranGoals.weeklyMemorizationGoal} verses)
                </Text>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${quranGoals.weeklyMemorizationGoal > 0 ? (quranGoals.weeklyMemorizationCompleted / quranGoals.weeklyMemorizationGoal) * 100 : 0}%`,
                        backgroundColor: colors.accent,
                      }
                    ]} 
                  />
                </View>
                <View style={styles.counterGrid}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementQuranMemorization(1)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+1</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementQuranMemorization(3)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+3</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementQuranMemorization(5)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.accent, colors.accentDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+5</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* DHIKR SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={colors.gradientInfo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIconContainer}
            >
              <IconSymbol
                ios_icon_name="hand.raised.fill"
                android_material_icon_name="back-hand"
                size={20}
                color={colors.card}
              />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Dhikr</Text>
            <TouchableOpacity
              style={styles.setGoalsButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/(iman)/dhikr-goals');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.setGoalsButtonText}>Set Goals</Text>
            </TouchableOpacity>
          </View>

          {dhikrGoals && (
            <View style={styles.goalsContainer}>
              <View style={styles.goalSubsection}>
                <Text style={styles.goalSubsectionTitle}>
                  Daily Dhikr ({dhikrGoals.dailyCompleted}/{dhikrGoals.dailyGoal})
                </Text>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${dhikrGoals.dailyGoal > 0 ? Math.min(100, (dhikrGoals.dailyCompleted / dhikrGoals.dailyGoal) * 100) : 0}%`,
                        backgroundColor: colors.info,
                      }
                    ]} 
                  />
                </View>
                <View style={styles.counterGrid}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementDhikr(1)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={colors.gradientInfo}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+1</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementDhikr(10)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={colors.gradientInfo}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+10</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementDhikr(33)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={colors.gradientInfo}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+33</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => incrementDhikr(100)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={colors.gradientInfo}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.counterButtonGradient}
                    >
                      <Text style={styles.counterButtonText}>+100</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.goalSubsection}>
                <Text style={styles.goalSubsectionTitle}>
                  Weekly Dhikr ({dhikrGoals.weeklyCompleted}/{dhikrGoals.weeklyGoal})
                </Text>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${dhikrGoals.weeklyGoal > 0 ? Math.min(100, (dhikrGoals.weeklyCompleted / dhikrGoals.weeklyGoal) * 100) : 0}%`,
                        backgroundColor: colors.info,
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How It Works</Text>
              <Text style={styles.infoText}>
                - Each ring represents a section: Prayer, Quran, and Dhikr{'\n'}
                - Track your progress directly on this screen{'\n'}
                - Use "Set Goals" to customize your targets{'\n'}
                - Rings reach 100% when all daily and weekly goals are met{'\n'}
                - Scores decay if goals aren&apos;t completed{'\n'}
                - Stay consistent to maintain high scores!{'\n'}
                {user && '- Your progress is automatically saved to your account'}
              </Text>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
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
  setGoalsButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  setGoalsButtonText: {
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
  goalSubsectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  prayersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  prayerCard: {
    flex: 1,
    minWidth: '18%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  prayerCardCompleted: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  checkCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  prayerName: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
  },
  prayerNameCompleted: {
    color: colors.primary,
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
  incrementButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  incrementButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  incrementButtonText: {
    ...typography.caption,
    color: colors.card,
    fontWeight: '600',
  },
  counterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  counterButton: {
    flex: 1,
    minWidth: '22%',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    ...shadows.medium,
  },
  counterButtonGradient: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    ...typography.caption,
    color: colors.card,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: spacing.xxl,
  },
  infoCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
