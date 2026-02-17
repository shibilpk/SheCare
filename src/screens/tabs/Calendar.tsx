import React, { useCallback, useState, useEffect } from 'react';
import {
  FlatList,
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../constants/colors';
import FontelloIcon from '../../services/FontelloIcons';
import { CalendarWidget, DateRange } from '../../components/widgets/Calender';
import ModalTopIcon from '../../components/common/ModalTopIcon';
import { ScrollView } from 'react-native-gesture-handler';
import { monthNames } from '../../constants/common';
import DiaryModal from '../common/diary/DiaryModal';
import { useDailyEntry } from '@src/hooks/useDailyEntry';
import { useErrorToast } from '@src/utils/toastMessage';

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

const CalendarScreen: React.FC = () => {
  const [view, setView] = useState<'month' | 'year'>('month');
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // Removed full screen activity animation logic
  const insets = useSafeAreaInsets();

  // Daily entry hook
  const { dailySummary, isLoading, error, fetchDailyDetailed } = useDailyEntry();

  // Auto show errors as toast
  useErrorToast(error);

  // Fetch daily entry when current date changes
  useEffect(() => {
    const loadDailyEntry = async () => {
      try {
        const entry = await fetchDailyDetailed(currentDate);
        console.log('📅 Daily Summary for', currentDate.toISOString().split('T')[0], ':', entry);

        if (entry) {
          console.log('  - Summary Cards:', entry.summary_cards);
          console.log('  - Created:', entry.created_at);
        } else {
          console.log('  - No entry found for this date');
        }
      } catch (err) {
        console.info('Error loading daily entry:', err);
      }
    };

    loadDailyEntry();
  }, [currentDate, fetchDailyDetailed]);

  // Calendar marking toggles
  const [markingToggles, setMarkingToggles] = useState({
    ovulation: true,
    fertile: true,
    period: true,
    futurePeriod: true,
    pregnant: true,
    medication: true,
    love: true,
    diary: true,
  });

  const toggleMarking = (key: keyof typeof markingToggles) => {
    setMarkingToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDayPress = useCallback((value: Date | DateRange) => {
    if (value instanceof Date) {
      setCurrentDate(value);
    }
  }, []);

  const getMarkedIcon = useCallback((type: string) => {
    switch (type) {
      case 'ovulation':
        return <FontelloIcon name="cog" color="orange" size={12} />;
      case 'fertile':
        return <FontelloIcon name="star" color="purple" size={12} />;
      case 'period':
        return <FontelloIcon name="droplet" color="blue" size={12} />;
      case 'future-period':
        return <FontelloIcon name="droplet" color="#888" size={12} />;
      case 'pregnant':
        return <FontelloIcon name="emo-laugh" color="green" size={12} />;
      case 'medication':
        return <FontelloIcon name="med-kit" color="#b5651d" size={12} />;
      case 'love':
        return <FontelloIcon name="heart" color="red" size={12} />;
      case 'diary':
        return <FontelloIcon name="book" color="#555" size={12} />;

      default:
        return null;
    }
  }, []);

  const handleYearChange = (offset: number) => {
    setSelectedYear(selectedYear + offset);
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
      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={[styles.settingsModalContent, { paddingTop: insets.top }]}>
          <View style={styles.settingsModalHeader}>
            <Text style={styles.settingsModalTitle}>Calendar Settings</Text>
            <ModalTopIcon
              onPress={() => setShowSettingsModal(false)}
              iconName="cancel"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.settingsModalSubtitle}>Show Markers</Text>

            {[
              {
                key: 'ovulation',
                label: 'Ovulation',
                icon: 'cog',
                color: 'orange',
              },
              {
                key: 'fertile',
                label: 'Fertile Window',
                icon: 'star',
                color: 'purple',
              },
              {
                key: 'period',
                label: 'Period',
                icon: 'droplet',
                color: 'blue',
              },
              {
                key: 'futurePeriod',
                label: 'Future Period',
                icon: 'droplet',
                color: '#888',
              },
              {
                key: 'pregnant',
                label: 'Pregnancy',
                icon: 'emo-laugh',
                color: 'green',
              },
              {
                key: 'medication',
                label: 'Medication',
                icon: 'med-kit',
                color: '#b5651d',
              },
              { key: 'love', label: 'Intimacy', icon: 'heart', color: 'red' },
              {
                key: 'diary',
                label: 'Diary Entry',
                icon: 'book',
                color: '#555',
              },
            ].map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.settingsToggleRow}
                onPress={() =>
                  toggleMarking(item.key as keyof typeof markingToggles)
                }
              >
                <View style={styles.settingsToggleLeft}>
                  <View
                    style={[
                      styles.settingsToggleIcon,
                      { backgroundColor: item.color + '20' },
                    ]}
                  >
                    <FontelloIcon
                      name={item.icon}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.settingsToggleLabel}>{item.label}</Text>
                </View>
                <View
                  style={[
                    styles.settingsToggleSwitch,
                    markingToggles[item.key as keyof typeof markingToggles] &&
                      styles.settingsToggleSwitchActive,
                  ]}
                >
                  <View
                    style={[
                      styles.settingsToggleThumb,
                      markingToggles[item.key as keyof typeof markingToggles] &&
                        styles.settingsToggleThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setShowSettingsModal(true)}
        >
          <FontelloIcon name="cog-b" size={24} color={THEME_COLORS.text} />
        </TouchableOpacity>

        <View style={styles.viewSwitcher}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.switchBtn,
              view === 'month' && styles.switchBtnActive,
            ]}
            onPress={() => setView('month')}
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
            onPress={() => setView('year')}
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
          <FontelloIcon name="calendar-o" size={28} color={THEME_COLORS.text} />
        </TouchableOpacity>
      </View>

      {view === 'month' ? (
        <>
          <ScrollView
            style={{
              flex: 1,
            }}
            overScrollMode="always"
          >
            <View style={{ flex: 1 }}>
              {/* Calendar Widget */}
              <View style={styles.calendarContainer}>
                <CalendarWidget
                  scrollable
                  selectionMode="single"
                  showMonthNavigation={true}
                  markedDates={[
                    ...(markingToggles.ovulation
                      ? [
                          {
                            date: new Date('2025-12-05'),
                            icon: getMarkedIcon('ovulation'),
                          },
                        ]
                      : []),
                    ...(markingToggles.love
                      ? [
                          {
                            date: new Date('2025-12-04'),
                            icon: getMarkedIcon('love'),
                          },
                        ]
                      : []),
                    ...(markingToggles.period
                      ? [
                          {
                            date: new Date('2025-12-06'),
                            icon: getMarkedIcon('period'),
                          },
                        ]
                      : []),
                    ...(markingToggles.futurePeriod
                      ? [
                          {
                            date: new Date('2025-12-07'),
                            icon: getMarkedIcon('future-period'),
                          },
                        ]
                      : []),
                    ...(markingToggles.fertile
                      ? [
                          {
                            date: new Date('2025-12-08'),
                            icon: getMarkedIcon('fertile'),
                          },
                        ]
                      : []),
                    ...(markingToggles.medication
                      ? [
                          {
                            date: new Date('2025-12-09'),
                            icon: getMarkedIcon('medication'),
                          },
                        ]
                      : []),
                    ...(markingToggles.diary
                      ? [
                          {
                            date: new Date('2025-12-10'),
                            icon: getMarkedIcon('diary'),
                          },
                        ]
                      : []),
                    ...(markingToggles.pregnant
                      ? [
                          {
                            date: new Date('2025-12-11'),
                            icon: getMarkedIcon('pregnant'),
                          },
                          {
                            date: new Date('2025-12-13'),
                            icon: getMarkedIcon('pregnant'),
                            backgroundColor: 'red',
                            textColor: 'white',
                          },
                        ]
                      : []),
                    {
                      date: new Date('2025-12-12'),
                      // Example: mark with background and text color only (no icon)
                      backgroundColor: 'red',
                      textColor: 'white',
                    },
                  ]}
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
                        Fertility window tracking
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pregnancyPercent}>50%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '50%' }]} />
                  </View>
                </View>
                {/* Removed expand/collapse button and icon */}
                <View>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Summary</Text>
                    <TouchableOpacity
                      onPress={() => setShowDiaryModal(true)}
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
                            <Text style={styles.activityEmoji}>{card.icon}</Text>
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
                            <Text style={styles.activityValue}>{card.value}</Text>
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
                      <Text style={styles.emptyStateText}>No data for this date</Text>
                      <Text style={styles.emptyStateSubtext}>Tap + to add activities</Text>
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
            initialDate={currentDate}
            onSave={(date, text) => {
              // Handle save logic here
              console.log('Diary saved:', { date, text });
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
  settingsModalContent: {
    backgroundColor: THEME_COLORS.textLight,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '100%',
    height: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderRadius: 0,
  },
  settingsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingsModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  settingsModalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 16,
    marginTop: 8,
  },
  settingsToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsToggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsToggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  settingsToggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  settingsToggleSwitchActive: {
    backgroundColor: THEME_COLORS.primary,
  },
  settingsToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsToggleThumbActive: {
    alignSelf: 'flex-end',
  },
});

export default CalendarScreen;
