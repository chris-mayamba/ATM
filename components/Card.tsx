import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';

const GlassCard = ({ children, style, onPress, logo }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      {/* Fond semi-transparent avec bordure pour effet glass */}
      <View style={styles.glassBackground} />

      {/* Logo optionnel */}
      {logo && (
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>
      )}

      {/* Contenu de la carte */}
      <View style={styles.content}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    padding: 16,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});

export default GlassCard;