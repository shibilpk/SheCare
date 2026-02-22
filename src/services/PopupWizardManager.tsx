import React, { createContext, useContext, useState, useRef } from 'react';
import PopupWizard, { PopupScreen } from '../components/common/PopupWizard';

interface PopupWizardContextType {
  showWizard: (screens: PopupScreen[], onComplete?: (data: Record<string, any>) => void | Promise<void>, gradientColors?: string[]) => void;
  hideWizard: () => void;
}

const PopupWizardContext = createContext<PopupWizardContextType>({
  showWizard: () => {},
  hideWizard: () => {},
});

export const usePopupWizard = () => useContext(PopupWizardContext);

interface PopupWizardProviderProps {
  children: React.ReactNode;
}

export function PopupWizardProvider({ children }: PopupWizardProviderProps) {
  const [visible, setVisible] = useState(false);
  const [screens, setScreens] = useState<PopupScreen[]>([]);
  const [gradientColors, setGradientColors] = useState<string[]>(['#EC4899', '#8B5CF6']);
  const onCompleteCallbackRef = useRef<((data: Record<string, any>) => void | Promise<void>) | undefined>();

  const showWizard = (
    wizardScreens: PopupScreen[],
    onComplete?: (data: Record<string, any>) => void | Promise<void>,
    colors?: string[]
  ) => {
    setScreens(wizardScreens);
    onCompleteCallbackRef.current = onComplete;
    if (colors) {
      setGradientColors(colors);
    }
    setVisible(true);
  };

  const hideWizard = () => {
    setVisible(false);
    // Reset after animation completes
    setTimeout(() => {
      setScreens([]);
      onCompleteCallbackRef.current = undefined;
      setGradientColors(['#EC4899', '#8B5CF6']);
    }, 500);
  };

  const handleComplete = async (data: Record<string, any>) => {


    // Hide wizard first
    setVisible(false);

    // Execute callback after a delay to ensure clean unmount
    setTimeout(async () => {
      if (onCompleteCallbackRef.current) {
        try {
          await onCompleteCallbackRef.current(data);
        } catch (error) {
          console.error('Error in wizard completion callback:', error);
        }
      }
    }, 100);
  };

  const handleSkip = () => {
    hideWizard();
  };

  return (
    <PopupWizardContext.Provider value={{ showWizard, hideWizard }}>
      {children}
      {visible && screens.length > 0 && (
        <PopupWizard
          visible={visible}
          screens={screens}
          onComplete={handleComplete}
          onSkip={handleSkip}
          gradientColors={gradientColors}
        />
      )}
    </PopupWizardContext.Provider>
  );
}
