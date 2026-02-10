import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlobalModalContext from '../../services/GlobalContext';
import DaysScroller from '../../components/widgets/DaysScroller';
import ModalTopIcon from '../../components/common/ModalTopIcon';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../constants/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import DiaryModal from '../common/diary/DiaryModal';
import { STYLE } from '../../constants/app';
import { fetchDiaryEntry, saveDiaryEntry } from '../common/diary/service';
import { parseValidationErrors } from '@src/utils/formUtils';
import { APIError } from '@src/services/ApiClient';
import { useToastMessage } from '@src/utils/toastMessage';

const moods = [
  { name: 'Happy', emoji: '😊', color: '#FFE0B2' },
  { name: 'Sad', emoji: '😢', color: '#BBDEFB' },
  { name: 'Angry', emoji: '😠', color: '#FFCDD2' },
  { name: 'In Love', emoji: '😍', color: '#F8BBD0' },
  { name: 'Anxious', emoji: '😰', color: '#D1C4E9' },
  { name: 'Calm', emoji: '😌', color: '#C8E6C9' },
  { name: 'Tired', emoji: '😴', color: '#E1BEE7' },
  { name: 'Excited', emoji: '🤩', color: '#FFF9C4' },
];

const symptoms = [
  { name: 'Headache', icon: 'head', color: '#FFCDD2' },
  { name: 'Cramps', icon: 'body', color: '#F8BBD0' },
  { name: 'Bloating', icon: 'circle', color: '#E1BEE7' },
  { name: 'Nausea', icon: 'sad', color: '#C5CAE9' },
  { name: 'Fatigue', icon: 'sleep', color: '#BBDEFB' },
  { name: 'Back Pain', icon: 'back', color: '#B2DFDB' },
  { name: 'Tender Breasts', icon: 'heart', color: '#F0F4C3' },
  { name: 'Acne', icon: 'face', color: '#FFCCBC' },
];

export default function AboutHomeModal() {
  // Save entry to API
  const handleSave = async () => {
    const payload = {
      date: selectedDate,
      ratings: itemRatings,
      moods: selectedMoods,
      symptoms: selectedSymptoms,
      flow: selectedFlow,
      // add other fields as needed
    };
    try {
      // const response = await fetch('https://your-api-endpoint.com/entry', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // const result = await response.json();
      console.log('Save result:', payload);
      // Optionally show success message or close modal
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };
  // Ratings state by item id
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});

  // Set rating for an item by id
  const setItemRating = (id: string, value: number) => {
    setItemRatings(prev => {
      // If first star is clicked and already selected, clear rating
      if (value === 1 && prev[id] === 1) {
        return { ...prev, [id]: 0 };
      }
      return { ...prev, [id]: value };
    });
  };

  const today = new Date();
  const daysScrollerRef = useRef<{ goToToday: () => void } | null>(null);
  const modal = useContext(GlobalModalContext);
  const insets = useSafeAreaInsets();

  const [monthYear, setMonthYear] = useState<{ month: number; year: number }>({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracking' | 'ratings'>(
    'tracking',
  );
  const { showToast } = useToastMessage();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [diaryText, setDiaryText] = useState<string>('');

  useEffect(() => {
    if (showDiaryModal) {
      loadDiary(new Date());
    }
  }, [showDiaryModal]);

  async function loadDiary(date: Date) {
    try {
      const entry = await fetchDiaryEntry(date);
      setDiaryText(entry?.content ?? '');
    } catch (error) {
      console.error('Failed to fetch diary entry', error);
      setDiaryText('');
    }
  }

  async function handleDiarySave(date: Date, text: string) {
    try {
      const message = await saveDiaryEntry(date, text);
      showToast(message);
      setShowDiaryModal(false);
    } catch (error) {
      const apiError = error as APIError;

      if (apiError.statusCode === 422 && apiError.data) {
        console.log(parseValidationErrors(apiError.data));
      } else {
        Alert.alert(
          apiError.normalizedError.title,
          apiError.normalizedError.message,
        );
      }
    }
  }

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood],
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky Calendar Header */}
        <View style={styles.calendarHeader}>
          <View style={styles.headerTop}>
            <ModalTopIcon iconName="cancel" onPress={modal.close} />
            <Text style={styles.monthText}>
              {new Date(monthYear.year, monthYear.month).toLocaleString(
                'default',
                { month: 'long', year: 'numeric' },
              )}
            </Text>
            <ModalTopIcon iconName="check" onPress={modal.close} />
          </View>
          <DaysScroller
            ref={daysScrollerRef}
            onMonthChange={(month, year) => setMonthYear({ month, year })}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </View>

        {/* Date Info Banner */}
        <View style={styles.dateBanner}>
          <FontelloIcon
            name="calendar-1"
            size={20}
            color={THEME_COLORS.primary}
          />
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('default', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tracking' && styles.tabActive]}
            onPress={() => setActiveTab('tracking')}
          >
            <FontelloIcon
              name="heart"
              size={18}
              color={activeTab === 'tracking' ? '#fff' : '#999'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'tracking' && styles.tabTextActive,
              ]}
            >
              Tracking
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ratings' && styles.tabActive]}
            onPress={() => setActiveTab('ratings')}
          >
            <FontelloIcon
              name="star"
              size={18}
              color={activeTab === 'ratings' ? '#fff' : '#999'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'ratings' && styles.tabTextActive,
              ]}
            >
              Ratings
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'tracking' ? (
          <>
            {/* Moods Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon
                  name="heart"
                  size={20}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>How are you feeling?</Text>
              </View>
              <View style={styles.moodsGrid}>
                {moods.map((mood, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.moodCard,
                      { backgroundColor: mood.color },
                      selectedMoods.includes(mood.name) &&
                        styles.moodCardSelected,
                    ]}
                    onPress={() => toggleMood(mood.name)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.name}</Text>
                    {selectedMoods.includes(mood.name) && (
                      <View style={styles.selectedBadge}>
                        <FontelloIcon name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptoms Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon
                  name="stethoscope"
                  size={20}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Any symptoms?</Text>
              </View>
              <View style={styles.symptomsGrid}>
                {symptoms.map((symptom, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.symptomChip,
                      { backgroundColor: symptom.color },
                      selectedSymptoms.includes(symptom.name) &&
                        styles.symptomChipSelected,
                    ]}
                    onPress={() => toggleSymptom(symptom.name)}
                  >
                    <Text style={styles.symptomText}>{symptom.name}</Text>
                    {selectedSymptoms.includes(symptom.name) && (
                      <FontelloIcon name="check" size={14} color="#333" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Flow Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon
                  name="droplet"
                  size={20}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Period Flow</Text>
              </View>
              <View style={styles.flowGrid}>
                {[
                  { label: 'Light', emoji: '🌸', color: '#FFE0F0' },
                  { label: 'Medium', emoji: '💧', color: '#E1F5FE' },
                  { label: 'Heavy', emoji: '💦', color: '#C5CAE9' },
                  { label: 'Spotting', emoji: '🩸', color: '#FFCDD2' },
                  { label: 'None', emoji: '🚫', color: '#EEEEEE' },
                ].map((flow, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.flowCard,
                      { backgroundColor: flow.color },
                      selectedFlow === flow.label && styles.flowCardSelected,
                    ]}
                    onPress={() => setSelectedFlow(flow.label)}
                  >
                    <Text style={styles.flowEmoji}>{flow.emoji}</Text>
                    <Text style={styles.flowLabel}>{flow.label}</Text>
                    {selectedFlow === flow.label && (
                      <View style={styles.flowCheckBadge}>
                        <FontelloIcon name="check" size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Activity Tags Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon
                  name="tag"
                  size={20}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Activities</Text>
              </View>
              <View style={styles.tagsGrid}>
                {[
                  { label: 'Exercise', emoji: '💪', color: '#C8E6C9' },
                  { label: 'Sleep', emoji: '😴', color: '#E1BEE7' },
                  { label: 'Stress', emoji: '😫', color: '#FFCDD2' },
                  { label: 'Travel', emoji: '✈️', color: '#B3E5FC' },
                  { label: 'Party', emoji: '🎉', color: '#FFF9C4' },
                  { label: 'Work', emoji: '💼', color: '#CFD8DC' },
                  { label: 'Meditation', emoji: '🧘', color: '#D1C4E9' },
                  { label: 'Shopping', emoji: '🛍️', color: '#F8BBD0' },
                ].map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tagChip, { backgroundColor: tag.color }]}
                  >
                    <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                    <Text style={styles.tagLabel}>{tag.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Intimacy Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon name="heart" size={20} color="#EC4899" />
                <Text style={styles.sectionTitle}>Intimacy</Text>
              </View>
              <View style={styles.intimacyGrid}>
                {[
                  { label: 'Protected', emoji: '🛡️', color: '#C8E6C9' },
                  { label: 'Unprotected', emoji: '⚠️', color: '#FFCDD2' },
                  { label: 'None', emoji: '🚫', color: '#EEEEEE' },
                ].map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.intimacyCard,
                      { backgroundColor: option.color },
                    ]}
                  >
                    <Text style={styles.intimacyEmoji}>{option.emoji}</Text>
                    <Text style={styles.intimacyLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon
                  name="book"
                  size={20}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Notes</Text>
              </View>
              <TouchableOpacity
                style={styles.notesCard}
                onPress={() => {
                  setShowDiaryModal(true);
                }}
              >
                <FontelloIcon name="plus-circled" size={24} color="#999" />
                <Text style={styles.notesPlaceholder}>
                  Add notes about your day...
                </Text>
              </TouchableOpacity>
              <DiaryModal
                visible={showDiaryModal}
                onClose={() => setShowDiaryModal(false)}
                initialDate={new Date()}
                initialText={diaryText}
                onSave={(date, text) => {
                  // Handle save logic here
                  handleDiarySave(date, text);
                }}
                onDateChange={date => {
                  loadDiary(date);
                }}
              />
            </View>
          </>
        ) : (
          <>
            {/* Ratings Tab Content */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon name="star" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Rate Your Day</Text>
              </View>
              <Text style={styles.ratingsSubtitle}>
                Help us understand your wellness by rating different aspects
              </Text>
            </View>

            {[
              {
                heading: 'Body & Mind',
                items: [
                  { id: 'stress', title: 'Stress', emoji: '😫' },
                  { id: 'sleep', title: 'Sleep', emoji: '😴' },
                  { id: 'exercise', title: 'Exercise', emoji: '💪' },
                ],
              },
              {
                heading: 'Emotions',
                items: [
                  { id: 'overallMood', title: 'Overall Mood', emoji: '😊' },
                  { id: 'anxiety', title: 'Anxiety', emoji: '😰' },
                  { id: 'focus', title: 'Focus', emoji: '🎯' },
                ],
              },
            ].map((section, idx) => (
              <View key={idx} style={styles.ratingSection}>
                <Text style={styles.ratingSectionHeading}>
                  {section.heading}
                </Text>
                <View style={styles.ratingItems}>
                  {section.items.map(item => (
                    <View key={item.id} style={styles.ratingItemContainer}>
                      <View style={styles.ratingItem}>
                        <Text style={styles.ratingItemEmoji}>{item.emoji}</Text>
                        <Text style={styles.ratingItemTitle}>{item.title}</Text>
                      </View>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => setItemRating(item.id, star)}
                          >
                            <FontelloIcon
                              name={
                                star <= (itemRatings[item.id] || 0)
                                  ? 'star'
                                  : 'star-empty'
                              }
                              size={24}
                              color={
                                star <= (itemRatings[item.id] || 0)
                                  ? '#FFD700'
                                  : '#d7d5cc'
                              }
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Entry</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  calendarHeader: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  todayBtn: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    zIndex: 1,
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E6FF',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodCard: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  moodCardSelected: {
    borderWidth: 3,
    borderColor: THEME_COLORS.primary,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  symptomChipSelected: {
    borderWidth: 2,
    borderColor: '#333',
  },
  symptomText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  flowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  flowCard: {
    width: '30%',
    aspectRatio: 1.2,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  flowCardSelected: {
    borderWidth: 3,
    borderColor: THEME_COLORS.primary,
  },
  flowEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  flowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  flowCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagEmoji: {
    fontSize: 16,
  },
  tagLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  intimacyGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  intimacyCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  intimacyEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  intimacyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  notesPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  saveBtn: {
    backgroundColor: THEME_COLORS.primary,
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bottomPadding: {
    height: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#fff',
  },
  ratingsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
    marginTop: -8,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // for Android shadow
  },
  ratingSectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  ratingItems: {
    justifyContent: 'space-around',
  },
  ratingItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  ratingItemTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ratingItemEmoji: {
    fontSize: 28,
  },
  ratingStars: {
    flexDirection: 'row',
    marginLeft: 10,
    gap: 6,
  },
  ratingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
});
