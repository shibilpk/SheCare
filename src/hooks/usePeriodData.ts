import { useState, useEffect, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface PeriodRange {
  id: string;
  start_date: string;
  end_date: string;
  cycle_length: number;
}

export interface PregnancyChance {
  value: 'low' | 'medium' | 'high';
  percent: number;
}

export interface CustomerPeriodData {
  active_period: PeriodRange | null;
  is_fertile: boolean;
  pregnancy_chance: PregnancyChance | null;
  next_period_date: string | null;
  ovulation_date: string | null;
  fertile_window_start: string | null;
  fertile_window_end: string | null;
  avg_cycle_length: number;
  avg_period_length: number;
  late_period_days: number;
  card_status: string;
  card_label: string;
  card_value: string;
  card_subtitle: string;
  card_button_text: string;
}

export interface UsePeriodDataReturn {
  periodData: CustomerPeriodData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch customer period data
 * Returns period information including active period, predictions, and cycle statistics
 */
export function usePeriodData(): UsePeriodDataReturn {
  const [periodData, setPeriodData] = useState<CustomerPeriodData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriodData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<CustomerPeriodData>(
        APIS.V1.PERIOD.CUSTOMER_DATA,
      );
      setPeriodData(response);
    } catch (err: any) {
      console.info('Failed to fetch period data:', err);
      setError(err.message || 'Failed to load period data');
      setPeriodData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriodData();
  }, [fetchPeriodData]);

  return {
    periodData,
    isLoading,
    error,
    refetch: fetchPeriodData,
  };
}
