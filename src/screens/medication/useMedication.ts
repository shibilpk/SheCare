import { useState, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface DoseSchedule {
  dose_index: number;
  time: string;
  taken: boolean;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency_period: string;
  times_per_period: number;
  frequency_text: string;
  color: string;
  icon: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  dose_times: string[];
  created_at: string;
  updated_at: string;
}

export interface MedicationWithDoses {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  icon: string;
  color: string;
  doses: DoseSchedule[];
}

export interface MedicationStats {
  total_doses: number;
  taken_doses: number;
  completion_percent: number;
}

export interface CreateMedicationPayload {
  name: string;
  dosage: string;
  frequency_period: 'daily' | 'weekly' | 'monthly' | 'once';
  times_per_period: number;
  color?: string;
  icon?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface ToggleDosePayload {
  medication_id: number;
  date: string;
  dose_index: number;
  taken: boolean;
}

export interface UseMedicationReturn {
  medications: MedicationWithDoses[];
  stats: MedicationStats | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchMedications: (date: Date) => Promise<MedicationWithDoses[]>;
  fetchStats: (date: Date) => Promise<MedicationStats | null>;
  createMedication: (payload: CreateMedicationPayload) => Promise<Medication>;
  updateMedication: (id: number, payload: CreateMedicationPayload) => Promise<Medication>;
  toggleDose: (payload: ToggleDosePayload) => Promise<void>;
  deleteMedication: (id: number) => Promise<void>;
}

/**
 * Custom hook for medication operations
 * Provides fetch, create, update, and toggle functionality for medications
 */
export function useMedication(): UseMedicationReturn {
  const [medications, setMedications] = useState<MedicationWithDoses[]>([]);
  const [stats, setStats] = useState<MedicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async (date: Date): Promise<MedicationWithDoses[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const dateStr = date.toISOString().split('T')[0];
      const response = await apiClient.get<MedicationWithDoses[]>(
        APIS.v1.medication.medicationsByDate(dateStr)
      );

      setMedications(response);
      return response;
    } catch (err: any) {
      console.info('Failed to fetch medications:', err);
      setError(err.message || 'Failed to load medications');
      setMedications([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async (date: Date): Promise<MedicationStats | null> => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await apiClient.get<MedicationStats>(
        APIS.v1.medication.stats(dateStr)
      );

      setStats(response);
      return response;
    } catch (err: any) {
      console.info('Failed to fetch medication stats:', err);
      return null;
    }
  }, []);

  const createMedication = useCallback(async (payload: CreateMedicationPayload): Promise<Medication> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await apiClient.post<Medication>(
        APIS.v1.medication.medications(),
        payload
      );

      return response;
    } catch (err: any) {
      console.info('Failed to create medication:', err);
      setError(err.message || 'Failed to create medication');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateMedication = useCallback(async (id: number, payload: CreateMedicationPayload): Promise<Medication> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await apiClient.put<Medication>(
        APIS.v1.medication.updateMedication(id),
        payload
      );

      return response;
    } catch (err: any) {
      console.info('Failed to update medication:', err);
      setError(err.message || 'Failed to update medication');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const toggleDose = useCallback(async (payload: ToggleDosePayload): Promise<void> => {
    try {
      await apiClient.post(
        APIS.v1.medication.toggleDose(),
        payload
      );

      // Update local state optimistically
      setMedications(prev =>
        prev.map(med =>
          med.id === payload.medication_id
            ? {
                ...med,
                doses: med.doses.map((dose, idx) =>
                  idx === payload.dose_index
                    ? { ...dose, taken: payload.taken }
                    : dose
                ),
              }
            : med
        )
      );

      // Update stats
      if (stats) {
        const newTakenDoses = payload.taken
          ? stats.taken_doses + 1
          : Math.max(0, stats.taken_doses - 1);
        const newPercent =
          stats.total_doses > 0
            ? (newTakenDoses / stats.total_doses) * 100
            : 0;

        setStats({
          ...stats,
          taken_doses: newTakenDoses,
          completion_percent: newPercent,
        });
      }
    } catch (err: any) {
      console.info('Failed to toggle dose:', err);
      setError(err.message || 'Failed to update dose');
      throw err;
    }
  }, [stats]);

  const deleteMedication = useCallback(async (id: number): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);

      await apiClient.delete(
        APIS.v1.medication.deleteMedication(id)
      );

      // Remove from local state
      setMedications(prev => prev.filter(med => med.id !== id));
    } catch (err: any) {
      console.info('Failed to delete medication:', err);
      setError(err.message || 'Failed to delete medication');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    medications,
    stats,
    isLoading,
    isSaving,
    error,
    fetchMedications,
    fetchStats,
    createMedication,
    updateMedication,
    toggleDose,
    deleteMedication,
  };
}
