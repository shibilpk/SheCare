import { useState } from 'react';
import apiClient from '../../../services/ApiClient';
import { APIS } from '../../../constants/apis';

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  detail: {
    title: string;
    message: string;
  };
}

export function useChangePassword() {
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (payload: ChangePasswordPayload) => {
    try {
      setIsChanging(true);
      setError(null);
      const response = await apiClient.post<ChangePasswordResponse>(
        APIS.v1.auth.changePassword(),
        payload,
        { is_auth: true }
      );
      return response;
    } catch (err: any) {
      const errorMessage = err?.normalizedError?.message || 'Failed to change password';
      setError(errorMessage);
      throw err;
    } finally {
      setIsChanging(false);
    }
  };

  return {
    changePassword,
    isChanging,
    error,
  };
}
