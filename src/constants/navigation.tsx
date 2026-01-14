export const SCREENS = {
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  CALENDAR: 'Calendar',
  PROFILE: 'Profile',
  TODAY: 'Today',
  ANALYSIS: 'Analysis',
  LIFESTYLE_DETAILS: 'LifestyleDetails',
  LANDING: 'Landing',
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
} as const;

export type RootStackParamList = {
  [K in (typeof SCREENS)[keyof typeof SCREENS]]: undefined;
};
