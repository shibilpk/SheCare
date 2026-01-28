import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import LinearGradient from 'react-native-linear-gradient';
import FontelloIcon from '../../../services/FontelloIcons';
import { THEME_COLORS } from '../../../constants/colors';
import { RootStackParamList } from '../../../constants/navigation';
import useStore from '../../../hooks/useStore';
import { KeyboardAvoidingModal } from '../../../components';

export default function PregnancySettings() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isPregnant = useStore(state => state.isPregnant ?? false);
  const setIsPregnant = useStore(state => state.setIsPregnant ?? (() => {}));

  const [pregnancyEnabled, setPregnancyEnabled] = useState(isPregnant);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [babyName, setBabyName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [kickCounter, setKickCounter] = useState(true);
  const [contractionTimer, setContractionTimer] = useState(true);
  const [weeklyUpdates, setWeeklyUpdates] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);

  // Turn Off Reason Modal States
  const [showTurnOffModal, setShowTurnOffModal] = useState(false);
  const [turnOffReason, setTurnOffReason] = useState<'born' | 'abortion' | 'mistake' | null>(null);

  // Child Born States
  const [showChildBornModal, setShowChildBornModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [birthWeight, setBirthWeight] = useState('');
  const [birthLength, setBirthLength] = useState('');
  const [childGender, setChildGender] = useState<'boy' | 'girl' | ''>('');

  const calculateWeeks = () => {
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const weeksRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
    const currentWeek = 40 - weeksRemaining;
    return currentWeek > 0 ? currentWeek : 0;
  };

  const handleSave = () => {
    setIsPregnant(pregnancyEnabled);
    Alert.alert('Success', 'Pregnancy settings saved successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleDueDateConfirm = (date: Date) => {
    setDueDate(date);
    setShowDueDatePicker(false);
  };

  const handleBirthDateConfirm = (date: Date) => {
    setBirthDate(date);
    setShowBirthDatePicker(false);
  };

  const handlePregnancyToggle = (value: boolean) => {
    if (!value && pregnancyEnabled) {
      // Turning off pregnancy mode
      setShowTurnOffModal(true);
    } else {
      setPregnancyEnabled(value);
    }
  };

  const handleTurnOffConfirm = () => {
    if (turnOffReason === 'born') {
      setShowTurnOffModal(false);
      setShowChildBornModal(true);
    } else if (turnOffReason === 'abortion' || turnOffReason === 'mistake') {
      setPregnancyEnabled(false);
      setShowTurnOffModal(false);
      Alert.alert(
        'Pregnancy Mode Disabled',
        turnOffReason === 'abortion'
          ? 'Our thoughts are with you during this difficult time.'
          : 'Pregnancy mode has been turned off.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsPregnant(false);
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleChildBornSave = () => {
    if (!childName.trim()) {
      Alert.alert('Required', 'Please enter the baby\'s name');
      return;
    }

    setPregnancyEnabled(false);
    setShowChildBornModal(false);

    Alert.alert(
      'Congratulations! 🎉',
      `Welcome to the world, ${childName}! Your pregnancy journey has been saved.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setIsPregnant(false);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <FontelloIcon name="left-open-mini" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pregnancy Settings</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enable Pregnancy Mode */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.iconBox}>
                <FontelloIcon name="emo-laugh" size={24} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Enable Pregnancy Mode</Text>
                <Text style={styles.cardSubtitle}>
                  Switch to pregnancy tracking features
                </Text>
              </View>
            </View>
            <Switch
              value={pregnancyEnabled}
              onValueChange={handlePregnancyToggle}
              trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {pregnancyEnabled && (
          <>
            {/* Pregnancy Information */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pregnancy Information</Text>
                <FontelloIcon
                  name="heart"
                  size={18}
                  color={THEME_COLORS.primary}
                />
              </View>

              {/* Due Date */}
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => setShowDueDatePicker(true)}
              >
                <View style={styles.inputLeft}>
                  <View
                    style={[
                      styles.inputIconBox,
                      { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <FontelloIcon name="calendar" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Due Date</Text>
                    <Text style={styles.inputValue}>
                      {dueDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <FontelloIcon name="right-open-mini" size={20} color="#999" />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Current Week */}
              <View style={styles.inputRow}>
                <View style={styles.inputLeft}>
                  <View
                    style={[
                      styles.inputIconBox,
                      { backgroundColor: '#DBEAFE' },
                    ]}
                  >
                    <FontelloIcon name="clock" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Current Week</Text>
                    <Text style={styles.inputValue}>
                      Week {calculateWeeks()} of 40
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Baby Name */}
              <View style={styles.inputRow}>
                <View style={styles.inputLeft}>
                  <View
                    style={[
                      styles.inputIconBox,
                      { backgroundColor: '#FCE7F3' },
                    ]}
                  >
                    <FontelloIcon name="emo-happy" size={20} color="#EC4899" />
                  </View>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Baby Name (Optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter baby's name"
                      placeholderTextColor="#999"
                      value={babyName}
                      onChangeText={setBabyName}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Medical Information */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Medical Information</Text>
                <FontelloIcon
                  name="hospital"
                  size={18}
                  color={THEME_COLORS.primary}
                />
              </View>

              {/* Doctor Name */}
              <View style={styles.inputRow}>
                <View style={styles.inputLeft}>
                  <View
                    style={[
                      styles.inputIconBox,
                      { backgroundColor: '#D1FAE5' },
                    ]}
                  >
                    <FontelloIcon name="user-md" size={20} color="#10B981" />
                  </View>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Doctor's Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter doctor's name"
                      placeholderTextColor="#999"
                      value={doctorName}
                      onChangeText={setDoctorName}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Hospital */}
              <View style={styles.inputRow}>
                <View style={styles.inputLeft}>
                  <View
                    style={[
                      styles.inputIconBox,
                      { backgroundColor: '#E0E7FF' },
                    ]}
                  >
                    <FontelloIcon name="hospital" size={20} color="#6366F1" />
                  </View>
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputLabel}>Hospital/Clinic</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter hospital name"
                      placeholderTextColor="#999"
                      value={hospitalName}
                      onChangeText={setHospitalName}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Tracking Features */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tracking Features</Text>
                <FontelloIcon
                  name="chart-line"
                  size={18}
                  color={THEME_COLORS.primary}
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <View
                    style={[
                      styles.toggleIconBox,
                      { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <FontelloIcon name="child" size={20} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.toggleLabel}>Kick Counter</Text>
                    <Text style={styles.toggleSubtext}>
                      Track baby movements
                    </Text>
                  </View>
                </View>
                <Switch
                  value={kickCounter}
                  onValueChange={setKickCounter}
                  trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <View
                    style={[
                      styles.toggleIconBox,
                      { backgroundColor: '#FCE7F3' },
                    ]}
                  >
                    <FontelloIcon name="clock" size={20} color="#EC4899" />
                  </View>
                  <View>
                    <Text style={styles.toggleLabel}>Contraction Timer</Text>
                    <Text style={styles.toggleSubtext}>
                      Monitor contractions
                    </Text>
                  </View>
                </View>
                <Switch
                  value={contractionTimer}
                  onValueChange={setContractionTimer}
                  trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <View
                    style={[
                      styles.toggleIconBox,
                      { backgroundColor: '#D1FAE5' },
                    ]}
                  >
                    <FontelloIcon name="bell" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.toggleLabel}>Weekly Updates</Text>
                    <Text style={styles.toggleSubtext}>Get pregnancy tips</Text>
                  </View>
                </View>
                <Switch
                  value={weeklyUpdates}
                  onValueChange={setWeeklyUpdates}
                  trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                  <View
                    style={[
                      styles.toggleIconBox,
                      { backgroundColor: '#E0E7FF' },
                    ]}
                  >
                    <FontelloIcon
                      name="calendar-check-o"
                      size={20}
                      color="#6366F1"
                    />
                  </View>
                  <View>
                    <Text style={styles.toggleLabel}>
                      Appointment Reminders
                    </Text>
                    <Text style={styles.toggleSubtext}>
                      Never miss checkups
                    </Text>
                  </View>
                </View>
                <Switch
                  value={appointmentReminders}
                  onValueChange={setAppointmentReminders}
                  trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Information Card */}
            <View style={styles.infoCard}>
              <FontelloIcon name="info-circled" size={24} color="#3B82F6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>About Pregnancy Mode</Text>
                <Text style={styles.infoText}>
                  Pregnancy mode provides specialized tracking features
                  including weekly development updates, kick counter,
                  contraction timer, and customized health insights for
                  expecting mothers.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.saveButtonGradient}>
              <FontelloIcon name="floppy" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Due Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDueDatePicker}
        mode="date"
        date={dueDate}
        minimumDate={new Date()}
        onConfirm={handleDueDateConfirm}
        onCancel={() => setShowDueDatePicker(false)}
      />

      {/* Birth Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showBirthDatePicker}
        mode="date"
        date={birthDate}
        maximumDate={new Date()}
        onConfirm={handleBirthDateConfirm}
        onCancel={() => setShowBirthDatePicker(false)}
      />

      {/* Turn Off Reason Modal */}
      <KeyboardAvoidingModal
        visible={showTurnOffModal}
        onClose={() => {
          setShowTurnOffModal(false);
          setTurnOffReason(null);
        }}
        title="Why are you turning off Pregnancy Mode?"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalDescription}>
            Please select the reason for turning off pregnancy tracking:
          </Text>

          <TouchableOpacity
            style={[
              styles.reasonOption,
              turnOffReason === 'born' && styles.reasonOptionSelected,
            ]}
            onPress={() => setTurnOffReason('born')}
          >
            <View style={[styles.reasonIconBox, { backgroundColor: '#DCFCE7' }]}>
              <FontelloIcon name="child" size={24} color="#10B981" />
            </View>
            <View style={styles.reasonTextContainer}>
              <Text style={styles.reasonTitle}>Baby Born 🎉</Text>
              <Text style={styles.reasonSubtext}>
                Congratulations! My baby has arrived
              </Text>
            </View>
            {turnOffReason === 'born' && (
              <FontelloIcon name="ok" size={20} color={THEME_COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reasonOption,
              turnOffReason === 'abortion' && styles.reasonOptionSelected,
            ]}
            onPress={() => setTurnOffReason('abortion')}
          >
            <View style={[styles.reasonIconBox, { backgroundColor: '#FEE2E2' }]}>
              <FontelloIcon name="heart-broken" size={24} color="#EF4444" />
            </View>
            <View style={styles.reasonTextContainer}>
              <Text style={styles.reasonTitle}>Pregnancy Loss</Text>
              <Text style={styles.reasonSubtext}>
                I experienced a miscarriage or loss
              </Text>
            </View>
            {turnOffReason === 'abortion' && (
              <FontelloIcon name="ok" size={20} color={THEME_COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reasonOption,
              turnOffReason === 'mistake' && styles.reasonOptionSelected,
            ]}
            onPress={() => setTurnOffReason('mistake')}
          >
            <View style={[styles.reasonIconBox, { backgroundColor: '#E0E7FF' }]}>
              <FontelloIcon name="attention" size={24} color="#6366F1" />
            </View>
            <View style={styles.reasonTextContainer}>
              <Text style={styles.reasonTitle}>Turned On By Mistake</Text>
              <Text style={styles.reasonSubtext}>
                I enabled this mode accidentally
              </Text>
            </View>
            {turnOffReason === 'mistake' && (
              <FontelloIcon name="ok" size={20} color={THEME_COLORS.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalButton,
              !turnOffReason && styles.modalButtonDisabled,
            ]}
            onPress={handleTurnOffConfirm}
            disabled={!turnOffReason}
          >
            <Text style={styles.modalButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingModal>

      {/* Child Born Details Modal */}
      <KeyboardAvoidingModal
        visible={showChildBornModal}
        onClose={() => {
          setShowChildBornModal(false);
          setPregnancyEnabled(true);
        }}
        title="Baby Details"
        showScrollView={true}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalDescription}>
            Please share some details about your newborn:
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabelModal}>Baby's Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter baby's name"
              placeholderTextColor="#999"
              value={childName}
              onChangeText={setChildName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabelModal}>Birth Date</Text>
            <TouchableOpacity
              style={styles.modalDateButton}
              onPress={() => setShowBirthDatePicker(true)}
            >
              <Text style={styles.modalDateText}>
                {birthDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <FontelloIcon name="calendar" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.genderContainer}>
            <Text style={styles.inputLabelModal}>Gender</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  childGender === 'boy' && styles.genderButtonSelectedBoy,
                ]}
                onPress={() => setChildGender('boy')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    childGender === 'boy' && styles.genderButtonTextSelected,
                  ]}
                >
                  👦 Boy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  childGender === 'girl' && styles.genderButtonSelectedGirl,
                ]}
                onPress={() => setChildGender('girl')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    childGender === 'girl' && styles.genderButtonTextSelected,
                  ]}
                >
                  👧 Girl
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabelModal}>Birth Weight (kg)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 3.2"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={birthWeight}
              onChangeText={setBirthWeight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabelModal}>Birth Length (cm)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 50"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={birthLength}
              onChangeText={setBirthLength}
            />
          </View>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleChildBornSave}
          >
            <Text style={styles.modalButtonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  inputLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputTextContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  inputValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    padding: 0,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalContent: {
    paddingTop: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  reasonOptionSelected: {
    borderColor: THEME_COLORS.primary,
    backgroundColor: '#F9FAFB',
  },
  reasonIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  reasonSubtext: {
    fontSize: 13,
    color: '#666',
  },
  modalButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelModal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  modalDateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  modalDateText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  genderButtonSelectedBoy: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  genderButtonSelectedGirl: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  genderButtonTextSelected: {
    color: '#333',
  },
});
