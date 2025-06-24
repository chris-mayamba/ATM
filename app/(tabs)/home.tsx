// app/(tabs)/home.tsx
import { Ionicons } from "@expo/vector-icons";
import { useATMSync, useATMRealtime } from "@/app/atmSync";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";

import { useSession } from "@/ctx";
import { MapPin, Navigation, Star } from "lucide-react-native";
import { lubumbashiATMs, bankColors } from "../../data/atmData";
import { Databases, ID, Client, Query } from "appwrite";
import TransportModal from "../../components/TransportModal";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");

// Configuration Appwrite
const APPWRITE_CONFIG = {
  databaseId: "683ca4080011a598c3a6",
  atmStatesCollectionId: "6859c0f60012d7412a82",
  historyCollectionId: "683ca6bf00206a77511a",
};

type ATMMarker = {
  distance: number;
  id: string;
  coordinate: { latitude: number; longitude: number };
  name: string;
  bank: string;
  address: string;
  services: string[];
  isOpen: boolean;
  openingHours: string;
  rating: number;
  logo: string;
  title?: string;
  description?: string;
};

const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242424" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#E0E0E0" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242424" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#3A3A3A" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#1A2E35" }],
  },
];

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
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

export default function HomeScreen() {
  const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("682c932f001076e9cc68");
  const databases = new Databases(client);
  const { user, isDark } = useSession();

  const {
    atmDisponibilities,
    saveATMState,
    loadingStates,
    lastUpdated,
    fetchATMStates,
  } = useATMSync();

  const handleToggle = async (atmId: string) => {
    const current = atmDisponibilities[atmId] ?? true;
    const success = await saveATMState(atmId, !current);

    if (!success) {
      // Gérer l'échec si nécessaire
    }
  };

  const mapRef = useRef<MapView>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(40)).current;

  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [atmMarkers, setAtmMarkers] = useState<ATMMarker[]>([]);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [selectedATM, setSelectedATM] = useState<ATMMarker | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showTransportModal, setShowTransportModal] = useState(false);
  const [pendingATM, setPendingATM] = useState<ATMMarker | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<any>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [atmTransports, setAtmTransports] = useState<
    Record<string, { transport: any; estimatedTime: number }>
  >({});

  // Pour les mises à jour en temps réel
  useATMRealtime((payload) => {
    if (
      payload.event === "databases.*.collections.*.documents.*.update" ||
      payload.event === "databases.*.collections.*.documents.*.create"
    ) {
      fetchATMStates();
    }
  });
  const [openedFromList, setOpenedFromList] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<"marker" | "list" | null>(
    null
  ); // Ajoute cec

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    getCurrentLocation();
    fetchATMStates();

    const interval = setInterval(fetchATMStates, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (region) fetchAllATMs();
  }, [region]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "La localisation est requise pour trouver les distributeurs près de vous."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);
      if (mapRef.current?.animateToRegion) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      const defaultRegion = {
        latitude: -11.6647,
        longitude: 27.4794,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(defaultRegion);
      if (mapRef.current?.animateToRegion) {
        mapRef.current.animateToRegion(defaultRegion, 1000);
      }
    }
  };

  const fetchAllATMs = async () => {
    if (!region) return;

    try {
      const markers = lubumbashiATMs.map((atm) => {
        const distance = getDistanceFromLatLonInKm(
          region.latitude,
          region.longitude,
          atm.coordinate.latitude,
          atm.coordinate.longitude
        );

        return {
          ...atm,
          distance,
          title: atm.name,
          description: atm.address,
        };
      });

      markers.sort((a, b) => a.distance - b.distance);
      setAtmMarkers(markers);

      if (markers.length > 0) {
        setSelectedATM(markers[0]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des ATMs:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les données des distributeurs."
      );
    }
  };

  const getRouteToATM = async (atmCoord: {
    longitude: number;
    latitude: number;
  }) => {
    if (!region) return;

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${region.longitude},${region.latitude};${atmCoord.longitude},${atmCoord.latitude}?overview=full&geometries=geojson`
      );

      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lon,
          })
        );
        const duration = data.routes[0].duration;

        setRouteCoords(coords);
        setTravelTime(Math.round(duration / 60));
      }
    } catch (error) {
      console.error("Erreur calcul itinéraire :", error);
    }
  };

  const saveHistory = async (atm: ATMMarker) => {
    if (!user) return;
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.historyCollectionId,
        ID.unique(),
        {
          userId: user.$id,
          nomATM: atm.name,
          Adresse: atm.address,
          date: new Date().toISOString(),
        }
      );
    } catch (err) {
      console.log("Erreur lors de l'enregistrement de l'historique :", err);
    }
  };

  const handleSaveATMState = async (atmId: string, isAvailable: boolean) => {
    try {
      const actualAvailability = isAvailable ?? true; // Toujours disponible par défaut
      await saveATMState(atmId, actualAvailability);
    } catch (error) {
      console.error("Erreur mise à jour état ATM:", error);
    }
  };

  const filteredATMs = atmMarkers.filter((atm) => {
    return (
      atm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      atm.bank.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleATMPress = (atm: ATMMarker) => {
    setPendingATM(atm);
    setModalOrigin("list");
    setShowTransportModal(true);
  };

  const handleATMMarkerPress = (atm: ATMMarker) => {
    if (!hasTransportForATM(atm.id)) {
      Alert.alert(
        "Choix du transport requis",
        "Veuillez d'abord choisir un moyen de transport."
      );
      return;
    }
    setSelectedATM(atm);
    setModalOrigin("marker");
    setSelectedTransport(atmTransports[atm.id].transport);
    setEstimatedTime(atmTransports[atm.id].estimatedTime);
    setShowModal(true);
  };

  const handleTransportSelect = (mode: any) => {
    setShowTransportModal(false);
    if (pendingATM && mode) {
      setSelectedATM(pendingATM);
      const time = Math.round((pendingATM.distance / mode.speed) * 60);
      setEstimatedTime(time);
      setSelectedTransport(mode);
      setAtmTransports((prev) => ({
        ...prev,
        [pendingATM.id]: { transport: mode, estimatedTime: time },
      }));
      getRouteToATM(pendingATM.coordinate);
      setPendingATM(null);
      setShowModal(true);
    } else {
      setPendingATM(null);
      setSelectedTransport(null);
      setEstimatedTime(null);
    }
  };

  const hasTransportForATM = (atmId: string) => {
    return !!atmTransports[atmId];
  };

  useEffect(() => {
    if (showModal) {
      fadeAnim.setValue(0);
      translateYAnim.setValue(40);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showModal]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#121212" : "#fff",
    },
    map: {
      width: "100%",
      height: "100%",
    },
    locationButtonContainer: {
      position: "absolute",
      bottom: 30,
      right: 20,
      zIndex: 10,
    },
    button: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      elevation: 3,
      backgroundColor: "#28a745",
    },
    atmListContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 34,
      backgroundColor: isDark ? "#1E1E1E" : "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 12,
    },
    atmListHeader: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    atmListTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#E0E0E0" : "#000",
    },
    atmListContent: {
      paddingHorizontal: 20,
      gap: 12,
    },
    atmCard: {
      width: 280,
      padding: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: isDark ? "#2D2D2D" : "#ddd",
      backgroundColor: isDark ? "#222" : "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    atmCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 12,
    },
    bankLogo: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    atmCardInfo: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    atmCardBank: {
      fontSize: 14,
      fontWeight: "600",
    },
    atmStatusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    atmCardTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
      color: isDark ? "#fff" : "#000",
    },
    atmCardDescription: {
      fontSize: 14,
      marginBottom: 12,
      lineHeight: 20,
      color: isDark ? "#aaa" : "#666",
    },
    atmCardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    atmCardDistance: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    atmCardDistanceText: {
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? "#aaa" : "#666",
    },
    atmCardRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    atmCardRatingText: {
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? "#aaa" : "#666",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      padding: 20,
      borderRadius: 16,
      backgroundColor: isDark ? "#333" : "#fff",
    },
    rowDisponibility: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: "#007bff",
    },
    modalTextInline: {
      fontSize: 16,
    },
    modalText: {
      fontSize: 16,
      marginBottom: 8,
    },
    commentInputContainer: {
      marginTop: 10,
    },
    commentInput: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },
    modalActionButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
    },
    modalActionText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: "bold",
    },
    modalActionPrimary: {
      backgroundColor: "#007bff",
    },
    confirmBtn: {
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      marginBottom: 6,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
    },
    helpButton: {
      position: "absolute",
      top: 48,
      right: 20,
      zIndex: 100,
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 20,
      padding: 6,
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
  });

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          showsUserLocation
          showsMyLocationButton={false}
          provider={PROVIDER_GOOGLE}
          customMapStyle={isDark ? darkMapStyle : []}
        >
          {filteredATMs.map((atm) => (
            <Marker
              key={atm.id}
              coordinate={atm.coordinate}
              title={atm.title}
              description={atm.description}
              onPress={() => handleATMMarkerPress(atm)}
            />
          ))}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="#007AFF"
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      )}

      <View style={styles.locationButtonContainer}>
        <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
          <Navigation size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.atmListContainer}>
        <View style={styles.atmListHeader}>
          <Text style={styles.atmListTitle}>
            Distributeurs trouvés ({filteredATMs.length})
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.atmListContent}
        >
          {filteredATMs.map((atm) => (
            <TouchableOpacity
              key={atm.id}
              style={[
                styles.atmCard,
                {
                  borderColor:
                    selectedATM?.id === atm.id
                      ? "#007bff"
                      : styles.atmCard.borderColor,
                },
              ]}
              onPress={() => handleATMPress(atm)}
            >
              <View style={styles.atmCardHeader}>
                <Image source={{ uri: atm.logo }} style={styles.bankLogo} />
                <View style={styles.atmCardInfo}>
                  <Text
                    style={[
                      styles.atmCardBank,
                      { color: bankColors[atm.bank] || "#007bff" },
                    ]}
                  >
                    {atm.bank}
                  </Text>
                  <View
                    style={[
                      styles.atmStatusIndicator,
                      {
                        backgroundColor: atmDisponibilities[atm.id]
                          ? "#28a745"
                          : "#ffc107",
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.atmCardTitle} numberOfLines={1}>
                {atm.name}
              </Text>

              <Text style={styles.atmCardDescription} numberOfLines={2}>
                {atm.address}
              </Text>

              <View style={styles.atmCardFooter}>
                <View style={styles.atmCardDistance}>
                  <MapPin size={14} color={isDark ? "#aaa" : "#666"} />
                  <Text style={styles.atmCardDistanceText}>
                    {atm.distance.toFixed(1)} km
                  </Text>
                </View>

                <View style={styles.atmCardRating}>
                  <Star size={14} color="#ffc107" />
                  <Text style={styles.atmCardRatingText}>
                    {atm.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TransportModal
        visible={showTransportModal}
        onSelect={handleTransportSelect}
      />

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }],
              },
            ]}
          >
            {/* En-tête avec logo de la banque
            {selectedATM?.logo && (
              <View style={{ marginBottom: 10, alignItems: "center" }}>
                <Image
                  source={{ uri: selectedATM.logo }}
                  style={{ width: 60, height: 60, borderRadius: 12 }}
                  resizeMode="contain"
                />
              </View>
            )} */}

            <Text style={[styles.modalTitle, { color: "#007bff" }]}>
              {selectedATM?.bank}
            </Text>

            {/* Adresse et distance */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color="#888"
                style={{ marginRight: 4 }}
              />
              <Text
                style={{ color: isDark ? "#fff" : "#555", fontSize: 14 }}
                numberOfLines={2}
              >
                {selectedATM?.address}
              </Text>
            </View>

            {selectedATM?.distance !== undefined && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons
                  name="walk-outline"
                  size={18}
                  color="#888"
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: isDark ? "#fff" : "#555", fontSize: 14 }}>
                  {selectedATM.distance.toFixed(2)} km
                </Text>
              </View>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: "#eee",
                width: "100%",
                marginVertical: 10,
              }}
            />

            {/* Section disponibilité */}
            <View style={styles.rowDisponibility}>
              <Ionicons
                name={
                  atmDisponibilities[selectedATM?.id]
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={20}
                color={
                  atmDisponibilities[selectedATM?.id] ? "#28a745" : "#dc3545"
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.modalTextInline,
                  {
                    color: atmDisponibilities[selectedATM?.id]
                      ? "#28a745"
                      : "#dc3545",
                    fontWeight: "bold",
                    marginRight: 10,
                  },
                ]}
              >
                {atmDisponibilities[selectedATM?.id]
                  ? "Disponible"
                  : "Indisponible"}
              </Text>
              <Switch
                value={!!atmDisponibilities[selectedATM?.id]}
                onValueChange={() => handleToggle(selectedATM?.id)}
                trackColor={{ false: "#dc3545", true: "#28a745" }}
                thumbColor="#fff"
                disabled={loadingStates[selectedATM?.id]}
              />
              {loadingStates[selectedATM?.id] && (
                <ActivityIndicator
                  size="small"
                  color="#007bff"
                  style={{ marginLeft: 10 }}
                />
              )}
            </View>

            {/* Dernière mise à jour */}
            {lastUpdated[selectedATM?.id] && (
              <Text
                style={[
                  styles.modalText,
                  { color: isDark ? "#aaa" : "#666", fontSize: 12 },
                ]}
              >
                Mis à jour:{" "}
                {new Date(lastUpdated[selectedATM?.id]).toLocaleString()}
              </Text>
            )}

            {/* Temps estimé */}
            {selectedTransport && estimatedTime !== null && (
              <Text
                style={[
                  styles.modalText,
                  { color: "#007bff", fontWeight: "bold" },
                ]}
              >
                Temps estimé : {estimatedTime} min ({selectedTransport?.name})
              </Text>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: "#eee",
                width: "100%",
                marginVertical: 10,
              }}
            />

            {/* Boutons conditionnels */}
            {modalOrigin === "list" ? (
              <>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: "#007bff" }]}
                  onPress={async () => {
                    if (selectedATM && user) await saveHistory(selectedATM);
                    setShowModal(false);
                  }}
                >
                  <Text style={[styles.buttonText, { fontWeight: "bold" }]}>
                    Démarrer l'itinéraire
                  </Text>
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
              </>
            ) : (
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: "#6c757d" }]}
                onPress={() => {
                  setShowModal(false);
                  setRouteCoords([]);
                  setTravelTime(null);
                }}
              >
                <Text style={styles.buttonText}>Retour</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Bouton d'aide en haut à droite */}
      {/* Bouton d'aide en haut à droite */}
      <TouchableOpacity
        style={[
          styles.helpButton,
          { backgroundColor: isDark ? "#333" : "#fff" },
        ]}
        onPress={() =>
          router.push({ pathname: "/guide", params: { fromHelp: "1" } })
        }
        activeOpacity={0.7}
      >
        <Ionicons name="help-circle" size={28} color="#007bff" />
      </TouchableOpacity>
    </View>
  );
}

const theme = {
  primary: "#007bff",
  background: "#fff",
  text: "#000",
  textSecondary: "#666",
  success: "#28a745",
  warning: "#ffc107",
  accent: "#ffc107",
  border: "#ddd",
  surface: "#fff",
};

// const styles = StyleSheet.create({
//   ;
