import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import UpdateScreen from '../screens/common/update/UpdateScreen';
import { APIS } from '../constants/apis';
import { Platform } from 'react-native';
import apiClient from './ApiClient';

// Constants
const UPDATE_CHECK_KEY = 'last_update_check';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Types
interface UpdateInfo {
  shouldUpdate: boolean;
  version?: string;
  isRequired?: boolean;
  notes?: string[];
}

interface VersionResponse {
  version: string;
  min_version: string;
  release_date: string;
  force_update: boolean;
  download_url: string;
  release_notes: string[];
}

interface UpdateContextType {
  showUpdate: (isRequired?: boolean) => void;
  hideUpdate: () => void;
  checkUpdates: () => Promise<void>;
  forceCheckUpdates: () => Promise<UpdateInfo>;
}

const UpdateContext = createContext<UpdateContextType>({
  showUpdate: () => {},
  hideUpdate: () => {},
  checkUpdates: async () => {},
  forceCheckUpdates: async () => ({ shouldUpdate: false }),
});

export const useUpdate = () => useContext(UpdateContext);

// ============================================================================
// Update Service Functions (Combined from updateService.ts)
// ============================================================================

/**
 * Checks if 24 hours have passed since the last update check
 */
const shouldCheckForUpdates = async (): Promise<boolean> => {
  try {
    const lastCheckTime = await AsyncStorage.getItem(UPDATE_CHECK_KEY);

    if (!lastCheckTime) {
      return true; // First time checking
    }

    const lastCheck = parseInt(lastCheckTime, 10);
    const now = Date.now();
    const timeDiff = now - lastCheck;

    return timeDiff >= ONE_DAY_MS;
  } catch (error) {
    console.error('Error checking update timestamp:', error);
    return true; // On error, allow check
  }
};

/**
 * Updates the last update check timestamp
 */
const updateLastCheckTime = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(UPDATE_CHECK_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error updating check timestamp:', error);
  }
};

/**
 * Compares version strings (e.g., "1.0.0" vs "1.0.1")
 */
const compareVersions = (current: string, latest: string): boolean => {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false; // Versions are equal
};

/**
 * Main function to check for app updates
 * Only makes API call once per day
 */
const checkForUpdates = async (): Promise<UpdateInfo> => {
  try {
    // Check if we should make the API call (once per day)
    const shouldCheck = await shouldCheckForUpdates();

    if (!shouldCheck) {
      console.log('Update check skipped - checked within last 24 hours');
      return { shouldUpdate: false };
    }

    console.log('Checking for app updates...');

    // Get current app version
    const currentVersion = DeviceInfo.getVersion();
    console.log(currentVersion);
    // Make API call to check for updates

    const response = await apiClient.get<any>(
      `${APIS.V1.APP.getVersion(Platform.OS || 'android')}`,
    );

    const data: VersionResponse = response;
    console.log(data);

    const {
      version: latestVersion,
      force_update: isRequired,
      release_notes: releaseNotes,
      min_version: minimumVersion,
    } = data;

    // Update the last check timestamp
    await updateLastCheckTime();

    // Check if update is needed
    const hasUpdate = compareVersions(currentVersion, latestVersion);

    // Check if current version is below minimum required version
    const isBelowMinimum = minimumVersion
      ? compareVersions(currentVersion, minimumVersion)
      : false;

    if (hasUpdate) {
      console.log(`Update available: ${currentVersion} -> ${latestVersion}`);
      return {
        shouldUpdate: true,
        version: latestVersion,
        isRequired: isRequired || isBelowMinimum,
        notes: releaseNotes,
      };
    }

    console.log('App is up to date');
    return { shouldUpdate: false };
  } catch (error) {
    console.error('Update check failed:', error);
    // Don't update timestamp on error, so it will retry next time
    return { shouldUpdate: false };
  }
};

/**
 * Force an update check (bypass 24-hour restriction)
 * Useful for manual "Check for Updates" button
 */
const forceCheckForUpdates = async (): Promise<UpdateInfo> => {
  try {
    // Reset the timestamp to force a check
    await AsyncStorage.removeItem(UPDATE_CHECK_KEY);
    return await checkForUpdates();
  } catch (error) {
    console.error('Forced update check failed:', error);
    return { shouldUpdate: false };
  }
};

/**
 * Get the last update check time
 */
export const getLastUpdateCheckTime = async (): Promise<Date | null> => {
  try {
    const lastCheckTime = await AsyncStorage.getItem(UPDATE_CHECK_KEY);
    return lastCheckTime ? new Date(parseInt(lastCheckTime, 10)) : null;
  } catch (error) {
    console.error('Error getting last check time:', error);
    return null;
  }
};

// ============================================================================
// Update Provider Component
// ============================================================================

interface UpdateProviderProps {
  children: React.ReactNode;
}

export function UpdateProvider({ children }: UpdateProviderProps) {
  const [visible, setVisible] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('2.0.0');
  const [updateNotes, setUpdateNotes] = useState<string[]>([
    'Improved sleep tracking with detailed analytics',
    'New health insights dashboard',
    'Bug fixes and performance improvements',
    'Enhanced medication reminders',
    'Better UI/UX experience',
  ]);

  // Check for updates on app start (only once per day)
  useEffect(() => {
    performUpdateCheck();
  }, []);

  const performUpdateCheck = async () => {
    try {
      const updateInfo = await checkForUpdates();

      if (updateInfo.shouldUpdate) {
        setCurrentVersion(updateInfo.version || DeviceInfo.getVersion());
        setIsRequired(updateInfo.isRequired || false);

        if (updateInfo.notes && updateInfo.notes.length > 0) {
          setUpdateNotes(updateInfo.notes);
        }

        setVisible(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const performForceUpdateCheck = async (): Promise<UpdateInfo> => {
    return await forceCheckForUpdates();
  };

  const showUpdate = (required = false) => {
    setIsRequired(required);
    setVisible(true);
  };

  const hideUpdate = () => {
    if (!isRequired) {
      setVisible(false);
    }
  };

  const handleUpdate = () => {
    // Track update action
    console.log('User clicked Update');
    setVisible(false);
  };

  return (
    <UpdateContext.Provider
      value={{
        showUpdate,
        hideUpdate,
        checkUpdates: performUpdateCheck,
        forceCheckUpdates: performForceUpdateCheck,
      }}
    >
      {children}
      <UpdateScreen
        visible={visible}
        onSkip={hideUpdate}
        onUpdate={handleUpdate}
        version={currentVersion}
        isRequired={isRequired}
        updateNotes={updateNotes}
      />
    </UpdateContext.Provider>
  );
}
