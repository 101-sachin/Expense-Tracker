import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {fonts} from '../utils/fonts';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  minimal?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 'large',
  color,
  style,
  minimal = false,
}) => {
  const {colors} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const loaderColor = color || colors.primary;

  const content = (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
        style,
      ]}>
      {minimal ? (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <ActivityIndicator size={size} color={loaderColor} />
          {message && (
            <Text style={[styles.message, {marginTop: 0, marginLeft: 8, color: colors.textSecondary}]}>
              {message}
            </Text>
          )}
        </View>
      ) : (
        <View style={[styles.loaderWrapper, {backgroundColor: colors.surface}]}>
          <ActivityIndicator size={size} color={loaderColor} />
          {message && (
            <Text style={[styles.message, {color: colors.textSecondary}]}>
              {message}
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreenOverlay,
          {backgroundColor: 'rgba(0,0,0,0.4)'},
        ]}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderWrapper: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
});

export default Loader;
