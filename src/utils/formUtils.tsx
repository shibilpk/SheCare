// utils/formUtils.ts

export type FormErrors<T> =
  Partial<Record<keyof T, string>>;

type BackendValidationError = {
  detail?: {
    loc: (string | number)[];
    msg: string;
  }[];
};

export const clearFieldError = <T extends Record<string, string>>(
  errors: FormErrors<T>,
  field: keyof T
): FormErrors<T> => {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};

// Generic validation for required fields
export const validateRequiredFields = <T extends object>(
  data: T,
  requiredFields: (keyof T)[]
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};

  requiredFields.forEach((field) => {
    const value = data[field];

    if (typeof value !== 'string' || value.trim() === '') {
      errors[field] = 'This field is required';
    }
  });

  return errors;
};

// Validate email
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
  return null;
};

// Validate phone
export const validatePhone = (phone: string): string | null => {
  if (!phone) return 'Phone number is required';
  if (!/^[0-9]{10}$/.test(phone)) return 'Phone number must be 10 digits';
  return null;
};

// Helper to clean error messages
const cleanMessage = (msg: string): string => {
  return msg.includes(':')
    ? msg.split(':').slice(1).join(':').trim()
    : msg;
};

// Parse backend validation errors (consolidated from parseErrors.tsx)
export const parseValidationErrors = (
  error: BackendValidationError
): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};

  if (!Array.isArray(error?.detail)) {
    return formattedErrors;
  }

  error.detail.forEach(({ loc, msg }) => {
    const field = loc[loc.length - 1];

    if (typeof field === 'string') {
      formattedErrors[field] = cleanMessage(msg);
    }
  });

  return formattedErrors;
};

// Map server-side errors
export const mapServerErrors = <T extends FormData>(serverData: any): Partial<T> => {
  const errors: Partial<T> = {};
  for (const key in serverData) {
    if (serverData.hasOwnProperty(key)) {
      errors[key as keyof T] = serverData[key][0]; // assuming server returns array
    }
  }
  return errors;
};
