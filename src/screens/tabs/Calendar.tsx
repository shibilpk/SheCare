import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../constants/navigation';
import { STYLE } from '../../constants/app';
import {
  useCalendarMarkers,
  type CalendarMarkers,
} from '@src/hooks/useCalendarMarkers';
import FontelloIcon from '../../services/FontelloIcons';
import { CalendarWidget, DateRange } from '../../components/widgets/Calender';
import { ScrollView } from 'react-native-gesture-handler';
import { monthNames } from '../../constants/common';
import DiaryModal from '../common/diary/DiaryModal';
import { useDailyEntry } from '@src/hooks/useDailyEntry';
import { useErrorToast, useToastMessage } from '@src/utils/toastMessage';
import { useDiary } from '@src/hooks/useDiary';
import { APIError } from '@src/services/ApiClient';
import { log } from 'node_modules/react-native-bootsplash/dist/typescript/module/extras/utils';
import CalendarDateContext from '@src/services/CalendarDateContext';

// Memoized MonthCard component for better performance in year view
const MonthCard = React.memo<{
  monthIdx: number;
  selectedYear: number;
  isEven: boolean;
  onDayPress: (date: Date | DateRange) => void;
}>(({ monthIdx, selectedYear, isEven, onDayPress }) => {
  return (
    <View style={[styles.monthCard, isEven && styles.monthCardAlt]}>
      <Text style={styles.monthCardTitle}>{monthNames[monthIdx]}</Text>
      <CalendarWidget
        initialDate={new Date(selectedYear, monthIdx, 1)}
        onDayPress={onDayPress}
        calendarStyle={{
          dayText: { fontSize: 10 },
          cell: { paddingVertical: 2, paddingHorizontal: 2 },
        }}
        hideWeekDays
      />
    </View>
  );
});

// `type` is the key returned by the calendar-markers API
const MARKERS: {
  key: string;
  type: keyof CalendarMarkers;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: 'period', type: 'period', label: 'Period', icon: 'droplet', color: '#e51e1e' },
  { key: 'futurePeriod', type: 'future_period', label: 'Future Period', icon: 'droplet', color: '#888888' },
  { key: 'ovulation', type: 'ovulation', label: 'Ovulation', icon: 'snowflake-o', color: '#FB8C00' },
  { key: 'fertile', type: 'fertile', label: 'Fertile Window', icon: 'cog', color: '#8E24AA' },
  { key: 'pregnant', type: 'pregnant', label: 'Pregnancy', icon: 'emo-laugh', color: '#43A047' },
  { key: 'medication', type: 'medication', label: 'Medication', icon: 'med-kit', color: '#b5651d' },
  { key: 'love', type: 'love', label: 'Intimacy', icon: 'heart', color: '#ef43e6' },
  { key: 'diary', type: 'diary', label: 'Diary Entry', icon: 'book', color: '#555555' },
];

const CalendarScreen: React.FC = () => {
  const [view, setView] = useState<'month' | 'year'>('month');
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [diaryText, setDiaryText] = useState('');
  const [diaryDate, setDiaryDate] = useState<Date>(today);
  const [isYearViewLoading, setIsYearViewLoading] = useState(false);
  // Removed full screen activity animation logic
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  // Get global calendar date context
  const calendarDateContext = useContext(CalendarDateContext);

  // Sync currentDate with global context
  useEffect(() => {
    calendarDateContext.setSelectedDate(currentDate);
  }, [currentDate, calendarDateContext]);

  // Daily entry hook
  const { dailySummary, isLoading, error, fetchDailyDetailed } =
    useDailyEntry();

  const { saveEntry: saveDiaryNote, fetchEntry: fetchDiaryEntry } = useDiary();

  const { showToast } = useToastMessage();

  // Pregnancy chance for the selected date comes with the daily summary
  const pregnancyChance = dailySummary?.pregnancy_chance ?? null;
  const isLoadingPregnancy = isLoading;
  const pregnancyLevel = pregnancyChance?.level ?? 'low';
  const pregnancyChanceLabel =
    pregnancyLevel.charAt(0).toUpperCase() + pregnancyLevel.slice(1);
  let pregnancySubtitle = `${pregnancyChanceLabel} chance - Fertility tracking`;
  if (pregnancyChance?.is_ovulation_day) {
    pregnancySubtitle = `${pregnancyChanceLabel} chance - Ovulation day`;
  } else if (pregnancyChance?.is_fertile_window) {
    pregnancySubtitle = `${pregnancyChanceLabel} chance - Fertile window`;
  }

  // Auto show errors as toast
  useErrorToast(error);

  // Fetch daily entry when current date changes
  useEffect(() => {
    console.log('Fetching daily entry for date:', currentDate);
    const loadDailyEntry = async () => {
      try {
        const entry = await fetchDailyDetailed(currentDate);

        if (entry) {
        } else {
        }
      } catch (err) {
        console.info('Error loading daily entry:', err);
      }
    };

    loadDailyEntry();
  }, [currentDate, fetchDailyDetailed]);

  async function loadDiary(date: Date) {
    try {
      const entry = await fetchDiaryEntry(date);
      setDiaryDate(date);
      setDiaryText(entry?.content ?? '');
      setShowDiaryModal(true);
    } catch (err) {
      console.info('Failed to fetch diary entry', err);
      setDiaryText('');
    }
  }

  const handleDiarySave = useCallback(
    async (date: Date, text: string) => {
      try {
        const message = await saveDiaryNote(date, text);
        showToast(message);
        setShowDiaryModal(false);
      } catch (err) {
        const apiError = err as APIError;

        if (apiError.statusCode === 422 && apiError.data) {
        } else {
          Alert.alert(
            apiError.normalizedError.title,
            apiError.normalizedError.message,
          );
        }
      }
    },
    [saveDiaryNote, showToast],
  );

  const handleDayPress = useCallback((value: Date | DateRange) => {
    if (value instanceof Date) {
      setCurrentDate(value);
    }
  }, []);

  // Dates to mark on the calendar, fetched for the visible months
  const calendarMarkers = useCalendarMarkers(currentDate);

  const markedDates = useMemo(
    () =>
      MARKERS.flatMap(marker =>
        calendarMarkers[marker.type].map(date => ({
          date,
          icon: (
            <FontelloIcon
              name={marker.icon}
              color={marker.color}
              size={12}
            />
          ),
        })),
      ),
    [calendarMarkers],
  );

  const handleYearChange = (offset: number) => {
    setIsYearViewLoading(true);
    setSelectedYear(selectedYear + offset);
    setTimeout(() => {
      setIsYearViewLoading(false);
    }, 300);
  };

  // Handle view switching with loading state
  const handleViewSwitch = (newView: 'month' | 'year') => {
    if (newView === 'year' && view !== 'year') {
      setIsYearViewLoading(true);
      setView(newView);
      setTimeout(() => {
        setIsYearViewLoading(false);
      }, 300);
    } else {
      setView(newView);
    }
  };

  // Memoized callback for month day press in year view
  const handleMonthDayPress = useCallback(
    (date: Date | DateRange) => {
      handleDayPress(date);
      setView('month');
    },
    [handleDayPress],
  );

  // Get summary cards from API
  const summaryCards = dailySummary?.summary_cards || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.openDrawer()}
        >
          <FontelloIcon name="cog-1" size={24} color={THEME_COLORS.text} />
        </TouchableOpacity>

        <View style={styles.viewSwitcher}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.switchBtn,
              view === 'month' && styles.switchBtnActive,
            ]}
            onPress={() => handleViewSwitch('month')}
          >
            <Text
              style={
                view === 'month' ? styles.switchTextActive : styles.switchText
              }
            >
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.switchBtn,
              view === 'year' && styles.switchBtnActive,
            ]}
            onPress={() => handleViewSwitch('year')}
          >
            <Text
              style={
                view === 'year' ? styles.switchTextActive : styles.switchText
              }
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            view === 'month'
              ? setCurrentDate(today)
              : setSelectedYear(today.getFullYear());
          }}
          style={styles.todayBtn}
        >
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>{today.getDate()}</Text>
          </View>
          <FontelloIcon name="calendar-1" size={28} color={THEME_COLORS.text} />
        </TouchableOpacity>
      </View>

      {view === 'month' ? (
        <>
          <ScrollView
            style={{
              flex: 1,
            }}
            overScrollMode="always"
            contentContainerStyle={STYLE.scrollContent}
          >
            <View style={{ flex: 1 }}>
              {/* Calendar Widget */}
              <View style={styles.calendarContainer}>
                <CalendarWidget
                  scrollable
                  selectionMode="single"
                  showMonthNavigation={true}
                  markedDates={markedDates}
                  initialDate={currentDate}
                  selectedDate={currentDate}
                  onDayPress={handleDayPress}
                  calendarStyle={{
                    dayText: { fontSize: 16 },
                    monthWrapper: {
                      // backgroundColor: 'red',
                    },
                  }}
                  onMonthChange={date => setCurrentDate(date)}
                />
              </View>
              {/* Pregnancy Chance Card */}
              <View style={styles.pregnancyCard}>
                <View style={styles.pregnancyHeader}>
                  <View style={styles.pregnancyTitleRow}>
                    <View style={styles.pregnancyIconBox}>
                      <FontelloIcon name="heart" size={20} color="#fff" />
                    </View>
                    <View style={styles.pregnancyTextContainer}>
                      <Text style={styles.pregnancyTitle}>
                        Pregnancy Chance
                      </Text>
                      <Text style={styles.pregnancySubtitle}>
                        {isLoadingPregnancy
                          ? 'Loading...'
                          : pregnancySubtitle
                        }
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pregnancyPercent}>
                    {isLoadingPregnancy ? '...' : `${pregnancyChance?.percentage || 0}%`}
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${pregnancyChance?.percentage || 0}%` }]} />
                  </View>
                </View>
                {/* Removed expand/collapse button and icon */}
                <View>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Summary</Text>
                    <TouchableOpacity
                      onPress={() => loadDiary(diaryDate)}
                      style={styles.activitiesAddBtn}
                    >
                      <FontelloIcon
                        name="plus"
                        size={24}
                        color={THEME_COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Summary List */}
                  {summaryCards.length > 0 ? (
                    summaryCards.map(card => (
                      <View key={card.id} style={styles.activityItem}>
                        <View style={styles.activityIconCircle}>
                          {card.icon.length === 1 || card.icon.length === 2 ? (
                            <Text style={styles.activityEmoji}>
                              {card.icon}
                            </Text>
                          ) : (
                            <FontelloIcon
                              name={card.icon}
                              size={18}
                              color={THEME_COLORS.primary}
                            />
                          )}
                        </View>
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityTitle}>{card.title}</Text>
                          {card.value && (
                            <Text style={styles.activityValue}>
                              {card.value}
                            </Text>
                          )}
                          {card.rating && (
                            <View style={styles.activityRatingStars}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <FontelloIcon
                                  key={star}
                                  name={
                                    star <= Math.round(card.rating!)
                                      ? 'star'
                                      : 'star-empty'
                                  }
                                  size={14}
                                  color={
                                    star <= Math.round(card.rating!)
                                      ? '#FFD700'
                                      : '#d7d5cc'
                                  }
                                />
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>
                        No data for this date
                      </Text>
                      <Text style={styles.emptyStateSubtext}>
                        Tap + to add activities
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
          {/* Diary Modal */}
          <DiaryModal
            visible={showDiaryModal}
            onClose={() => setShowDiaryModal(false)}
            initialDate={diaryDate}
            initialText={diaryText}
            onSave={(date: Date, text: string) => {
              handleDiarySave(date, text);
            }}
            onDateChange={(date: Date) => {
              loadDiary(date);
              console.log('Date', date);
            }}
          />
        </>
      ) : (
        <>
          {/* Year View */}
          <View style={styles.yearHeader}>
            <TouchableOpacity
              onPress={() => handleYearChange(-1)}
              style={styles.yearNavBtn}
              activeOpacity={0.7}
            >
              <View style={styles.yearNavBtnInner}>
                <FontelloIcon name="left-open-mini" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.yearTitleContainer}>
              <Text style={styles.yearTitle}>{selectedYear}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleYearChange(1)}
              style={styles.yearNavBtn}
              activeOpacity={0.7}
            >
              <View style={styles.yearNavBtnInner}>
                <FontelloIcon name="right-open-mini" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {isYearViewLoading ? (
            <View style={styles.yearLoadingContainer}>
              <ActivityIndicator size="large" color={THEME_COLORS.primary} />
              <Text style={styles.yearLoadingText}>Loading calendar...</Text>
            </View>
          ) : (
            <FlatList
              data={Array.from({ length: 12 })}
              keyExtractor={(_, idx) => `${selectedYear}-${idx}`}
              numColumns={2}
              contentContainerStyle={styles.yearGrid}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews={true}
              getItemLayout={(_, index) => ({
                length: 200,
                offset: 200 * Math.floor(index / 2),
                index,
              })}
              renderItem={({ index: monthIdx }) => {
                const row = Math.floor(monthIdx / 2);
                const col = monthIdx % 2;
                const isEven =
                  (row % 2 === 0 && col === 0) || (row % 2 === 1 && col === 1);

                return (
                  <MonthCard
                    monthIdx={monthIdx}
                    selectedYear={selectedYear}
                    isEven={isEven}
                    onDayPress={handleMonthDayPress}
                  />
                );
              }}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsBtn: {
    padding: 4,
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    padding: 4,
  },
  switchBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  switchBtnActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  switchTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  todayBtn: {
    position: 'relative',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBadge: {
    position: 'absolute',
    top: 13,
    zIndex: 1,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME_COLORS.text,
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
    overflow: 'hidden',
  },
  pregnancyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pregnancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pregnancyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pregnancyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pregnancyTextContainer: {
    flex: 1,
  },
  pregnancyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  pregnancySubtitle: {
    fontSize: 12,
    color: '#999',
  },
  pregnancyPercent: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME_COLORS.primary,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 5,
  },
  activitiesAddBtn: {
    paddingHorizontal: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME_COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  activityValue: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  activityRatingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 4,
  },
  activityEmoji: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 12,
    marginHorizontal: 16,
  },
  yearNavBtn: {
    padding: 2,
  },
  yearNavBtnInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  yearTitleContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    marginHorizontal: 10,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.primary,
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.primary,
    letterSpacing: 0.5,
  },
  yearLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  yearLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  yearGrid: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  monthCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthCardAlt: {
    backgroundColor: '#f8f9fa',
  },
  monthCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default CalendarScreen;
