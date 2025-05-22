// File: app/home.js
import React from 'react';
import { View, Text, Button, useColorScheme, StyleSheet, Dimensions, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSession } from '../../ctx';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import ProfileScreen from '../profile';

export default function Home() {
  const { user, logout } = useSession();
  const isDark = useColorScheme() === 'dark';

  // Récupère les coordonnées GPS depuis les préférences utilisateur
  const latitude = user?.prefs?.latitude || -11.6609;
  const longitude = user?.prefs?.longitude || 27.4794;

return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Barre de recherche */}
      <TextInput
        placeholder="Rechercher un lieu ou ATM"
        placeholderTextColor={isDark ? '#ccc' : '#666'}
        style={[
          styles.searchInput,
          {
            backgroundColor: isDark ? '#333' : '#f0f0f0',
            color: isDark ? '#fff' : '#000',
          },
        ]}
      />

      {/* Carte avec position */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Vous êtes ici"
          description={`${latitude}, ${longitude}`}
        />
      </MapView>

      {/* Bouton logout */}
      {/* <View style={styles.buttonContainer}>
        <Button title="Se déconnecter" onPress={logout} color="#FF3B30" />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  buttonContainer: {
    padding: 10,
  },
  searchInput: {
    height: 40,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});
