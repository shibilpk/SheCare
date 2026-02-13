import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Button } from '../../components';
import apiClient, { APIError } from '../../services/ApiClient';
import useStore from '../../store/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { APIS } from '../../constants/apis';
import LinearGradient from 'react-native-linear-gradient';
import FontelloIcon from '../../services/FontelloIcons';
import { STYLE } from '../../constants/app';
import {
  clearFieldError,
  FormErrors,
  validateRequiredFields,
  validateEmail,
  validatePhone,
  parseValidationErrors,
} from '../../utils/formUtils';
type InputMode = 'email' | 'phone';
// Types for login

type LoginData = {
  email: string;
  phone: string;
  password: string;
};

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [inputMode, setInputMode] = useState<InputMode>('email');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const safeAreaInsets = useSafeAreaInsets();

  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors<LoginData>>({});

  const setToken = useStore(state => state.setToken);

  const validateLoginForm = (): boolean => {
    let newErrors: FormErrors<LoginData> = {};

    // Required fields
    newErrors = {
      ...newErrors,
      ...validateRequiredFields(
        loginData,
        inputMode === 'email' ? ['email', 'password'] : ['phone', 'password'],
      ),
    };

    // Mode-specific validation
    if (inputMode === 'email' && !newErrors.email) {
      const err = validateEmail(loginData.email);
      if (err) newErrors.email = err;
    }

    if (inputMode === 'phone' && !newErrors.phone) {
      const err = validatePhone(loginData.phone);
      if (err) newErrors.phone = err;
    }

    // Password length
    if (!newErrors.password && loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordLogin = async () => {
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const payload =
        inputMode === 'email'
          ? { email: loginData.email, password: loginData.password }
          : { phone: loginData.phone, password: loginData.password };

      const response = await apiClient.post<any>(APIS.V1.AUTH.LOGIN, payload, {
        is_auth: false,
      });

      setToken(response.access, response.refresh);
    } catch (error) {
      const apiError = error as APIError;

      if (apiError.statusCode === 422 && apiError.data) {
        // Same behavior as Register screen
        setErrors(parseValidationErrors(apiError.data));
      } else {
        Alert.alert(
          apiError.normalizedError.title,
          apiError.normalizedError.message,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    const value = inputMode === 'email' ? loginData.email : loginData.phone;
    const error = inputMode === 'email' ? validateEmail(value) : validatePhone(value);

    if (error) {
      setErrors(prev => ({
        ...prev,
        [inputMode]: error,
      }));
      return;
    }

    setOtpLoading(true);
    try {
      const payload = inputMode === 'email' ? { email: loginData.email } : { phone: loginData.phone };

      const response = await apiClient.post<any>(
        APIS.V1.AUTH.SEND_OTP,
        payload,
        { is_auth: false },
      );

      Alert.alert('Success', `OTP has been sent to your ${inputMode}`);
      navigation.navigate(SCREENS.OTP_VERIFICATION, {
        email: inputMode === 'email' ? loginData.email : loginData.phone,
        isLoginFlow: true,
      });
    } catch (error) {
      const apiError = error as APIError;
      Alert.alert('Failed', apiError.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  const toggleInputMode = () => {
    setInputMode(inputMode === 'email' ? 'phone' : 'email');
    // Clear the errors for the current input mode field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[inputMode];
      return newErrors;
    });
  };

  const handleChange = (field: keyof LoginData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => clearFieldError(prev, field));
  };

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={['#FFF5F7', '#FFF', '#FFF']}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.container, { paddingTop: safeAreaInsets.top }]}
          keyboardVerticalOffset={24}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inner}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <Image
                  source={require('../../assets/images/calendar-woman.png')}
                  style={styles.calendarWoman}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Welcome Back! 👋</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
              </View>

              {/* Login Form Card */}
              <View style={styles.formCard}>
                <View style={styles.form}>
                  {/* Input Field with Switch Option */}
                  {inputMode === 'email' ? (
                    <>
                      <TouchableOpacity
                        onPress={toggleInputMode}
                        style={styles.switchModeLink}
                        activeOpacity={0.7}
                      >
                        <FontelloIcon name="mobile" size={14} color="#8B5CF6" />
                        <Text style={styles.switchModeText}>Use Mobile</Text>
                      </TouchableOpacity>
                      <Input
                        label="Email Address"
                        value={loginData.email}
                        onChangeText={text => {
                          handleChange('email', text);
                        }}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        error={errors.email}
                        autoCapitalize="none"
                      />
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={toggleInputMode}
                        style={styles.switchModeLink}
                        activeOpacity={0.7}
                      >
                        <FontelloIcon name="mail" size={14} color="#8B5CF6" />
                        <Text style={styles.switchModeText}>Use Email</Text>
                      </TouchableOpacity>
                      <Input
                        label="Phone Number"
                        value={loginData.phone}
                        onChangeText={text => {
                          handleChange('phone', text);
                        }}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        error={errors.phone}
                      />
                    </>
                  )}

                  <Input
                    label="Password"
                    value={loginData.password}
                    onChangeText={text => handleChange('password', text)}
                    placeholder="Enter your password"
                    secureTextEntry
                    error={errors.password}
                  />

                  {/* Primary Login Button */}
                  <Button
                    title="Sign In"
                    onPress={handlePasswordLogin}
                    loading={loading}
                    disabled={loading || otpLoading}
                  />

                  {/* OTP Login Link */}
                  <TouchableOpacity
                    onPress={handleOTPLogin}
                    style={styles.otpLink}
                    disabled={loading || otpLoading}
                    activeOpacity={0.7}
                  >
                    {otpLoading ? (
                      <Text style={styles.otpLinkText}>Sending OTP...</Text>
                    ) : (
                      <>
                        <FontelloIcon name="key" size={14} color="#8B5CF6" />
                        <Text style={styles.otpLinkText}>
                          Login with OTP instead
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Social Login Section */}
              <View style={styles.socialSection}>
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Or continue with</Text>
                  <View style={styles.divider} />
                </View>
                <View style={styles.socialLoginContainer}>
                  <View style={styles.socialIconsRow}>
                    <TouchableOpacity
                      style={styles.socialIconButton}
                      onPress={() => {
                        handleSocialLogin('Google');
                      }}
                    >
                      <Image
                        source={require('../../assets/images/icons/icons8-google-50.png')}
                        style={styles.socialIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialIconButton}
                      onPress={() => {
                        handleSocialLogin('Facebook');
                      }}
                    >
                      <Image
                        source={require('../../assets/images/icons/icons8-github-50.png')}
                        style={styles.socialIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialIconButton}
                      onPress={() => {
                        handleSocialLogin('Instagram');
                      }}
                    >
                      <Image
                        source={require('../../assets/images/icons/icons8-instagram-50.png')}
                        style={styles.socialIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Sign Up Section */}
              <View style={styles.signupSection}>
                <Text style={styles.signupPrompt}>Don't have an account?</Text>
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={() => navigation.replace(SCREENS.REGISTER)}
                  activeOpacity={0.9}
                >
                  <Button
                    title="Sign up"
                    onPress={() => navigation.replace(SCREENS.REGISTER)}
                    loading={loading}
                    disabled={loading || otpLoading}
                    variant="secondary"
                    style={{ marginHorizontal: STYLE.spacing.mh }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: STYLE.spacing.ph,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  calendarWoman: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '500',
  },

  // Form Card
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: STYLE.spacing.mv,
  },

  // Form
  form: {
    width: '100%',
  },

  // Switch Mode Link
  switchModeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginTop: -8,
    marginBottom: 16,
  },
  switchModeText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // OTP Link
  otpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
    gap: 6,
  },
  otpLinkText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // Social Section
  socialSection: {
    marginBottom: STYLE.spacing.mv,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: STYLE.spacing.mv,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Sign Up Section
  signupSection: {
    alignItems: 'center',
    gap: 12,
  },
  signupPrompt: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  signupButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  socialLoginContainer: {
    alignItems: 'center',
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  socialIconButton: {
    borderRadius: 24,
    padding: 10,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  socialIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
});

export default LoginScreen;
