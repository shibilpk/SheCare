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

    toast.show(message, { ...toastOptions });
  };

  return { showToast };
};
