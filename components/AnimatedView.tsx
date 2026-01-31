import React, {useEffect, useRef} from 'react';
import {Animated, View, ViewProps} from 'react-native';

interface AnimatedViewProps extends ViewProps {
  children: React.ReactNode;
  fadeIn?: boolean;
  slideIn?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
}

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  fadeIn = true,
  slideIn,
  duration = 300,
  style,
  ...props
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(
    new Animated.Value(
      slideIn === 'left'
        ? -50
        : slideIn === 'right'
        ? 50
        : slideIn === 'up'
        ? -50
        : slideIn === 'down'
        ? 50
        : 0,
    ),
  ).current;

  useEffect(() => {
    Animated.parallel([
      fadeIn &&
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      slideIn &&
        Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
    ].filter(Boolean) as Animated.CompositeAnimation[]).start();
  }, [fadeAnim, slideAnim, fadeIn, slideIn, duration]);

  const animatedStyle: any = {};
  
  // Build transform array
  const transforms: any[] = [];
  
  if (slideIn) {
    if (slideIn === 'left' || slideIn === 'right') {
      transforms.push({translateX: slideAnim});
    } else {
      transforms.push({translateY: slideAnim});
    }
  }
  
  if (transforms.length > 0) {
    animatedStyle.transform = transforms;
  }
  
  if (fadeIn) {
    animatedStyle.opacity = fadeAnim;
  }

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};
