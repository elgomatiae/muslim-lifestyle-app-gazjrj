
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useImanTracker } from "@/contexts/ImanTrackerContext";
import * as Haptics from 'expo-haptics';

interface MeditationPractice {
  title: string;
  description: string;
  duration: number;
  iosIcon: string;
  androidIcon: string;
  color: string[];
  type: string;
}

interface MeditationSession {
  id: string;
  practice_type: string;
  duration_minutes: number;
  date: string;
  notes: string;
}

export default function MeditationScreen() {
  const { user } = useAuth();
  const { dhikrGoals, updateDhikrGoals, refreshData } = useImanTracker();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(1);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<MeditationPractice | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const practices: MeditationPractice[] = [
    {
      title: '1 Minute Guided Meditation',
      description: 'Quick mindful breathing exercise',
      duration: 1,
      iosIcon: 'timer',
      androidIcon: 'timer',
      color: colors.gradientInfo,
      type: '1min_guided',
    },
    {
      title: '5 Minute Meditation',
      description: 'Deep relaxation and mindfulness practice',
      duration: 5,
      iosIcon: 'leaf.fill',
      androidIcon: 'spa',
      color: colors.gradientOcean,
      type: '5min_meditation',
    },
    {
      title: 'Dhikr Meditation',
      description: 'Remembrance of Allah through repetitive phrases',
      duration: 5,
      iosIcon: 'sparkles',
      androidIcon: 'auto-awesome',
      color: colors.gradientPrimary,
      type: 'dhikr',
    },
  ];

  const loadMeditationData = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: sessionsData } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (sessionsData) {
        setSessions(sessionsData);
        setTodayCount(sessionsData.length);
      }

      const { data: goalsData } = await supabase
        .from('iman_tracker_goals')
        .select('meditation_daily_goal, meditation_daily_completed')
        .eq('user_id', user.id)
        .single();

      if (goalsData) {
        setDailyGoal(goalsData.meditation_daily_goal || 1);
        setTodayCount(goalsData.meditation_daily_completed || 0);
      }
    } catch (error) {
      console.error('Error loading meditation data:', error);
    }
  }, [user]);

  useEffect(() => {
    loadMeditationData();
  }, [loadMeditationData]);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleStartPractice = (practice: MeditationPractice) => {
    setSelectedPractice(practice);
    setTimeRemaining(practice.duration * 60);
    setIsTimerActive(false);
    setShowSessionModal(true);
  };

  const startTimer = () => {
    if (!selectedPractice) return;

    setIsTimerActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerActive(false);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsTimerActive(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsTimerActive(false);
    setTimeRemaining(selectedPractice ? selectedPractice.duration * 60 : 0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTimerComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Meditation Complete! 🎉',
      'Great job! Your session has been completed.',
      [
        {
          text: 'Save Session',
          onPress: () => handleCompletePractice(),
        },
      ]
    );
  };

  const handleCompletePractice = async () => {
    if (!user || !selectedPractice) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const { error: sessionError } = await supabase
        .from('meditation_sessions')
        .insert({
          user_id: user.id,
          practice_type: selectedPractice.type,
          duration_minutes: selectedPractice.duration,
          notes: sessionNotes,
        });

      if (sessionError) {
        console.error('Error saving session:', sessionError);
        Alert.alert('Error', 'Failed to save meditation session');
        return;
      }

      const { data: currentGoals } = await supabase
        .from('iman_tracker_goals')
        .select('meditation_daily_completed, meditation_daily_goal, amanah_weekly_mental_health_completed, amanah_weekly_mental_health_goal')
        .eq('user_id', user.id)
        .single();

      const newMeditationCompleted = (currentGoals?.meditation_daily_completed || 0) + 1;
      const newMentalHealthCompleted = (currentGoals?.amanah_weekly_mental_health_completed || 0) + 1;

      const { error: updateError } = await supabase
        .from('iman_tracker_goals')
        .update({
          meditation_daily_completed: newMeditationCompleted,
          amanah_weekly_mental_health_completed: newMentalHealthCompleted,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating goals:', updateError);
      }

      if (selectedPractice.type === 'dhikr' && dhikrGoals) {
        const dhikrIncrement = 33;
        const updatedDhikrGoals = {
          ...dhikrGoals,
          dailyCompleted: dhikrGoals.dailyCompleted + dhikrIncrement,
          weeklyCompleted: dhikrGoals.weeklyCompleted + dhikrIncrement,
        };
        await updateDhikrGoals(updatedDhikrGoals);
      }

      await loadMeditationData();
      await refreshData();

      setShowSessionModal(false);
      setSelectedPractice(null);
      setSessionNotes('');
      setTimeRemaining(0);
      setIsTimerActive(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      Alert.alert(
        'Great Job! 🎉',
        `You completed ${selectedPractice.title}. Your Iman Tracker has been updated!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error completing practice:', error);
      Alert.alert('Error', 'Failed to complete meditation session');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerProgress = (): number => {
    if (!selectedPractice) return 0;
    const totalSeconds = selectedPractice.duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={colors.gradientOcean}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <IconSymbol
              ios_icon_name="leaf.fill"
              android_material_icon_name="spa"
              size={48}
              color={colors.card}
            />
            <Text style={styles.header}>Meditation & Dhikr</Text>
            <Text style={styles.subtitle}>Mindfulness through Islamic practices</Text>
          </LinearGradient>
        </View>

        {user && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {todayCount}/{dailyGoal}
                </Text>
              </View>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, (todayCount / dailyGoal) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {todayCount >= dailyGoal 
                ? '✨ Goal achieved! Keep the momentum going!' 
                : `${dailyGoal - todayCount} more session${dailyGoal - todayCount === 1 ? '' : 's'} to reach your goal`}
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            Choose a meditation practice below. Each completed session will be tracked in your Iman Tracker under the Amanah (Well-Being) ring!
          </Text>
        </View>

        <View style={styles.practicesContainer}>
          <Text style={styles.sectionTitle}>Meditation Practices</Text>
          {practices.map((practice, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.practiceCard}
                activeOpacity={0.7}
                onPress={() => handleStartPractice(practice)}
              >
                <LinearGradient
                  colors={practice.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.practiceGradient}
                >
                  <View style={styles.practiceIconContainer}>
                    <IconSymbol
                      ios_icon_name={practice.iosIcon}
                      android_material_icon_name={practice.androidIcon}
                      size={32}
                      color={colors.card}
                    />
                  </View>
                  <View style={styles.practiceContent}>
                    <Text style={styles.practiceTitle}>{practice.title}</Text>
                    <Text style={styles.practiceDescription}>{practice.description}</Text>
                    <View style={styles.durationBadge}>
                      <IconSymbol
                        ios_icon_name="clock.fill"
                        android_material_icon_name="schedule"
                        size={14}
                        color={colors.card}
                      />
                      <Text style={styles.durationText}>{practice.duration} min</Text>
                    </View>
                  </View>
                  <IconSymbol
                    ios_icon_name="play.circle.fill"
                    android_material_icon_name="play-circle"
                    size={36}
                    color={colors.card}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Mindfulness Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.tipText}>Find a quiet, comfortable space</Text>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.tipText}>Start with just 1 minute daily</Text>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.tipText}>Be patient with yourself</Text>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.tipText}>Practice regularly for best results</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={showSessionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (timerInterval) {
            clearInterval(timerInterval);
          }
          setShowSessionModal(false);
        }}
      >
        {selectedPractice && (
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    if (timerInterval) {
                      clearInterval(timerInterval);
                    }
                    setShowSessionModal(false);
                    setIsTimerActive(false);
                    setTimeRemaining(0);
                  }}
                  style={styles.closeButton}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.sessionCard}>
                <LinearGradient
                  colors={selectedPractice.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sessionHeader}
                >
                  <IconSymbol
                    ios_icon_name={selectedPractice.iosIcon}
                    android_material_icon_name={selectedPractice.androidIcon}
                    size={48}
                    color={colors.card}
                  />
                  <Text style={styles.sessionTitle}>{selectedPractice.title}</Text>
                  <Text style={styles.sessionDuration}>{selectedPractice.duration} minutes</Text>
                </LinearGradient>

                <View style={styles.sessionContent}>
                  <View style={styles.timerContainer}>
                    <View style={styles.timerCircle}>
                      <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                      <Text style={styles.timerLabel}>
                        {isTimerActive ? 'In Progress' : timeRemaining === 0 ? 'Complete' : 'Ready'}
                      </Text>
                    </View>
                    <View style={styles.progressRing}>
                      <View 
                        style={[
                          styles.progressRingFill,
                          { 
                            width: `${getTimerProgress()}%`,
                            backgroundColor: selectedPractice.color[0],
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  <View style={styles.timerControls}>
                    {!isTimerActive && timeRemaining > 0 && (
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={startTimer}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={colors.gradientSuccess}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.controlButtonGradient}
                        >
                          <IconSymbol
                            ios_icon_name="play.fill"
                            android_material_icon_name="play-arrow"
                            size={24}
                            color={colors.card}
                          />
                          <Text style={styles.controlButtonText}>Start</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    {isTimerActive && (
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={pauseTimer}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={colors.gradientWarning}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.controlButtonGradient}
                        >
                          <IconSymbol
                            ios_icon_name="pause.fill"
                            android_material_icon_name="pause"
                            size={24}
                            color={colors.card}
                          />
                          <Text style={styles.controlButtonText}>Pause</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    {!isTimerActive && timeRemaining < selectedPractice.duration * 60 && timeRemaining > 0 && (
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={resetTimer}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={colors.gradientSecondary}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.controlButtonGradient}
                        >
                          <IconSymbol
                            ios_icon_name="arrow.clockwise"
                            android_material_icon_name="refresh"
                            size={24}
                            color={colors.card}
                          />
                          <Text style={styles.controlButtonText}>Reset</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.sessionInstructions}>
                    {selectedPractice.type === 'dhikr' 
                      ? 'Repeat: SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x)'
                      : selectedPractice.type === '1min_guided'
                      ? 'Take slow, deep breaths. Focus on your breathing and let go of distracting thoughts.'
                      : 'Find a comfortable position. Close your eyes and focus on your breath. Let your mind settle into the present moment.'}
                  </Text>

                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes (optional)</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="How did you feel during this practice?"
                      placeholderTextColor={colors.textSecondary}
                      value={sessionNotes}
                      onChangeText={setSessionNotes}
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleCompletePractice}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={colors.gradientSuccess}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.completeButtonGradient}
                    >
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={colors.card}
                      />
                      <Text style={styles.completeButtonText}>Mark as Complete</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  headerGradient: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  header: {
    ...typography.h1,
    color: colors.card,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.card,
    textAlign: 'center',
    opacity: 0.95,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h4,
    color: colors.text,
  },
  progressBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  progressBadgeText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  progressSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  practicesContainer: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  practiceCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  practiceGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  practiceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    ...typography.h4,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  practiceDescription: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  durationText: {
    ...typography.smallBold,
    color: colors.card,
  },
  tipsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  tipsList: {
    gap: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  bottomPadding: {
    height: 120,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    ...shadows.large,
  },
  sessionHeader: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  sessionTitle: {
    ...typography.h2,
    color: colors.card,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  sessionDuration: {
    ...typography.bodyBold,
    color: colors.card,
    opacity: 0.9,
  },
  sessionContent: {
    padding: spacing.xl,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  timerText: {
    ...typography.h1,
    fontSize: 48,
    color: colors.text,
    fontWeight: 'bold',
  },
  timerLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressRing: {
    width: 220,
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressRingFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  timerControls: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  controlButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  controlButtonText: {
    ...typography.h4,
    color: colors.card,
  },
  sessionInstructions: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  notesSection: {
    marginBottom: spacing.xxl,
  },
  notesLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notesInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  completeButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  completeButtonText: {
    ...typography.h4,
    color: colors.card,
  },
});
