import React, { createContext, useContext, useState, useEffect } from 'react';
import UpdateScreen from '../screens/common/update/UpdateScreen';

interface UpdateContextType {
  showUpdate: (isRequired?: boolean) => void;
  hideUpdate: () => void;
}

const UpdateContext = createContext<UpdateContextType>({
  showUpdate: () => {},
  hideUpdate: () => {},
});

export const useUpdate = () => useContext(UpdateContext);

interface UpdateProviderProps {
  children: React.ReactNode;
}

export function UpdateProvider({ children }: UpdateProviderProps) {
  const [visible, setVisible] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [currentVersion] = useState('2.0.0');

  // You can add version check logic here
  useEffect(() => {
    // Example: Check for updates on app start
    // checkForUpdates();
  }, []);

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
    <UpdateContext.Provider value={{ showUpdate, hideUpdate }}>
      {children}
      <UpdateScreen
        visible={visible}
        onSkip={hideUpdate}
        onUpdate={handleUpdate}
        version={currentVersion}
        isRequired={isRequired}
        updateNotes={[
          'Improved sleep tracking with detailed analytics',
          'New health insights dashboard',
          'Bug fixes and performance improvements',
          'Enhanced medication reminders',
          'Better UI/UX experience',
        ]}
      />
    </UpdateContext.Provider>
  );
}
