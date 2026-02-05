// constants/apis.ts
export const BASE_URL = 'http://169.254.117.252:7865';
// export const BASE_URL = 'http://192.168.1.16:7865';
// export const BASE_URL = 'http://localhost:7865';
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
  getProfile: (id: string | number) =>
    `/api/${API_VERSION}/customer/profile/${id}/`, // dynamic
};

const APP_API = {
  getVersion: (os: string) => `/api/${API_VERSION}/general/app-version/${os}/`,
};
const DAIRY = {
  ENTRY: `/api/${API_VERSION}/diary/entry/`,
  ENTRY_FROM_DATE: `/api/${API_VERSION}/diary/entry-by-date/`,
};
const PERIOD = {
  ACTIVE: `/api/${API_VERSION}/period/active/`,
  CREATE : `/api/${API_VERSION}/period/create/`,
  LIST : `/api/${API_VERSION}/period/list/`,
};
export const APIS = {
  V1: {
    AUTH: AUTH_API,
    CUSTOMER: CUSTOMER_API,
    APP: APP_API,
    DAIRY: DAIRY,
    PERIOD: PERIOD,
  },
};
