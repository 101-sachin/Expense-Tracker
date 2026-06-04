/**
 * Expense Tracker App
 * @format
 */

import React, {useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {ThemeProvider, useTheme} from './contexts/ThemeContext';
import {AlertProvider} from './utils/alert';
import SplashScreen from './components/SplashScreen';
import ExpenseTrackerMain from './components/ExpenseTrackerMain';

const AppContent: React.FC = () => {
  const {colors, isDark} = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      <ExpenseTrackerMain />
    </SafeAreaView>
  );
};

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
