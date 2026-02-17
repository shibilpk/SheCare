import { APIS } from '@src/constants/apis';
import apiClient, { APIError } from '@src/services/ApiClient';
import { useState, useEffect, useCallback } from 'react';
import { ProfileResponse } from '@src/constants/types';

export interface HealthAnalysisData {
  bmi: {
    bmi: number;
    notes: Array<string>;
    new_bmi: number;
    status: string;
    status_badge_color: string;
  };
  profile: ProfileResponse;
}

export interface UseHealthAnalysisReturn {
  healthAnalysis: HealthAnalysisData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch health analysis data (BMI, profile, etc.)
 */
export function useHealthAnalysis(): UseHealthAnalysisReturn {
  const [healthAnalysis, setHealthAnalysis] = useState<HealthAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthAnalysis = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await apiClient.get<HealthAnalysisData>(
        APIS.V1.CUSTOMER.HEALTH_ANALYSIS,
      );
      setHealthAnalysis(response);
    } catch (e) {
      const apiError = e as APIError;
      console.info('Failed to fetch health analysis', e);
      setError(apiError.message || 'Failed to load health analysis');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchHealthAnalysis(true);
  }, [fetchHealthAnalysis]);

  useEffect(() => {
    fetchHealthAnalysis();
  }, [fetchHealthAnalysis]);

  return {
    healthAnalysis,
    isLoading,
    isRefreshing,
    error,
    refetch,
  };
}
