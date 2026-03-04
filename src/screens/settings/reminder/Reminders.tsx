import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../../constants/colors';
import FontelloIcon from '../../../services/FontelloIcons';
import ModalTopIcon from '../../../components/common/ModalTopIcon';
import BackButton from '../../../components/widgets/BackButton';
import { STYLE } from '../../../constants/app';
import { useReminders, type Reminder } from './useReminders';
import { ScreenLoader } from '../../../components/common/ScreenLoader';
import { InfoCard } from '@src/components';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (reminder_type: string) => void;
  onEdit: (reminder: Reminder) => void;
  isUpdating: boolean;
}

const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggle,
  onEdit,
  isUpdating,
}) => (
  <TouchableOpacity
    style={styles.reminderCard}
    onLongPress={() => onEdit(reminder)}
  >
    <View style={styles.reminderLeft}>
      <View
        style={[styles.iconBox, { backgroundColor: reminder.color || '#666' }]}
      >
        <FontelloIcon
          name={reminder.icon || 'bell-alt'}
          size={20}
          color="#fff"
        />
      </View>
      <View style={styles.reminderInfo}>
        <Text style={styles.reminderTitle}>{reminder.title}</Text>
        <Text style={styles.reminderSubtitle}>
          {reminder.days_advance > 0 &&
            `${reminder.days_advance} day${
              reminder.days_advance === 1 ? '' : 's'
            } before • `}
          {reminder.time}
        </Text>
      </View>
    </View>
    <Switch
      value={reminder.enabled}
      onValueChange={() => onToggle(reminder.reminder_type)}
      trackColor={{
        false: '#ddd',
        true: reminder.color || THEME_COLORS.primary,
      }}
      thumbColor="#fff"
      disabled={isUpdating}
    />
  </TouchableOpacity>
);

const ReminderSettingsScreen: React.FC = () => {
  const {
    reminders,
    isLoading,
    updatingReminders,
    toggleReminder,
    updateReminder,
    reminderInfo
  } = useReminders();

  const insets = useSafeAreaInsets();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedDaysAdvance, setSelectedDaysAdvance] = useState(0);

  const handleToggleReminder = useCallback(
    async (reminder_type: string) => {
      try {
        await toggleReminder(reminder_type);
      } catch (err: any) {
        Alert.alert(
          'Error',
          err?.normalizedError?.message || 'Failed to update reminder',
        );
      }
    },
    [toggleReminder],
  );

  const openEditModal = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setSelectedDaysAdvance(reminder.days_advance);

    // Parse time
    if (reminder.time) {
      const [time, period] = reminder.time.split(' ');
      const [hours] = time.split(':');
      let hour = Number.parseInt(hours, 10);

      if (period === 'PM' && hour !== 12) {
        setSelectedHour(hour);
        setSelectedPeriod('PM');
      } else if (period === 'AM' && hour === 12) {
        setSelectedHour(12);
        setSelectedPeriod('AM');
      } else if (period === 'AM') {
        setSelectedHour(hour);
        setSelectedPeriod('AM');
      } else {
        setSelectedHour(hour === 12 ? 12 : hour);
        setSelectedPeriod('PM');
      }
    }

    setShowEditModal(true);
  }, []);

  const handleSaveReminder = async () => {
    if (!editingReminder) return;

    const timeString = `${selectedHour.toString().padStart(2, '0')}:00 ${selectedPeriod}`;

    try {
      await updateReminder(editingReminder.reminder_type, {
        time: timeString,
        days_advance: selectedDaysAdvance,
      });
      setShowEditModal(false);
      setEditingReminder(null);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.normalizedError?.message || 'Failed to update reminder',
      );
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysAdvanceOptions = Array.from({ length: 8 }, (_, i) => i);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Reminder Settings</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() =>
            Alert.alert(
              'Reminder Settings',
              'Tap hold any reminder to customize its time and days before notification.\n\nUse the toggle to enable/disable reminders.',
              [{ text: 'Got it' }],
            )
          }
        >
          <FontelloIcon name="cog" size={20} color={THEME_COLORS.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ScreenLoader message="Loading reminders..." />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <InfoCard
            title="Insights & Tips"
            emoji="💡"
            highlightColor={{
              bgColor: '#FFF3E0',
              borderColor: '#FF9800',
              bulletColor: '#FF9800',
              boldColor: '#333',
            }}
            insights={reminderInfo}
          />

          {/* Health Cycle Reminders */}
          <View style={styles.section}>
            {reminders.map(reminder => (
              <ReminderCard
                key={reminder.reminder_type}
                reminder={reminder}
                onToggle={handleToggleReminder}
                onEdit={openEditModal}
                isUpdating={updatingReminders.has(reminder.reminder_type)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Edit Reminder Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <ModalTopIcon
              iconName="cancel"
              onPress={() => {
                setShowEditModal(false);
                setEditingReminder(null);
              }}
            />
            <Text style={styles.modalTitle}>Edit Reminder</Text>
            <ModalTopIcon iconName="check" onPress={handleSaveReminder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {editingReminder && (
              <>
                {/* Reminder Info */}
                <View style={styles.reminderPreview}>
                  <View
                    style={[
                      styles.iconBoxLarge,
                      { backgroundColor: editingReminder.color || '#666' },
                    ]}
                  >
                    <FontelloIcon
                      name={editingReminder.icon || 'bell'}
                      size={32}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.reminderPreviewTitle}>
                    {editingReminder.title}
                  </Text>
                </View>

                {/* Days Advance Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Days Before Event</Text>
                  <View style={styles.daysGrid}>
                    {daysAdvanceOptions.map(days => {
                      let label: string;
                      if (days === 0) {
                        label = 'Same day';
                      } else if (days === 1) {
                        label = '1 day before';
                      } else {
                        label = `${days} days before`;
                      }

                      return (
                        <TouchableOpacity
                          key={days}
                          style={[
                            styles.dayButton,
                            selectedDaysAdvance === days &&
                              styles.dayButtonActive,
                          ]}
                          onPress={() => setSelectedDaysAdvance(days)}
                        >
                          <Text
                            style={[
                              styles.dayButtonText,
                              selectedDaysAdvance === days &&
                                styles.dayButtonTextActive,
                            ]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Time Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reminder Time</Text>

                  {/* Hour Selection */}
                  <Text style={styles.subLabel}>Hour</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourScroll}
                    contentContainerStyle={styles.hourScrollContent}
                  >
                    {hours.map(hour => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.hourButton,
                          selectedHour === hour && styles.hourButtonActive,
                        ]}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text
                          style={[
                            styles.hourButtonText,
                            selectedHour === hour &&
                              styles.hourButtonTextActive,
                          ]}
                        >
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* AM/PM Selection */}
                  <Text style={styles.subLabel}>Period</Text>
                  <View style={styles.periodRow}>
                    <TouchableOpacity
                      style={[
                        styles.periodButton,
                        selectedPeriod === 'AM' && styles.periodButtonActive,
                      ]}
                      onPress={() => setSelectedPeriod('AM')}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          selectedPeriod === 'AM' &&
                            styles.periodButtonTextActive,
                        ]}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.periodButton,
                        selectedPeriod === 'PM' && styles.periodButtonActive,
                      ]}
                      onPress={() => setSelectedPeriod('PM')}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          selectedPeriod === 'PM' &&
                            styles.periodButtonTextActive,
                        ]}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                  <FontelloIcon name="info-circled" size={20} color="#2196F3" />
                  <Text style={styles.infoText}>
                    You'll receive a notification at{' '}
                    {selectedHour.toString().padStart(2, '0')}:00{' '}
                    {selectedPeriod}
                    {selectedDaysAdvance > 0 &&
                      ` (${selectedDaysAdvance} day${
                        selectedDaysAdvance === 1 ? '' : 's'
                      } before the event)`}
                    .
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...STYLE.header,
    marginBottom: STYLE.spacing.mv * 2,
  },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    ...STYLE.scrollContent,
  },
  section: {
    marginTop: STYLE.spacing.mv,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: STYLE.spacing.mv,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  reminderPreview: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  iconBoxLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reminderPreviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  dayButtonActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  hourScroll: {
    maxHeight: 60,
  },
  hourScrollContent: {
    paddingVertical: 8,
    gap: 8,
  },
  hourButton: {
    width: 60,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  hourButtonActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  hourButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  hourButtonTextActive: {
    color: '#fff',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  periodButtonActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
});

export default ReminderSettingsScreen;
