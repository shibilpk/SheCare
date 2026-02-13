import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAvoidingModal } from '../../components';
import { STYLE } from '../../constants/app';

interface DoseSchedule {
  time: string;
  taken: boolean;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  icon: string;
  color: string;
  doses: DoseSchedule[];
}

export default function MedicationsScreen() {
  const navigation = useNavigation();
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      name: 'Prenatal Vitamin',
      dosage: '1 tablet',
      frequency: 'Once daily',
      icon: 'pharmacy',
      color: '#EC4899',
      doses: [
        { time: 'Morning', taken: true },
      ],
    },
    {
      id: 2,
      name: 'Folic Acid',
      dosage: '400mcg',
      frequency: '3 times daily',
      icon: 'pharmacy',
      color: '#8B5CF6',
      doses: [
        { time: 'Morning', taken: true },
        { time: 'Afternoon', taken: true },
        { time: 'Evening', taken: false },
      ],
    },
    {
      id: 3,
      name: 'Iron Supplement',
      dosage: '65mg',
      frequency: 'Twice daily',
      icon: 'pharmacy',
      color: '#EF4444',
      doses: [
        { time: 'Morning', taken: true },
        { time: 'Evening', taken: false },
      ],
    },
    {
      id: 4,
      name: 'Calcium',
      dosage: '600mg',
      frequency: 'Twice weekly',
      icon: 'pharmacy',
      color: '#10B981',
      doses: [
        { time: 'Dose 1', taken: false },
        { time: 'Dose 2', taken: false },
      ],
    },
    {
      id: 5,
      name: 'Vitamin D',
      dosage: '1000 IU',
      frequency: 'Once daily',
      icon: 'pharmacy',
      color: '#F59E0B',
      doses: [
        { time: 'Morning', taken: false },
      ],
    },
    {
      id: 6,
      name: 'DHA Supplement',
      dosage: '200mg',
      frequency: '4 times daily',
      icon: 'pharmacy',
      color: '#06B6D4',
      doses: [
        { time: 'Dose 1', taken: false },
        { time: 'Dose 2', taken: false },
        { time: 'Dose 3', taken: false },
        { time: 'Dose 4', taken: false },
      ],
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [frequencyPeriod, setFrequencyPeriod] = useState('daily');
  const [timesPerPeriod, setTimesPerPeriod] = useState(1);
  const [selectedColor, setSelectedColor] = useState('#EC4899');
  const [doseTaken, setDoseTaken] = useState<boolean[]>([false]);

  const toggleDose = (medId: number, doseIndex: number) => {
    setMedications(
      medications.map(med =>
        med.id === medId
          ? {
              ...med,
              doses: med.doses.map((dose, idx) =>
                idx === doseIndex ? { ...dose, taken: !dose.taken } : dose,
              ),
            }
          : med,
      ),
    );
  };

  // Calculate total doses
  const totalDoses = medications.reduce((sum, med) => sum + med.doses.length, 0);
  const takenDoses = medications.reduce(
    (sum, med) => sum + med.doses.filter(d => d.taken).length,
    0,
  );
  const completionPercent = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

  const colorOptions = [
    '#EC4899', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B',
    '#3B82F6', '#06B6D4', '#F43F5E', '#84CC16', '#A855F7',
  ];

  const handleTimesChange = (newTimes: number) => {
    setTimesPerPeriod(newTimes);
    setDoseTaken(Array(newTimes).fill(false));
  };

  const handleSaveMedication = () => {
    if (newMedName.trim() && newDosage.trim()) {
      let frequencyText = '';

      if (frequencyPeriod === 'once') {
        frequencyText = 'One time only';
      } else {
        const timesText = timesPerPeriod === 1 ? 'Once' :
                         timesPerPeriod === 2 ? 'Twice' :
                         `${timesPerPeriod} times`;
        frequencyText = `${timesText} ${frequencyPeriod}`;
      }

      // Generate generic time labels
      const generateTimes = (count: number) => {
        const times = [];
        if (count === 1) times.push('Morning');
        else if (count === 2) times.push('Morning', 'Evening');
        else if (count === 3) times.push('Morning', 'Afternoon', 'Evening');
        else {
          for (let i = 1; i <= count; i++) {
            times.push(`Dose ${i}`);
          }
        }
        return times;
      };

      const newMed: Medication = {
        id: medications.length + 1,
        name: newMedName.trim(),
        dosage: newDosage.trim(),
        frequency: frequencyText,
        icon: 'pharmacy',
        color: selectedColor,
        doses: generateTimes(timesPerPeriod).map(time => ({ time, taken: false })),
      };

      setMedications([...medications, newMed]);
      resetForm();
      setShowAddModal(false);
    }
  };

  const resetForm = () => {
    setNewMedName('');
    setNewDosage('');
    setFrequencyPeriod('daily');
    setTimesPerPeriod(1);
    setSelectedColor('#EC4899');
    setDoseTaken([false]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <FontelloIcon name="left-open-mini" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medications & Vitamins</Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.addBtn}
        >
          <FontelloIcon name="plus" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Card */}
        <LinearGradient
          colors={['#FCE7F3', '#FBCFE8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <View style={styles.progressCardWrapper}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Today's Progress</Text>
                <Text style={styles.progressSubtitle}>
                  {takenDoses} of {totalDoses} doses taken
                </Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercent}>
                  {Math.round(completionPercent)}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${completionPercent}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Medications List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
        </View>

        {medications.map(med => (
          <View key={med.id} style={styles.medCard}>
            <View
              style={[
                styles.medIconContainer,
                { backgroundColor: `${med.color}20` },
              ]}
            >
              <FontelloIcon name={med.icon} size={24} color={med.color} />
            </View>
            <View style={styles.medContent}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDosage}>{med.dosage}</Text>
              <View style={styles.medMeta}>
                <FontelloIcon name="clock" size={12} color="#999" />
                <Text style={styles.medFrequency}>  {med.frequency}</Text>
              </View>

              {/* Dose Schedule */}
              <View style={styles.doseScheduleContainer}>
                {med.doses.map((dose, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.doseItem,
                      dose.taken && styles.doseItemTaken,
                    ]}
                    onPress={() => toggleDose(med.id, index)}
                  >
                    <FontelloIcon
                      name="clock"
                      size={10}
                      color={dose.taken ? THEME_COLORS.textLight : '#999'}
                    />
                    <Text style={[
                      styles.doseTime,
                      dose.taken && styles.doseTimeTaken,
                    ]}>
                      {dose.time}
                    </Text>
                    {dose.taken && (
                      <FontelloIcon
                        name="ok"
                        size={10}
                        color={THEME_COLORS.textLight}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ))}

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <FontelloIcon name="info-circled" size={20} color="#3B82F6" />
            <Text style={styles.tipsTitle}>Important Reminders</Text>
          </View>
          <Text style={styles.tipText}>
            • Take iron supplements with vitamin C for better absorption
          </Text>
          <Text style={styles.tipText}>
            • Avoid taking calcium and iron together
          </Text>
          <Text style={styles.tipText}>
            • Set daily reminders to maintain consistency
          </Text>
        </View>
      </ScrollView>

      {/* Add Medication Modal */}
      <KeyboardAvoidingModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Medication"
        showScrollView={true}
      >
        <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Medication Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Prenatal Vitamin"
                    value={newMedName}
                    onChangeText={setNewMedName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dosage</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 1 tablet, 400mcg"
                    value={newDosage}
                    onChangeText={setNewDosage}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Period</Text>
                  <View style={styles.periodRow}>
                    {['once', 'daily', 'weekly', 'monthly', 'yearly'].map(period => (
                      <TouchableOpacity
                        key={period}
                        onPress={() => {
                          setFrequencyPeriod(period);
                          if (period === 'once') {
                            handleTimesChange(1);
                          }
                        }}
                        style={[
                          styles.periodBtn,
                          frequencyPeriod === period && styles.periodBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodText,
                            frequencyPeriod === period && styles.periodTextActive,
                          ]}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {frequencyPeriod !== 'once' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>How many times per {frequencyPeriod}?</Text>
                    <View style={styles.timesRow}>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <TouchableOpacity
                          key={num}
                          onPress={() => handleTimesChange(num)}
                          style={[
                            styles.timesBtn,
                            timesPerPeriod === num && styles.timesBtnActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.timesText,
                              timesPerPeriod === num && styles.timesTextActive,
                            ]}
                          >
                            {num}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <View style={styles.colorRow}>
                    {colorOptions.map(color => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorBtn,
                          { backgroundColor: color },
                          selectedColor === color && styles.colorBtnActive,
                        ]}
                      >
                        {selectedColor === color && (
                          <FontelloIcon name="ok" size={16} color="#FFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

        <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveMedication}
                >
                  <Text style={styles.modalSaveBtnText}>Save</Text>
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
    ...STYLE.header,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  addBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressCard: {
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCardWrapper: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME_COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EC4899',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  medContent: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  medDosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  medMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  medFrequency: {
    fontSize: 13,
    color: '#999',
  },
  doseScheduleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  doseItemTaken: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  doseTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  doseTimeTaken: {
    color: THEME_COLORS.textLight,
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: THEME_COLORS.text,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  periodTextActive: {
    color: THEME_COLORS.textLight,
  },
  timesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  timesBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timesBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  timesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  timesTextActive: {
    color: THEME_COLORS.textLight,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnActive: {
    borderColor: '#333',
    borderWidth: 3,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
});
