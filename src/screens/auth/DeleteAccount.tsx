import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../constants/navigation';
import DeleteAccountSvg from '../../assets/images/delete-account.svg';
import FontelloIcon from '../../services/FontelloIcons';

export default function DeleteAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isDeactivate, setIsDeactivate] = useState(true);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const handleDelete = () => {
    if (!confirmChecked) {
      Alert.alert('Confirmation Required', 'Please confirm that you understand the consequences.');
      return;
    }

    if (isDeactivate) {
      Alert.alert(
        'Account Deactivated',
        'Your account will be temporarily deactivated. You can restore it anytime by logging back in.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        'Confirm Deletion',
        'Are you absolutely sure? This action cannot be undone and all your data will be permanently lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Permanently',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
              navigation.goBack();
            }
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <FontelloIcon name="left-open-mini" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Illustration */}
        <View style={styles.illustrationBox}>
          <DeleteAccountSvg width={200} height={120} />
        </View>

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <View style={styles.warningIconBox}>
              <FontelloIcon name="attention" size={24} color="#DC2626" />
            </View>
            <Text style={styles.warningTitle}>Important Information</Text>
          </View>
          <Text style={styles.warningText}>
            This action will affect your account and data. Please read carefully before proceeding.
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Choose an option</Text>

          {/* Deactivate Option */}
          <TouchableOpacity
            style={[styles.optionCard, isDeactivate && styles.optionCardActive]}
            onPress={() => setIsDeactivate(true)}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.optionIconBox, { backgroundColor: '#DBEAFE' }]}>
                <FontelloIcon name="pause" size={24} color="#3B82F6" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Temporarily Deactivate</Text>
                <Text style={styles.optionSubtitle}>Take a break, come back anytime</Text>
              </View>
              <View style={[styles.radioButton, isDeactivate && styles.radioButtonActive]}>
                {isDeactivate && <View style={styles.radioButtonInner} />}
              </View>
            </View>
            <View style={styles.optionDetails}>
              <View style={styles.detailRow}>
                <FontelloIcon name="check" size={16} color="#10B981" />
                <Text style={styles.detailText}>Your data will be preserved</Text>
              </View>
              <View style={styles.detailRow}>
                <FontelloIcon name="check" size={16} color="#10B981" />
                <Text style={styles.detailText}>Can be restored by logging in</Text>
              </View>
              <View style={styles.detailRow}>
                <FontelloIcon name="check" size={16} color="#10B981" />
                <Text style={styles.detailText}>Account hidden from others</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Delete Option */}
          <TouchableOpacity
            style={[styles.optionCard, !isDeactivate && styles.optionCardActive]}
            onPress={() => setIsDeactivate(false)}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.optionIconBox, { backgroundColor: '#FEE2E2' }]}>
                <FontelloIcon name="trashEmpty" size={24} color="#DC2626" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Delete Permanently</Text>
                <Text style={styles.optionSubtitle}>Cannot be undone</Text>
              </View>
              <View style={[styles.radioButton, !isDeactivate && styles.radioButtonActive]}>
                {!isDeactivate && <View style={styles.radioButtonInner} />}
              </View>
            </View>
            <View style={styles.optionDetails}>
              <View style={styles.detailRow}>
                <FontelloIcon name="cancel" size={16} color="#DC2626" />
                <Text style={styles.detailText}>All data permanently deleted</Text>
              </View>
              <View style={styles.detailRow}>
                <FontelloIcon name="cancel" size={16} color="#DC2626" />
                <Text style={styles.detailText}>Cannot be recovered</Text>
              </View>
              <View style={styles.detailRow}>
                <FontelloIcon name="cancel" size={16} color="#DC2626" />
                <Text style={styles.detailText}>Immediate and irreversible</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Confirmation Checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setConfirmChecked(!confirmChecked)}
        >
          <View style={[styles.checkbox, confirmChecked && styles.checkboxActive]}>
            {confirmChecked && <FontelloIcon name="check" size={14} color="#fff" />}
          </View>
          <Text style={styles.checkboxText}>
            I understand the consequences of this action
          </Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <FontelloIcon name="info" size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>What happens next?</Text>
          </View>
          {isDeactivate ? (
            <>
              <Text style={styles.infoText}>
                • Your profile will be hidden from others
              </Text>
              <Text style={styles.infoText}>
                • You can reactivate anytime by logging in
              </Text>
              <Text style={styles.infoText}>
                • All your data remains secure
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                • Your account will be deleted within 24 hours
              </Text>
              <Text style={styles.infoText}>
                • All personal data will be permanently removed
              </Text>
              <Text style={styles.infoText}>
                • This action cannot be reversed
              </Text>
            </>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            isDeactivate ? styles.deactivateBtn : styles.deleteBtn,
            !confirmChecked && styles.actionBtnDisabled
          ]}
          onPress={handleDelete}
          disabled={!confirmChecked}
        >
          <Text style={styles.actionBtnText}>
            {isDeactivate ? 'Deactivate Account' : 'Delete Account Permanently'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
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
  illustrationBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  warningIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
  },
  warningText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  optionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCardActive: {
    borderColor: THEME_COLORS.primary,
    backgroundColor: '#F9FAFB',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: THEME_COLORS.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME_COLORS.primary,
  },
  optionDetails: {
    gap: 8,
    paddingLeft: 60,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  deactivateBtn: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
});