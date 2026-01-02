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
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../constants/colors';
import FontelloIcon from '../../utils/FontelloIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SCREENS, RootStackParamList } from '../../constants/navigation';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import useStore from '../../hooks/useStore';
import apiClient, { APIError } from '../../utils/ApiClient';
import { AUTH_URLS } from '../../constants/apis';

export default function Profile() {
  const clearToken = useStore(state => state.clearToken);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);

  // Height of headerGradient section (should match its style)
  const [headerHeight, setHeaderHeight] = useState(0);
  const handleHeaderLayout = (event: any) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(AUTH_URLS.PROFILE);

      if (response.state === 1 && response.profile) {
        setProfile(response.profile);
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error) {
      let errorMessage = 'Failed to load profile';

      if (error instanceof APIError) {
        if (error.type === 'network') {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Pull-to-refresh state and handler
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
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
      if (asset && asset.uri) {
        setAvatarUri(asset.uri);
      }
    });
  };
  const insets = useSafeAreaInsets();

  const animation = useRef(new Animated.Value(0)).current; // 0 → blue, 1 → green
  useEffect(() => {
    Animated.timing(animation, {
      toValue: scrolledPastHeader ? 1 : 0,
      duration: 800, // 👈 smooth transition time (ms)
      useNativeDriver: false, // required for color animation
    }).start();
  }, [scrolledPastHeader, animation]);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    setScrolledPastHeader(y > headerHeight);
  };
  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME_COLORS.primary, '#f8f9fa'], // blue → green
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
        overScrollMode='always'
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
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarContainer}
            >
              <Image
                source={
                  avatarUri
                    ? { uri: avatarUri }
                    : profile?.photo
                    ? { uri: profile.photo }
                    : require('../../assets/images/calendar-woman2.png')
                }
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <FontelloIcon name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>
              {profile
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
                : 'Loading...'}
            </Text>
            <Text style={styles.userEmail}>{profile?.email || ''}</Text>

            <TouchableOpacity style={styles.editProfileBtn}>
              <FontelloIcon name="pencil" size={16} color="#fff" />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <FontelloIcon
                name="calendar"
                size={24}
                color={THEME_COLORS.primary}
              />
            </View>
            <Text style={styles.statValue}>{profile?.age || '--'}</Text>
            <Text style={styles.statLabel}>Age (years)</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <FontelloIcon
                name="balanceScale"
                size={24}
                color={THEME_COLORS.primary}
              />
            </View>
            <Text style={styles.statValue}>{profile?.weight || '--'}</Text>
            <Text style={styles.statLabel}>Weight (kg)</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <FontelloIcon
                name="person"
                size={24}
                color={THEME_COLORS.primary}
              />
            </View>
            <Text style={styles.statValue}>{profile?.height || '--'}</Text>
            <Text style={styles.statLabel}>Height (cm)</Text>
          </View>
        </View>

        {/* Cycle Information Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cycle Information</Text>
            <FontelloIcon name="heart" size={18} color={THEME_COLORS.primary} />
          </View>

          <View style={styles.cycleInfoRow}>
            <View style={styles.cycleInfoItem}>
              <View style={styles.cycleInfoIconBox}>
                <Text style={styles.cycleInfoIcon}>📅</Text>
              </View>
              <View style={styles.cycleInfoText}>
                <Text style={styles.cycleInfoLabel}>Cycle Length</Text>
                <Text style={styles.cycleInfoValue}>
                  {profile?.cycleLength || profile?.cycle_length || '--'} days
                </Text>
              </View>
            </View>

            <View style={styles.cycleInfoItem}>
              <View style={styles.cycleInfoIconBox}>
                <Text style={styles.cycleInfoIcon}>🩸</Text>
              </View>
              <View style={styles.cycleInfoText}>
                <Text style={styles.cycleInfoLabel}>Period Length</Text>
                <Text style={styles.cycleInfoValue}>
                  {profile?.periodLength || profile?.period_length || '--'} days
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.lifestyleBtn}
            onPress={() => navigation.navigate(SCREENS.LIFESTYLE_DETAILS)}
          >
            <View style={styles.lifestyleBtnContent}>
              <View style={styles.lifestyleBtnIcon}>
                <FontelloIcon name="chart-line" size={20} color="#fff" />
              </View>
              <View style={styles.lifestyleBtnText}>
                <Text style={styles.lifestyleBtnTitle}>
                  View Lifestyle Details
                </Text>
                <Text style={styles.lifestyleBtnSubtitle}>
                  Track your health journey
                </Text>
              </View>
            </View>
            <FontelloIcon
              name="right-open-mini"
              size={20}
              color={THEME_COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <FontelloIcon name="cog-b" size={18} color={THEME_COLORS.primary} />
          </View>

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

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
              <View style={styles.preferenceIconBox}>
                <FontelloIcon
                  name="moon"
                  size={20}
                  color={THEME_COLORS.primary}
                />
              </View>
              <View>
                <Text style={styles.preferenceLabel}>Dark Mode</Text>
                <Text style={styles.preferenceSubtext}>Easy on the eyes</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ddd', true: THEME_COLORS.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
            <FontelloIcon name="user" size={18} color={THEME_COLORS.primary} />
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
    marginHorizontal: 20,
    marginTop: -20,
    gap: 12,
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
    marginHorizontal: 20,
    marginTop: 20,
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
  cycleInfoRow: {
    gap: 12,
  },
  cycleInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 12,
  },
  cycleInfoIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cycleInfoIcon: {
    fontSize: 24,
  },
  cycleInfoText: {
    flex: 1,
  },
  cycleInfoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
    fontWeight: '500',
  },
  cycleInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  lifestyleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0e6ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  lifestyleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lifestyleBtnIcon: {
    width: 44,
    height: 44,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lifestyleBtnText: {
    flex: 1,
  },
  lifestyleBtnTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  lifestyleBtnSubtitle: {
    fontSize: 12,
    color: '#999',
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
    marginBottom: 16,
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
});
