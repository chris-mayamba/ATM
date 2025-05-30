// components/InputWithIcon.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function InputWithIcon({ icon, placeholder, value, onChangeText, secureTextEntry = false, isDark }) {
  const [hide, setHide] = useState(secureTextEntry);
  const inputBg = isDark ? '#1a1a1a' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const placeholderColor = isDark ? '#888' : '#666';

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: inputBg,
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ccc'
    }}>
      <Feather name={icon} size={20} color={placeholderColor} style={{ marginRight: 10 }} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={hide}
        autoCapitalize="none"
        placeholderTextColor={placeholderColor}
        style={{ flex: 1, color: textColor, fontSize: 16 }}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setHide(!hide)}>
          <Feather name={hide ? 'eye-off' : 'eye'} size={20} color={placeholderColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}
