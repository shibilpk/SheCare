import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type StoreState = {
  token: string | null;
  refreshToken: string | null;
  setToken: (token: string, refreshToken?: string) => void;
  clearToken: () => void;
  isLoggedIn: () => boolean;

  isPregnant: boolean;
  setIsPregnant?: (isPregnant: boolean) => void;

  isDarkMode: undefined | boolean;
  setDarkMode: (isDarkMode: boolean | undefined) => void;
};

const useStore = create<StoreState>()(
  persist<StoreState>(
    function (set, get) {
      return {
        // For authentication
        token: null,
        refreshToken: null,
        setToken: function (token: string, refreshToken?: string) {
          set({ token: token, refreshToken: refreshToken ?? null });
        },
        clearToken: function () {
          set({ token: null, refreshToken: null });
        },
        isLoggedIn: function () {
          return !!get().token;
        },
        // For pregnancy mode
        isPregnant: false,
        setIsPregnant: function (isPregnant: boolean) {
          set({ isPregnant: isPregnant });
        },
        // For theme management
        isDarkMode: undefined,
        setDarkMode: function (isDarkMode: boolean | undefined) {
          set({ isDarkMode: isDarkMode });
        }
      };
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(function () {
        return AsyncStorage;
      }),
    },
  ),
);

export default useStore;
