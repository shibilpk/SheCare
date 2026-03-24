import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLORS } from '@src/constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@src/constants/navigation';
import Input from '@src/components/widgets/Input';
import FontelloIcon from '@src/services/FontelloIcons';
import BackButton from '@src/components/widgets/BackButton';
import { STYLE } from '@src/constants/app';
import { useChangePassword } from './useChangePassword';
import LinearGradient from 'react-native-linear-gradient';

export default function ChangePasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { changePassword, isChanging } = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = [
    { text: 'At least 8 characters', met: newPassword.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { text: 'Contains number', met: /\d/.test(newPassword) },
    { text: 'Contains special character', met: /[!@#$%^&*]/.test(newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (!allRequirementsMet) {
      Alert.alert('Error', 'Password does not meet all requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      Alert.alert(
        response.detail.title,
        response.detail.message,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.normalizedError?.message || 'Failed to change password'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card with Gradient */}
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoCard}
        >
          <View style={styles.infoIconBox}>
            <FontelloIcon name="lock" size={22} color={THEME_COLORS.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Secure Your Account</Text>
            <Text style={styles.infoText}>
              Choose a strong password to keep your account secure. Your password
              should be unique and not used elsewhere.
            </Text>
          </View>
        </LinearGradient>

        {/* Current Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <FontelloIcon name="lock" size={13} color={THEME_COLORS.text} /> Current Password
          </Text>
          <View style={styles.inputWrapper}>
            <Input
              label=""
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              placeholder="Enter current password"
              style={styles.input}
              editable={!isChanging}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isChanging}
            >
              <FontelloIcon
                name={showCurrentPassword ? 'eye' : 'eye-off'}
                size={18}
                color="#999"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <FontelloIcon name="lock-open" size={13} color={THEME_COLORS.text} /> New Password
          </Text>
          <View style={styles.inputWrapper}>
            <Input
              label=""
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholder="Enter new password"
              style={styles.input}
              editable={!isChanging}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
              disabled={isChanging}
            >
              <FontelloIcon
                name={showNewPassword ? 'eye' : 'eye-off'}
                size={18}
                color="#999"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Requirements */}
        {newPassword.length > 0 && (
          <View style={styles.requirementsCard}>
            <View style={styles.requirementsHeader}>
              <FontelloIcon name="shield" size={14} color={THEME_COLORS.primary} />
              <Text style={styles.requirementsTitle}>Password Requirements</Text>
            </View>
            {passwordRequirements.map((req) => (
              <View key={req.text} style={styles.requirementRow}>
                <View
                  style={[
                    styles.requirementCheck,
                    req.met && styles.requirementCheckMet,
                  ]}
                >
                  {req.met ? (
              <FontelloIcon name="check" size={11} color="#fff" />
                  ) : (
                    <View style={styles.requirementDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.requirementText,
                    req.met && styles.requirementTextMet,
                  ]}
                >
                  {req.text}
                </Text>
              </View>
            ))}
            {/* Progress indicator */}
            <View style={styles.requirementProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(passwordRequirements.filter(r => r.met).length / passwordRequirements.length) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {passwordRequirements.filter(r => r.met).length}/{passwordRequirements.length}
              </Text>
            </View>
          </View>
        )}

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <FontelloIcon name="lock-open" size={13} color={THEME_COLORS.text} /> Confirm New Password
          </Text>
          <View style={styles.inputWrapper}>
            <Input
              label=""
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Re-enter new password"
              style={styles.input}
              editable={!isChanging}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isChanging}
            >
              <FontelloIcon
                name={showConfirmPassword ? 'eye' : 'eye-off'}
                size={18}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && (
            <View style={styles.matchIndicator}>
              {passwordsMatch ? (
                <View style={styles.matchSuccess}>
                  <FontelloIcon name="check" size={12} color="#10B981" />
                  <Text style={styles.matchSuccessText}>Passwords match</Text>
                </View>
              ) : (
                <View style={styles.matchError}>
                  <FontelloIcon name="cancel" size={12} color="#EF4444" />
                  <Text style={styles.matchErrorText}>
                    Passwords do not match
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              (!allRequirementsMet || !passwordsMatch || !currentPassword || isChanging) &&
                styles.buttonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={
              !allRequirementsMet || !passwordsMatch || !currentPassword || isChanging
            }
          >
            {isChanging ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isChanging}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIconContainer}>
              <FontelloIcon name="lightbulb" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.tipsTitle}>Security Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Use a unique password for each account
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Avoid common words or personal information
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Consider using a password manager
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Change your password regularly
              </Text>
            </View>
          </View>
        </View>
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
    ...STYLE.header,
  },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  headerPlaceholder: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  infoTextContainer: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    marginBottom: 0,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.LightBg,
    backgroundColor: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
    padding: 4,
  },
  requirementsCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  requirementCheckMet: {
    backgroundColor: '#10B981',
  },
  requirementDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#9CA3AF',
  },
  requirementText: {
    fontSize: 13,
    color: '#6B7280',
  },
  requirementTextMet: {
    color: '#10B981',
    fontWeight: '500',
  },
  requirementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 28,
    textAlign: 'right',
  },
  matchIndicator: {
    marginTop: 6,
  },
  matchSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
  matchSuccessText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  matchError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
  },
  matchErrorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  buttonGroup: {
    marginTop: 6,
    marginBottom: 16,
  },
  button: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  tipsCard: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  tipsIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  tipBullet: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
});
