import { useState, useEffect, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface Appointment {
  id: number;
  title: string;
  doctor: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM:SS
  notes: string;
  icon: string;
  color: string;
  is_completed: boolean;
}

export interface AppointmentPayload {
  title: string;
  doctor?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  time?: string | null; // HH:MM
  notes?: string;
  icon?: string;
  color?: string;
  is_completed?: boolean;
}

const errorMessage = (err: any, fallback: string): string =>
  err?.normalizedError?.message || fallback;

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (refreshing = false) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const response = await apiClient.get<Appointment[]>(
        APIS.v1.pregnancy.appointments(),
      );
      setAppointments(response);
      setError(null);
    } catch (err: any) {
      console.info('Failed to fetch appointments:', err);
      setError(errorMessage(err, 'Failed to load appointments'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const createAppointment = useCallback(
    async (payload: AppointmentPayload) => {
      try {
        setIsSaving(true);
        const created = await apiClient.post<Appointment>(
          APIS.v1.pregnancy.appointments(),
          payload,
        );
        await fetchAppointments(true);
        return created;
      } catch (err: any) {
        throw new Error(errorMessage(err, 'Failed to add appointment'));
      } finally {
        setIsSaving(false);
      }
    },
    [fetchAppointments],
  );

  const updateAppointment = useCallback(
    async (id: number, payload: AppointmentPayload) => {
      try {
        setIsSaving(true);
        const updated = await apiClient.put<Appointment>(
          APIS.v1.pregnancy.appointment(id),
          payload,
        );
        await fetchAppointments(true);
        return updated;
      } catch (err: any) {
        throw new Error(errorMessage(err, 'Failed to update appointment'));
      } finally {
        setIsSaving(false);
      }
    },
    [fetchAppointments],
  );

  const deleteAppointment = useCallback(async (id: number) => {
    try {
      setIsSaving(true);
      await apiClient.delete(APIS.v1.pregnancy.appointment(id));
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      throw new Error(errorMessage(err, 'Failed to delete appointment'));
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    appointments,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
}
