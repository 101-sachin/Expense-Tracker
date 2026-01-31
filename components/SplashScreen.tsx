import React, {useEffect} from 'react';
import {View, ActivityIndicator, StatusBar, StyleSheet} from 'react-native';
import AppLogo from './AppLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.logoContainer}>
        <AppLogo size={200} />
      </View>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
});

export default SplashScreen;
