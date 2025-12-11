
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, Modal } from "react-native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import Svg, { Circle } from 'react-native-svg';

interface Goal {
  name: string;
  target: number;
  current: number;
  unit: string;
  color: string;
  icon: string;
}

export default function ImanTrackerScreen() {
  const [goals, setGoals] = useState<Goal[]>([
    { name: 'Prayers', target: 5, current: 3, unit: 'prayers', color: colors.primary, icon: 'schedule' },
    { name: 'Quran', target: 30, current: 15, unit: 'minutes', color: colors.accent, icon: 'book' },
    { name: 'Dhikr', target: 100, current: 50, unit: 'times', color: colors.secondary, icon: 'favorite' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoalIndex, setSelectedGoalIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');

  const openModal = (index: number) => {
    setSelectedGoalIndex(index);
    setInputValue(goals[index].current.toString());
    setModalVisible(true);
  };

  const updateGoal = () => {
    if (selectedGoalIndex !== null) {
      const newGoals = [...goals];
      const value = parseInt(inputValue) || 0;
      newGoals[selectedGoalIndex].current = Math.min(value, newGoals[selectedGoalIndex].target);
      setGoals(newGoals);
      setModalVisible(false);
      setSelectedGoalIndex(null);
      setInputValue('');
    }
  };

  const renderProgressRing = (goal: Goal, size: number, strokeWidth: number) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = goal.current / goal.target;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={styles.ringContainer}>
        <Svg width={size} height={size}>
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
            stroke={goal.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.ringContent}>
          <IconSymbol
            ios_icon_name={goal.icon}
            android_material_icon_name={goal.icon}
            size={32}
            color={goal.color}
          />
          <Text style={styles.ringText}>{goal.current}/{goal.target}</Text>
          <Text style={styles.ringLabel}>{goal.name}</Text>
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
        <Text style={styles.header}>Iman Tracker</Text>
        <Text style={styles.subtitle}>Track your daily spiritual goals</Text>

        {/* Progress Rings */}
        <View style={styles.ringsContainer}>
          {goals.map((goal, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.ringWrapper}
                onPress={() => openModal(index)}
                activeOpacity={0.7}
              >
                {renderProgressRing(goal, 120, 12)}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Goal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
          {goals.map((goal, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.goalCard}
                onPress={() => openModal(index)}
                activeOpacity={0.7}
              >
                <View style={styles.goalInfo}>
                  <View style={[styles.goalIconContainer, { backgroundColor: goal.color }]}>
                    <IconSymbol
                      ios_icon_name={goal.icon}
                      android_material_icon_name={goal.icon}
                      size={24}
                      color={colors.card}
                    />
                  </View>
                  <View style={styles.goalTextContainer}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalProgress}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${(goal.current / goal.target) * 100}%`,
                          backgroundColor: goal.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentage}>
                    {Math.round((goal.current / goal.target) * 100)}%
                  </Text>
                </View>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Update Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Update {selectedGoalIndex !== null ? goals[selectedGoalIndex].name : ''}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="Enter value"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={updateGoal}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Update</Text>
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
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  ringWrapper: {
    marginBottom: 16,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  ringLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  bottomPadding: {
    height: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonCancel: {
    backgroundColor: colors.highlight,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonTextConfirm: {
    color: colors.card,
  },
});
