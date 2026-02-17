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
import FontelloIcon from '../../services/FontelloIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import LinearGradient from 'react-native-linear-gradient';
import { STYLE } from '../../constants/app';
import { RootStackParamList, SCREENS } from '@src/constants/navigation';
import { APIS } from '@src/constants/apis';
import apiClient, { APIError } from '@src/services/ApiClient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePeriodActions } from '@src/hooks/usePeriodActions';

type ScreenRouteProp = RouteProp<
  RootStackParamList,
  typeof SCREENS.PERIOD_SELECTOR
>;
const PeriodSelector: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const {
    startDate = null,
    endDate = null,
    rangeDays = null,
    periodId = null,
  } = route.params || {};

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { startPeriod, endPeriod } = usePeriodActions();

  const [range, setRange] = useState<DateRange>({
    startDate: startDate,
    endDate: endDate,
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

    // Normalize dates to midnight to avoid time zone issues
    const start = new Date(range.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(range.endDate);
    end.setHours(0, 0, 0, 0);

    // Calculate difference in days (inclusive of both start and end dates)
    const diffTime = end.getTime() - start.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Ensure we return a positive number
    return Math.max(days, 0);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '--';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleConfirm = async () => {
    // Both start and end dates are required
    if (!range.startDate || !range.endDate) {
      Alert.alert(
        'Incomplete Selection',
        'Please select both start and end dates',
      );
      return;
    }

    // Validate that end date is not before start date
    if (range.startDate && range.endDate && range.endDate < range.startDate) {
      Alert.alert(
        'Invalid Date Range',
        'End date cannot be before start date',
      );
      return;
    }

    try {
      console.log(periodId,"periodId");

      if (periodId) {
        // Updating an existing period - send period_id, start_date and end_date
        const payload = {
          period_id: periodId,
          start_date: range.startDate!.toISOString().split('T')[0],
          end_date: range.endDate!.toISOString().split('T')[0],
        };
        await endPeriod(payload);
      } else {
        // Starting a new period - send both dates
        const payload = {
          start_date: range.startDate!.toISOString().split('T')[0],
          end_date: range.endDate!.toISOString().split('T')[0],
        };
        await startPeriod(payload);
      }
      navigation.navigate(SCREENS.LANDING);
    } catch (error) {
      const apiError = error as APIError;
      Alert.alert(
        apiError.normalizedError.title,
        apiError.normalizedError.message,
      );
      return;
    }
  };

  const handleClear = () => {
    // Clear both dates for both new and existing periods
    setRange({ startDate: null, endDate: null });
  };

  // Both new and updating periods need both dates
  const isComplete = !!(range.startDate && range.endDate);
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
        <Text style={styles.headerTitle}>
          {periodId ? 'Update Period' : 'Select Period'}
        </Text>
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

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <CalendarWidget
            selectionMode="range"
            showMonthNavigation
            scrollable
            selectedRange={range}
            onDayPress={handleDayPress}
            calendarStyle={{ dayText: { fontSize: 16 } }}
            rangeDays={rangeDays !== null ? rangeDays : undefined}
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
            {periodId
              ? 'Update your period dates by selecting both start and end dates.'
              : 'Select your period start date first, then choose the end date to complete your selection.'}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    ...STYLE.header,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...STYLE.headerTitle,
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
  calendarContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    marginHorizontal: STYLE.spacing.mh,
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
    marginHorizontal: STYLE.spacing.mh,
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
