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
import apiClient, { APIError } from '../../utils/ApiClient';
import { THEME_COLORS } from '../../constants/colors';
import useStore from '../../hooks/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { APIS } from '../../constants/apis';
import LinearGradient from 'react-native-linear-gradient';
import FontelloIcon from '../../utils/FontelloIcons';
import { STYLE } from '../../constants/app';

type InputMode = 'email' | 'phone';

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [inputMode, setInputMode] = useState<InputMode>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const safeAreaInsets = useSafeAreaInsets();

  const setToken = useStore(state => state.setToken);

  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setInputError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(emailValue)) {
      setInputError('Email is invalid');
      return false;
    }
    setInputError('');
    return true;
  };

  const validatePhone = (phoneValue: string) => {
    if (!phoneValue) {
      setInputError('Phone number is required');
      return false;
    } else if (!/^[0-9]{10}$/.test(phoneValue)) {
      setInputError('Phone number must be 10 digits');
      return false;
    }
    setInputError('');
    return true;
  };

  const handlePasswordLogin = async () => {
    const isValid =
      inputMode === 'email' ? validateEmail(email) : validatePhone(phone);
    if (!isValid) {
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordError('');
    setLoading(true);
    try {
      const payload =
        inputMode === 'email' ? { email, password } : { phone, password };

      const response = await apiClient.post<any>(APIS.V1.AUTH.LOGIN, payload, {
        is_auth: false,
      });

      if (response.state === 1 && response.access && response.refresh) {
        setToken(response.access, response.refresh);
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      const apiError = error as APIError;
      let errorMessage = apiError.message;
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    const isValid =
      inputMode === 'email' ? validateEmail(email) : validatePhone(phone);
    if (!isValid) {
      return;
    }

    setOtpLoading(true);
    try {
      const payload = inputMode === 'email' ? { email } : { phone };

      const response = await apiClient.post<any>(
        APIS.V1.AUTH.SEND_OTP,
        payload,
        { is_auth: false },
      );

      if (response.state === 1) {
        Alert.alert('Success', `OTP has been sent to your ${inputMode}`);
        navigation.navigate(SCREENS.OTP_VERIFICATION, {
          email: inputMode === 'email' ? email : phone,
          isLoginFlow: true,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
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
    setInputError('');
    setPasswordError('');
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
                      <Input
                        label="Email Address"
                        value={email}
                        onChangeText={text => {
                          setEmail(text);
                          setInputError('');
                        }}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        error={inputError}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={toggleInputMode}
                        style={styles.switchModeLink}
                        activeOpacity={0.7}
                      >
                        <FontelloIcon name="mobile" size={14} color="#8B5CF6" />
                        <Text style={styles.switchModeText}>
                          Use phone number instead
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Input
                        label="Phone Number"
                        value={phone}
                        onChangeText={text => {
                          setPhone(text);
                          setInputError('');
                        }}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        error={inputError}
                      />
                      <TouchableOpacity
                        onPress={toggleInputMode}
                        style={styles.switchModeLink}
                        activeOpacity={0.7}
                      >
                        <FontelloIcon name="mail" size={14} color="#8B5CF6" />
                        <Text style={styles.switchModeText}>
                          Use email instead
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <Input
                    label="Password"
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      setPasswordError('');
                    }}
                    placeholder="Enter your password"
                    secureTextEntry
                    error={passwordError}
                  />

                  {/* Primary Login Button */}
                  <Button
                    title="Sign In"
                    onPress={handlePasswordLogin}
                    loading={loading}
                    disabled={loading || otpLoading}
                    style={styles.primaryButton}
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
                      onPress={() => {}}
                    >
                      <Image
                        source={require('../../assets/images/icons/icons8-google-50.png')}
                        style={styles.socialIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialIconButton}
                      onPress={() => {}}
                    >
                      <Image
                        source={require('../../assets/images/icons/icons8-github-50.png')}
                        style={styles.socialIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialIconButton}
                      onPress={() => {}}
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
                  <LinearGradient
                    colors={['#EC4899', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.signupGradient}>
                      <Text style={styles.signupButtonText}>
                        Create Account
                      </Text>
                      <FontelloIcon name="right-open" size={18} color="#FFF" />
                    </View>
                  </LinearGradient>
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
    marginBottom: 24,
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
    gap: 6,
    marginTop: -8,
    marginBottom: 16,
  },
  switchModeText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  primaryButton: {
    marginTop: 8,
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
  signupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  signupButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
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
