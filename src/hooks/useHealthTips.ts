import { useState, useEffect, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface HealthTip {
  id: number;
  category: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface UseHealthTipsReturn {
  tips: HealthTip[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** General wellness tips (managed from the backend admin). */
export function useHealthTips(): UseHealthTipsReturn {
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<HealthTip[]>(
        APIS.v1.general.healthTips(),
      );
      setTips(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.info('Failed to fetch health tips:', err);
      setError(
        err?.normalizedError?.message ||
          err?.message ||
          'Failed to load health tips',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  return { tips, isLoading, error, refetch: fetchTips };
}
