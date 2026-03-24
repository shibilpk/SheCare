// constants/apis.ts
// Use your computer's IP address for physical devices/emulators
// Find your IP: macOS: ifconfig | grep "inet " | grep -v 127.0.0.1
// export const BASE_URL = 'http://192.168.108.134:7865';
export const BASE_URL = 'http://localhost:7865'; // Only works in web browser
const API_VERSION = 'v1';

const auth = {
  login: () => `/api/${API_VERSION}/auth/login/`,
  refresh: () => `/api/${API_VERSION}/auth/refresh/`,
  sendOtp: () => `/api/${API_VERSION}/auth/send-otp/`,
  verifyOtp: (id: string) => `/api/${API_VERSION}/auth/verify-otp/${id}/`,
  loginWithOtp: () => `/api/${API_VERSION}/auth/login-otp/`,
  changePassword: () => `/api/${API_VERSION}/auth/change-password/`,
};

const customer = {
  register: () => `/api/${API_VERSION}/customer/register/`,
  profile: () => `/api/${API_VERSION}/customer/profile/`,
  weightEntry: () => `/api/${API_VERSION}/customer/profile/wight-entry/`,
  healthAnalysis: () => `/api/${API_VERSION}/customer/health-analysis/`,
  preferences: () => `/api/${API_VERSION}/customer/preferences/`,
  preferencesOptions: () => `/api/${API_VERSION}/customer/preferences/options/`,
  profileById: (id: string | number) =>
    `/api/${API_VERSION}/customer/profile/${id}/`,
};

const diary = {
  entry: () => `/api/${API_VERSION}/diary/entry/`,
  entryFromDate: () => `/api/${API_VERSION}/diary/entry-by-date/`,
};

const period = {
  active: () => `/api/${API_VERSION}/period/active/`,
  start: () => `/api/${API_VERSION}/period/start/`,
  end: () => `/api/${API_VERSION}/period/end/`,
  list: () => `/api/${API_VERSION}/period/list/`,
  customerData: () => `/api/${API_VERSION}/period/customer-data/`,
  pregnancyChance: () => `/api/${API_VERSION}/period/pregnancy-chance/`,
};

const activities = {
  dailyActionList: () => `/api/${API_VERSION}/activities/daily-actions/`,
  ratingList: () => `/api/${API_VERSION}/activities/rating-lists/`,
  dailyEntries: (dateStr: string) =>
    `/api/${API_VERSION}/activities/daily-entries/${dateStr}/`,
  dailyEntriesDetailed: (dateStr: string) =>
    `/api/${API_VERSION}/activities/daily-entries-detailed/${dateStr}/`,
  createDailyEntry: () => `/api/${API_VERSION}/activities/daily-entries/`,
};

const hydration = {
  hydrationLog: (dateStr: string) =>
    `/api/${API_VERSION}/hydration/hydration/${dateStr}/`,
  createOrUpdateHydration: () => `/api/${API_VERSION}/hydration/hydration/`,
  hydrationContent: () => `/api/${API_VERSION}/hydration/hydration-content/`,
};

const medication = {
  medications: () => `/api/${API_VERSION}/medication/medications/`,
  medicationsByDate: (dateStr: string) =>
    `/api/${API_VERSION}/medication/medications/by-date/${dateStr}/`,
  updateMedication: (id: number) =>
    `/api/${API_VERSION}/medication/medications/${id}/`,
  deleteMedication: (id: number) =>
    `/api/${API_VERSION}/medication/medications/${id}/`,
  toggleDose: () => `/api/${API_VERSION}/medication/medication-log/`,
  stats: (dateStr: string) =>
    `/api/${API_VERSION}/medication/medication-stats/${dateStr}/`,
};

const general = {
  dailyTips: () => `/api/${API_VERSION}/general/daily-tips/`,
  appVersion: (os: string) => `/api/${API_VERSION}/general/app-version/${os}/`,
  animation: (name: string) =>
    `/api/${API_VERSION}/general/animations/${name}/`,
};

const blog = {
  listPosts: () => `/api/${API_VERSION}/blog/posts/`,
  latestPosts: (limit: number) =>
    `/api/${API_VERSION}/blog/posts/?limit=${limit}&page=1`,
  paginatedPosts: (page: number, limit: number = 10) =>
    `/api/${API_VERSION}/blog/posts/?page=${page}&limit=${limit}`,
  post: (id: string) => `/api/${API_VERSION}/blog/posts/${id}/`,
};

const staticContent = {
  list: () => `/api/${API_VERSION}/static-content/`,
  content: (contentType: string) =>
    `/api/${API_VERSION}/static-content/${contentType}/`,
};

const reminder = {
  settings: () => `/api/${API_VERSION}/reminder/reminder-settings/`,
  info: () => `/api/${API_VERSION}/reminder/reminder-info/`,
};

const nutrition = {
  summary: (dateStr: string) =>
    `/api/${API_VERSION}/nutrition/summary/${dateStr}/`,
  logs: () => `/api/${API_VERSION}/nutrition/logs/`,
  updateLog: (id: number) => `/api/${API_VERSION}/nutrition/logs/${id}/`,
  deleteLog: (id: number) => `/api/${API_VERSION}/nutrition/logs/${id}/`,
  goal: () => `/api/${API_VERSION}/nutrition/goal/`,
  foodSuggestions: () => `/api/${API_VERSION}/nutrition/food-suggestions/`,
};

const contactFeedback = {
  submitContactUs: () => `/api/${API_VERSION}/contact-feedback/contact-us/`,
  submitFeedback: () => `/api/${API_VERSION}/contact-feedback/feedback/`,
  listContactUs: () => `/api/${API_VERSION}/contact-feedback/contact-us/`,
  listFeedback: () => `/api/${API_VERSION}/contact-feedback/feedback/`,
};

const pregnancy = {
  status: () => `/api/${API_VERSION}/pregnancy/status/`,
  active: () => `/api/${API_VERSION}/pregnancy/active/`,
  create: () => `/api/${API_VERSION}/pregnancy/create/`,
  update: () => `/api/${API_VERSION}/pregnancy/update/`,
  end: () => `/api/${API_VERSION}/pregnancy/end/`,
  delete: () => `/api/${API_VERSION}/pregnancy/delete/`,
};

export const APIS = {
  v1: {
    auth: auth,
    customer: customer,
    diary: diary,
    period: period,
    activities: activities,
    general: general,
    blog: blog,
    hydration: hydration,
    reminder: reminder,
    medication: medication,
    nutrition: nutrition,
    static_content: staticContent,
    contact_feedback: contactFeedback,
    pregnancy: pregnancy,
  }
};
