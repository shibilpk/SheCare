import { useState, useEffect, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface PregnancyChance {
  level: 'low' | 'medium' | 'high';
  percentage: number;
}

export interface UsePregnancyChanceReturn {
  pregnancyChance: PregnancyChance | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch pregnancy chance with percentage
 * Returns pregnancy chance level and percentage for today
 */
export function usePregnancyChance(): UsePregnancyChanceReturn {
  const [pregnancyChance, setPregnancyChance] = useState<PregnancyChance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPregnancyChance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<PregnancyChance>(
        APIS.V1.PERIOD.PREGNANCY_CHANCE,
      );
      setPregnancyChance(response);
    } catch (err: any) {
      console.info('Failed to fetch pregnancy chance:', err);
      setError(err.message || 'Failed to load pregnancy chance');
      setPregnancyChance(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPregnancyChance();
  }, [fetchPregnancyChance]);

  return {
    pregnancyChance,
    isLoading,
    error,
    refetch: fetchPregnancyChance,
  };
}
