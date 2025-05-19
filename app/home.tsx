import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, useColorScheme, TextInput, Button, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function NomDeTaPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { nom } = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        {errorMsg && <Text>{errorMsg}</Text>}
      </View>
    );
  }

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
        Voir votre emplacement
      </Text>
      <Text>Bienvenue {nom}</Text>
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
      <TouchableOpacity
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: '#28a745',
          borderRadius: 5,
        }}
        onPress={() => router.push('/map')}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Voir la carte</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: '#ff3b30',
          borderRadius: 5,
        }}
        onPress={() => router.replace('/')}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Se déconnecter</Text>
      </TouchableOpacity>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Vous êtes ici"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});