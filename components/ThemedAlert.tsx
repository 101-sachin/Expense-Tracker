import React, {useEffect, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';

interface ThemedAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onDismiss?: () => void;
}

const ThemedAlert: React.FC<ThemedAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const {colors} = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim]);

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      width: '80%',
      maxWidth: 400,
      shadowColor: colors.shadowColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      padding: 16,
      paddingBottom: 8,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      padding: 16,
      paddingTop: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    lastButton: {
      borderRightWidth: 0,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    cancelButtonText: {
      color: colors.textSecondary,
    },
    destructiveButtonText: {
      color: colors.danger,
    },
  });

  const handleButtonPress = (button: typeof buttons[0]) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View
          style={[
            dynamicStyles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                dynamicStyles.alertContainer,
                {
                  transform: [{scale: scaleAnim}],
                },
              ]}>
              <Text style={dynamicStyles.title}>{title}</Text>
              <Text style={dynamicStyles.message}>{message}</Text>
              <View style={dynamicStyles.buttonContainer}>
                {buttons.map((button, index) => (
                  <AnimatedButton
                    key={index}
                    button={button}
                    style={[
                      dynamicStyles.button,
                      index === buttons.length - 1 && dynamicStyles.lastButton,
                    ]}
                    textStyle={[
                      dynamicStyles.buttonText,
                      button.style === 'cancel' &&
                        dynamicStyles.cancelButtonText,
                      button.style === 'destructive' &&
                        dynamicStyles.destructiveButtonText,
                    ]}
                    onPress={() => handleButtonPress(button)}
                  />
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const AnimatedButton: React.FC<{
  button: {text: string};
  style: any;
  textStyle: any;
  onPress: () => void;
}> = ({button, style, textStyle, onPress}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={style}>
      <Animated.View
        style={{
          transform: [{scale: scaleAnim}],
        }}>
        <Text style={textStyle}>{button.text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ThemedAlert;
