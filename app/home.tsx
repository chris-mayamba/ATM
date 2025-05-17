import React from 'react';
import { View, Text, useColorScheme, TextInput, Button, TouchableOpacity } from 'react-native';

export default function NomDeTaPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#181818' : '#fff',
      }}
    >
      <Text style={{ color: isDark ? '#fff' : '#181818', fontSize: 20 }}>
        Titre ou message de la page
      </Text>
      {/* Exemple d'input adapté */}
      <TextInput
        placeholder="Votre texte"
        placeholderTextColor={isDark ? '#aaa' : '#555'}
        style={{
          color: isDark ? '#fff' : '#181818',
          borderColor: isDark ? '#fff' : '#181818',
          borderWidth: 1,
          marginTop: 20,
          padding: 8,
          width: 250,
        }}
      />
      {/* Exemple de bouton */}
      <Button title="Valider" onPress={() => {}} color={isDark ? '#fff' : '#181818'} />
      {/* Exemple de lien */}
      <TouchableOpacity>
        <Text style={{ color: isDark ? '#4fa3ff' : '#007aff', marginTop: 20 }}>
          Lien ou action
        </Text>
      </TouchableOpacity>
    </View>
  );
}