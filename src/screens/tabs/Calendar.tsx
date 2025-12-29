import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FlatList,
  Modal,
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../constants/colors';
import FontelloIcon from '../../utils/FontelloIcons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CalendarWidget, DateRange } from '../../components/widgets/Calender';
import ModalTopIcon from '../../components/common/ModalTopIcon';
import { RootStackParamList } from '../../constants/navigation';
import { ScrollView } from 'react-native-gesture-handler';
import { monthNames } from '../../constants/common';

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
  const today = new Date();
  const [view, setView] = useState<'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // Removed full screen activity animation logic
  const [diaryText, setDiaryText] = useState('');
  const [diaryDate, setDiaryDate] = useState(today);
  const [showDiaryDatePicker, setShowDiaryDatePicker] = useState(false);
  const insets = useSafeAreaInsets();

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
      case 'dairy':
        return <FontelloIcon name="book" color="#555" size={12} />;

      default:
        return null;
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setShowDiaryModal(false);
    }, []),
  );

  const calendarRoute = useRoute<RouteProp<RootStackParamList, 'Calendar'>>();

  useEffect(() => {
    if (calendarRoute.params?.openDiaryModal) {
      setShowDiaryModal(true);
    }
  }, [calendarRoute.params]);

  useEffect(() => {
    setDiaryDate(currentDate);
  }, [currentDate]);

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

  const activityData = [
    {
      id: 1,
      icon: 'glass',
      title: 'Hydration',
      value: '8 cups',
      color: '#2196F3',
    },
    {
      id: 2,
      icon: 'heart',
      title: 'Exercise',
      value: '30 min',
      color: '#F44336',
    },
    {
      id: 3,
      icon: 'moon',
      title: 'Sleep',
      value: '7.5 hours',
      color: '#9C27B0',
    },
    {
      id: 4,
      icon: 'cutlery',
      title: 'Meals',
      value: '3 tracked',
      color: '#FF9800',
    },
    {
      id: 5,
      icon: 'thermometer',
      title: 'Temperature',
      value: '36.6°C',
      color: '#4CAF50',
    },
    {
      id: 6,
      icon: 'pill',
      title: 'Medications',
      rating: 3,
      color: '#795548',
    },
    {
      id: 7,
      icon: 'glass',
      title: 'Hydration',
      value: '8 cups',
      color: '#2196F3',
    },
    {
      id: 8,
      icon: 'heart',
      title: 'Exercise',
      value: '30 min',
      color: '#F44336',
    },
    {
      id: 9,
      icon: 'moon',
      title: 'Sleep',
      value: '7.5 hours',
      color: '#9C27B0',
    },
    {
      id: 10,
      icon: 'cutlery',
      title: 'Meals',
      value: '3 tracked',
      color: '#FF9800',
    },
    {
      id: 11,
      icon: 'thermometer',
      title: 'Temperature',
      value: '36.6°C',
      color: '#4CAF50',
    },
    {
      id: 12,
      icon: 'pill',
      title: 'Medications',
      rating: 3,
      color: '#795548',
    },
    {
      id: 13,
      icon: 'glass',
      title: 'Hydration',
      value: '8 cups',
      color: '#2196F3',
    },
    {
      id: 14,
      icon: 'heart',
      title: 'Exercise',
      value: '30 min',
      color: '#F44336',
    },
    {
      id: 15,
      icon: 'moon',
      title: 'Sleep',
      value: '7.5 hours',
      color: '#9C27B0',
    },
    {
      id: 16,
      icon: 'cutlery',
      title: 'Meals',
      value: '3 tracked',
      color: '#FF9800',
    },
    {
      id: 17,
      icon: 'thermometer',
      title: 'Temperature',
      value: '36.6°C',
      color: '#4CAF50',
    },
    {
      id: 18,
      icon: 'pill',
      title: 'Medications',
      rating: 3,
      color: '#795548',
    },
    {
      id: 19,
      icon: 'glass',
      title: 'Hydration',
      value: '8 cups',
      color: '#2196F3',
    },
    {
      id: 20,
      icon: 'heart',
      title: 'Exercise',
      value: '30 min',
      color: '#F44336',
    },
    {
      id: 21,
      icon: 'moon',
      title: 'Sleep',
      value: '7.5 hours',
      color: '#9C27B0',
    },
    {
      id: 22,
      icon: 'cutlery',
      title: 'Meals',
      value: '3 tracked',
      color: '#FF9800',
    },
    {
      id: 23,
      icon: 'thermometer',
      title: 'Temperature',
      value: '36.6°C',
      color: '#4CAF50',
    },
    {
      id: 24,
      icon: 'pill',
      title: 'Medications',
      rating: 3,
      color: '#795548',
    },
    {
      id: 25,
      icon: 'glass',
      title: 'Hydration',
      value: '8 cups',
      color: '#2196F3',
    },
    {
      id: 26,
      icon: 'heart',
      title: 'Exercise',
      value: '30 min',
      color: '#F44336',
    },
    {
      id: 27,
      icon: 'moon',
      title: 'Sleep',
      value: '7.5 hours',
      color: '#9C27B0',
    },
    {
      id: 28,
      icon: 'cutlery',
      title: 'Meals',
      value: '3 tracked',
      color: '#FF9800',
    },
    {
      id: 29,
      icon: 'thermometer',
      title: 'Temperature',
      value: '36.6°C',
      color: '#4CAF50',
    },
    {
      id: 30,
      icon: 'pill',
      title: 'Medications',
      rating: 3,
      color: '#795548',
    },
  ];

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
                            icon: getMarkedIcon('dairy'),
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
                <View style={styles.activitiesSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Activities</Text>
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

                  {activityData.map(activity => (
                    <View key={activity.id} style={styles.activityCard}>
                      <View style={styles.activityIconBox}>
                        <FontelloIcon
                          name={activity.icon}
                          size={15}
                          color={activity.color}
                        />
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle}>
                          {activity.title}
                        </Text>
                        {activity.value ? (
                          <Text style={styles.activityValue}>
                            {activity.value}
                          </Text>
                        ) : activity.rating ? (
                          <View style={styles.activityRatingStars}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <FontelloIcon
                                key={star}
                                name={
                                  star <= activity.rating
                                    ? 'star'
                                    : 'star-empty'
                                }
                                size={15}
                                color={
                                  star <= activity.rating
                                    ? '#FFD700'
                                    : '#d7d5cc'
                                }
                              />
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
          {/* Diary Modal */}
          <Modal
            visible={showDiaryModal}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setShowDiaryModal(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.modalContainer, { paddingTop: insets.top }]}
              keyboardVerticalOffset={24}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ModalTopIcon
                    iconName="cancel"
                    onPress={() => setShowDiaryModal(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowDiaryDatePicker(true)}
                  >
                    <Text style={styles.modalDate}>
                      {diaryDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={showDiaryDatePicker}
                    mode="date"
                    date={diaryDate}
                    onConfirm={date => {
                      setDiaryDate(date);
                      setShowDiaryDatePicker(false);
                    }}
                    onCancel={() => setShowDiaryDatePicker(false)}
                  />
                  <ModalTopIcon
                    iconName="check"
                    onPress={() => setShowDiaryModal(false)}
                  />
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>Daily Notes</Text>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      multiline
                      numberOfLines={8}
                      value={diaryText}
                      onChangeText={setDiaryText}
                      placeholder="Write your thoughts, feelings, or any notes..."
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
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
  activitiesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIconBox: {
    width: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  activityValue: {
    fontSize: 13,
    color: '#999',
  },
  activityRatingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.primary,
  },
  modalBody: {
    flex: 1,
    paddingTop: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
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
