import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1E6FD9" />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
