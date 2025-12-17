
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type MentalTab = 'journal' | 'prompts' | 'stories' | 'duas' | 'mood' | 'meditation' | 'support';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  created_at: string;
}

interface JournalPrompt {
  id: string;
  prompt_text: string;
  category: string;
  tags: string[];
}

interface ProphetStory {
  id: string;
  title: string;
  story_text: string;
  lesson: string;
  mental_health_connection: string;
  category: string;
}

interface MentalHealthDua {
  id: string;
  title: string;
  arabic_text: string;
  transliteration: string;
  translation: string;
  emotion_category: string;
}

interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  created_at: string;
}

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Peaceful', value: 'peaceful' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😤', label: 'Angry', value: 'angry' },
  { emoji: '🙏', label: 'Grateful', value: 'grateful' },
];

const TABS = [
  { id: 'journal', label: 'Journal', icon: 'book.fill', androidIcon: 'menu-book', color: colors.gradientPrimary },
  { id: 'prompts', label: 'Prompts', icon: 'lightbulb.fill', androidIcon: 'lightbulb', color: colors.gradientInfo },
  { id: 'stories', label: 'Stories', icon: 'book.closed.fill', androidIcon: 'auto-stories', color: colors.gradientSecondary },
  { id: 'duas', label: 'Duas', icon: 'hands.sparkles.fill', androidIcon: 'self-improvement', color: colors.gradientPurple },
  { id: 'mood', label: 'Mood', icon: 'chart.line.uptrend.xyaxis', androidIcon: 'insights', color: colors.gradientTeal },
  { id: 'meditation', label: 'Meditate', icon: 'leaf.fill', androidIcon: 'spa', color: colors.gradientOcean },
  { id: 'support', label: 'Support', icon: 'heart.text.square.fill', androidIcon: 'favorite', color: colors.gradientPink },
];

export default function MentalHealthScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MentalTab>('journal');
  
  // Journal state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  // Prompts state
  const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
  
  // Stories state
  const [stories, setStories] = useState<ProphetStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<ProphetStory | null>(null);
  
  // Duas state
  const [duas, setDuas] = useState<MentalHealthDua[]>([]);
  const [selectedDua, setSelectedDua] = useState<MentalHealthDua | null>(null);
  
  // Mood state
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedMoodTrack, setSelectedMoodTrack] = useState('');
  const [moodIntensity, setMoodIntensity] = useState(5);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'journal':
          await loadJournalEntries();
          break;
        case 'prompts':
          await loadPrompts();
          break;
        case 'stories':
          await loadStories();
          break;
        case 'duas':
          await loadDuas();
          break;
        case 'mood':
          await loadMoodEntries();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJournalEntries = async () => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error) setJournalEntries(data || []);
  };

  const loadPrompts = async () => {
    const { data, error } = await supabase
      .from('journal_prompts')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    if (!error) setPrompts(data || []);
  };

  const loadStories = async () => {
    const { data, error } = await supabase
      .from('prophet_stories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    if (!error) setStories(data || []);
  };

  const loadDuas = async () => {
    const { data, error } = await supabase
      .from('mental_health_duas')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    if (!error) setDuas(data || []);
  };

  const loadMoodEntries = async () => {
    const { data, error } = await supabase
      .from('mood_tracking')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error) setMoodEntries(data || []);
  };

  const saveJournalEntry = async () => {
    if (!journalContent.trim()) {
      Alert.alert('Error', 'Please write something in your journal');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    const { error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        title: journalTitle.trim() || 'Untitled Entry',
        content: journalContent.trim(),
        mood: selectedMood,
      });

    if (error) {
      Alert.alert('Error', 'Failed to save entry');
    } else {
      Alert.alert('Success', 'Your journal entry has been saved');
      setJournalTitle('');
      setJournalContent('');
      setSelectedMood('');
      setShowNewEntry(false);
      loadJournalEntries();
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMoodTrack) {
      Alert.alert('Error', 'Please select a mood');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You must be logged in to track mood');
      return;
    }

    const { error } = await supabase
      .from('mood_tracking')
      .insert({
        user_id: user.id,
        mood: selectedMoodTrack,
        intensity: moodIntensity,
        date: new Date().toISOString().split('T')[0],
      });

    if (error) {
      Alert.alert('Error', 'Failed to save mood');
    } else {
      Alert.alert('Success', 'Mood tracked successfully');
      setSelectedMoodTrack('');
      setMoodIntensity(5);
      loadMoodEntries();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodObj = MOODS.find(m => m.value === mood);
    return moodObj ? moodObj.emoji : '📝';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string[] } = {
      grief: colors.gradientPink,
      anxiety: colors.gradientInfo,
      depression: colors.gradientPurple,
      resilience: colors.gradientSecondary,
      'self-care': colors.gradientOcean,
    };
    return colorMap[category] || colors.gradientPrimary;
  };

  const renderJournalTab = () => {
    if (showNewEntry) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.newEntryHeader}>
            <TouchableOpacity
              onPress={() => setShowNewEntry(false)}
              style={styles.backButton}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="chevron-left"
                size={24}
                color={colors.text}
              />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.newEntryTitle}>New Entry</Text>
            <TouchableOpacity
              onPress={saveJournalEntry}
              style={styles.saveButton}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.moodSection}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.moodButton,
                      selectedMood === mood.value && styles.moodButtonSelected,
                    ]}
                    onPress={() => setSelectedMood(mood.value)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Title (Optional)</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Give your entry a title..."
              placeholderTextColor={colors.textSecondary}
              value={journalTitle}
              onChangeText={setJournalTitle}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Your Thoughts</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Write your thoughts, feelings, and reflections..."
              placeholderTextColor={colors.textSecondary}
              value={journalContent}
              onChangeText={setJournalContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.contentHeader}>
          <View>
            <Text style={styles.contentTitle}>My Journal</Text>
            <Text style={styles.contentSubtitle}>Your private space for reflection</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNewEntry(true)}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addGradient}
            >
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={24}
                color={colors.card}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="book.fill"
              android_material_icon_name="menu-book"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No entries yet</Text>
            <Text style={styles.emptySubtext}>Start journaling to track your thoughts</Text>
          </View>
        ) : (
          journalEntries.map((entry, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.entryCard} activeOpacity={0.7}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryMood}>{getMoodEmoji(entry.mood)}</Text>
                  <View style={styles.entryHeaderText}>
                    <Text style={styles.entryTitle} numberOfLines={1}>{entry.title}</Text>
                    <Text style={styles.entryDate}>{formatDate(entry.created_at)}</Text>
                  </View>
                </View>
                <Text style={styles.entryContent} numberOfLines={3}>{entry.content}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))
        )}
      </View>
    );
  };

  const renderPromptsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <View>
          <Text style={styles.contentTitle}>Journal Prompts</Text>
          <Text style={styles.contentSubtitle}>Guided questions for reflection</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.randomCard}
        activeOpacity={0.8}
        onPress={() => {
          if (prompts.length > 0) {
            const randomIndex = Math.floor(Math.random() * prompts.length);
            Alert.alert('Random Prompt', prompts[randomIndex].prompt_text);
          }
        }}
      >
        <LinearGradient
          colors={colors.gradientOcean}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.randomGradient}
        >
          <IconSymbol
            ios_icon_name="sparkles"
            android_material_icon_name="auto-awesome"
            size={32}
            color={colors.card}
          />
          <Text style={styles.randomTitle}>Get Random Prompt</Text>
        </LinearGradient>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.emptyText}>Loading prompts...</Text>
      ) : prompts.length === 0 ? (
        <Text style={styles.emptyText}>No prompts available</Text>
      ) : (
        prompts.map((prompt, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity style={styles.promptCard} activeOpacity={0.7}>
              <View style={styles.promptIconContainer}>
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.promptContent}>
                <Text style={styles.promptText}>{prompt.prompt_text}</Text>
                {prompt.tags && prompt.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {prompt.tags.slice(0, 3).map((tag, tagIndex) => (
                      <React.Fragment key={tagIndex}>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </React.Fragment>
        ))
      )}
    </View>
  );

  const renderStoriesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <View>
          <Text style={styles.contentTitle}>Prophet Stories</Text>
          <Text style={styles.contentSubtitle}>Learn from the Prophet&apos;s life ﷺ</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <IconSymbol
          ios_icon_name="info.circle.fill"
          android_material_icon_name="info"
          size={20}
          color={colors.secondary}
        />
        <Text style={styles.infoText}>
          Stories showing how the Prophet ﷺ dealt with challenges
        </Text>
      </View>

      {loading ? (
        <Text style={styles.emptyText}>Loading stories...</Text>
      ) : stories.length === 0 ? (
        <Text style={styles.emptyText}>No stories available</Text>
      ) : (
        stories.map((story, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={styles.storyCard}
              activeOpacity={0.7}
              onPress={() => setSelectedStory(story)}
            >
              <LinearGradient
                colors={getCategoryColor(story.category)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.storyGradient}
              >
                <View style={styles.storyHeader}>
                  <View style={styles.storyIconContainer}>
                    <IconSymbol
                      ios_icon_name="book.fill"
                      android_material_icon_name="menu-book"
                      size={24}
                      color={colors.card}
                    />
                  </View>
                  <View style={styles.storyHeaderText}>
                    <Text style={styles.storyTitle}>{story.title}</Text>
                    <Text style={styles.storyCategory}>{story.category.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.storyPreview} numberOfLines={2}>
                  {story.mental_health_connection}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </React.Fragment>
        ))
      )}
    </View>
  );

  const renderDuasTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <View>
          <Text style={styles.contentTitle}>Healing Duas</Text>
          <Text style={styles.contentSubtitle}>Prayers for mental wellness</Text>
        </View>
      </View>

      {loading ? (
        <Text style={styles.emptyText}>Loading duas...</Text>
      ) : duas.length === 0 ? (
        <Text style={styles.emptyText}>No duas available</Text>
      ) : (
        duas.map((dua, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={styles.duaCard}
              activeOpacity={0.7}
              onPress={() => setSelectedDua(dua)}
            >
              <View style={styles.duaHeader}>
                <View style={styles.duaIconContainer}>
                  <IconSymbol
                    ios_icon_name="hands.sparkles.fill"
                    android_material_icon_name="self-improvement"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.duaHeaderText}>
                  <Text style={styles.duaTitle}>{dua.title}</Text>
                  <Text style={styles.duaCategory}>{dua.emotion_category.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.duaArabic}>{dua.arabic_text}</Text>
              <Text style={styles.duaTranslation} numberOfLines={2}>{dua.translation}</Text>
            </TouchableOpacity>
          </React.Fragment>
        ))
      )}
    </View>
  );

  const renderMoodTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <View>
          <Text style={styles.contentTitle}>Mood Tracker</Text>
          <Text style={styles.contentSubtitle}>Track your emotional patterns</Text>
        </View>
      </View>

      <View style={styles.moodSection}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((mood, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  styles.moodButton,
                  selectedMoodTrack === mood.value && styles.moodButtonSelected,
                ]}
                onPress={() => setSelectedMoodTrack(mood.value)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </View>

      {selectedMoodTrack && (
        <>
          <View style={styles.intensitySection}>
            <Text style={styles.sectionTitle}>Intensity: {moodIntensity}/10</Text>
            <View style={styles.intensityButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.intensityButton,
                      moodIntensity === value && styles.intensityButtonSelected,
                    ]}
                    onPress={() => setMoodIntensity(value)}
                  >
                    <Text style={[
                      styles.intensityText,
                      moodIntensity === value && styles.intensityTextSelected,
                    ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveMoodButton} onPress={saveMoodEntry}>
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveMoodGradient}
            >
              <Text style={styles.saveMoodText}>Save Mood</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.sectionTitle}>Recent Entries</Text>
      {loading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : moodEntries.length === 0 ? (
        <Text style={styles.emptyText}>No entries yet</Text>
      ) : (
        moodEntries.map((entry, index) => (
          <React.Fragment key={index}>
            <View style={styles.moodEntryCard}>
              <Text style={styles.moodEntryEmoji}>{getMoodEmoji(entry.mood)}</Text>
              <View style={styles.moodEntryContent}>
                <Text style={styles.moodEntryLabel}>{entry.mood}</Text>
                <Text style={styles.moodEntryDate}>{formatDate(entry.created_at)}</Text>
              </View>
              <View style={styles.intensityBadge}>
                <Text style={styles.intensityBadgeText}>{entry.intensity}/10</Text>
              </View>
            </View>
          </React.Fragment>
        ))
      )}
    </View>
  );

  const renderMeditationTab = () => {
    const practices = [
      {
        title: 'Dhikr Meditation',
        description: 'Repeat SubhanAllah, Alhamdulillah, Allahu Akbar',
        duration: '5-10 min',
        color: colors.gradientPrimary,
      },
      {
        title: 'Breath Awareness',
        description: 'Focus on your breathing',
        duration: '5 min',
        color: colors.gradientInfo,
      },
      {
        title: 'Gratitude Reflection',
        description: 'Reflect on Allah&apos;s blessings',
        duration: '10 min',
        color: colors.gradientPink,
      },
      {
        title: 'Quran Contemplation',
        description: 'Slowly recite and reflect',
        duration: '15 min',
        color: colors.gradientSecondary,
      },
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.contentHeader}>
          <View>
            <Text style={styles.contentTitle}>Meditation & Dhikr</Text>
            <Text style={styles.contentSubtitle}>Mindfulness through Islamic practices</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            Islamic mindfulness combines remembrance of Allah with present-moment awareness
          </Text>
        </View>

        {practices.map((practice, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity style={styles.practiceCard} activeOpacity={0.7}>
              <LinearGradient
                colors={practice.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.practiceGradient}
              >
                <View style={styles.practiceIconContainer}>
                  <IconSymbol
                    ios_icon_name="leaf.fill"
                    android_material_icon_name="spa"
                    size={28}
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
                    <Text style={styles.durationText}>{practice.duration}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderSupportTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.contentHeader}>
        <View>
          <Text style={styles.contentTitle}>Emotional Support</Text>
          <Text style={styles.contentSubtitle}>Guidance for different emotions</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.crisisCard}
        activeOpacity={0.7}
        onPress={() => router.push('/crisis-support' as any)}
      >
        <LinearGradient
          colors={colors.gradientRed}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.crisisGradient}
        >
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={32}
            color={colors.card}
          />
          <Text style={styles.crisisTitle}>Crisis Support</Text>
          <Text style={styles.crisisSubtitle}>Immediate help if you&apos;re in crisis</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.supportCard}
        activeOpacity={0.7}
        onPress={() => router.push('/emotional-support' as any)}
      >
        <View style={styles.supportIconContainer}>
          <IconSymbol
            ios_icon_name="heart.fill"
            android_material_icon_name="favorite"
            size={28}
            color={colors.accent}
          />
        </View>
        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>Emotional Guidance</Text>
          <Text style={styles.supportDescription}>Islamic advice for different emotions</Text>
        </View>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="chevron-right"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>Important Note</Text>
        <Text style={styles.disclaimerText}>
          This app provides Islamic guidance and support resources, but it is not a substitute for professional mental health care.
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'journal':
        return renderJournalTab();
      case 'prompts':
        return renderPromptsTab();
      case 'stories':
        return renderStoriesTab();
      case 'duas':
        return renderDuasTab();
      case 'mood':
        return renderMoodTab();
      case 'meditation':
        return renderMeditationTab();
      case 'support':
        return renderSupportTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <IconSymbol
            ios_icon_name="brain.head.profile"
            android_material_icon_name="psychology"
            size={40}
            color={colors.card}
          />
          <Text style={styles.headerTitle}>Mental Wellness</Text>
          <Text style={styles.headerSubtitle}>Your mental health matters</Text>
        </LinearGradient>
      </View>

      {/* Tab Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {TABS.map((tab, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === tab.id && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.id as MentalTab)}
            >
              {activeTab === tab.id ? (
                <LinearGradient
                  colors={tab.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabGradient}
                >
                  <IconSymbol
                    ios_icon_name={tab.icon}
                    android_material_icon_name={tab.androidIcon}
                    size={20}
                    color={colors.card}
                  />
                  <Text style={styles.tabTextActive}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <IconSymbol
                    ios_icon_name={tab.icon}
                    android_material_icon_name={tab.androidIcon}
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.tabText}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Story Detail Modal */}
      <Modal
        visible={selectedStory !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedStory(null)}
      >
        {selectedStory && (
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setSelectedStory(null)}
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

              <View style={styles.storyDetailCard}>
                <LinearGradient
                  colors={getCategoryColor(selectedStory.category)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.storyDetailHeader}
                >
                  <Text style={styles.storyDetailTitle}>{selectedStory.title}</Text>
                  <Text style={styles.storyDetailCategory}>
                    {selectedStory.category.toUpperCase()}
                  </Text>
                </LinearGradient>

                <View style={styles.storyDetailContent}>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>The Story</Text>
                    <Text style={styles.sectionText}>{selectedStory.story_text}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>The Lesson</Text>
                    <Text style={styles.sectionText}>{selectedStory.lesson}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mental Health Connection</Text>
                    <Text style={styles.sectionText}>{selectedStory.mental_health_connection}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bottomPadding} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Dua Detail Modal */}
      <Modal
        visible={selectedDua !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDua(null)}
      >
        {selectedDua && (
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setSelectedDua(null)}
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

              <View style={styles.duaDetailCard}>
                <LinearGradient
                  colors={colors.gradientPurple}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.duaDetailHeader}
                >
                  <Text style={styles.duaDetailTitle}>{selectedDua.title}</Text>
                  <Text style={styles.duaDetailCategory}>
                    {selectedDua.emotion_category.toUpperCase()}
                  </Text>
                </LinearGradient>

                <View style={styles.duaDetailContent}>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Arabic</Text>
                    <Text style={styles.arabicText}>{selectedDua.arabic_text}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transliteration</Text>
                    <Text style={styles.transliterationText}>{selectedDua.transliteration}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Translation</Text>
                    <Text style={styles.translationText}>{selectedDua.translation}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bottomPadding} />
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
  header: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  headerGradient: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.card,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.card,
    opacity: 0.95,
  },
  tabScroll: {
    maxHeight: 60,
    marginTop: spacing.lg,
  },
  tabContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  tab: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  tabActive: {
    ...shadows.medium,
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tabInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    ...typography.bodyBold,
    color: colors.card,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: spacing.xl,
  },
  tabContent: {
    paddingHorizontal: spacing.xl,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  contentTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contentSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  addButton: {
    borderRadius: borderRadius.round,
    overflow: 'hidden',
    ...shadows.medium,
  },
  addGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  entryMood: {
    fontSize: 32,
  },
  entryHeaderText: {
    flex: 1,
  },
  entryTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  entryDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  entryContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  newEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  newEntryTitle: {
    ...typography.h3,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  saveText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  moodSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moodButton: {
    width: '30%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  moodButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    ...typography.caption,
    color: colors.text,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  titleInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
  },
  randomCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.large,
  },
  randomGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  randomTitle: {
    ...typography.h3,
    color: colors.card,
    marginTop: spacing.md,
  },
  promptCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  promptIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptContent: {
    flex: 1,
  },
  promptText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.highlight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    ...typography.small,
    color: colors.primary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  storyCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  storyGradient: {
    padding: spacing.lg,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  storyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyHeaderText: {
    flex: 1,
  },
  storyTitle: {
    ...typography.h4,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  storyCategory: {
    ...typography.smallBold,
    color: colors.card,
    opacity: 0.8,
  },
  storyPreview: {
    ...typography.body,
    color: colors.card,
    lineHeight: 22,
    opacity: 0.9,
  },
  duaCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  duaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duaHeaderText: {
    flex: 1,
  },
  duaTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  duaCategory: {
    ...typography.smallBold,
    color: colors.primary,
  },
  duaArabic: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  duaTranslation: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  intensitySection: {
    marginBottom: spacing.xl,
  },
  intensityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  intensityButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  intensityButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  intensityText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  intensityTextSelected: {
    color: colors.card,
  },
  saveMoodButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  saveMoodGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  saveMoodText: {
    ...typography.h4,
    color: colors.card,
  },
  moodEntryCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  moodEntryEmoji: {
    fontSize: 32,
  },
  moodEntryContent: {
    flex: 1,
  },
  moodEntryLabel: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  moodEntryDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  intensityBadge: {
    backgroundColor: colors.highlight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  intensityBadgeText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  practiceCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  practiceGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  practiceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  crisisCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.colored,
  },
  crisisGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  crisisTitle: {
    ...typography.h3,
    color: colors.card,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  crisisSubtitle: {
    ...typography.body,
    color: colors.card,
    opacity: 0.95,
  },
  supportCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  supportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  supportDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  disclaimerCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
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
  storyDetailCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    ...shadows.large,
  },
  storyDetailHeader: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  storyDetailTitle: {
    ...typography.h2,
    color: colors.card,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  storyDetailCategory: {
    ...typography.bodyBold,
    color: colors.card,
    opacity: 0.9,
  },
  storyDetailContent: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  duaDetailCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    ...shadows.large,
  },
  duaDetailHeader: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  duaDetailTitle: {
    ...typography.h2,
    color: colors.card,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  duaDetailCategory: {
    ...typography.bodyBold,
    color: colors.card,
    opacity: 0.9,
  },
  duaDetailContent: {
    padding: spacing.xl,
  },
  arabicText: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'right',
    lineHeight: 36,
  },
  transliterationText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  translationText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 120,
  },
});
