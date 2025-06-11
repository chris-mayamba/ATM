// app/(tabs)/home.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import React, { useRef, useState, useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator,
  Alert,
  Text,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSession } from "../../ctx";

const ATM_ICONS: Record<string, any> = {
  Equity: require("../../assets/images/equity-icon.png"),
  Rawbank: require("../../assets/images/rawbank-icon.jpeg"),
  Default: require("../../assets/images/atm-icon.png"),
};

export default function Home() {
  const mapRef = useRef<MapView>(null);
  useSession();
  const isDark = useColorScheme() === "dark";

  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  type ATMMarker = {
    distance: number;
    id: any;
    coordinate: { latitude: number; longitude: number };
    title: string;
    description: string;
    icon: any;
    raw?: {
      name?: string;
      operator?: string;
      brand?: string;
      network?: string;
      address?: string;
      [key: string]: any;
    };
  };
  const [atmMarkers, setAtmMarkers] = useState<ATMMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [selectedATM, setSelectedATM] = useState<ATMMarker | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [atmDisponibilities, setAtmDisponibilities] = useState<
    Record<number, boolean>
  >({});

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "La localisation est requise.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const fetchAllATMs = async () => {
    if (!region) return;
    setIsLoading(true);
    try {
      const query = `[out:json];
        node["amenity"="atm"](${region.latitude - 0.1},${
        region.longitude - 0.1
      },${region.latitude + 0.1},${region.longitude + 0.1});
        out;`;

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          query
        )}`
      );

      const data = await response.json();

      const markers = data.elements.map(function (atm: { tags: {
        address: any;
        brand: any;
        network: any; operator: string; name: any; 
}; lat: number; lon: number; id: any; }) {
        const operator =
          atm.tags?.operator ||
          atm.tags?.brand ||
          atm.tags?.network ||
          atm.tags?.name ||
          "Distributeur inconnu";

        // Calculate distance from current region to ATM
        const distance = region
          ? getDistanceFromLatLonInKm(
              region.latitude,
              region.longitude,
              atm.lat,
              atm.lon
            )
          : undefined;

        return {
          id: atm.id,
          coordinate: { latitude: atm.lat, longitude: atm.lon },
          title: operator, // Le nom de la banque ou du réseau
          description: [
            atm.tags?.name,
            atm.tags?.address,
            atm.tags?.operator,
            atm.tags?.brand,
            atm.tags?.network
          ].filter(Boolean).join(" | "),
          icon: ATM_ICONS[operator] || ATM_ICONS.Default,
          distance,
          raw: atm.tags // Ajoute toutes les infos brutes pour la modal
        };
      });

      setAtmMarkers(markers);
      chooseBestATM(markers);
    } catch (error) {
      console.error("Erreur API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chooseBestATM = async (markers: any) => {
    if (!region) return;
    let best = null;
    let bestTime = Infinity;
    for (const atm of markers) {
      const duration = await getTravelTime(atm.coordinate);
      if (duration && duration < bestTime) {
        bestTime = duration;
        best = atm;
      }
    }
    if (best) {
      setSelectedATM(best);
      setShowModal(true);

      // Initialise disponibilité si elle n'existe pas encore
      setAtmDisponibilities((prev) => ({
        ...prev,
        [best.id]: prev[best.id] ?? true,
      }));

      getRouteToATM(best.coordinate);
    }
  };

  const getTravelTime = async (atmCoord: { longitude: any; latitude: any; }) => {
    if (!region) return null;
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${region.longitude},${region.latitude};${atmCoord.longitude},${atmCoord.latitude}?overview=false`
      );
      const data = await res.json();
      return Math.round(data.routes[0].duration / 60);
    } catch (e) {
      return null;
    }
  };

  const getRouteToATM = async (atmCoord: { longitude: any; latitude: any; }) => {
    if (!region) return;

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${region.longitude},${region.latitude};${atmCoord.longitude},${atmCoord.latitude}?overview=full&geometries=geojson`
      );

      const data = await response.json();
      const coords = data.routes[0].geometry.coordinates.map(
        ([lon, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lon,
        })
      );
      const duration = data.routes[0].duration;

      setRouteCoords(coords);
      setTravelTime(Math.round(duration / 60));
    } catch (error) {
      console.error("Erreur calcul itinéraire :", error);
    }
  };

  const filteredATMs = atmMarkers.filter((atm) =>
    atm.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (

    <View
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          showsUserLocation
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="Votre position"
            pinColor="blue"
          />

          {filteredATMs.map((atm) => (
            <Marker
              key={atm.id}
              coordinate={atm.coordinate}
              title={atm.title}
              description={atm.description}
              onPress={() => {
                setSelectedATM(atm);
                setShowModal(true);
                setAtmDisponibilities((prev) => ({
                  ...prev,
                  [atm.id]: prev[atm.id] ?? true,
                }));
                getRouteToATM(atm.coordinate);
              }}
            />
          ))}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="#00f"
            />
          )}
        </MapView>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#007bff" }]}
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
          style={[styles.button, { backgroundColor: "#28a745" }]}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher une banque..."
        onChangeText={setSearchQuery}
        value={searchQuery}
      />

      {filteredATMs.length > 0 && (
        <View style={{ maxHeight: 200, margin: 10, backgroundColor: "#fff", borderRadius: 8, elevation: 2 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16, margin: 10 }}>Liste des distributeurs</Text>
          {filteredATMs
            .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999))
            .map((atm) => (
              <TouchableOpacity
                key={atm.id}
                style={{ padding: 10, borderBottomWidth: 1, borderColor: "#eee" }}
                onPress={() => {
                  setSelectedATM(atm);
                  setShowModal(true);
                  getRouteToATM(atm.coordinate);
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{atm.title}</Text>
                <Text>{atm.description}</Text>
                {atm.distance !== undefined && (
                  <Text style={{ color: "#888" }}>
                    {atm.distance.toFixed(2)} km
                  </Text>
                )}
              </TouchableOpacity>
            ))}
        </View>
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedATM?.title}</Text>
            <Text style={styles.modalText}>{selectedATM?.description}</Text>
            {travelTime && (
              <Text style={styles.modalText}>
                Temps estimé : {travelTime} min
              </Text>
            )}

            <View style={styles.rowDisponibility}>
              <Text
                style={[
                  styles.modalTextInline,
                  {
                    color: atmDisponibilities[selectedATM?.id]
                      ? "green"
                      : "red",
                    fontWeight: "bold",
                    marginRight: 10,
                  },
                ]}
              >
                Disponibilité :{" "}
                {atmDisponibilities[selectedATM?.id]
                  ? "Disponible"
                  : "Indisponible"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.dispoToggleBtn,
                  {
                    backgroundColor: atmDisponibilities[selectedATM?.id]
                      ? "#dc3545"
                      : "#28a745",
                  },
                ]}
                onPress={() =>
                  setAtmDisponibilities((prev) => ({
                    ...prev,
                    [selectedATM?.id]: !prev[selectedATM?.id],
                  }))
                }
              >
                <Text style={styles.toggleText}>
                  {atmDisponibilities[selectedATM?.id] ? "❌" : "✔️"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: "#007bff" }]}
              onPress={() => setShowModal(false)}
            >

              <Text style={styles.buttonText}>Démarrer l'itinéraire</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: "#6c757d" }]}
              onPress={() => {
                setShowModal(false);
                setRouteCoords([]);
                setTravelTime(null);
              }}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

import { ViewStyle, TextStyle, ImageStyle } from "react-native";

const styles = StyleSheet.create<{
  container: ViewStyle;
  map: ViewStyle;
  controls: ViewStyle;
  button: ViewStyle;
  searchBar: TextStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  confirmBtn: ViewStyle;
}>({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  controls: {
    position: "absolute",
    bottom: 20,
    right: 20,
    gap: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    textAlign: "center",
    flexWrap: "wrap",
    color: "white",
    fontWeight: "500",
  },
  searchBar: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 14,
    textAlign: "center",
    flexWrap: "wrap",
    marginBottom: 10,
    width: "100%",
    color: "#333",
  },
  modalTextInline: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },

  rowDisponibility: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },

  dispoToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  toggleText: {
    color: "white",
    fontWeight: "bold",
  },
});
