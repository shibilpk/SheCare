import { useState, useCallback, useEffect } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface WeightResponse {
  weight: string;
  unit: string;
}

export interface ProfileResponse {
  email: string;
  name: string;
  phone?: string;
  photo?: string;
  age?: number;
  date_of_birth?: string;
  address?: string;
  height?: number;
  weight?: WeightResponse;
  cycleLength?: number;
  cycle_length?: number;
  periodLength?: number;
  period_length?: number;
  lutealPhase?: number;
  luteal_phase?: number;
  language?: string;
  timezone?: string;
}

export interface ProfileUpdate {
  user?: {
    first_name?: string;
  };
  name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  height?: number;
  height_unit?: string;
  cycle_length?: number;
  period_length?: number;
  luteal_phase?: number;
}

export interface WeightData {
  weight?: string;
  weight_unit?: string;
  weight_date?: string;
}

export interface AvatarFile {
  uri: string;
  name: string;
  type: string;
}

export interface UseProfileReturn {
  profile: ProfileResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchProfile: () => Promise<ProfileResponse | null>;
  updateProfile: (data: ProfileUpdate) => Promise<any>;
  updateProfilePicture: (imageFile: AvatarFile) => Promise<any>;
  saveWeight: (weightData: WeightData) => Promise<any>;
}

/**
 * Custom hook for profile operations
 * Provides fetch and update functionality for user profile
 */
export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<any>(APIS.V1.CUSTOMER.PROFILE);


      if (response.profile) {

        setProfile(response.profile);
        return response.profile;
      }
      return null;
    } catch (err: any) {
      console.info('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdate) => {
    try {
      setIsSaving(true);
      setError(null);

      // Helper function to append form data recursively
      const appendFormDataRecursively = (
        formData: FormData,
        obj: any,
        parentKey?: string,
      ) => {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const formKey = parentKey ? `${parentKey}[${key}]` : key;

            if (value != null && typeof value === 'object' && !Array.isArray(value)) {
              appendFormDataRecursively(formData, value, formKey);
            } else if (value != null) {
              formData.append(formKey, String(value));
            }
          }
        }
      };

      const formData = new FormData();
      appendFormDataRecursively(formData, data);

      const response = await apiClient.patch<any>(
        APIS.V1.CUSTOMER.PROFILE,
        formData,
      );

      if (response.profile) {
        setProfile(response.profile);
      }

      return response;
    } catch (err: any) {
      console.info('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateProfilePicture = useCallback(async (imageFile: AvatarFile) => {
    try {
      setIsSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append('photo', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
      } as any);

      const response = await apiClient.patch<any>(
        APIS.V1.CUSTOMER.PROFILE,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      if (response.profile) {
        setProfile(response.profile);
      }

      return response;
    } catch (err: any) {
      console.info('Failed to update profile picture:', err);
      setError(err.message || 'Failed to update profile picture');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const saveWeight = useCallback(async (weightData: WeightData) => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await apiClient.post<any>(
        APIS.V1.CUSTOMER.WEIGHT_ENTRY,
        weightData,
      );

      return response;
    } catch (err: any) {
      console.info('Failed to save weight:', err);
      setError(err.message || 'Failed to save weight');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Auto-fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    updateProfile,
    updateProfilePicture,
    saveWeight,
  };
}
