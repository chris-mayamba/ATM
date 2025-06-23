// app/(tabs)/home.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import * as Location from "expo-location";
import { useSession } from "../../ctx";
import { MapPin, Navigation, Star } from 'lucide-react-native';
import { lubumbashiATMs, bankColors } from '../../data/atmData';
import { Databases, ID, Client } from "appwrite";
import TransportModal from '../../components/TransportModal';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

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
  icon?: any;
  raw?: any;
};

export default function HomeScreen() {
  const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("682c932f001076e9cc68");
  const databases = new Databases(client);
  
  const saveHistory = async (atm: ATMMarker, user: any, travelTime: number | null) => {
    if (!user) return;
    try {
      await databases.createDocument(
        "683ca4080011a598c3a6",
        "683ca6bf00206a77511a",
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

  const mapRef = useRef<MapView>(null);
  const { user } = useSession();

  const isDark = useColorScheme() === "dark";
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
  const [atmDisponibilities, setAtmDisponibilities] = useState<Record<string, boolean>>({});
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [pendingATM, setPendingATM] = useState<ATMMarker | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<any>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [atmTransports, setAtmTransports] = useState<Record<string, { transport: any, estimatedTime: number }>>({});

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "La localisation est requise pour trouver les distributeurs près de vous.");
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

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (region) {
      fetchAllATMs();
    }
  }, [region]);

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
        const nearest = markers[0];
        setSelectedATM(nearest);
        setAtmDisponibilities(prev => ({
          ...prev,
          [nearest.id]: prev[nearest.id] ?? nearest.isOpen,
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des ATMs:", error);
      Alert.alert("Erreur", "Impossible de charger les données des distributeurs.");
    }
  };

  const getRouteToATM = async (atmCoord: { longitude: number; latitude: number }) => {
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

  const filteredATMs = atmMarkers.filter((atm) => {
    return atm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           atm.bank.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleATMPress = (atm: ATMMarker) => {
    setPendingATM(atm);
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
      setAtmTransports(prev => ({
        ...prev,
        [pendingATM.id]: { transport: mode, estimatedTime: time }
      }));
      setAtmDisponibilities((prev) => ({
        ...prev,
        [pendingATM.id]: prev[pendingATM.id] ?? true,
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

  const hasTransportForATM = (atmId: string) => {
    return !!atmTransports[atmId];
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
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
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#28a745" }]}
          onPress={getCurrentLocation}
        >
          <Navigation size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.atmListContainer}>
        <View style={styles.atmListHeader}>
          <Text style={[styles.atmListTitle, { color: isDark ? "#fff" : "#000" }]}>
            Distributeurs trouvés ({filteredATMs.length})
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.atmListContent}
        >
          {filteredATMs
            .sort((a, b) => a.distance - b.distance)
            .map((atm) => (
              <TouchableOpacity
                key={atm.id}
                style={[
                  styles.atmCard,
                  {
                    backgroundColor: isDark ? "#222" : "#fff",
                    borderColor: selectedATM?.id === atm.id ? "#007bff" : "#ddd",
                  }
                ]}
                onPress={() => handleATMPress(atm)}
              >
                <View style={styles.atmCardHeader}>
                  <Image source={{ uri: atm.logo }} style={styles.bankLogo} />
                  <View style={styles.atmCardInfo}>
                    <Text style={[styles.atmCardBank, { color: bankColors[atm.bank] || "#007bff" }]}>
                      {atm.bank}
                    </Text>
                    <View style={[
                      styles.atmStatusIndicator,
                      { backgroundColor: atm.isOpen ? "#28a745" : "#ffc107" }
                    ]} />
                  </View>
                </View>

                <Text style={[styles.atmCardTitle, { color: isDark ? "#fff" : "#000" }]} numberOfLines={1}>
                  {atm.name}
                </Text>

                <Text style={[styles.atmCardDescription, { color: isDark ? "#aaa" : "#666" }]} numberOfLines={2}>
                  {atm.address}
                </Text>

                <View style={styles.atmCardFooter}>
                  <View style={styles.atmCardDistance}>
                    <MapPin size={14} color={isDark ? "#aaa" : "#666"} />
                    <Text style={[styles.atmCardDistanceText, { color: isDark ? "#aaa" : "#666" }]}>
                      {atm.distance.toFixed(1)} km
                    </Text>
                  </View>

                  <View style={styles.atmCardRating}>
                    <Star size={14} color="#ffc107" />
                    <Text style={[styles.atmCardRatingText, { color: isDark ? "#aaa" : "#666" }]}>
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
                backgroundColor: isDark ? "#333" : "#fff",
              },
            ]}
          >
            {selectedATM?.logo && (
              <View style={{ marginBottom: 10 }}>
                <Image
                  source={{ uri: selectedATM.logo }}
                  style={{ width: 60, height: 60, borderRadius: 12 }}
                  resizeMode="contain"
                />
              </View>
            )}

            <Text style={[styles.modalTitle, { color: "#007bff", marginBottom: 4 }]}>
              {selectedATM?.name}
            </Text>

            {selectedATM?.distance !== undefined && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Ionicons name="walk-outline" size={18} color="#888" style={{ marginRight: 4 }} />
                <Text style={{ color: isDark ? "#fff" : "#555", fontSize: 14 }}>
                  {selectedATM.distance.toFixed(2)} km
                </Text>
              </View>
            )}

            <View style={{ height: 1, backgroundColor: "#eee", width: "100%", marginVertical: 10 }} />

            <View style={styles.rowDisponibility}>
              <Ionicons
                name={atmDisponibilities[selectedATM?.id] ? "checkmark-circle" : "close-circle"}
                size={20}
                color={atmDisponibilities[selectedATM?.id] ? "#28a745" : "#dc3545"}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                styles.modalTextInline,
                {
                  color: atmDisponibilities[selectedATM?.id] ? "#28a745" : "#dc3545",
                  fontWeight: "bold",
                  marginRight: 10,
                },
              ]}>
                {atmDisponibilities[selectedATM?.id] ? "Disponible" : "Indisponible"}
              </Text>
              <Switch
                value={!!atmDisponibilities[selectedATM?.id]}
                onValueChange={() =>
                  setAtmDisponibilities((prev) => ({
                    ...prev,
                    [selectedATM?.id]: !prev[selectedATM?.id],
                  }))
                }
                trackColor={{ false: "#dc3545", true: "#28a745" }}
                thumbColor="#fff"
              />
            </View>

            {selectedTransport && estimatedTime !== null && (
              <Text style={[styles.modalText, { color: "#007bff", fontWeight: "bold" }]}>
                Temps estimé : {estimatedTime} min
              </Text>
            )}

            <View style={{ height: 1, backgroundColor: "#eee", width: "100%", marginVertical: 10 }} />

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: "#007bff", marginTop: 16, marginBottom: 6, borderRadius: 20 },
              ]}
              onPress={async () => {
                if (selectedATM && user) {
                  await saveHistory(selectedATM, user, travelTime);
                }
                setShowModal(false);
              }}
            >
              <Text style={[styles.buttonText, { fontWeight: "bold"}]}>Démarrer l'itinéraire</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: "#6c757d", borderRadius: 20 },
              ]}
              onPress={() => {
                setShowModal(false);
                setRouteCoords([]);
                setTravelTime(null);
              }}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </Animated.View>
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

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"  // Fond blanc
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#000000"  // Texte noir
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ffffff"  // Contour blanc
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f0f0f0"  // Routes gris clair
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#d9eef5"  // Eau bleu clair
      }
    ]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: "100%",
    height: "100%"
  },
  markerContainer: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  markerImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  },
  atmListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 34,
    backgroundColor: '#fff',
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
    fontWeight: '600',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  atmCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  atmCardBank: {
    fontSize: 14,
    fontWeight: '600',
  },
  atmStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  atmCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  atmCardDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  atmCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  atmCardDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  atmCardDistanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  atmCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  atmCardRatingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
  },
  rowDisponibility: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalTextInline: {
    fontSize: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
  },
  confirmBtn: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});