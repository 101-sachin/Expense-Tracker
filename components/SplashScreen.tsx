import React, {useEffect} from 'react';
import {View, StatusBar, StyleSheet} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import Loader from './Loader';
import AppLogo from './AppLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  const {colors, isDark} = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={styles.logoContainer}>
        <AppLogo size={200} />
      </View>
      <View style={styles.loaderContainer}>
        <Loader minimal size="large" color={colors.primary} message="" />
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
