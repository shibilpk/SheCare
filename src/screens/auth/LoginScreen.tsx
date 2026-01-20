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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Button } from '../../components';
import { TouchableOpacity } from 'react-native';
import apiClient, { APIError } from '../../utils/ApiClient';
import { THEME_COLORS } from '../../constants/colors';
import useStore from '../../hooks/useStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { APIS } from '../../constants/apis';

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const safeAreaInsets = useSafeAreaInsets();

  const setToken = useStore(state => state.setToken);

  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(emailValue)) {
      setEmailError('Email is invalid');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setCheckingUser(true);
    try {
      // Check if user exists
      const response = await apiClient.post<any>(
        APIS.V1.AUTH.CHECK_USER,
        { email },
        { is_auth: false },
      );

      if (response.state === 1) {
        setUserExists(response.exists);
        if (!response.exists) {
          Alert.alert(
            'User Not Found',
            'This email is not registered. Please create an account.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Register',
                onPress: () => navigation.replace(SCREENS.REGISTER),
              },
            ],
          );
        }
      }
    } catch (error) {
      const apiError = error as APIError;
      Alert.alert('Error', apiError.message || 'Failed to check user');
      // For demo purposes, allow to proceed
      setUserExists(true);
    } finally {
      setCheckingUser(false);
    }
  };

  const handlePasswordLogin = async () => {
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
      const response = await apiClient.post<any>(
        APIS.V1.AUTH.LOGIN,
        { email, password },
        { is_auth: false },
      );

      if (response.state === 1 && response.access && response.refresh) {
        setToken(response.access, response.refresh);
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      const apiError = error as APIError;
      let errorMessage = apiError.message;

      if (apiError.statusCode === 401) {
        errorMessage = 'Invalid email or password';
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post<any>(
        APIS.V1.AUTH.SEND_OTP,
        { email },
        { is_auth: false },
      );

      if (response.state === 1) {
        Alert.alert('Success', 'OTP has been sent to your email');
        navigation.navigate(SCREENS.OTP_VERIFICATION, {
          email,
          isLoginFlow: true,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error) {
      const apiError = error as APIError;
      Alert.alert('Failed', apiError.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setUserExists(null);
    setPassword('');
    setPasswordError('');
  };

  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: safeAreaInsets.top }]}
        keyboardVerticalOffset={24}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <Image
              source={require('../../assets/images/calendar-woman.png')}
              style={styles.calendarWoman}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>We are glad you are here</Text>
            <View style={styles.form}>
              {/* Email Input - Always visible */}
              <Input
                label="Email"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setEmailError('');
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                error={emailError}
                editable={userExists === null}
              />

              {userExists === null ? (
                <>
                  <Button
                    title="Continue"
                    onPress={handleEmailSubmit}
                    loading={checkingUser}
                    disabled={checkingUser}
                  />
                  <Button
                    title="Create Account"
                    onPress={() => navigation.replace(SCREENS.REGISTER)}
                    variant="secondary"
                  />
                </>
              ) : (
                <>
                  {/* Email confirmed section */}
                  <TouchableOpacity
                    style={styles.changeEmailButton}
                    onPress={handleChangeEmail}
                  >
                    <Text style={styles.changeEmailText}>Change Email</Text>
                  </TouchableOpacity>

                  {/* Password Input - Only shown after email verification */}
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

                  <Button
                    title="Sign In with Password"
                    onPress={handlePasswordLogin}
                    loading={loading && password.length > 0}
                    disabled={loading}
                  />

                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.divider} />
                  </View>

                  <Button
                    title="Sign In with OTP"
                    onPress={handleOTPLogin}
                    variant="secondary"
                    loading={loading && password.length === 0}
                    disabled={loading}
                  />
                </>
              )}
            </View>

            {/* Social Login Buttons */}
            {userExists === null && (
              <View style={styles.socialLoginContainer}>
                <Text style={styles.socialLoginText}>Or sign in with</Text>
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
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  changeEmailButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  changeEmailText: {
    color: THEME_COLORS.primary || '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  socialLoginContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  socialLoginText: {
    fontSize: 14,
    marginBottom: 12,
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
  calendarWoman: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
});

export default LoginScreen;
