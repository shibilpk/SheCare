// constants/apis.ts
// Use your computer's IP address for physical devices/emulators
// Find your IP: macOS: ifconfig | grep "inet " | grep -v 127.0.0.1
export const BASE_URL = 'http://192.168.108.134:7865';
// export const BASE_URL = 'http://localhost:7865'; // Only works in web browser
const API_VERSION = 'v1';

const AUTH_API = {
  LOGIN: `/api/${API_VERSION}/auth/login/`,
  REFRESH: `/api/${API_VERSION}/auth/refresh/`,
  SEND_OTP: `/api/${API_VERSION}/auth/send-otp/`,
  getVerifyOTP: (id: string) => `/api/${API_VERSION}/auth/verify-otp/${id}/`,
  LOGIN_WITH_OTP: `/api/${API_VERSION}/auth/login-otp/`,
};

const CUSTOMER_API = {
  REGISTER: `/api/${API_VERSION}/customer/register/`,
  PROFILE: `/api/${API_VERSION}/customer/profile/`,
  WEIGHT_ENTRY: `/api/${API_VERSION}/customer/profile/wight-entry/`,
  HEALTH_ANALYSIS: `/api/${API_VERSION}/customer/health-analysis/`,
  PREFERENCES: `/api/${API_VERSION}/customer/preferences/`,
  PREFERENCES_OPTIONS: `/api/${API_VERSION}/customer/preferences/options/`,
  getProfile: (id: string | number) =>
    `/api/${API_VERSION}/customer/profile/${id}/`, // dynamic
};

const DAIRY = {
  ENTRY: `/api/${API_VERSION}/diary/entry/`,
  ENTRY_FROM_DATE: `/api/${API_VERSION}/diary/entry-by-date/`,
};
const PERIOD = {
  ACTIVE: `/api/${API_VERSION}/period/active/`,
  START: `/api/${API_VERSION}/period/start/`,
  END: `/api/${API_VERSION}/period/end/`,
  LIST: `/api/${API_VERSION}/period/list/`,
  CUSTOMER_DATA: `/api/${API_VERSION}/period/customer-data/`,
  PREGNANCY_CHANCE: `/api/${API_VERSION}/period/pregnancy-chance/`,
};
const ACTIVITIES = {
  DAILY_ACTION_LIST: `/api/${API_VERSION}/activities/daily-actions/`,
  RATING_LIST: `/api/${API_VERSION}/activities/rating-lists/`,
  getDailyEntires: (dateStr: string) =>
    `/api/${API_VERSION}/activities/daily-entries/${dateStr}`,
  getDailyDetailed: (dateStr: string) =>
    `/api/${API_VERSION}/activities/daily-entries-detailed/${dateStr}`,
  CREATE_DAILY_ENTRY: `/api/${API_VERSION}/activities/daily-entries/`,
};

const HYDRATION = {
  getHydrationLog: (dateStr: string) =>
    `/api/${API_VERSION}/hydration/hydration/${dateStr}`,
  CREATE_UPDATE_HYDRATION: `/api/${API_VERSION}/hydration/hydration/`,
  HYDRATION_CONTENT: `/api/${API_VERSION}/hydration/hydration-content/`,
};

const MEDICATION = {
  MEDICATIONS: `/api/${API_VERSION}/medication/medications/`,
  getMedicationsWithDoses: (dateStr: string) =>
    `/api/${API_VERSION}/medication/medications/by-date/${dateStr}`,
  updateMedication: (id: number) =>
    `/api/${API_VERSION}/medication/medications/${id}`,
  deleteMedication: (id: number) =>
    `/api/${API_VERSION}/medication/medications/${id}`,
  TOGGLE_DOSE: `/api/${API_VERSION}/medication/medication-log/`,
  getStats: (dateStr: string) =>
    `/api/${API_VERSION}/medication/medication-stats/${dateStr}`,
};

const GENERAL = {
  DAILY_TIPS: `/api/${API_VERSION}/general/daily-tips/`,
  getVersion: (os: string) => `/api/${API_VERSION}/general/app-version/${os}/`,
  getAnimation: (name: string) =>
    `/api/${API_VERSION}/general/animations/${name}/`,
};

const BLOG = {
  LIST_POSTS: `/api/${API_VERSION}/blog/posts/`,
  getLatestPosts: (limit: number) => `/api/${API_VERSION}/blog/posts/?limit=${limit}&page=1`,
  getPaginatedPosts: (page: number, limit: number = 10) => `/api/${API_VERSION}/blog/posts/?page=${page}&limit=${limit}`,
  getPost: (id: string) => `/api/${API_VERSION}/blog/posts/${id}/`,
};

const STATIC_CONTENT = {
  LIST: `/api/${API_VERSION}/static-content/`,
  getContent: (contentType: string) =>
    `/api/${API_VERSION}/static-content/${contentType}/`,
};

const REMINDER = {
  SETTINGS: `/api/${API_VERSION}/reminder/reminder-settings/`,
  INFO: `/api/${API_VERSION}/reminder/reminder-info/`,
};

const NUTRITION = {
  getSummary: (dateStr: string) =>
    `/api/${API_VERSION}/nutrition/summary/${dateStr}`,
  LOGS: `/api/${API_VERSION}/nutrition/logs/`,
  updateLog: (id: number) => `/api/${API_VERSION}/nutrition/logs/${id}`,
  deleteLog: (id: number) => `/api/${API_VERSION}/nutrition/logs/${id}`,
  GOAL: `/api/${API_VERSION}/nutrition/goal/`,
  FOOD_SUGGESTIONS: `/api/${API_VERSION}/nutrition/food-suggestions/`,
};

const CONTACT_FEEDBACK = {
  submitContactUs: () => `/api/${API_VERSION}/contact-feedback/contact-us/`,
  submitFeedback: () => `/api/${API_VERSION}/contact-feedback/feedback/`,
  listContactUs: () => `/api/${API_VERSION}/contact-feedback/contact-us/`,
  listFeedback: () => `/api/${API_VERSION}/contact-feedback/feedback/`,
};

export const APIS = {
  V1: {
    AUTH: AUTH_API,
    CUSTOMER: CUSTOMER_API,
    DAIRY: DAIRY,
    PERIOD: PERIOD,
    ACTIVITIES: ACTIVITIES,
    GENERAL: GENERAL,
    BLOG: BLOG,
    HYDRATION: HYDRATION,
    REMINDER: REMINDER,
    MEDICATION: MEDICATION,
    NUTRITION: NUTRITION,
    STATIC_CONTENT: STATIC_CONTENT,
    CONTACT_FEEDBACK: CONTACT_FEEDBACK,
  },
};
