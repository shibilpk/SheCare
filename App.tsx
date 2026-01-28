import RootNavigation from './src/services/Navigation';
import { ToastProvider } from 'react-native-toast-notifications';

export default function App() {
  return (
    <ToastProvider>
      <RootNavigation />
    </ToastProvider>
  );
}
