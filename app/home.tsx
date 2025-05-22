// File: app/home.js
import React from 'react';
import { View, Text, Button, useColorScheme, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSession } from '../ctx';

export default function Home() {
  const { user, logout } = useSession();
  const isDark = useColorScheme() === 'dark';

  // Récupère les coordonnées GPS depuis les préférences utilisateur
  const latitude = user?.prefs?.latitude || -11.6609;
  const longitude = user?.prefs?.longitude || 27.4794;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Text style={[styles.welcomeText, { color: isDark ? '#fff' : '#000' }]}>
        Welcome, {user?.name}
      </Text>

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
          title="You are here"
          description={`${latitude}, ${longitude}`}
        />
      </MapView>

      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={logout} color="#FF3B30" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  buttonContainer: {
    padding: 10,
  },
});
