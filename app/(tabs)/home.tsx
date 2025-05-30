// File: app/home.js
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSession } from "../../ctx";

export default function Home() {
  const mapRef = useRef(null);
  const { user, logout } = useSession();
  const isDark = useColorScheme() === "dark";

  // Récupère les coordonnées GPS depuis les préférences utilisateur
  const latitude = user?.prefs?.latitude || -11.6609;
  const longitude = user?.prefs?.longitude || 27.4794;


  // État local pour la région affichée sur la carte (latitude, longitude, et zoom via delta)
  const [region, setRegion] = useState({
    latitude,
    longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [atmMarkers, setAtmMarkers] = useState([]);

  // ✅ Fonction pour récupérer UNIQUEMENT les ATM "Equity"
  const fetchNearbyATMs = async (lat = region.latitude, lon = region.longitude) => {
    const radius = 10000; // rayon de recherche
    const query = `
      [out:json];
      node["amenity"="atm"]["operator"~"Equity"](around:${radius},${lat},${lon});
      out;
    `;

    try {
      const response = await fetch(
        'https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}'
      );
      const data = await response.json();

      console.log("ATM trouvés :", data.elements);

      const markers = data.elements.map((atm) => ({
        id: atm.id,
        lat: atm.lat,
        lon: atm.lon,
        name: atm.tags?.operator || "Equity Bank",
      }));

      setAtmMarkers(markers);
    } catch (error) {
      console.error("Erreur lors du chargement des ATM :", error);
      Alert.alert("Erreur", "Impossible de récupérer les ATM.");
    }
  };

  // Fonction asynchrone pour récupérer la position GPS actuelle
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission de localisation refusée");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    // Mise à jour de l’état avec la nouvelle région
    setRegion(newRegion);

    // Recentrer la carte en 1 seconde
    mapRef.current?.animateToRegion(newRegion, 1000); // 1000ms d’animation
  };

  return (
    <View
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
      {/* Barre de recherche */}
      <TextInput
        placeholder="Rechercher un lieu ou ATM"
        placeholderTextColor={isDark ? "#ccc" : "#666"}
        style={[
          styles.searchInput,
          {
            backgroundColor: isDark ? "#333" : "#f0f0f0",
            color: isDark ? "#fff" : "#000",
          },
        ]}
      />

      {/* Carte avec position */}
      <MapView ref={mapRef} style={styles.map} region={region}>
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title="Vous êtes ici"
          description={`${region.latitude}, ${region.longitude}`}
        />
      </MapView>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.roundButton}
          onPress={() => console.log("Afficher la list des ATM")}
        >
          <Ionicons name="reader" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roundButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    gap: 12,
    flexDirection: "column",
    alignItems: "center",
  },

  roundButton: {
    width: 50,
    height: 50,
    borderRadius: 25, // rend le bouton circulaire
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // pour Android
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  container: {
    flex: 1,
    paddingTop: 40,
  },
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
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
