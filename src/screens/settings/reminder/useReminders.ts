import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../../services/ApiClient';
import { APIS } from '../../../constants/apis';

export interface Reminder {
  reminder_type: string;
  title: string;
  icon?: string;
  color?: string;
  enabled: boolean;
  time: string;
  days_advance: number;
}

export interface ReminderSettingsResponse {
  reminder_settings: Reminder[];
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderInfo, setReminderInfo] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingReminders, setUpdatingReminders] = useState<Set<string>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);

  // Use ref to keep track of latest reminders without triggering callback recreation
  const remindersRef = useRef<Reminder[]>([]);

  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  const fetchReminderSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<ReminderSettingsResponse>(
        APIS.v1.reminder.settings(),
        { is_auth: true },
      );

      setReminders(response.reminder_settings || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch reminder settings:', err);
      setError(
        err?.normalizedError?.message || 'Failed to load reminder settings',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReminderInfo = useCallback(async () => {
    try {
      const response = await apiClient.get<{ reminder_info: string[] }>(
        APIS.v1.reminder.info(),
        { is_auth: true },
      );
      setReminderInfo(response.reminder_info || []);
      console.log('Reminder info:', response.reminder_info);
    } catch (err: any) {
      console.error('Failed to fetch reminder info:', err);
      setError(err?.normalizedError?.message || 'Failed to load reminder info');
    }
  }, []);

  const updateReminderSettings = useCallback(
    async (updatedReminder: Reminder) => {
      try {
        // Mark this specific reminder as updating
        setUpdatingReminders(prev =>
          new Set(prev).add(updatedReminder.reminder_type),
        );

        const response = await apiClient.patch<{
          reminder: Reminder;
          detail: { title: string; message: string };
        }>(
          APIS.v1.reminder.settings(),
          { reminder_settings: [updatedReminder] },
          { is_auth: true },
        );

        // Update only the changed reminder in the local state
        setReminders(prevReminders =>
          prevReminders.map(r =>
            r.reminder_type === response.reminder.reminder_type
              ? response.reminder
              : r,
          ),
        );
        setError(null);
        return response;
      } catch (err: any) {
        console.error('Failed to update reminder settings:', err);
        const errorMessage =
          err?.normalizedError?.message || 'Failed to update reminder settings';
        setError(errorMessage);
        throw err;
      } finally {
        // Remove this specific reminder from updating set
        setUpdatingReminders(prev => {
          const next = new Set(prev);
          next.delete(updatedReminder.reminder_type);
          return next;
        });
      }
    },
    [],
  );

  const toggleReminder = useCallback(
    async (reminder_type: string) => {
      const reminder = remindersRef.current.find(
        r => r.reminder_type === reminder_type,
      );
      if (!reminder) return;

      const updatedReminder = { ...reminder, enabled: !reminder.enabled };
      // Optimistic update
      setReminders(prevReminders =>
        prevReminders.map(r =>
          r.reminder_type === reminder_type ? updatedReminder : r,
        ),
      );
      return updateReminderSettings(updatedReminder);
    },
    [updateReminderSettings],
  );

  const updateReminder = useCallback(
    async (reminder_type: string, updates: Partial<Reminder>) => {
      const reminder = remindersRef.current.find(
        r => r.reminder_type === reminder_type,
      );
      if (!reminder) return;

      const updatedReminder = { ...reminder, ...updates };
      // Optimistic update
      setReminders(prevReminders =>
        prevReminders.map(r =>
          r.reminder_type === reminder_type ? updatedReminder : r,
        ),
      );
      return updateReminderSettings(updatedReminder);
    },
    [updateReminderSettings],
  );

  useEffect(() => {
    (async () => {
      await fetchReminderSettings();
      await fetchReminderInfo();
    })();
  }, [fetchReminderInfo, fetchReminderSettings]);

  return {
    reminders,
    reminderInfo,
    isLoading,
    updatingReminders,
    error,
    toggleReminder,
    updateReminder,
    refresh: fetchReminderSettings,
  };
}
