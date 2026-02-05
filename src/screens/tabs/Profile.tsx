import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Animated,
  RefreshControl,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../constants/colors';
import FontelloIcon from '../../services/FontelloIcons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { SCREENS, RootStackParamList } from '../../constants/navigation';
import { Input, KeyboardAvoidingModal, DatePicker } from '../../components';
import { PopupScreen } from '../../components/common/PopupWizard';
import { usePopupWizard } from '../../services/PopupWizardManager';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import useStore from '../../hooks/useStore';
import apiClient, { APIError } from '../../services/ApiClient';
import { APIS } from '../../constants/apis';
import AdBanner from '../../components/common/AdBanner';
import { SAMPLE_ADS, AD_PLACEMENTS, trackAdClick } from '../../constants/ads';
import { STYLE } from '../../constants/app';
import { useToastMessage } from '@src/utils/toastMessage';
import {
  clearFieldError,
  FormErrors,
  parseValidationErrors,
  validateRequiredFields,
} from '@src/utils/formUtils';

export default function Profile() {
  const clearToken = useStore(state => state.clearToken);
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const { showWizard } = usePopupWizard();

  interface WeightResponse {
    weight: string;
    unit: string;
  }

  interface ProfileResponse {
    email: string;
    name: string;
    phone?: string;
    photo?: string;
    age?: number;
    date_of_birth?: string;
    address?: string;
    height?: number;
    weight?: WeightResponse;
    cycleLength?: number;
    cycle_length?: number;
    periodLength?: number;
    period_length?: number;
    lutealPhase?: number;
    luteal_phase?: number;
  }

  interface ProfileUpdate {
    user?: {
      first_name?: string;
    };
    name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    address?: string;
    height?: number;
    height_unit?: string;
    cycle_length?: number;
    period_length?: number;
    luteal_phase?: number;
  }
  interface WeightData {
    weight?: string;
    weight_unit?: string;
    weight_date?: string;
  }
  type ProfileErrorKey = {
    height?: string;
    weight?: string;
    phone?: string;
    weight_unit?: string;
    weight_date?: string;
  };
  type ProfileErrors = FormErrors<ProfileErrorKey>;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileUpdate, setProfileUpdate] = useState<ProfileUpdate>({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [weightData, setWeightData] = useState<WeightData>({});
  const [height, setHeight] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [unit, setUnit] = useState('kg');
  const [editField, setEditField] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});

  // Cycle Information States
  const [cycleLength, setCycleLength] = useState('');
  const [periodLength, setPeriodLength] = useState('');
  const [lutealPhase, setLutealPhase] = useState('');
  const [useCycleAverage, setUseCycleAverage] = useState(false);
  const [usePeriodAverage, setUsePeriodAverage] = useState(false);
  const [useLutealAverage, setUseLutealAverage] = useState(false);
  const { showToast } = useToastMessage();
  type AvatarFile = {
    uri: string;
    name: string;
    type: string;
  };
  const [avatar, setAvatar] = useState<AvatarFile | null>(null);
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);

  const [headerHeight, setHeaderHeight] = useState(0);
  const handleHeaderLayout = (event: any) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };

  const appendFormDataRecursively = (
    formData: FormData,
    data: any,
    parentKey = '',
  ) => {
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      const formKey = parentKey ? `${parentKey}.${key}` : key;

      if (value instanceof File || value instanceof Blob) {
        formData.append(formKey, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          appendFormDataRecursively(formData, { [index]: item }, formKey);
        });
      } else if (typeof value === 'object') {
        appendFormDataRecursively(formData, value, formKey);
      } else {
        formData.append(formKey, String(value));
      }
    });
  };

  const validateWeightForm = (): boolean => {
    let newErrors: FormErrors<WeightData> = {};

    // Required fields
    newErrors = {
      ...newErrors,
      ...validateRequiredFields(weightData, [
        'weight',
        'weight_unit',
        'weight_date',
      ]),
    };

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let dataToUpdate: ProfileUpdate = {};
      const formData = new FormData();
      let update_api = APIS.V1.CUSTOMER.PROFILE;
      if (editField === 'age') {
        if (profileUpdate.date_of_birth) {
          formData.append(
            'date_of_birth',
            new Date(profileUpdate.date_of_birth).toISOString().split('T')[0],
          );
        }
      } else if (editField === 'weight') {
        if (!validateWeightForm()) return;
        appendFormDataRecursively(formData, weightData);
        update_api = APIS.V1.CUSTOMER.WEIGHT_ENTRY;
      } else if (editField === 'height') {
        formData.append('height', height);
      } else if (editField === 'name') {
        dataToUpdate.name = name;
      } else if (editField === 'phone') {
        dataToUpdate.phone = phone;
      } else if (editField === 'cycle') {
        if (cycleLength) dataToUpdate.cycle_length = parseInt(cycleLength);
        if (periodLength) dataToUpdate.period_length = parseInt(periodLength);
        if (lutealPhase) dataToUpdate.luteal_phase = parseInt(lutealPhase);
      }

      // Use recursive function to handle deeply nested objects
      appendFormDataRecursively(formData, profileUpdate);
      console.log(formData);

      const response = await apiClient.patch<any>(update_api, formData);

      if (response.profile) {
        setProfile(response.profile);
        setEditField(null);
        showToast(response.detail?.message || 'Profile updated successfully');
        setErrors({});
      } else {
        showToast('Failed to update profile', { type: 'danger' });
      }
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

  const handleWightChange = (field: keyof WeightData, value: string) => {
    // setLoginData(prev => ({ ...prev, [field]: value }));
    // setWeightData({ ...weightData, weight: text })
    setWeightData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => clearFieldError(prev, field));
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(APIS.V1.CUSTOMER.PROFILE);

      if (response.profile) {
        setProfile(response.profile);
        setName(response.profile.name || '');
        setPhone(response.profile.phone || '');
        setHeight(response.profile.height?.toString() || '');
        setCycleLength(
          (
            response.profile.cycleLength || response.profile.cycle_length
          )?.toString() || '',
        );
        setPeriodLength(
          (
            response.profile.periodLength || response.profile.period_length
          )?.toString() || '',
        );
        setLutealPhase(
          (
            response.profile.lutealPhase || response.profile.luteal_phase
          )?.toString() || '',
        );
      } else {
        showToast('Failed to load profile data');
      }
    } catch (error) {
      const apiError = error as APIError;
      showToast(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async (imageFile: AvatarFile) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append('photo', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
      } as any);

      const response = await apiClient.patch<any>(
        APIS.V1.CUSTOMER.PROFILE,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      if (response.profile) {
        setProfile(response.profile);
        setAvatar(null);
        Alert.alert('Success', 'Profile picture updated');
      } else {
        Alert.alert('Error', 'Failed to update profile picture');
      }
    } catch (error) {
      const apiError = error as APIError;
      Alert.alert('Error', apiError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  // PopupWizard Demo Configuration
  const wizardScreens: PopupScreen[] = [
    {
      id: 'welcome',
      imageUrl:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      title: 'Welcome to SheCare',
      message:
        "Let's personalize your health journey with a few quick questions.",
      formType: 'none',
      buttonText: "Let's Start",
      allowSkip: true,
    },
    {
      id: 'trackCycle',
      icon: 'calendar',
      title: 'Track Your Cycle?',
      message:
        'Would you like to enable menstrual cycle tracking and predictions?',
      formType: 'yesno',
      allowSkip: true,
    },
    {
      id: 'reminderTime',
      icon: 'bell',
      title: 'Reminder Time',
      message:
        'What time would you like to receive your daily health reminders?',
      formType: 'datepicker',
      allowSkip: false,
    },
    {
      id: 'goalWeight',
      icon: 'balance-scale',
      title: 'Health Goal',
      message: 'What is your target weight? (Optional)',
      formType: 'input',
      inputPlaceholder: 'e.g., 65',
      inputKeyboardType: 'numeric',
      allowSkip: true,
    },
  ];

  const handleWizardComplete = async (data: Record<string, any>) => {
    console.log('Wizard completed with data:', data);

    try {
      // Send data to API
      const response = await apiClient.post('/user/preferences', data);
      Alert.alert('Success', 'Your preferences have been saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Handle error gracefully without crashing
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Preferences Saved',
        `Settings saved locally.\n\n${JSON.stringify(data, null, 2)}`,
      );
    }
  };

  const handleWizardSkip = () => {
    Alert.alert('Skipped', 'You can access this later from settings.');
  };

  const pickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.7,
      selectionLimit: 1,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'ImagePicker error');
        return;
      }
      const asset: Asset | undefined = response.assets && response.assets[0];
      if (asset?.uri) {
        const imageFile = {
          uri: asset.uri,
          name: asset.fileName ?? 'avatar.jpg',
          type: asset.type ?? 'image/jpeg',
        };

        setAvatar(imageFile);
        updateProfilePicture(imageFile);
      }
    });
  };

  const insets = useSafeAreaInsets();

  const animation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animation, {
      toValue: scrolledPastHeader ? 1 : 0,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [scrolledPastHeader, animation]);

  useEffect(() => {
    console.log(profileUpdate, 'profileUpdate');
  }, [profileUpdate]);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    setScrolledPastHeader(y > headerHeight);
  };

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME_COLORS.primary, '#f8f9fa'],
  });

  return (
    <SafeAreaView style={[styles.container]} edges={['top']}>
      <Animated.View
        style={[
          {
            height: insets.top,
            backgroundColor,
          },
          styles.statusBar,
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME_COLORS.primary]}
            tintColor={THEME_COLORS.primary}
          />
        }
      >
        {/* Header Profile Section */}
        <View style={styles.headerGradient} onLayout={handleHeaderLayout}>
          {/* Settings Icon */}
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.settingsBtn}
          >
            <FontelloIcon name="cog-b" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarContainer}
            >
              <Image
                source={
                  avatar?.uri
                    ? { uri: avatar.uri }
                    : profile?.photo
                      ? { uri: profile.photo }
                      : require('../../assets/images/calendar-woman2.png')
                }
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <FontelloIcon name="camera-outline" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>
              {profile
                ? `${profile.name || ''}`.trim() || 'User'
                : 'Loading...'}
            </Text>
            <Text style={styles.userEmail}>{profile?.email || ''}</Text>

            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => setEditField('profile')}
            >
              <FontelloIcon name="pencil" size={16} color="#fff" />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Stats Cards */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              setProfileUpdate({
                date_of_birth:
                  profile?.date_of_birth || new Date().toISOString(),
              });
              setEditField('age');
            }}
          >
            <View style={styles.statIconContainer}>
              <FontelloIcon
                name="calendar"
                size={24}
                color={THEME_COLORS.primary}
              />
            </View>
            <Text style={styles.statValue}>{profile?.age || '--'}</Text>
            <Text style={styles.statLabel}>Age (years)</Text>
            <View style={styles.editBtn}>
              <FontelloIcon name="pencil" size={12} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              setWeightData({
                weight: '',
                weight_unit: 'kg',
                weight_date: new Date().toISOString().split('T')[0],
              });
              setEditField('weight');
            }}
          >
            <View style={styles.statIconContainer}>
              <FontelloIcon
                name="balance-scale"
                size={24}
                color={THEME_COLORS.primary}
              />
            </View>
            <Text style={styles.statValue}>
              {profile?.weight?.weight || '--'}
            </Text>
            <Text style={styles.statLabel}>
              Weight ({profile?.weight?.unit || 'kg'})
            </Text>
            <View style={styles.editBtn}>
              <FontelloIcon name="pencil" size={12} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              setHeight(profile?.height?.toString() || '');
              setEditField('height');
            }}
          >
            <View style={styles.statIconContainer}>
              <FontelloIcon
                name="person"
                size={24}
                color={THEME_COLORS.primary}
              />
            </View>
            <Text style={styles.statValue}>{profile?.height || '--'}</Text>
            <Text style={styles.statLabel}>Height (cm)</Text>
            <View style={styles.editBtn}>
              <FontelloIcon name="pencil" size={12} color="#999" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Banner Ad - After Stats */}
        <AdBanner
          ads={SAMPLE_ADS}
          size="banner"
          autoRotate={true}
          rotationInterval={6000}
          onAdClick={ad => {
            trackAdClick(ad.id, AD_PLACEMENTS.PROFILE_TOP);
            console.log('Ad clicked:', ad.title);
          }}
          showCloseButton={false}
          containerStyle={styles.addContainer}
        />

        {/* Banner Ad - After Stats */}
        <AdBanner
          ads={SAMPLE_ADS}
          size="fullpage"
          autoRotate={true}
          rotationInterval={6000}
          onAdClick={ad => {
            trackAdClick(ad.id, AD_PLACEMENTS.PROFILE_TOP);
            console.log('Ad clicked:', ad.title);
          }}
          showCloseButton={false}
          containerStyle={styles.addContainer}
        />

        {/* Cycle Information Cards */}

        <View style={[styles.sectionCard, styles.container]}>
          <TouchableOpacity
            onPress={() => {
              setCycleLength(
                (profile?.cycleLength || profile?.cycle_length)?.toString() ||
                  '',
              );
              setPeriodLength(
                (profile?.periodLength || profile?.period_length)?.toString() ||
                  '',
              );
              setLutealPhase(
                (profile?.lutealPhase || profile?.luteal_phase)?.toString() ||
                  '',
              );
              setEditField('cycle');
            }}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Cycle Information</Text>
              </View>

              <FontelloIcon name="pencil" size={16} color="#999" />
            </View>

            {/* Cycle Phase Timeline */}
            <View style={styles.cycleTimelineContainer}>
              {/* Cycle Length Numbers Line */}
              <View style={styles.cycleLengthLine}>
                <View style={styles.cycleLengthDash} />
                <View style={styles.cycleLengthCenter}>
                  <Text style={styles.cycleLengthLabel}>Days Cycle</Text>
                </View>
                <View style={styles.cycleLengthDash} />
              </View>
              <View style={styles.cycleTimeline}>
                <View
                  style={[
                    styles.cyclePhaseBar,
                    {
                      flex:
                        (profile?.periodLength || profile?.period_length || 5) /
                        (profile?.cycleLength || profile?.cycle_length || 28),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#DC2626', '#EF4444']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cyclePhaseGradient}
                  >
                    <Text style={styles.cyclePhaseText}>Period</Text>
                  </LinearGradient>
                </View>
                <View
                  style={[
                    styles.cyclePhaseBar,
                    {
                      flex:
                        ((profile?.cycleLength || profile?.cycle_length || 28) -
                          (profile?.lutealPhase ||
                            profile?.luteal_phase ||
                            14) -
                          (profile?.periodLength ||
                            profile?.period_length ||
                            5)) /
                        (profile?.cycleLength || profile?.cycle_length || 28),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#F87171', '#FCA5A5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cyclePhaseGradient}
                  >
                    <Text style={styles.cyclePhaseText}>Follicular</Text>
                  </LinearGradient>
                </View>
                <View
                  style={[
                    styles.cyclePhaseBar,
                    {
                      flex:
                        (profile?.lutealPhase || profile?.luteal_phase || 14) /
                        (profile?.cycleLength || profile?.cycle_length || 28),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#FFC0CB', '#FFE4E1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.cyclePhaseGradient}
                  >
                    <Text style={styles.cyclePhaseText}>Luteal</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Cycle Data Below Graph */}
              <View style={styles.cycleDataContainer}>
                <View style={styles.cycleDataItem}>
                  <View style={styles.cycleIconContainer}>
                    <FontelloIcon
                      name="calendar"
                      size={16}
                      color={THEME_COLORS.primary}
                    />
                  </View>
                  <View style={styles.cycleDataTextContainer}>
                    <Text style={styles.cycleDataLabel}>Cycle Length</Text>
                    <Text style={styles.cycleDataValue}>
                      {profile?.cycleLength || profile?.cycle_length || 28} days
                    </Text>
                  </View>
                </View>
                <View style={styles.cycleDataItem}>
                  <View style={styles.cycleIconContainer}>
                    <FontelloIcon
                      name="drop"
                      size={16}
                      color={THEME_COLORS.primary}
                    />
                  </View>
                  <View style={styles.cycleDataTextContainer}>
                    <Text style={styles.cycleDataLabel}>Period Length</Text>
                    <Text style={styles.cycleDataValue}>
                      {profile?.periodLength || profile?.period_length || 7}{' '}
                      days
                    </Text>
                  </View>
                </View>

                <View style={styles.cycleDataItem}>
                  <View style={styles.cycleIconContainer}>
                    <FontelloIcon
                      name="leaf"
                      size={16}
                      color={THEME_COLORS.primary}
                    />
                  </View>
                  <View style={styles.cycleDataTextContainer}>
                    <Text style={styles.cycleDataLabel}>Follicular Phase</Text>
                    <Text style={styles.cycleDataValue}>
                      {(profile?.cycleLength || profile?.cycle_length || 28) -
                        (profile?.lutealPhase || profile?.luteal_phase || 14) -
                        (profile?.periodLength ||
                          profile?.period_length ||
                          5)}{' '}
                      days
                    </Text>
                  </View>
                </View>

                <View style={styles.cycleDataItem}>
                  <View style={styles.cycleIconContainer}>
                    <FontelloIcon
                      name="moon"
                      size={16}
                      color={THEME_COLORS.primary}
                    />
                  </View>
                  <View style={styles.cycleDataTextContainer}>
                    <Text style={styles.cycleDataLabel}>Luteal Phase</Text>
                    <Text style={styles.cycleDataValue}>
                      {profile?.lutealPhase || profile?.luteal_phase || 14} days
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <AdBanner
          ads={SAMPLE_ADS}
          size="halfpage"
          autoRotate={true}
          rotationInterval={1000}
          onAdClick={ad => {
            trackAdClick(ad.id, AD_PLACEMENTS.PROFILE_MIDDLE);
            console.log('Half page ad clicked:', ad.title);
          }}
          showCloseButton={true}
          containerStyle={styles.addContainer}
        />

        {/* Personal Information */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <FontelloIcon name="user" size={18} color={THEME_COLORS.primary} />
          </View>
          {/* Info Rows if profile?.address exists */}

          {/* <View style={styles.divider} /> */}

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => {
              setPhone(profile?.phone || '');
              setEditField('phone');
            }}
          >
            <View style={styles.infoLeft}>
              <View style={styles.infoIconBox}>
                <FontelloIcon
                  name="mobile"
                  size={18}
                  color={THEME_COLORS.primary}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>
                  {profile?.phone || 'Not set'}
                </Text>
              </View>
            </View>
            <FontelloIcon name="pencil" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Banner Ad - Before Preferences */}
        <AdBanner
          ads={SAMPLE_ADS}
          size="banner"
          autoRotate={true}
          rotationInterval={7000}
          onAdClick={ad => {
            trackAdClick(ad.id, AD_PLACEMENTS.PROFILE_BOTTOM);
          }}
          showCloseButton={true}
          containerStyle={styles.addContainer}
        />

        {/* Preferences Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <FontelloIcon name="cog-b" size={18} color={THEME_COLORS.primary} />
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              navigation.navigate(SCREENS.THEME_SETTINGS);
            }}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#F3E5F5' }]}
              >
                <FontelloIcon name="palette" size={18} color="#9C27B0" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Theme & Appearance</Text>
                <Text style={styles.preferenceSubtext}>
                  Customize your look
                </Text>
              </View>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <View style={styles.preferenceIconBox}>
                <FontelloIcon
                  name="bell"
                  size={20}
                  color={THEME_COLORS.primary}
                />
              </View>
              <View>
                <Text style={styles.preferenceLabel}>Notifications</Text>
                <Text style={styles.preferenceSubtext}>
                  Get reminders & updates
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Alert.alert(
                'Privacy Settings',
                'Navigate to privacy settings screen',
              );
            }}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#E8F5E9' }]}
              >
                <FontelloIcon name="lock" size={18} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Privacy & Security</Text>
                <Text style={styles.preferenceSubtext}>Manage your data</Text>
              </View>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Alert.alert(
                'Language Settings',
                'Navigate to language settings screen',
              );
            }}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#FFF3E0' }]}
              >
                <FontelloIcon name="language" size={18} color="#FF9800" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Language</Text>
                <Text style={styles.preferenceSubtext}>English (US)</Text>
              </View>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Pregnancy turn on/off */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              navigation.navigate(SCREENS.PREGNANCY_SETTINGS);
            }}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#E1F5FE' }]}
              >
                <FontelloIcon name="emo-laugh" size={18} color="#0288D1" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Pregnancy Mode</Text>
                <Text style={styles.preferenceSubtext}>
                  Track pregnancy health
                </Text>
              </View>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
            <FontelloIcon
              name="shield"
              size={18}
              color={THEME_COLORS.primary}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate(SCREENS.CHANGE_PASSWORD)}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#E3F2FD' }]}
              >
                <FontelloIcon name="key" size={18} color="#2196F3" />
              </View>
              <Text style={styles.actionLabel}>Change Password</Text>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Alert.alert('Help & Support', 'Navigate to help center');
            }}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#F3E5F5' }]}
              >
                <FontelloIcon name="help-circled" size={18} color="#9C27B0" />
              </View>
              <Text style={styles.actionLabel}>Help & Support</Text>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => showWizard(wizardScreens, handleWizardComplete)}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#E1F5FE' }]}
              >
                <FontelloIcon name="magic" size={18} color="#0288D1" />
              </View>
              <Text style={styles.actionLabel}>Try Popup Wizard</Text>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => clearToken()}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#FFF3E0' }]}
              >
                <FontelloIcon name="logout" size={18} color="#FF9800" />
              </View>
              <Text style={styles.actionLabel}>Logout</Text>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={() => navigation.navigate(SCREENS.DELETE_ACCOUNT)}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <View
                style={[styles.actionIconBox, { backgroundColor: '#FFEBEE' }]}
              >
                <FontelloIcon name="trashEmpty" size={18} color="#F44336" />
              </View>
              <Text style={[styles.actionLabel, { color: '#F44336' }]}>
                Delete Account
              </Text>
            </View>
            <FontelloIcon name="right-open-mini" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>FemCare v1.0.0</Text>
          <Text style={styles.versionSubtext}>
            Made with 💜 for women's health
          </Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <KeyboardAvoidingModal
        visible={editField !== null}
        onClose={() => {
          setEditField(null);
          setProfileUpdate({});
        }}
        showScrollView={true}
        title={
          (editField &&
            editField.charAt(0).toUpperCase() + editField.slice(1)) ||
          'Edit'
        }
      >
        {editField === 'profile' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={profileUpdate.user?.first_name ?? profile?.name ?? ''}
                onChangeText={text =>
                  setProfileUpdate(prev => ({
                    ...prev,
                    user: {
                      ...prev.user,
                      first_name: text,
                    },
                  }))
                }
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your address"
                value={profileUpdate.address ?? profile?.address ?? ''}
                onChangeText={text =>
                  setProfileUpdate(prev => ({
                    ...prev,
                    address: text,
                  }))
                }
              />
            </View>
          </>
        )}

        {editField === 'phone' && (
          <View style={styles.inputGroup}>
            <Input
              label="Phone Number"
              labelStyle={styles.inputLabel}
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={profileUpdate.phone ?? profile?.phone ?? ''}
              onChangeText={text =>
                setProfileUpdate(prev => ({
                  ...prev,
                  user: {
                    ...prev.user,
                    phone: text,
                  },
                }))
              }
              error={errors.phone}
            />
          </View>
        )}

        {editField === 'weight' && (
          <>
            <View style={styles.inputGroup}>
              <Input
                label="Weight"
                style={styles.input}
                labelStyle={styles.inputLabel}
                placeholder="Enter weight"
                keyboardType="numeric"
                value={weightData.weight}
                onChangeText={text => handleWightChange('weight', text)}
                error={errors.weight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Unit</Text>
              <View style={styles.unitRow}>
                <TouchableOpacity
                  onPress={() =>
                    setWeightData({ ...weightData, weight_unit: 'kg' })
                  }
                  style={[
                    styles.unitBtn,
                    weightData.weight_unit === 'kg' && styles.unitBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.unitText,
                      weightData.weight_unit === 'kg' && styles.unitTextActive,
                    ]}
                  >
                    kg
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setWeightData({ ...weightData, weight_unit: 'lb' })
                  }
                  style={[
                    styles.unitBtn,
                    weightData.weight_unit === 'lb' && styles.unitBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.unitText,
                      weightData.weight_unit === 'lb' && styles.unitTextActive,
                    ]}
                  >
                    lb
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <DatePicker
              label="Date"
              value={
                weightData.weight_date
                  ? new Date(weightData.weight_date)
                  : new Date()
              }
              onChange={date => {
                setWeightData({
                  ...weightData,
                  weight_date: date.toISOString().split('T')[0],
                });
              }}
              mode="date"
              maximumDate={new Date()}
            />
          </>
        )}

        {editField === 'height' && (
          <View style={styles.inputGroup}>
            <Input
              label="Height (cm)"
              style={styles.input}
              placeholder="Enter height"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
              error={errors.height}
            />
          </View>
        )}

        {editField === 'age' && (
          <DatePicker
            label="Date of Birth"
            value={
              profileUpdate.date_of_birth
                ? new Date(profileUpdate.date_of_birth)
                : profile?.date_of_birth
                  ? new Date(profile.date_of_birth)
                  : new Date()
            }
            onChange={date =>
              setProfileUpdate(prev => ({
                ...prev,
                date_of_birth: date.toISOString(),
              }))
            }
            mode="date"
            maximumDate={new Date()}
          />
        )}

        {editField === 'cycle' && (
          <>
            <View style={styles.cycleEditSection}>
              <View style={styles.cycleEditHeader}>
                <View>
                  <Text style={styles.cycleEditTitle}>Cycle Length</Text>
                  <Text style={styles.cycleEditDescription}>
                    The number of days from the first day of your period to the
                    day before your next period starts. Average is 28 days.
                  </Text>
                </View>
              </View>

              <View style={styles.cycleEditRow}>
                <View style={styles.cycleInputContainer}>
                  <TextInput
                    style={styles.cycleInput}
                    placeholder="28"
                    keyboardType="numeric"
                    value={cycleLength}
                    onChangeText={setCycleLength}
                    editable={!useCycleAverage}
                  />
                  <Text style={styles.cycleInputUnit}>days</Text>
                </View>
                <View style={styles.cycleSwitchContainer}>
                  <Text style={styles.cycleSwitchLabel}>Use Average</Text>
                  <Switch
                    value={useCycleAverage}
                    onValueChange={value => {
                      setUseCycleAverage(value);
                      if (value) setCycleLength('28');
                    }}
                    trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </View>

            <View style={styles.cycleDivider} />

            <View style={styles.cycleEditSection}>
              <View style={styles.cycleEditHeader}>
                <View>
                  <Text style={styles.cycleEditTitle}>Period Length</Text>
                  <Text style={styles.cycleEditDescription}>
                    The number of days your period typically lasts. Average is 5
                    days.
                  </Text>
                </View>
              </View>

              <View style={styles.cycleEditRow}>
                <View style={styles.cycleInputContainer}>
                  <TextInput
                    style={styles.cycleInput}
                    placeholder="5"
                    keyboardType="numeric"
                    value={periodLength}
                    onChangeText={setPeriodLength}
                    editable={!usePeriodAverage}
                  />
                  <Text style={styles.cycleInputUnit}>days</Text>
                </View>
                <View style={styles.cycleSwitchContainer}>
                  <Text style={styles.cycleSwitchLabel}>Use Average</Text>
                  <Switch
                    value={usePeriodAverage}
                    onValueChange={value => {
                      setUsePeriodAverage(value);
                      if (value) setPeriodLength('5');
                    }}
                    trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </View>

            <View style={styles.cycleDivider} />

            <View style={styles.cycleEditSection}>
              <View style={styles.cycleEditHeader}>
                <View>
                  <Text style={styles.cycleEditTitle}>Luteal Phase</Text>
                  <Text style={styles.cycleEditDescription}>
                    The number of days between ovulation and the start of your
                    next period. Average is 14 days.
                  </Text>
                </View>
              </View>

              <View style={styles.cycleEditRow}>
                <View style={styles.cycleInputContainer}>
                  <TextInput
                    style={styles.cycleInput}
                    placeholder="14"
                    keyboardType="numeric"
                    value={lutealPhase}
                    onChangeText={setLutealPhase}
                    editable={!useLutealAverage}
                  />
                  <Text style={styles.cycleInputUnit}>days</Text>
                </View>
                <View style={styles.cycleSwitchContainer}>
                  <Text style={styles.cycleSwitchLabel}>Use Average</Text>
                  <Switch
                    value={useLutealAverage}
                    onValueChange={value => {
                      setUseLutealAverage(value);
                      if (value) setLutealPhase('14');
                    }}
                    trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            </View>
          </>
        )}

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalCancelBtn}
            onPress={() => setEditField(null)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
            <Text style={styles.modalSaveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    backgroundColor: THEME_COLORS.primary,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  settingsBtn: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: THEME_COLORS.secondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editProfileBtnText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: -20,
    gap: 12,
    marginBottom: STYLE.spacing.mv,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0e6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: STYLE.spacing.mh,
    marginVertical: STYLE.spacing.mv,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cycleTimelineContainer: {
    marginTop: 0,
  },
  cycleLengthLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  cycleLengthDash: {
    flex: 1,
    height: 2,
    backgroundColor: '#9CA3AF',
  },
  cycleLengthCenter: {
    marginHorizontal: 4,
  },
  cycleLengthLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cycleTimeline: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cyclePhaseBar: {
    height: '100%',
  },
  cyclePhaseGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cyclePhaseText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cycleDataContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '4%',
  },
  cycleDataItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 10,
  },
  cycleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0E6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleDataTextContainer: {
    flex: 1,
  },
  cycleDataLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  cycleDataValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME_COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#f0e6ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#f0e6ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  preferenceSubtext: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  versionText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#bbb',
  },
  statusBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
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
  editBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  cycleEditSection: {
    marginBottom: 20,
  },
  cycleEditHeader: {
    marginBottom: 12,
  },
  cycleEditTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  cycleEditDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  cycleEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  cycleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  cycleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cycleInputUnit: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  cycleSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cycleSwitchLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  cycleDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  addContainer: {
    marginVertical: STYLE.spacing.mv,
    marginHorizontal: STYLE.spacing.mh,
  },
});
