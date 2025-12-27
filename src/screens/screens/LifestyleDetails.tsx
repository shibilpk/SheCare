import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LineChart } from 'react-native-chart-kit';
import { THEME_COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../utils/FontelloIcons';

const LifestyleDetailsScreen = () => {
  const navigation = useNavigation();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('170');
  const [age, setAge] = useState('25');
  const [unit, setUnit] = useState('kg');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [editField, setEditField] = useState(null);

  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterMl, setWaterMl] = useState(0);
  const [glassSize, setGlassSize] = useState(250);
  const [waterModalVisible, setWaterModalVisible] = useState(false);

  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [70, 68, 67, 66, 65, 64],
      color: () => THEME_COLORS.primary,
      strokeWidth: 3,
    }],
  });

  const handleConfirm = (date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
  };

  const handleSave = () => {
    if (editField === 'weight' && weight) {
      const newWeight = parseFloat(weight);
      if (!isNaN(newWeight)) {
        setChartData(prev => ({
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: [...prev.datasets[0].data.slice(1), newWeight],
          }],
        }));
      }
    }
    setEditField(null);
  };

  const currentWeight = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
  const weightChange = currentWeight - chartData.datasets[0].data[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <FontelloIcon name="left-open-mini" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lifestyle Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Weight Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Weight Progress</Text>
              <Text style={styles.progressSubtitle}>Last 6 months</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </Text>
            </View>
          </View>

          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: THEME_COLORS.primary,
                fill: '#fff',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#f0f0f0',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Health Stats Cards */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setEditField('weight')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
              <FontelloIcon name="balanceScale" size={24} color="#6366F1" />
            </View>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>
              {currentWeight} <Text style={styles.statUnit}>{unit}</Text>
            </Text>
            <TouchableOpacity style={styles.editBtn}>
              <FontelloIcon name="pencil" size={12} color="#999" />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setEditField('height')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#FCE7F3' }]}>
              <FontelloIcon name="person" size={24} color="#EC4899" />
            </View>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>
              {height} <Text style={styles.statUnit}>cm</Text>
            </Text>
            <TouchableOpacity style={styles.editBtn}>
              <FontelloIcon name="pencil" size={12} color="#999" />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setEditField('age')}
          >
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <FontelloIcon name="calendar" size={24} color="#10B981" />
            </View>
            <Text style={styles.statLabel}>Age</Text>
            <Text style={styles.statValue}>
              {age} <Text style={styles.statUnit}>yrs</Text>
            </Text>
            <TouchableOpacity style={styles.editBtn}>
              <FontelloIcon name="pencil" size={12} color="#999" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Water Tracker Card */}
        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterTitleRow}>
              <View style={styles.waterIconBox}>
                <FontelloIcon name="glass" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.waterTitle}>Water Tracker</Text>
                <Text style={styles.waterSubtitle}>Stay hydrated today</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.waterSettingsBtn}
              onPress={() => setWaterModalVisible(true)}
            >
              <FontelloIcon name="cog-b" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <View style={styles.waterProgressBox}>
            <View style={styles.waterStats}>
              <Text style={styles.waterAmount}>
                {((waterGlasses * glassSize + waterMl) / 1000).toFixed(2)} L
              </Text>
              <Text style={styles.waterTarget}>of 2.0 L goal</Text>
            </View>
            <View style={styles.waterProgressBar}>
              <View
                style={[
                  styles.waterProgressFill,
                  { width: `${Math.min(((waterGlasses * glassSize + waterMl) / 2000) * 100, 100)}%` }
                ]}
              />
            </View>
          </View>

          <View style={styles.waterControls}>
            <TouchableOpacity
              onPress={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
              style={styles.waterControlBtn}
            >
              <FontelloIcon name="minus" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.glassesDisplay}>
              <Text style={styles.glassesCount}>{waterGlasses}</Text>
              <Text style={styles.glassesLabel}>glasses</Text>
            </View>

            <TouchableOpacity
              onPress={() => setWaterGlasses(waterGlasses + 1)}
              style={styles.waterControlBtn}
            >
              <FontelloIcon name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Glass Images */}
          {waterGlasses > 0 && (
            <View style={styles.glassesRow}>
              {Array.from({ length: Math.min(waterGlasses, 8) }).map((_, idx) => (
                <Image
                  key={idx}
                  source={require('../../assets/images/glass-of-water.png')}
                  style={styles.glassImage}
                  resizeMode="contain"
                />
              ))}
              {waterGlasses > 8 && (
                <Text style={styles.glassesMore}>+{waterGlasses - 8}</Text>
              )}
            </View>
          )}
        </View>

        {/* Health Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIconBox}>
              <Text style={styles.tipsEmoji}>💡</Text>
            </View>
            <Text style={styles.tipsTitle}>Health Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipRow}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Stay hydrated and eat a balanced diet</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Track your progress regularly</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Set realistic and achievable goals</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Consult healthcare professionals for advice</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editField !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {editField && editField.charAt(0).toUpperCase() + editField.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setEditField(null)}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            {editField === 'weight' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Weight</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter weight"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <View style={styles.unitRow}>
                    <TouchableOpacity
                      onPress={() => setUnit('kg')}
                      style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
                    >
                      <Text style={[styles.unitText, unit === 'kg' && styles.unitTextActive]}>
                        kg
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setUnit('lb')}
                      style={[styles.unitBtn, unit === 'lb' && styles.unitBtnActive]}
                    >
                      <Text style={[styles.unitText, unit === 'lb' && styles.unitTextActive]}>
                        lb
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity
                    onPress={() => setDatePickerVisible(true)}
                    style={styles.dateBtn}
                  >
                    <Text style={styles.dateText}>{selectedDate.toLocaleDateString()}</Text>
                    <FontelloIcon name="calendar" size={20} color="#999" />
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={datePickerVisible}
                    mode="date"
                    date={selectedDate}
                    onConfirm={handleConfirm}
                    onCancel={() => setDatePickerVisible(false)}
                  />
                </View>
              </>
            )}

            {editField === 'height' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter height"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
            )}

            {editField === 'age' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter age"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditField(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSave}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Water Modal */}
      <Modal visible={waterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Water Settings</Text>
              <TouchableOpacity onPress={() => setWaterModalVisible(false)}>
                <FontelloIcon name="cancel" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Add Water (ml)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount in ml"
                keyboardType="numeric"
                value={waterMl ? String(waterMl) : ''}
                onChangeText={v => setWaterMl(Number(v) || 0)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Glass Size (ml)</Text>
              <TextInput
                style={styles.input}
                placeholder="Default: 250ml"
                keyboardType="numeric"
                value={glassSize ? String(glassSize) : ''}
                onChangeText={v => setGlassSize(Number(v) || 250)}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setWaterModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => {
                  setWaterGlasses(waterGlasses + Math.floor(waterMl / glassSize));
                  setWaterMl(waterMl % glassSize);
                  setWaterModalVisible(false);
                }}
              >
                <Text style={styles.modalSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerPlaceholder: {
    width: 36,
  },
  scrollContent: {
    padding: 20,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#333',
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: '#F0E6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  editBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waterIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  waterSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  waterSettingsBtn: {
    padding: 8,
  },
  waterProgressBox: {
    marginBottom: 16,
  },
  waterStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 8,
  },
  waterAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3B82F6',
  },
  waterTarget: {
    fontSize: 14,
    color: '#999',
  },
  waterProgressBar: {
    height: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  waterControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  glassesDisplay: {
    alignItems: 'center',
  },
  glassesCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3B82F6',
  },
  glassesLabel: {
    fontSize: 12,
    color: '#999',
  },
  glassesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DBEAFE',
  },
  glassImage: {
    width: 32,
    height: 44,
  },
  glassesMore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  tipsCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  tipsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsEmoji: {
    fontSize: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  tipsList: {
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  unitBtnActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  unitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  unitTextActive: {
    color: '#fff',
  },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
  },
  dateText: {
    fontSize: 15,
    color: '#333',
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
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default LifestyleDetailsScreen;