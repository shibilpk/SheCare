// constants/apis.ts
export const BASE_URL = 'http://192.168.108.149:7865';
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
  getProfile: (id: string | number) =>
    `/api/${API_VERSION}/customer/profile/${id}/`, // dynamic
};

const APP_API = {
  getVersion: (os: string) => `/api/${API_VERSION}/general/app-version/${os}/`,
};

export const APIS = {
  V1: {
    AUTH: AUTH_API,
    CUSTOMER: CUSTOMER_API,
    APP: APP_API,
  },
};
