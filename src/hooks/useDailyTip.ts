import { useState, useEffect } from 'react';
import apiClient from '../services/ApiClient';
import { APIS } from '../constants/apis';

export interface DailyTip {
  date: string;
  short_description: string;
  long_description: string;
}

export function useDailyTip() {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDailyTip() {
      try {
        setIsLoading(true);
        const response = await apiClient.get<DailyTip>(
          APIS.V1.GENERAL.DAILY_TIPS,
        );
        setTip(response);
        setError(null);
      } catch (err: any) {
        console.info('Failed to fetch daily tip:', err);
        setError(err.message || 'Failed to load daily tip');
        setTip(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDailyTip();
  }, []);

  return { tip, isLoading, error };
}
