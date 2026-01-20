// constants/apis.ts
export const BASE_URL = 'http://localhost:8006';
const API_VERSION = 'v1';

const BASE_AUTH_URL = `/api/${API_VERSION}/auth`;
const BASE_CUSTOMER_URL = `/api/${API_VERSION}/customer`;

const AUTH_API = {
  LOGIN: `${BASE_AUTH_URL}/login/`,
  REFRESH: `${BASE_AUTH_URL}/refresh/`,
  CHECK_USER: `${BASE_AUTH_URL}/check-user/`,
  SEND_OTP: `${BASE_AUTH_URL}/send-otp/`,
  getVerifyOTP: (id: string) => `${BASE_AUTH_URL}/verify-otp/${id}/`,
  LOGIN_WITH_OTP: `${BASE_AUTH_URL}/login-otp/`,

  // Customer endpoints
  REGISTER: `${BASE_CUSTOMER_URL}/register/`,
  PROFILE: `${BASE_CUSTOMER_URL}/profile/`,
  getProfile: (id: string | number) => `${BASE_CUSTOMER_URL}/profile/${id}/`, // dynamic
};

export const APIS = {
  V1: {
    AUTH: AUTH_API,
  },
};
