export const SCREENS = {
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  OTP_VERIFICATION: 'OTPVerification',
  CALENDAR: 'Calendar',
  PROFILE: 'Profile',
  TODAY: 'Today',
  ANALYSIS: 'Analysis',
  LIFESTYLE_DETAILS: 'LifestyleDetails',
  LANDING: 'Landing',
  MAIN_TABS: 'MainTabs',
  CHANGE_PASSWORD: 'ChangePassword',
  DELETE_ACCOUNT: 'DeleteAccount',
  HOSPITAL_CHECKLIST: 'HospitalChecklist',
  REMINDERS: 'Reminders',
  THEME_SETTINGS: 'ThemeSettings',
  PERIOD_SELECTOR: 'PeriodSelector',
  MEDICATIONS: 'Medications',
  HYDRATION: 'Hydration',
  NUTRITION: 'Nutrition',
  EXERCISE: 'Exercise',
  SLEEP_LOG: 'SleepLog',
  WEIGHT_TRACK: 'WeightTrack',
  APPOINTMENTS: 'Appointments',
  PREGNANCY_SETTINGS: 'PregnancySettings',
  TIPS_SCREEN: 'TipsScreen',
  BLOG_LIST: 'BlogList',
  BLOG_DETAIL: 'BlogDetail',
  PERIODS_LIST: 'PeriodsList',
  DAILY_TIP: 'DailyTip',
  PREFERENCES: 'Preferences',
} as const;

// Define screens that need params and their types
type ScreenParams = {
  [SCREENS.OTP_VERIFICATION]: {
    id?: string;
    email?: string;
    isLoginFlow?: boolean;
  };
  [SCREENS.PERIOD_SELECTOR]?: {
    startDate?: Date | null;
    endDate?: Date | null;
    rangeDays?: number | null;
    periodId?: string | null;
  };
};

// RootStackParamList automatically types screens
export type RootStackParamList = {
  [K in (typeof SCREENS)[keyof typeof SCREENS]]: K extends keyof ScreenParams
    ? ScreenParams[K]
    : undefined;
};
