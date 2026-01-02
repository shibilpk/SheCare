import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Modal, StatusBar } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GlobalModalContext from './GlobalContext';
import { SCREENS, type RootStackParamList } from '../constants/navigation';
import * as Screens from '../screens';
import { tabOptions, todayTabBarIcon } from '../components/widgets/TabIcon';
import useStore from '../hooks/useStore';
import { useIsDarkMode } from './theme';
import { THEME_COLORS } from '../constants/colors';
import AboutHomeModal from '../screens/tabs/AboutHomeModal';
import FontelloIcon from './FontelloIcons';
import ModalTopIcon from '../components/common/ModalTopIcon';
import { UpdateProvider, useUpdate } from './UpdateManager';

// Create navigation ref for accessing navigation outside React components
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();
const EmptyScreen = () => null;

/* ---------------------- Tabs ---------------------- */
function TabNavigator() {
  const modal = useContext(GlobalModalContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME_COLORS.primary,
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={Screens.HomeScreen}
        options={tabOptions('home', 'Home')}
      />
      <Tab.Screen
        name={SCREENS.CALENDAR}
        component={Screens.CalendarScreen}
        options={tabOptions("calendar", 'Calendar')}
      />
      <Tab.Screen
        name={SCREENS.TODAY}
        component={EmptyScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props: any) => todayTabBarIcon({ onPress: modal.open }),
        }}
      />
      <Tab.Screen
        name={SCREENS.ANALYSIS}
        component={Screens.AnalysisScreen}
        options={tabOptions('chart-bar', 'Analysis')}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={Screens.Profile}
        options={tabOptions('user', 'Profile')}
      />
    </Tab.Navigator>
  );
}

function SecondaryTabNavigator() {
  const modal = useContext(GlobalModalContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME_COLORS.primary,
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={Screens.SecondaryHomeScreen}
        options={tabOptions('home', 'Home')}
      />
      <Tab.Screen
        name={SCREENS.CALENDAR}
        component={Screens.CalendarScreen}
        options={tabOptions("calendar", 'Calendar')}
      />
      <Tab.Screen
        name={SCREENS.TODAY}
        component={EmptyScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props: any) => todayTabBarIcon({ onPress: modal.open }),
        }}
      />
      <Tab.Screen
        name={SCREENS.ANALYSIS}
        component={Screens.SecondaryAnalysisScreen}
        options={tabOptions('chart-line', 'Analysis')}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={Screens.Profile}
        options={tabOptions('user', 'Profile')}
      />
    </Tab.Navigator>
  );
}

/* ---------------------- Custom Drawer Content ---------------------- */
function CustomDrawerContent(props: any) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { showUpdate } = useUpdate();
  const isPregnant = useStore(state => state.isPregnant ?? false);
  const setIsPregnant = useStore(state => state.setIsPregnant ?? (() => {}));
  const clearToken = useStore(state => state.clearToken);

  const togglePregnancyMode = () => setIsPregnant(!isPregnant);

  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => clearToken(),
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'home',
      label: 'Home',
      onPress: () => props.navigation.navigate(SCREENS.HOME),
      color: '#8B5CF6',
    },
  ];

  const settingsItems = [
    {
      icon: 'bell',
      label: 'Notifications',
      color: '#8B5CF6',
      hasToggle: true,
      value: notificationsEnabled,
      onToggle: toggleNotifications,
    },
    {
      icon: 'emo-laugh',
      label: 'Pregnancy Mode',
      color: '#6366F1',
      hasToggle: true,
      value: isPregnant,
      onToggle: togglePregnancyMode,
    },
    {
      icon: 'moon',
      label: 'Theme',
      color: '#6366F1',
      onPress: () => props.navigation.navigate(SCREENS.THEME_SETTINGS),
    },
    {
      icon: 'key',
      label: 'Change Password',
      color: '#3B82F6',
      onPress: () => props.navigation.navigate(SCREENS.CHANGE_PASSWORD),
    },
    {
      icon: 'info',
      label: 'Help & Support',
      color: '#10B981',
      onPress: () =>
        Alert.alert('Help & Support', 'Contact us at support@femcare.com'),
    },
    {
      icon: 'doc-text',
      label: 'Privacy Policy',
      color: '#6B7280',
      onPress: () =>
        Alert.alert('Privacy Policy', 'View our privacy policy...'),
    },
  ];

  return (
    <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
      {/* Close Button */}
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Ali Ahmed</Text>
          <Text style={styles.profileEmail}>shibil.pk.786.asdas@gmail.com</Text>
        </View>
        <View style={styles.closeButton}>
          <ModalTopIcon
            iconName="cancel"
            onPress={() => props.navigation.closeDrawer()}
          />
        </View>
      </View>

      {/* Menu Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: `${item.color}20` },
              ]}
            >
              <FontelloIcon name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <FontelloIcon name="right-open-mini" size={18} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.hasToggle ? undefined : item.onPress}
            activeOpacity={item.hasToggle ? 1 : 0.7}
          >
            <View
              style={[
                styles.menuIconBox,
                { backgroundColor: `${item.color}20` },
              ]}
            >
              <FontelloIcon name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.hasToggle ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#D1D5DB', true: THEME_COLORS.primary }}
                thumbColor="#fff"
              />
            ) : (
              <FontelloIcon name="right-open-mini" size={18} color="#999" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <FontelloIcon name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>FemCare v1.0.0</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => showUpdate(false)}
          activeOpacity={0.7}
        >
          <FontelloIcon name="info-circled" size={24} color={THEME_COLORS.primary} />
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  closeButton: { position: 'absolute', right: 0, top: 0 },
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  profileInfo: {
    marginTop: 4,
    flexGrow: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#999',
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.primary,
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  infoButton: {
    padding: 4,
  },
});

/* ---------------------- Drawer ---------------------- */
function DrawerNavigator() {
  const isPregnant = useStore(state => state.isPregnant ?? false);
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerActiveTintColor: THEME_COLORS.primary,
        drawerInactiveTintColor: 'gray',
        swipeEnabled: false,
      }}
    >
      {/* Main Tab Navigation (Home, Calendar, Today, etc.) */}
      <Drawer.Screen
        name={SCREENS.HOME}
        component={isPregnant ? SecondaryTabNavigator : TabNavigator}
      />
    </Drawer.Navigator>
  );
}

/* ---------------------- Root ---------------------- */
export default function RootNavigation() {
  const isDarkMode = useIsDarkMode();
  const isLoggedIn = useStore(state => state.isLoggedIn());
  const [modalVisible, setModalVisible] = useState(false);
  const open = () => setModalVisible(true);
  const close = () => setModalVisible(false);

  return (
    <UpdateProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer ref={navigationRef}>
          {isLoggedIn ? (
          <GlobalModalContext.Provider value={{ open, close }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name={SCREENS.LANDING}
                component={DrawerNavigator}
              />
              <Stack.Screen
                name={SCREENS.LIFESTYLE_DETAILS}
                component={Screens.LifestyleDetailsScreen}
              />
              <Stack.Screen
                name={SCREENS.CHANGE_PASSWORD}
                component={Screens.ChangePasswordScreen}
              />
              <Stack.Screen
                name={SCREENS.DELETE_ACCOUNT}
                component={Screens.DeleteAccount}
              />
              <Stack.Screen
                name={SCREENS.HOSPITAL_CHECKLIST}
                component={Screens.HospitalChecklist}
              />
              <Stack.Screen
                name={SCREENS.REMINDERS}
                component={Screens.Reminders}
              />
              <Stack.Screen
                name={SCREENS.THEME_SETTINGS}
                component={Screens.ThemeSettings}
              />
              <Stack.Screen
                name={SCREENS.PERIOD_SELECTOR}
                component={Screens.PeriodSelector}
              />
              <Stack.Screen
                name={SCREENS.MEDICATIONS}
                component={Screens.Medications}
              />
              <Stack.Screen
                name={SCREENS.HYDRATION}
                component={Screens.Hydration}
              />
              <Stack.Screen
                name={SCREENS.NUTRITION}
                component={Screens.Nutrition}
              />
              <Stack.Screen
                name={SCREENS.WEIGHT_TRACK}
                component={Screens.WeightTrack}
              />
              <Stack.Screen
                name={SCREENS.EXERCISE}
                component={Screens.Exercise}
              />
              <Stack.Screen
                name={SCREENS.APPOINTMENTS}
                component={Screens.Appointments}
              />
              <Stack.Screen
                name={SCREENS.SLEEP_LOG}
                component={Screens.SleepLog}
              />
            </Stack.Navigator>
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent
              onRequestClose={close}
            >
              <AboutHomeModal />
            </Modal>
          </GlobalModalContext.Provider>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name={SCREENS.LOGIN}
              component={Screens.LoginScreen}
            />
            <Stack.Screen
              name={SCREENS.REGISTER}
              component={Screens.RegisterScreen}
            />
          </Stack.Navigator>
        )}
        </NavigationContainer>
      </SafeAreaProvider>
    </UpdateProvider>
  );
}
