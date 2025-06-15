import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export default function InputWithIcon({ 
  icon: Icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  theme,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  ...props 
}) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.background, 
      borderColor: theme.border,
      shadowColor: theme.text
    }]}>
      <Icon size={20} color={theme.textSecondary} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...props}
      />
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setIsSecure(!isSecure)}
        >
          {isSecure ? (
            <EyeOff size={20} color={theme.textSecondary} />
          ) : (
            <Eye size={20} color={theme.textSecondary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  eyeButton: {
    padding: 4,
  },
});