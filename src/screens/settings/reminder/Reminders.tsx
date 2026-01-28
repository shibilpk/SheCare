import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { THEME_COLORS } from '../../../constants/colors';
import FontelloIcon from '../../../services/FontelloIcons';
import ModalTopIcon from '../../../components/common/ModalTopIcon';
import BackButton from '../../../components/widgets/BackButton';
import { STYLE } from '../../../constants/app';

type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ReminderType = 'repeat' | 'one-time' | 'repeat_from' | 'specific';
interface Reminder {
  id: string;
  title: string;
  icon: string;
  color: string;
  enabled: boolean;

  time?: string;

  type: ReminderType;
  frequency?: ReminderFrequency;
  specificDate?: Date;
  customMessage?: string;
}

const ReminderSettingsScreen: React.FC = () => {
  // Custom reminder form state (single object)
  const [customForm, setCustomForm] = useState({
    title: '',
    message: '',
    time: new Date(),
    frequency: 'daily' as ReminderFrequency,
    date: new Date(),
  });
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);

  const [customReminders, setCustomReminders] = useState<Reminder[]>([]);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      //   type: 'period',
      title: 'Period Reminder',
      icon: 'calendar-o',
      color: '#F44336',
      enabled: true,
      frequency: 'daily',
      daysAdvance: 0,
      time: '09:00 AM',
    },
    {
      id: '2',
      //   type: 'ovulation',
      title: 'Ovulation Day',
      icon: 'heart',
      color: '#FF9800',
      enabled: true,
      frequency: 'daily',
      daysAdvance: 1,
      time: '08:00 AM',
    },
    {
      id: '3',
      //   type: 'fertility',
      title: 'Fertility Window',
      icon: 'star',
      color: '#4CAF50',
      enabled: true,
      frequency: 'daily',
      daysAdvance: 0,
      time: '07:00 AM',
    },
    {
      id: '4',
      //   type: 'medicine',
      title: 'Take Medicine',
      icon: 'hospital',
      color: '#2196F3',
      enabled: false,
      frequency: 'daily',
      daysAdvance: 0,
      time: '08:00 PM',
    },
    {
      id: '5',
      //   type: 'appointment',
      title: 'Doctor Appointment',
      icon: 'stethoscope',
      color: '#9C27B0',
      enabled: false,
      daysAdvance: 1,
      time: '08:00 PM',
    },
    {
      id: '6',
      //   type: 'water',
      title: 'Drink Water',
      icon: 'glass',
      color: '#00BCD4',
      enabled: true,
      frequency: 'daily',
      time: '10:00 AM',
    },
  ]);

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const openEditModal = (id: string) => {
    setEditingReminder(id);
    const reminder = reminders.find(r => r.id === id);
    if (reminder && reminder.time) {
      const [time, period] = reminder.time.split(' ');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      const dateObj = new Date();
      dateObj.setHours(hour, parseInt(minutes), 0);
      setCustomForm(prev => ({ ...prev, time: dateObj }));
    }
  };

  const handleAddCustomReminder = () => {
    if (!customForm.title.trim()) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: customForm.title,
      icon: 'bell',
      color: '#607D8B',
      enabled: true,
      time: customForm.time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      frequency: customForm.frequency,
      specificDate:
        customForm.frequency === 'specific' ? customForm.date : undefined,
      customMessage: customForm.message,
    };

    setCustomReminders(prev => [...prev, newReminder]);
    resetCustomForm();
    setShowAddModal(false);
  };

  const resetCustomForm = () => {
    setCustomForm({
      title: '',
      message: '',
      time: new Date(),
      frequency: 'daily',
      date: new Date(),
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Delete custom reminder by index
  const deleteCustomReminder = (index: number) => {
    setCustomReminders(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Reminder Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.descriptionCard}>
          <FontelloIcon
            name="info-circled"
            size={24}
            color={THEME_COLORS.primary}
          />
          <Text style={styles.descriptionText}>
            Set up reminders for periods, ovulation, medications, appointments,
            and more. Stay on track with your health.
          </Text>
        </View>

        {/* Health Cycle Reminders */}
        <View style={styles.section}>
          {reminders.map(reminder => (
            <TouchableOpacity
              key={reminder.id}
              style={styles.reminderCard}
              onPress={() => openEditModal(reminder.id)}
            >
              <View style={styles.reminderLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: reminder.color }]}
                >
                  <FontelloIcon name={reminder.icon} size={20} color="#fff" />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderSubtitle}>
                    {reminder.daysAdvance !== undefined &&
                      `${reminder.daysAdvance} day${
                        reminder.daysAdvance !== 1 ? 's' : ''
                      } before`}
                    {reminder.time && ` • ${reminder.time}`}
                  </Text>
                </View>
              </View>
              <Switch
                value={reminder.enabled}
                onValueChange={() => toggleReminder(reminder.id)}
                trackColor={{ false: '#ddd', true: reminder.color }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Custom Reminders</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
            >
              <FontelloIcon
                name="plus"
                size={20}
                color={THEME_COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {customReminders.map((reminder, idx) => (
            <TouchableOpacity
              key={reminder.id}
              style={styles.reminderCard}
              // You can add edit modal logic here if needed
            >
              <View style={styles.reminderLeft}>
                <View
                  style={[styles.iconBox, { backgroundColor: reminder.color }]}
                >
                  <FontelloIcon name={reminder.icon} size={20} color="#fff" />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderSubtitle}>
                    {reminder.frequency === 'specific'
                      ? reminder.specificDate?.toLocaleDateString()
                      : reminder.frequency}
                    {reminder.time && ` • ${reminder.time}`}
                  </Text>
                </View>
              </View>
              <View style={styles.reminderRight}>
                <Switch
                  value={reminder.enabled}
                  onValueChange={() => {
                    setCustomReminders(prev =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, enabled: !r.enabled } : r,
                      ),
                    );
                  }}
                  trackColor={{ false: '#ddd', true: reminder.color }}
                  thumbColor="#fff"
                />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteCustomReminder(idx)}
                >
                  <FontelloIcon name="trash" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {customReminders.length === 0 && (
            <View style={styles.emptyState}>
              <FontelloIcon name="bell" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No custom reminders yet</Text>
              <Text style={styles.emptySubtext}>
                Tap + to create your first reminder
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Custom Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <ModalTopIcon
              iconName="cancel"
              onPress={() => {
                setShowAddModal(false);
                resetCustomForm();
              }}
            />
            <Text style={styles.modalTitle}>Add Custom Reminder</Text>
            <ModalTopIcon iconName="check" onPress={handleAddCustomReminder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reminder Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Birthday, Anniversary"
                placeholderTextColor="#999"
                value={customForm.title}
                onChangeText={text =>
                  setCustomForm(prev => ({ ...prev, title: text }))
                }
              />
            </View>

            {/* Message Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a custom message..."
                placeholderTextColor="#999"
                value={customForm.message}
                onChangeText={text =>
                  setCustomForm(prev => ({ ...prev, message: text }))
                }
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Frequency Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Frequency</Text>
              <View style={styles.frequencyGrid}>
                {(
                  [
                    'daily',
                    'weekly',
                    'monthly',
                    'yearly',
                    'specific',
                  ] as ReminderFrequency[]
                ).map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyBtn,
                      customForm.frequency === freq &&
                        styles.frequencyBtnActive,
                    ]}
                    onPress={() =>
                      setCustomForm(prev => ({ ...prev, frequency: freq }))
                    }
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        customForm.frequency === freq &&
                          styles.frequencyTextActive,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Specific Date Picker */}
            {customForm.frequency === 'specific' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <FontelloIcon
                    name="calendar-o"
                    size={20}
                    color={THEME_COLORS.primary}
                  />
                  <Text style={styles.dateButtonText}>
                    {customForm.date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Time Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reminder Time</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <FontelloIcon
                  name="clock"
                  size={20}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.dateButtonText}>
                  {formatTime(customForm.time)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <FontelloIcon name="info-circled" size={20} color="#2196F3" />
              <Text style={styles.infoText}>
                You'll receive a notification at the specified time based on
                your selected frequency.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Date Picker */}
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={customForm.date}
          onConfirm={date => {
            setCustomForm(prev => ({ ...prev, date }));
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Time Picker */}
        <DateTimePickerModal
          isVisible={showTimePicker}
          mode="time"
          date={customForm.time}
          onConfirm={time => {
            setCustomForm(prev => ({ ...prev, time }));
            setShowTimePicker(false);
          }}
          onCancel={() => setShowTimePicker(false)}
        />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  descriptionCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  descriptionText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
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
    marginBottom: 12,
  },
  addBtn: {
    padding: 4,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
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
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  deleteBtn: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
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
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  frequencyBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  frequencyTextActive: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
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
