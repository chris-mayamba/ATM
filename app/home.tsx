import { useRouter } from 'expo-router'; // Importer le router

import React from 'react';
import { Button, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function NomDeTaPage() {
    const router = useRouter(); // Initialiser le router
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isLight = colorScheme === 'light';

  
  const handleLogout = async () => {
    await clearSession();
    router.replace('/login'); // Rediriger vers la page de connexion
  };

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

function clearSession() {
  throw new Error('Function not implemented.');
}
