
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

interface DhikrPhrase {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  color: string;
}

const DHIKR_PHRASES: DhikrPhrase[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللّٰهِ',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    color: '#4CAF50',
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلّٰهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    color: '#2196F3',
  },
  {
    id: 'allahuakbar',
    arabic: 'اللّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    color: '#FF9800',
  },
  {
    id: 'lailahaillallah',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no god but Allah',
    color: '#9C27B0',
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    color: '#F44336',
  },
  {
    id: 'subhanallahwalhamdulillah',
    arabic: 'سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ',
    transliteration: 'Subhan Allah wal Hamdulillah',
    translation: 'Glory be to Allah and all praise is due to Allah',
    color: '#00BCD4',
  },
];

interface DhikrCircularCounterProps {
  count: number;
  onIncrement: (amount: number) => void;
  dailyGoal?: number;
}

export default function DhikrCircularCounter({ count, onIncrement, dailyGoal = 100 }: DhikrCircularCounterProps) {
  const [selectedPhrase, setSelectedPhrase] = useState<DhikrPhrase>(DHIKR_PHRASES[0]);
  const [showPhraseSelector, setShowPhraseSelector] = useState(false);

  const handleMainButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onIncrement(1);
  };

  const handleIncrementPress = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onIncrement(amount);
  };

  const handlePhraseSelect = (phrase: DhikrPhrase) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPhrase(phrase);
    setShowPhraseSelector(false);
  };

  const progress = dailyGoal > 0 ? Math.min(count / dailyGoal, 1) : 0;
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      {/* Phrase Selector Button */}
      <TouchableOpacity
        style={styles.phraseSelectorButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowPhraseSelector(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.phraseSelectorContent}>
          <View style={styles.phraseTextContainer}>
            <Text style={styles.phraseArabic}>{selectedPhrase.arabic}</Text>
            <Text style={styles.phraseTransliteration}>{selectedPhrase.transliteration}</Text>
            <Text style={styles.phraseTranslation}>{selectedPhrase.translation}</Text>
          </View>
          <View style={styles.swapIconContainer}>
            <IconSymbol
              ios_icon_name="arrow.triangle.2.circlepath"
              android_material_icon_name="swap-horiz"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.swapText}>Swap</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Circular Counter Button */}
      <TouchableOpacity
        style={styles.circularButtonContainer}
        onPress={handleMainButtonPress}
        activeOpacity={0.8}
      >
        <Svg width={size} height={size} style={styles.progressRing}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.highlight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={selectedPhrase.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        
        <LinearGradient
          colors={[selectedPhrase.color, selectedPhrase.color + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circularButton}
        >
          <Text style={styles.countText}>{count}</Text>
          <Text style={styles.tapText}>Tap to count</Text>
          <View style={styles.goalIndicator}>
            <Text style={styles.goalText}>Goal: {dailyGoal}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Increment Buttons */}
      <View style={styles.incrementButtonsContainer}>
        <TouchableOpacity
          style={styles.incrementButton}
          onPress={() => handleIncrementPress(10)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[selectedPhrase.color, selectedPhrase.color + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.incrementButtonGradient}
          >
            <Text style={styles.incrementButtonText}>+10</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.incrementButton}
          onPress={() => handleIncrementPress(33)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[selectedPhrase.color, selectedPhrase.color + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.incrementButtonGradient}
          >
            <Text style={styles.incrementButtonText}>+33</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.incrementButton}
          onPress={() => handleIncrementPress(100)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[selectedPhrase.color, selectedPhrase.color + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.incrementButtonGradient}
          >
            <Text style={styles.incrementButtonText}>+100</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Phrase Selector Modal */}
      <Modal
        visible={showPhraseSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhraseSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Dhikr Phrase</Text>
              <TouchableOpacity
                onPress={() => setShowPhraseSelector(false)}
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

            <ScrollView style={styles.phraseList} showsVerticalScrollIndicator={false}>
              {DHIKR_PHRASES.map((phrase, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.phraseItem,
                      selectedPhrase.id === phrase.id && styles.phraseItemSelected,
                    ]}
                    onPress={() => handlePhraseSelect(phrase)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.phraseColorIndicator, { backgroundColor: phrase.color }]} />
                    <View style={styles.phraseItemContent}>
                      <Text style={styles.phraseItemArabic}>{phrase.arabic}</Text>
                      <Text style={styles.phraseItemTransliteration}>{phrase.transliteration}</Text>
                      <Text style={styles.phraseItemTranslation}>{phrase.translation}</Text>
                    </View>
                    {selectedPhrase.id === phrase.id && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={phrase.color}
                      />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  phraseSelectorButton: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  phraseSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phraseTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  phraseArabic: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'left',
  },
  phraseTransliteration: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  phraseTranslation: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  swapIconContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.md,
  },
  swapText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  circularButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  circularButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  countText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: spacing.xs,
  },
  tapText: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.9,
  },
  goalIndicator: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.sm,
  },
  goalText: {
    ...typography.small,
    color: colors.card,
    fontWeight: '600',
  },
  incrementButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  incrementButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  incrementButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementButtonText: {
    ...typography.h4,
    color: colors.card,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseList: {
    padding: spacing.lg,
  },
  phraseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.small,
  },
  phraseItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  phraseColorIndicator: {
    width: 4,
    height: '100%',
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  phraseItemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  phraseItemArabic: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  phraseItemTransliteration: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  phraseItemTranslation: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
