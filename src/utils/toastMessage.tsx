import { useEffect } from 'react';
import { useToast, ToastOptions } from 'react-native-toast-notifications';

export const useToastMessage = () => {
  const toast = useToast();

  const showToast = (
    message: string,
    options?: ToastOptions & {
      stack?: boolean;
    },
  ) => {
    const { stack = false, ...toastOptions } = options || {};

    if (!stack) {
      toast.hideAll();
    }

    toast.show(message, { duration: 1000, ...toastOptions });
  };

  return { showToast };
};

/**
 * Automatically shows error as toast when error value changes
 * @param error - Error message to display
 * @param deps - Additional dependencies to watch (optional)
 */
export function useErrorToast(error: string | null, deps: any[] = []) {
  const { showToast } = useToastMessage();

  useEffect(() => {
    if (error) {
      showToast(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, showToast, ...deps]);
}
