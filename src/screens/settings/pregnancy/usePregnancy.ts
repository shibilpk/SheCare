import { useState, useCallback, useEffect, useRef } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';
import useStore from '@src/store/useStore';

export interface PregnancyData {
  id: number;
  due_date: string;
  last_period_date?: string | null;
  baby_name: string;
  doctor_name: string;
  hospital_name: string;
  is_active: boolean;
  weeks_pregnant: number;
  baby_born: boolean;
  pregnancy_lost: boolean;
  mistaken_toggle: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface PregnancyInput {
  due_date?: string;
  baby_name?: string;
  doctor_name?: string;
  hospital_name?: string;
}

export interface BabyDetails {
  child_name: string;
  birth_date: string;
  birth_weight?: number;
  birth_length?: number;
  child_gender?: 'boy' | 'girl' | '';
}

export interface PregnancyEndPayload {
  reason: 'born' | 'lost' | 'mistake';
  baby_details?: BabyDetails;
}

export interface SuccessMessage {
  title: string;
  message: string;
}

/**
 * Hook for managing pregnancy data and operations
 */
export function usePregnancy() {
  const [pregnancy, setPregnancy] = useState<PregnancyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPregnant = useStore(state => state.isPregnant);
  const setIsPregnant = useStore(state => state.setIsPregnant);
  const hasInitialized = useRef(false);

  /**
   * Fetch active pregnancy details
   */
  const fetchActivePregnancy = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<PregnancyData>(
        APIS.v1.pregnancy.active(),
      );
      setPregnancy(response);
      setError(null);
    } catch (err: any) {
      console.error('No active pregnancy found:', err);
      setError(err?.message || 'No active pregnancy');
      setIsPregnant(false);
    } finally {
      setIsLoading(false);
    }
  }, [setIsPregnant]);

  /**
   * Create a new pregnancy
   */
  const createPregnancy = useCallback(
    async (data: PregnancyInput) => {
      try {
        setIsUpdating(true);
        setError(null);

        const response = await apiClient.post<PregnancyData>(
          APIS.v1.pregnancy.create(),
          data,
        );

        setPregnancy(response);
        setIsPregnant(true);
        return response;
      } catch (err: any) {
        console.error('Failed to create pregnancy:', err);
        setError(err?.message || 'Failed to create pregnancy');
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [setIsPregnant],
  );

  /**
   * Update existing pregnancy
   */
  const updatePregnancy = useCallback(
    async (data: PregnancyInput) => {
      try {
        setIsUpdating(true);
        setError(null);

        const response = await apiClient.patch<PregnancyData>(
          APIS.v1.pregnancy.update(),
          data,
        );

        setPregnancy(response);
        setIsPregnant(true);
        return response;
      } catch (err: any) {
        console.error('Failed to update pregnancy:', err);
        setError(err?.message || 'Failed to update pregnancy');
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [setIsPregnant],
  );

  /**
   * End pregnancy (born, lost, or mistake)
   */
  const endPregnancy = useCallback(
    async (payload: PregnancyEndPayload) => {
      try {
        const response = await apiClient.post<SuccessMessage>(
          APIS.v1.pregnancy.end(),
          payload,
        );
        setIsPregnant(false);
        return response;
      } catch (err: any) {
        console.error('Failed to end pregnancy:', err);
        setError(err?.message || 'Failed to end pregnancy');
        throw err;
      }
    },
    [setIsPregnant],
  );

  const isPregnantRef = useRef(isPregnant);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!isPregnantRef.current) return;

    hasInitialized.current = true;
    fetchActivePregnancy();
  }, [fetchActivePregnancy]);

  return {
    pregnancy,
    isLoading,
    isUpdating,
    error,
    isPregnant,
    setIsPregnant,
    refresh: fetchActivePregnancy,
    createPregnancy,
    updatePregnancy,
    endPregnancy,
  };
}
