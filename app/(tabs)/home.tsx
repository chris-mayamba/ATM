import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import React, { useRef, useState, useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSession } from "../../ctx";

export default function Home() {
  const mapRef = useRef(null);
  const { user } = useSession();
  const isDark = useColorScheme() === "dark";

  // Coordonnées par défaut centrées sur Kinshasa
  const latitude = user?.prefs?.latitude || -4.4419;
  const longitude = user?.prefs?.longitude || 15.2663;

  const [region, setRegion] = useState({
    latitude,
    longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const [atmMarkers, setAtmMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction optimisée pour récupérer les ATM
  const fetchAllATMs = async () => {
    setIsLoading(true);
    try {
      const query = `[out:json];
        node["amenity"="atm"](${region.latitude-0.1},${region.longitude-0.1},${region.latitude+0.1},${region.longitude+0.1});
        out;`;

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const markers = data.elements?.map(atm => ({
        id: atm.id,
        coordinate: {
          latitude: atm.lat,
          longitude: atm.lon
        },
        title: atm.tags?.operator || 'ATM',
        description: atm.tags?.name || 'Distributeur automatique'
      })) || [];

      setAtmMarkers(markers);
    } catch (error) {
      console.error("Erreur API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial et quand la région change
  useEffect(() => {
    fetchAllATMs();
  }, [region]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const location = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setRegion(newRegion);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title="Votre position"
          pinColor="blue"
        />

        {atmMarkers.map(atm => (
          <Marker
            key={atm.id}
            coordinate={atm.coordinate}
            title={atm.title}
            description={atm.description}
            pinColor="#ff0000"
          />
        ))}
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007bff' }]}
          onPress={fetchAllATMs}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="cash" size={24} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#28a745' }]}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});