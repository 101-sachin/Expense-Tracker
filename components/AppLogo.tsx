import React from 'react';
import {Image, StyleSheet, ImageSourcePropType, View} from 'react-native';

/**
 * App Logo Component
 * Uses the logo image from assets/images/logo.png
 */
const AppLogo: React.FC<{size?: number}> = ({size = 200}) => {
  const logoImage: ImageSourcePropType = require('../assets/images/logo.png');

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Image
        source={logoImage}
        style={[styles.logo, {width: size, height: size}]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    // Image will maintain aspect ratio and fit within the size
  },
});

export default AppLogo;
