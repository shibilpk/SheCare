import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarWidget, DateRange } from '../../components/widgets/Calender';
import { HOME_CARD_PASTEL, THEME_COLORS } from '../../constants/colors';
import FontelloIcon from '../../utils/FontelloIcons';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import LinearGradient from 'react-native-linear-gradient';
const PeriodSelector: React.FC = () => {
  const navigation = useNavigation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [range, setRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [pickerType, setPickerType] = useState<'start' | 'end' | null>(null);

  // Use useCallback to prevent recreation on every render
  const handleDayPress = useCallback((value: Date | DateRange) => {
    if (typeof value === 'object' && 'startDate' in value) {
      setRange(value);
    }
  }, []);

  const calculateDuration = () => {
    if (!range.startDate || !range.endDate) return 0;
    const diffTime = Math.abs(
      range.endDate.getTime() - range.startDate.getTime(),
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '--';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleConfirm = () => {
    if (!range.startDate || !range.endDate) {
      Alert.alert(
        'Incomplete Selection',
        'Please select both start and end dates',
      );
      return;
    }

    Alert.alert(
      'Period Selected',
      `Start: ${formatDate(range.startDate)}\nEnd: ${formatDate(
        range.endDate,
      )}\nDuration: ${calculateDuration()} days`,
      [{ text: 'OK', onPress: () => console.log('Period confirmed', range) }],
    );
  };

  const handleClear = () => {
    setRange({ startDate: null, endDate: null });
  };

  const isComplete = range.startDate && range.endDate;
  const duration = calculateDuration();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Period</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selection Status Cards */}
        <View style={styles.statusSection}>
          <View style={styles.dateCardsRow}>
            <View style={styles.dateCardBlock}>
              <TouchableOpacity
                onPress={() => setPickerType('start')}
                activeOpacity={0.85}
                style={styles.dateCardTouchable}
              >
                <LinearGradient
                  colors={['#11998e', '#38ef7d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusGradient}
                >
                  <View style={styles.statusCardOverlay}>
                    <View style={styles.statusCard}>
                      <View style={styles.statusInfoRowBelow}>
                        <FontelloIcon
                          name="play"
                          size={18}
                          color={THEME_COLORS.text}
                          style={styles.statusIconInline}
                        />
                        <Text style={styles.statusLabelOverlay}>Start</Text>
                      </View>
                      <Text
                        style={[styles.statusValueOverlay]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {formatDate(range.startDate)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.dateCardBlock}>
              <TouchableOpacity
                onPress={() => setPickerType('end')}
                activeOpacity={0.85}
                style={styles.dateCardTouchable}
              >
                <LinearGradient
                  colors={['#fc4a1a', '#f7b733']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusGradient}
                >
                  <View style={styles.statusCardOverlay}>
                    <View style={styles.statusCard}>
                      <View style={styles.statusInfoRowBelow}>
                        <FontelloIcon
                          name="stop"
                          size={18}
                          color={THEME_COLORS.text}
                          style={styles.statusIconInline}
                        />
                        <Text style={styles.statusLabelOverlay}>End</Text>
                      </View>
                      <Text
                        style={[styles.statusValueOverlay]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {formatDate(range.endDate)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Duration Card as third card */}
          <View>
            <LinearGradient
              colors={[HOME_CARD_PASTEL.coral, HOME_CARD_PASTEL.peach]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.statusGradient]}
            >
              <View style={styles.statusCardOverlay}>
                <View style={[styles.statusCard]}>
                  <View style={styles.statusInfoRowBelow}>
                    <FontelloIcon
                      name="clock"
                      size={18}
                      color={THEME_COLORS.text}
                      style={styles.statusIconInline}
                    />
                    <Text style={styles.statusLabelOverlay}>Days</Text>
                  </View>
                  <Text
                    style={styles.statusValueOverlay}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {range.startDate && range.endDate ? `${duration}` : '--'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
        {/* Date Picker Modal for Start/End Date */}
        <DateTimePickerModal
          isVisible={pickerType !== null}
          mode="date"
          date={
            pickerType === 'start'
              ? range.startDate || new Date()
              : range.endDate || new Date()
          }
          onConfirm={date => {
            if (pickerType === 'start') {
              setRange(r => ({ ...r, startDate: date }));
            } else if (pickerType === 'end') {
              setRange(r => ({ ...r, endDate: date }));
            }
            setPickerType(null);
          }}
          onCancel={() => setPickerType(null)}
        />

        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={() => {
              const newMonth = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1,
              );
              setCurrentMonth(newMonth);
            }}
            style={styles.navBtn}
          >
            <FontelloIcon
              name="left-open-mini"
              size={24}
              color={THEME_COLORS.primary}
            />
          </TouchableOpacity>
          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long' })}
            </Text>
            <Text style={styles.yearSubtitle}>
              {currentMonth.getFullYear()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const newMonth = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1,
              );
              setCurrentMonth(newMonth);
            }}
            style={styles.navBtn}
          >
            <FontelloIcon
              name="right-open-mini"
              size={24}
              color={THEME_COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <CalendarWidget
            selectionMode="range"
            outsideMonthVisible
            scrollable
            selectedRange={range}
            onDayPress={handleDayPress}
            initialDate={currentMonth}
            calendarStyle={{ dayText: { fontSize: 16 } }}
          />
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, !isComplete && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!isComplete}
          activeOpacity={0.8}
        >
          <FontelloIcon
            name="check"
            size={20}
            color={isComplete ? '#fff' : '#999'}
          />
          <Text
            style={[
              styles.confirmText,
              !isComplete && styles.confirmTextDisabled,
            ]}
          >
            Confirm Period
          </Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <FontelloIcon
              name="info-circled"
              size={20}
              color={THEME_COLORS.primary}
            />
          </View>
          <Text style={styles.infoText}>
            Select your period start date first, then choose the end date to
            complete your selection.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dateCardsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 0,
  },
  dateCardBlock: {
    flex: 1.15,
    marginRight: 8,
  },
  dateCardTouchable: {
    flex: 1,
  },
  statusIconInline: {
    marginRight: 4,
  },
  statusCardOverlay: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  statusLabelOverlay: {
    fontSize: 11, // slightly smaller
    color: THEME_COLORS.text,
    marginBottom: 2, // less space
    fontWeight: '700',

    letterSpacing: 0.5,
  },
  statusValueOverlay: {
    fontSize: 13, // slightly smaller
    fontWeight: '700',
    color: THEME_COLORS.text,

    letterSpacing: 0.2,
    marginTop: 1, // less space
  },
  statusInfoRowBelow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
  },

  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statusSection: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 12,
    gap: 0, // keep gap 0, use marginRight for date card spacing
  },
  statusGradient: {
    flex: 1,
    borderRadius: 10,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
    backgroundColor: '#fff',
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  monthTitleContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  yearSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmBtnDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmTextDisabled: {
    color: '#999',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${THEME_COLORS.primary}08`,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: THEME_COLORS.primary,
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
    fontWeight: '500',
  },
});

export default PeriodSelector;
