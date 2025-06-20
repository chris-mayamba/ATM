// app/(tabs)/home.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
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
  TextInput,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle
} from "react-native";
import * as Location from "expo-location";
import { useSession } from "../../ctx";
import { LinearGradient } from 'expo-linear-gradient';
import {
  Home as HomeIcon,
  Search,
  MapPin,
  Navigation,
  RefreshCw,
  User,
  Star,
  Clock,
  Car,
  CheckCircle,
  X,
  Send,
  Filter,
  CreditCard,
  Building2
} from 'lucide-react-native';
import { lubumbashiATMs, bankColors, getBankLogo } from '../../data/atmData';
import { Databases, ID, Client } from "appwrite";

// Platform-specific imports
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;
let WebMap: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} else {
  WebMap = require('../../components/WebMap').default;
}

const { width, height } = Dimensions.get('window');

// Type pour les marqueurs ATM
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
        "683ca4080011a598c3a6", // Remplace par ton databaseId
        "683ca6bf00206a77511a", // Remplace par ta collectionId
        ID.unique(),
        {
          userId: user.$id,
          nomATM: atm.name,
          adresse: atm.address,
          banque: atm.bank,
          date: new Date().toISOString(),
          operation: "Itinéraire",
          travelTime: travelTime || null,
        }
      );
    } catch (err) {
      console.log("Erreur lors de l'enregistrement de l'historique :", err);
    }
  };

  const mapRef = useRef<MapView>(null);
  const { user } = useSession();

  const isDark = useColorScheme() === "dark";
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(40)).current;

  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  const [atmMarkers, setAtmMarkers] = useState<ATMMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [selectedATM, setSelectedATM] = useState<ATMMarker | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [atmDisponibilities, setAtmDisponibilities] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'nearby' | 'bank'>('all');
  const [selectedBank, setSelectedBank] = useState<string>('all');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
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
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
    const matchesSearch = atm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         atm.bank.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    switch (selectedFilter) {
      case 'open':
        matchesFilter = atm.isOpen;
        break;
      case 'nearby':
        matchesFilter = atm.distance <= 2;
        break;
      case 'bank':
        matchesFilter = selectedBank === 'all' || atm.bank === selectedBank;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  const handleATMPress = (atm: ATMMarker) => {
    setSelectedATM(atm);
    setShowModal(true);
    setAtmDisponibilities((prev) => ({
      ...prev,
      [atm.id]: prev[atm.id] ?? true,
    }));
    getRouteToATM(atm.coordinate);
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
              image={atm.icon}
              onPress={() => handleATMPress(atm)}
            />
          ))}

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor={theme.primary}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      )}

      {/* Bouton de localisation */}
      <View style={styles.locationButtonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#28a745" }]}
          onPress={getCurrentLocation}
        >
          <Navigation size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Liste des ATMs */}
      <View style={styles.atmListContainer}>
        <View style={styles.atmListHeader}>
          <Text style={[styles.atmListTitle, { color: theme.text }]}>
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
                    backgroundColor: theme.background,
                    borderColor: selectedATM?.id === atm.id ? theme.primary : theme.border,
                  }
                ]}
                onPress={() => handleATMPress(atm)}
              >
                <View style={styles.atmCardHeader}>
                  <Image source={{ uri: atm.logo }} style={styles.bankLogo} />
                  <View style={styles.atmCardInfo}>
                    <Text style={[styles.atmCardBank, { color: bankColors[atm.bank] || theme.primary }]}>
                      {atm.bank}
                    </Text>
                    <View style={[
                      styles.atmStatusIndicator,
                      { backgroundColor: atm.isOpen ? theme.success : theme.warning }
                    ]} />
                  </View>
                </View>

                <Text style={[styles.atmCardTitle, { color: theme.text }]} numberOfLines={1}>
                  {atm.name}
                </Text>

                <Text style={[styles.atmCardDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                  {atm.address}
                </Text>

                <View style={styles.atmCardFooter}>
                  <View style={styles.atmCardDistance}>
                    <MapPin size={14} color={theme.textSecondary} />
                    <Text style={[styles.atmCardDistanceText, { color: theme.textSecondary }]}>
                      {atm.distance.toFixed(1)} km
                    </Text>
                  </View>

                  <View style={styles.atmCardRating}>
                    <Star size={14} color={theme.accent} />
                    <Text style={[styles.atmCardRatingText, { color: theme.textSecondary }]}>
                      {atm.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* Modal des détails ATM */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }],
                backgroundColor: theme.surface,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              },
            ]}
          >
            {/* Logo banque */}
            {selectedATM?.icon && (
              <View style={{ marginBottom: 10 }}>
                <Image
                  source={selectedATM.icon}
                  style={{ width: 60, height: 60, borderRadius: 12 }}
                  resizeMode="contain"
                />
              </View>
            )}

            <Text style={[styles.modalTitle, { color: "#007bff", marginBottom: 4 }]}>
              {selectedATM?.title}
            </Text>

            {/* Adresse et distance */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Ionicons name="location-outline" size={18} color="#888" style={{ marginRight: 4 }} />
              <Text style={{ color: "#555", fontSize: 14, flex: 1 }}>
                {selectedATM?.raw?.address || "Adresse inconnue"}
              </Text>
            </View>
            {selectedATM?.distance !== undefined && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Ionicons name="walk-outline" size={18} color="#888" style={{ marginRight: 4 }} />
                <Text style={{ color: "#555", fontSize: 14 }}>
                  {selectedATM.distance.toFixed(2)} km
                </Text>
              </View>
            )}

            {/* Séparateur */}
            <View style={{ height: 1, backgroundColor: "#eee", width: "100%", marginVertical: 10 }} />

            {/* Disponibilité */}
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

            {/* Temps estimé */}
            {travelTime && (
              <Text style={[styles.modalText, { color: "#007bff", fontWeight: "bold" }]}>
                Temps estimé : {travelTime} min
              </Text>
            )}

            {/* Séparateur */}
            <View style={{ height: 1, backgroundColor: "#eee", width: "100%", marginVertical: 10 }} />

            {/* Commentaire */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Laisser un commentaire..."
                value={comments[`${selectedATM?.id}_${user?.id}`] || ""}
                onChangeText={(text) =>
                  setComments((prev) => ({
                    ...prev,
                    [`${selectedATM?.id}_${user?.id}`]: text,
                  }))
                }
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalActionPrimary, { backgroundColor: theme.primary }]}
                onPress={() => {
                  Alert.alert(
                    "Navigation",
                    "Ouvrir dans l'application de navigation ?",
                    [
                      { text: "Annuler", style: "cancel" },
                      { text: "Ouvrir", onPress: () => console.log("Navigation started") }
                    ]
                  );
                }}
              >
                <Navigation size={18} color="#ffffff" />
                <Text style={[styles.modalActionText, { color: "#ffffff" }]}>
                  Naviguer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Boutons actions */}
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
  // Votre style de carte sombre ici
];

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

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: "100%",
    height: "100%"
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
    fontFamily: 'Poppins-SemiBold',
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
    fontFamily: 'Inter-SemiBold',
  },
  atmStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  atmCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  atmCardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Medium',
  },
  atmCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  atmCardRatingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
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
    backgroundColor: '#fff',
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
  commentInputContainer: {
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalActionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  modalActionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActionPrimary: {
    backgroundColor: '#007bff',
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