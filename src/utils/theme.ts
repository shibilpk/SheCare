import { useColorScheme } from 'react-native';
import useStore from '../hooks/useStore';

/**
 * Returns true if dark mode is active (user or system), false otherwise.
 */
export function useIsDarkMode(): boolean {
  const systemDarkMode = useColorScheme() === 'dark';
  const isDarkMode = useStore(state => state.isDarkMode);
  return isDarkMode !== undefined ? isDarkMode : systemDarkMode;
}

export function isUserSetTheme(): boolean {
  const isDarkMode = useStore.getState().isDarkMode;
  return isDarkMode !== undefined;
}