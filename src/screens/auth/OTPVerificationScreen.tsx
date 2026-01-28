// First, install these packages:
// npm install react-native-otp-entry react-native-otp-verify
// npx pod-install (for iOS)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components';
import apiClient, { APIError } from '../../services/ApiClient';
import { THEME_COLORS } from '../../constants/colors';
import useStore from '../../hooks/useStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../constants/navigation';
import { OtpInput } from 'react-native-otp-entry';
import RNOtpVerify from 'react-native-otp-verify'; // For Android SMS auto-read
import { APIS } from '../../constants/apis';

type OTPVerificationRouteProp = RouteProp<
  RootStackParamList,
  'OTPVerification'
>;

const OTPVerificationScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<OTPVerificationRouteProp>();
  const { id, email = '', isLoginFlow = false } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const safeAreaInsets = useSafeAreaInsets();
  const setToken = useStore(state => state.setToken);
  const otpInputRef = useRef<any>(null);

  // Auto-read SMS OTP (Android only)
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Start listening for OTP
      RNOtpVerify.getOtp()
        .then(() => RNOtpVerify.addListener(otpHandler))
        .catch(console.error);

      // Get hash for SMS (you'll need this for your backend)
      RNOtpVerify.getHash()
        .then(hash => {
          console.log('SMS Hash:', hash); // Send this to your backend
        })
        .catch(console.error);

      return () => {
        RNOtpVerify.removeListener();
      };
    }
  }, []);

  // Handler for SMS OTP
  const otpHandler = (message: string) => {
    try {
      // Extract OTP from SMS message
      // Example: "Your OTP is 123456"
      const otpMatch = message.match(/\b\d{6}\b/);
      if (otpMatch) {
        const extractedOtp = otpMatch[0];
        setOtp(extractedOtp);
        // Auto-verify after a brief delay
        setTimeout(() => {
          handleVerifyOTP(extractedOtp);
        }, 500);
      }
    } catch (error) {
      console.error('Error parsing OTP from SMS:', error);
    }
  };

  // Auto-paste from clipboard on mount
  useEffect(() => {
    checkClipboard();
  }, []);

  const checkClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      // Check if clipboard contains a 6-digit number
      const otpMatch = clipboardContent.match(/^\d{6}$/);
      if (otpMatch) {
        Alert.alert(
          'OTP Detected',
          `Would you like to use the OTP from clipboard: ${clipboardContent}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Use OTP',
              onPress: () => {
                setOtp(clipboardContent);
                // Also manually set the value in the input if needed
                if (otpInputRef.current?.setValue) {
                  otpInputRef.current.setValue(clipboardContent);
                }
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();

      // Extract 6 digits if they exist anywhere in the clipboard
      const otpMatch = clipboardContent.match(/\d{6}/);

      if (otpMatch) {
        const extractedOtp = otpMatch[0];
        setOtp(extractedOtp);

        // Force update the input field
        if (otpInputRef.current?.setValue) {
          otpInputRef.current.setValue(extractedOtp);
        }

        Alert.alert('Success', 'OTP pasted successfully!');
      } else {
        Alert.alert(
          'No OTP Found',
          'Clipboard does not contain a valid 6-digit OTP',
        );
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const handleVerifyOTP = async (otpToVerify?: string) => {
    const otpValue = otpToVerify || otp;

    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLoginFlow
        ? APIS.V1.AUTH.LOGIN_WITH_OTP
        : APIS.V1.AUTH.getVerifyOTP(id || '');
      const response = await apiClient.post<any>(
        endpoint,
        { email, otp: otpValue },
        { is_auth: false },
      );

      if (isLoginFlow) {
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Success', 'OTP verified successfully!');
      }
      if (response.access && response.refresh) {
        setToken(response.access, response.refresh);
      }
    } catch (error) {
      const apiError = error as APIError;
      Alert.alert('Verification Failed', apiError.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await apiClient.post<any>(
        APIS.V1.AUTH.SEND_OTP,
        { email },
        { is_auth: false },
      );

      Alert.alert('Success', 'OTP has been resent to your email');
      setOtp('');
      // Clear the OTP input
      if (otpInputRef.current?.clear) {
        otpInputRef.current.clear();
      }
      startResendTimer();
    } catch (error) {
      const apiError = error as APIError;
      Alert.alert('Failed', apiError.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isOTPComplete = otp.length === 6;

  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: safeAreaInsets.top }]}
      >
        <View style={styles.inner}>
          <Image
            source={require('../../assets/images/calendar-woman.png')}
            style={styles.calendarWoman}
            resizeMode="contain"
          />

          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          {Platform.OS === 'android' && (
            <Text style={styles.autoReadHint}>
              📱 OTP will be auto-filled from SMS
            </Text>
          )}

          <View style={styles.otpContainer}>
            <OtpInput
              ref={otpInputRef}
              numberOfDigits={6}
              focusColor={THEME_COLORS.primary || '#E91E63'}
              focusStickBlinkingDuration={500}
              onTextChange={text => {
                setOtp(text);
              }}
              onFilled={text => {
                console.log('OTP filled:', text);
                setOtp(text);
              }}
              theme={{
                containerStyle: styles.otpInputContainer,
                pinCodeContainerStyle: styles.pinCodeContainer,
                pinCodeTextStyle: styles.pinCodeText,
                focusStickStyle: styles.focusStick,
                focusedPinCodeContainerStyle: styles.focusedPinCodeContainer,
              }}
              autoFocus
            />
          </View>

          <Text
            style={[
              styles.helperText,
              isOTPComplete && styles.helperTextSuccess,
            ]}
          >
            {isOTPComplete ? '✓ OTP complete' : 'Enter all 6 digits'}
          </Text>

          <TouchableOpacity
            onPress={handlePasteFromClipboard}
            style={styles.pasteButton}
          >
            <Text style={styles.pasteButtonText}>📋 Paste from Clipboard</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button
              title="Verify OTP"
              onPress={() => handleVerifyOTP()}
              loading={loading}
              disabled={loading || !isOTPComplete}
              style={[
                styles.submitButton,
                !isOTPComplete && styles.submitButtonDisabled,
              ]}
            />

            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resendLoading || resendTimer > 0}
              style={styles.resendContainer}
            >
              <Text style={styles.resendText}>
                {resendLoading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={THEME_COLORS.primary || '#E91E63'}
                    />{' '}
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend OTP in ${resendTimer}s`
                ) : (
                  "Didn't receive the code? "
                )}
                {!resendLoading && resendTimer === 0 && (
                  <Text style={styles.resendLink}>Resend OTP</Text>
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: THEME_COLORS.background || '#FFF5F7',
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  calendarWoman: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME_COLORS.primary || '#E91E63',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME_COLORS.text || '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: THEME_COLORS.primary || '#E91E63',
  },
  autoReadHint: {
    fontSize: 13,
    color: THEME_COLORS.success || '#4CAF50',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  otpContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  otpInputContainer: {
    width: '100%',
  },
  pinCodeContainer: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: THEME_COLORS.border || '#DDD',
    backgroundColor: '#FFF',
  },
  focusedPinCodeContainer: {
    borderColor: THEME_COLORS.primary || '#E91E63',
    borderWidth: 2,
  },
  pinCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.text || '#333',
  },
  focusStick: {
    backgroundColor: THEME_COLORS.primary || '#E91E63',
  },
  helperText: {
    fontSize: 12,
    color: THEME_COLORS.text || '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  helperTextSuccess: {
    color: THEME_COLORS.success || '#4CAF50',
  },
  pasteButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  pasteButtonText: {
    fontSize: 14,
    color: THEME_COLORS.primary || '#E91E63',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 16,
  },
  submitButton: {
    opacity: 1,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  resendContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    color: THEME_COLORS.text || '#666',
    textAlign: 'center',
  },
  resendLink: {
    color: THEME_COLORS.primary || '#E91E63',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: THEME_COLORS.primary || '#E91E63',
    fontWeight: '500',
  },
});

export default OTPVerificationScreen;
