import React, {useRef} from 'react';
import {TouchableOpacity, TouchableOpacityProps, Animated} from 'react-native';

interface AnimatedTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleValue?: number;
}

export const AnimatedTouchable: React.FC<AnimatedTouchableProps> = ({
  children,
  scaleValue = 0.95,
  style,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
    onPressOut?.(e);
  };

  // Extract flex-related styles to pass to TouchableOpacity
  const touchableStyle = Array.isArray(style)
    ? style
    : style
    ? [style]
    : [];

  return (
    <Animated.View
      style={{
        transform: [{scale: scaleAnim}],
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={touchableStyle}
        {...props}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};
