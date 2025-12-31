import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

interface WaterLog {
  id: number;
  time: string;
  amount: number;
}

export default function HydrationScreen() {
  const navigation = useNavigation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [waterMl, setWaterMl] = useState(0);
  const [glassSize, setGlassSize] = useState(250);
  const [waterModalVisible, setWaterModalVisible] = useState(false);

  const dailyGoal = 8; // 8 glasses
  const [waterIntake, setWaterIntake] = useState<WaterLog[]>([
    { id: 1, time: '8:30 AM', amount: 1 },
    { id: 2, time: '10:15 AM', amount: 1 },
    { id: 3, time: '12:00 PM', amount: 1 },
    { id: 4, time: '2:30 PM', amount: 1 },
    { id: 5, time: '4:00 PM', amount: 1 },
    { id: 6, time: '6:15 PM', amount: 1 },
  ]);

  const totalGlasses = waterIntake.reduce((sum, log) => sum + log.amount, 0);
  const totalLiters = (totalGlasses * glassSize + waterMl) / 1000;
  const progressPercent = (totalLiters / 2.0) * 100;
  const remainingGlasses = Math.max(0, dailyGoal - totalGlasses);

  const addGlass = () => {
    if (totalGlasses < dailyGoal) {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setWaterIntake([...waterIntake, { id: Date.now(), time, amount: 1 }]);
    }
  };

  const removeLastGlass = () => {
    if (waterIntake.length > 0) {
      setWaterIntake(waterIntake.slice(0, -1));
    }
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
        <Text style={styles.headerTitle}>Hydration Tracker</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setWaterModalVisible(true)}
        >
          <FontelloIcon name="cog-b" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Card */}
        <LinearGradient
          colors={['#DBEAFE', '#BFDBFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <View style={styles.waterWrapper}>
            <View style={styles.waterAnimation}>
              <Text style={styles.waterEmoji}>💧</Text>
            </View>
            <Text style={styles.progressTitle}>Today's Hydration</Text>
            <View style={styles.progressStats}>
              <Text style={styles.progressValue}>
                {totalLiters.toFixed(2)} L
              </Text>
              <Text style={styles.progressDivider}>of</Text>
              <Text style={styles.progressGoal}>2.0 L</Text>
            </View>
            <Text style={styles.progressSubtitle}>
              {totalGlasses} glasses • {waterMl}ml added
            </Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(progressPercent, 100)}%` },
                  ]}
                />
              </View>
            </View>

            {remainingGlasses > 0 ? (
              <Text style={styles.remainingText}>
                {remainingGlasses} more glass{remainingGlasses > 1 ? 'es' : ''}{' '}
                to reach your goal!
              </Text>
            ) : (
              <Text style={styles.goalReachedText}>🎉 Goal Reached!</Text>
            )}
          </View>
        </LinearGradient>

        {/* Water Controls */}
        <View style={styles.waterControlsCard}>
          <View style={styles.waterControls}>
            <TouchableOpacity
              onPress={removeLastGlass}
              style={styles.waterControlBtn}
            >
              <FontelloIcon name="minus" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.glassesDisplay}>
              <Text style={styles.glassesCount}>{totalGlasses}</Text>
              <Text style={styles.glassesLabel}>glasses</Text>
            </View>

            <TouchableOpacity
              onPress={addGlass}
              style={styles.waterControlBtn}
            >
              <FontelloIcon name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <FontelloIcon name="heart" size={20} color="#EC4899" />
            <Text style={styles.benefitsTitle}>Hydration Benefits</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💪</Text>
            <Text style={styles.benefitText}>
              Supports healthy amniotic fluid levels
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🌡️</Text>
            <Text style={styles.benefitText}>Regulates body temperature</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✨</Text>
            <Text style={styles.benefitText}>
              Reduces swelling and prevents constipation
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>Boosts energy levels</Text>
          </View>
        </View>

        {/* Today's Log */}
        {waterIntake.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Log</Text>
              <Text style={styles.sectionCount}>
                {waterIntake.length} entries
              </Text>
            </View>

            {[...waterIntake].reverse().map((log, index) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logIcon}>
                  <FontelloIcon name="glass" size={20} color="#3B82F6" />
                </View>
                <View style={styles.logContent}>
                  <Text style={styles.logAmount}>
                    {log.amount} glass{log.amount > 1 ? 'es' : ''}
                  </Text>
                  <Text style={styles.logTime}>{log.time}</Text>
                </View>
                <View style={styles.logBadge}>
                  <Text style={styles.logNumber}>
                    #{waterIntake.length - index}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <FontelloIcon name="lightbulb" size={20} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Hydration Tips</Text>
          </View>
          <Text style={styles.tipText}>
            • Keep a water bottle with you at all times
          </Text>
          <Text style={styles.tipText}>
            • Drink a glass of water before each meal
          </Text>
          <Text style={styles.tipText}>• Add lemon or cucumber for flavor</Text>
          <Text style={styles.tipText}>
            • Set hourly reminders on your phone
          </Text>
        </View>
      </ScrollView>

      {/* Water Settings Modal */}
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
                  setWaterModalVisible(false);
                }}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME_COLORS.textLight,
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
    color: THEME_COLORS.text,
  },
  placeholder: {
    width: 32,
  },
  settingsBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  waterWrapper: {
    padding: 30,
    alignItems: 'center',
  },
  waterAnimation: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  waterEmoji: {
    fontSize: 48,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 12,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#3B82F6',
  },
  progressDivider: {
    fontSize: 32,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 8,
  },
  progressGoal: {
    fontSize: 32,
    fontWeight: '600',
    color: '#666',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  goalReachedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  waterControlsCard: {
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  waterControlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 40,
    fontWeight: '800',
    color: '#3B82F6',
  },
  glassesLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  glassesSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 16,
  },
  glassesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  glassItem: {
    width: '20%',
    minWidth: 60,
    aspectRatio: 1,
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  glassItemFilled: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  benefitsCard: {
    backgroundColor: '#FCE7F3',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logContent: {
    flex: 1,
  },
  logAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  logTime: {
    fontSize: 13,
    color: '#999',
  },
  logBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
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
  glassImagesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  glassImagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME_COLORS.textLight,
    padding: 16,
    borderRadius: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME_COLORS.textLight,
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
    color: THEME_COLORS.text,
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
    backgroundColor: THEME_COLORS.textLight,
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
