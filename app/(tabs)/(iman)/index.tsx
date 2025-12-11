
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, Modal } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuranGoals {
  versesToMemorize: number;
  versesMemorized: number;
  pagesToRead: number;
  pagesRead: number;
}

interface DhikrGoals {
  dailyTarget: number;
  currentCount: number;
}

interface PrayerProgress {
  completed: number;
  total: number;
}

export default function ImanTrackerScreen() {
  const [quranGoals, setQuranGoals] = useState<QuranGoals>({
    versesToMemorize: 5,
    versesMemorized: 0,
    pagesToRead: 2,
    pagesRead: 0,
  });

  const [dhikrGoals, setDhikrGoals] = useState<DhikrGoals>({
    dailyTarget: 100,
    currentCount: 0,
  });

  const [prayerProgress, setPrayerProgress] = useState<PrayerProgress>({
    completed: 0,
    total: 5,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'quran' | 'dhikr' | 'goals' | null>(null);
  const [tempQuranGoals, setTempQuranGoals] = useState<QuranGoals>(quranGoals);
  const [tempDhikrTarget, setTempDhikrTarget] = useState(dhikrGoals.dailyTarget.toString());

  // Load data and check for daily reset
  useEffect(() => {
    loadData();
    loadPrayerProgress();
  }, []);

  const loadData = async () => {
    try {
      const lastDate = await AsyncStorage.getItem('lastImanDate');
      const today = new Date().toDateString();
      
      if (lastDate !== today) {
        // Reset for new day
        await AsyncStorage.setItem('lastImanDate', today);
        const savedQuranGoals = await AsyncStorage.getItem('quranGoalTargets');
        const savedDhikrTarget = await AsyncStorage.getItem('dhikrGoalTarget');
        
        const newQuranGoals = savedQuranGoals ? JSON.parse(savedQuranGoals) : quranGoals;
        const newDhikrTarget = savedDhikrTarget ? parseInt(savedDhikrTarget) : dhikrGoals.dailyTarget;
        
        setQuranGoals({
          ...newQuranGoals,
          versesMemorized: 0,
          pagesRead: 0,
        });
        setDhikrGoals({
          dailyTarget: newDhikrTarget,
          currentCount: 0,
        });
        
        await AsyncStorage.setItem('quranProgress', JSON.stringify({
          ...newQuranGoals,
          versesMemorized: 0,
          pagesRead: 0,
        }));
        await AsyncStorage.setItem('dhikrProgress', JSON.stringify({
          dailyTarget: newDhikrTarget,
          currentCount: 0,
        }));
      } else {
        const savedQuranProgress = await AsyncStorage.getItem('quranProgress');
        const savedDhikrProgress = await AsyncStorage.getItem('dhikrProgress');
        
        if (savedQuranProgress) {
          setQuranGoals(JSON.parse(savedQuranProgress));
        }
        if (savedDhikrProgress) {
          setDhikrGoals(JSON.parse(savedDhikrProgress));
        }
      }
    } catch (error) {
      console.log('Error loading iman data:', error);
    }
  };

  const loadPrayerProgress = async () => {
    try {
      const savedPrayerData = await AsyncStorage.getItem('prayerData');
      if (savedPrayerData) {
        const prayers = JSON.parse(savedPrayerData);
        const completed = prayers.filter((p: any) => p.completed).length;
        setPrayerProgress({ completed, total: 5 });
      }
    } catch (error) {
      console.log('Error loading prayer progress:', error);
    }
  };

  const updateQuranProgress = async (field: keyof QuranGoals, increment: boolean) => {
    const newGoals = { ...quranGoals };
    if (field === 'versesMemorized') {
      newGoals.versesMemorized = increment 
        ? Math.min(newGoals.versesMemorized + 1, newGoals.versesToMemorize)
        : Math.max(newGoals.versesMemorized - 1, 0);
    } else if (field === 'pagesRead') {
      newGoals.pagesRead = increment 
        ? Math.min(newGoals.pagesRead + 1, newGoals.pagesToRead)
        : Math.max(newGoals.pagesRead - 1, 0);
    }
    setQuranGoals(newGoals);
    await AsyncStorage.setItem('quranProgress', JSON.stringify(newGoals));
  };

  const incrementDhikr = async () => {
    const newCount = Math.min(dhikrGoals.currentCount + 1, dhikrGoals.dailyTarget);
    const newDhikrGoals = { ...dhikrGoals, currentCount: newCount };
    setDhikrGoals(newDhikrGoals);
    await AsyncStorage.setItem('dhikrProgress', JSON.stringify(newDhikrGoals));
  };

  const resetDhikr = async () => {
    const newDhikrGoals = { ...dhikrGoals, currentCount: 0 };
    setDhikrGoals(newDhikrGoals);
    await AsyncStorage.setItem('dhikrProgress', JSON.stringify(newDhikrGoals));
  };

  const openGoalsModal = () => {
    setTempQuranGoals(quranGoals);
    setTempDhikrTarget(dhikrGoals.dailyTarget.toString());
    setModalType('goals');
    setModalVisible(true);
  };

  const saveGoals = async () => {
    const newQuranGoals = {
      ...tempQuranGoals,
      versesMemorized: Math.min(tempQuranGoals.versesMemorized, tempQuranGoals.versesToMemorize),
      pagesRead: Math.min(tempQuranGoals.pagesRead, tempQuranGoals.pagesToRead),
    };
    const newDhikrTarget = parseInt(tempDhikrTarget) || 100;
    
    setQuranGoals(newQuranGoals);
    setDhikrGoals({ ...dhikrGoals, dailyTarget: newDhikrTarget });
    
    await AsyncStorage.setItem('quranGoalTargets', JSON.stringify({
      versesToMemorize: newQuranGoals.versesToMemorize,
      pagesToRead: newQuranGoals.pagesToRead,
    }));
    await AsyncStorage.setItem('quranProgress', JSON.stringify(newQuranGoals));
    await AsyncStorage.setItem('dhikrGoalTarget', newDhikrTarget.toString());
    await AsyncStorage.setItem('dhikrProgress', JSON.stringify({
      dailyTarget: newDhikrTarget,
      currentCount: dhikrGoals.currentCount,
    }));
    
    setModalVisible(false);
  };

  const renderNestedRings = () => {
    const centerX = 170;
    const centerY = 170;
    
    // Prayer ring (outer) - Green
    const prayerRadius = 140;
    const prayerStroke = 20;
    const prayerProgressValue = prayerProgress.completed / prayerProgress.total;
    const prayerCircumference = 2 * Math.PI * prayerRadius;
    const prayerOffset = prayerCircumference * (1 - prayerProgressValue);
    
    // Quran ring (middle) - Amber
    const quranRadius = 100;
    const quranStroke = 18;
    const quranProgressValue = ((quranGoals.versesMemorized / quranGoals.versesToMemorize) + 
                          (quranGoals.pagesRead / quranGoals.pagesToRead)) / 2;
    const quranCircumference = 2 * Math.PI * quranRadius;
    const quranOffset = quranCircumference * (1 - quranProgressValue);
    
    // Dhikr ring (inner) - Blue
    const dhikrRadius = 60;
    const dhikrStroke = 16;
    const dhikrProgressValue = dhikrGoals.currentCount / dhikrGoals.dailyTarget;
    const dhikrCircumference = 2 * Math.PI * dhikrRadius;
    const dhikrOffset = dhikrCircumference * (1 - dhikrProgressValue);

    return (
      <View style={styles.nestedRingsContainer}>
        <Svg width={340} height={340}>
          {/* Prayer Ring (Outer) */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={prayerRadius}
            stroke={colors.highlight}
            strokeWidth={prayerStroke}
            fill="none"
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
          
          {/* Quran Ring (Middle) */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={quranRadius}
            stroke={colors.highlight}
            strokeWidth={quranStroke}
            fill="none"
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
          
          {/* Dhikr Ring (Inner) */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={dhikrRadius}
            stroke={colors.highlight}
            strokeWidth={dhikrStroke}
            fill="none"
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
        
        {/* Center Content */}
        <View style={styles.centerContent}>
          <Text style={styles.centerTitle}>Iman</Text>
          <Text style={styles.centerSubtitle}>Score</Text>
          <Text style={styles.centerPercentage}>
            {Math.round(((prayerProgressValue + quranProgressValue + dhikrProgressValue) / 3) * 100)}%
          </Text>
        </View>
        
        {/* Ring Labels */}
        <View style={styles.ringLabelsContainer}>
          <View style={styles.ringLabel}>
            <View style={[styles.ringLabelDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.ringLabelText}>Prayer ({prayerProgress.completed}/{prayerProgress.total})</Text>
          </View>
          <View style={styles.ringLabel}>
            <View style={[styles.ringLabelDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.ringLabelText}>Quran ({Math.round(quranProgressValue * 100)}%)</Text>
          </View>
          <View style={styles.ringLabel}>
            <View style={[styles.ringLabelDot, { backgroundColor: colors.info }]} />
            <Text style={styles.ringLabelText}>Dhikr ({dhikrGoals.currentCount}/{dhikrGoals.dailyTarget})</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.header}>Iman Tracker</Text>
            <Text style={styles.subtitle}>Track your daily spiritual goals</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openGoalsModal}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="gear"
              android_material_icon_name="settings"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Nested Rings Display */}
        {renderNestedRings()}

        {/* Quran Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol
                ios_icon_name="book"
                android_material_icon_name="book"
                size={20}
                color={colors.accent}
              />
            </View>
            <Text style={styles.sectionTitle}>Quran Goals</Text>
          </View>
          
          {/* Verses to Memorize */}
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>Verses to Memorize</Text>
              <Text style={styles.goalProgress}>
                {quranGoals.versesMemorized} / {quranGoals.versesToMemorize}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${(quranGoals.versesMemorized / quranGoals.versesToMemorize) * 100}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.goalButtons}>
              <TouchableOpacity
                style={[styles.goalButton, styles.goalButtonSecondary]}
                onPress={() => updateQuranProgress('versesMemorized', false)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="minus"
                  android_material_icon_name="remove"
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.goalButton, { backgroundColor: colors.accent }]}
                onPress={() => updateQuranProgress('versesMemorized', true)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={20}
                  color={colors.card}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Pages to Read */}
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>Pages to Read</Text>
              <Text style={styles.goalProgress}>
                {quranGoals.pagesRead} / {quranGoals.pagesToRead}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { 
                      width: `${(quranGoals.pagesRead / quranGoals.pagesToRead) * 100}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.goalButtons}>
              <TouchableOpacity
                style={[styles.goalButton, styles.goalButtonSecondary]}
                onPress={() => updateQuranProgress('pagesRead', false)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="minus"
                  android_material_icon_name="remove"
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.goalButton, { backgroundColor: colors.accent }]}
                onPress={() => updateQuranProgress('pagesRead', true)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="plus"
                  android_material_icon_name="add"
                  size={20}
                  color={colors.card}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tasbih Counter Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.info + '20' }]}>
              <IconSymbol
                ios_icon_name="hand"
                android_material_icon_name="back-hand"
                size={20}
                color={colors.info}
              />
            </View>
            <Text style={styles.sectionTitle}>Tasbih Counter</Text>
          </View>
          
          <LinearGradient
            colors={colors.gradientInfo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tasbihCard}
          >
            <Text style={styles.tasbihTitle}>Daily Dhikr</Text>
            <Text style={styles.tasbihCount}>{dhikrGoals.currentCount}</Text>
            <Text style={styles.tasbihTarget}>Goal: {dhikrGoals.dailyTarget}</Text>
            
            <View style={styles.tasbihProgressContainer}>
              <View style={styles.tasbihProgressBackground}>
                <View
                  style={[
                    styles.tasbihProgressFill,
                    { width: `${(dhikrGoals.currentCount / dhikrGoals.dailyTarget) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.tasbihButtons}>
              <TouchableOpacity
                style={styles.tasbihResetButton}
                onPress={resetDhikr}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="arrow-clockwise"
                  android_material_icon_name="refresh"
                  size={20}
                  color={colors.card}
                />
                <Text style={styles.tasbihResetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tasbihIncrementButton}
                onPress={incrementDhikr}
                activeOpacity={0.7}
              >
                <IconSymbol
                  ios_icon_name="plus-circle"
                  android_material_icon_name="add-circle"
                  size={32}
                  color={colors.card}
                />
                <Text style={styles.tasbihIncrementText}>Count</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Goals Settings Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Daily Goals</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <IconSymbol
                  ios_icon_name="xmark"
                  android_material_icon_name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Quran Goals */}
              <Text style={styles.modalSectionTitle}>Quran Goals</Text>
              
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Verses to Memorize</Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempQuranGoals.versesToMemorize.toString()}
                  onChangeText={(text) => setTempQuranGoals({
                    ...tempQuranGoals,
                    versesToMemorize: parseInt(text) || 0,
                  })}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Pages to Read</Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempQuranGoals.pagesToRead.toString()}
                  onChangeText={(text) => setTempQuranGoals({
                    ...tempQuranGoals,
                    pagesToRead: parseInt(text) || 0,
                  })}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Dhikr Goal */}
              <Text style={styles.modalSectionTitle}>Dhikr Goal</Text>
              
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Daily Target</Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempDhikrTarget}
                  onChangeText={setTempDhikrTarget}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={saveGoals}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingHorizontal: spacing.lg,
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
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nestedRingsContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.medium,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -30 }],
  },
  centerTitle: {
    ...typography.h4,
    color: colors.text,
  },
  centerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  centerPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  ringLabelsContainer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
    width: '100%',
  },
  ringLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ringLabelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ringLabelText: {
    ...typography.caption,
    color: colors.text,
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
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  goalCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  goalProgress: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
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
  goalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  goalButton: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalButtonSecondary: {
    backgroundColor: colors.highlight,
  },
  tasbihCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.colored,
  },
  tasbihTitle: {
    ...typography.h4,
    color: colors.card,
    marginBottom: spacing.md,
  },
  tasbihCount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: spacing.xs,
  },
  tasbihTarget: {
    ...typography.body,
    color: colors.card,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  tasbihProgressContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  tasbihProgressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  tasbihProgressFill: {
    height: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
  },
  tasbihButtons: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  tasbihResetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
  },
  tasbihResetText: {
    ...typography.body,
    color: colors.card,
    fontWeight: '600',
  },
  tasbihIncrementButton: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
  },
  tasbihIncrementText: {
    ...typography.body,
    color: colors.card,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    marginBottom: spacing.xl,
  },
  modalSectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  modalInputGroup: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.highlight,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  modalButtonTextConfirm: {
    color: colors.card,
  },
});
