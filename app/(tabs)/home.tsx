
// app/(tabs)/home.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,

  Animated,
  Image,
  Modal, StyleSheet,
  Switch,
  Text, TextInput, TextStyle, TouchableOpacity,
  useColorScheme,
  View, ViewStyle
} from "react-native";
import * as Location from "expo-location";
import { useSession } from "../../ctx";
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Home, 
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

export default function Home() {

  const mapRef = useRef<MapView>(null);
  const {user} = useSession();

  const isDark = useColorScheme() === "dark";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

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
  };

  const [atmMarkers, setAtmMarkers] = useState<ATMMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
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

  // Animation pour le modal
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(40)).current;

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
      // Default to Lubumbashi center if location fails
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

  // Ajoute ce useEffect pour charger les ATM dès que la région est connue
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

      // Sort by distance
      markers.sort((a, b) => a.distance - b.distance);
      setAtmMarkers(markers);
      
      // Auto-select the nearest ATM
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

  useEffect(() => {
    if (region) {
      loadATMsFromData();
    }
  }, [region]);

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


  useEffect(() => {
    if (showModal) {
      // Animation d'apparition
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
    <View
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
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
              strokeColor={theme.primary}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      );
    }
  };

  const uniqueBanks = [...new Set(atmMarkers.map(atm => atm.bank))];


      {/* Pour positionner le bouton */}
      <View style={{
        position: "absolute",
        bottom: 30,
        right: 20,
        zIndex: 10,
      }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#28a745" }]}
          onPress={getCurrentLocation}
        >
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
        </Animated.View>
      )}

      {/* ATM Details Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              { backgroundColor: theme.surface }
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <Image source={{ uri: selectedATM?.logo }} style={styles.modalBankLogo} />
                <View>
                  <Text style={[styles.modalBankName, { color: bankColors[selectedATM?.bank] || theme.primary }]}>
                    {selectedATM?.bank}
                  </Text>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedATM?.name}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                    {selectedATM?.address}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: theme.background }]}
                onPress={() => {
                  setShowModal(false);
                  setRouteCoords([]);
                  setTravelTime(null);
                }}
              >
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

      <Modal visible={showModal} transparent animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }],
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
              onPress={() => setShowModal(false)}
            >
              <Text style={[styles.buttonText, { fontWeight: "bold" }]}>Démarrer l'itinéraire</Text>
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
  card: ViewStyle;
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
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
  },
  filtersContainer: {
    paddingTop: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  bankFilters: {
    marginTop: 8,
  },
  bankChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  bankChipText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 200,
    right: 20,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPrimary: {},
  fabSecondary: {},
  atmListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 34,
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  modalHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  modalBankLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalBankName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "flex-start",
  },

  rowDisponibility: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modalInfoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  modalInfoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInfoValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  hoursText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  availabilityInfo: {
    flex: 1,
  },
  availabilityText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  availabilitySubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  availabilityToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContainer: {
    borderRadius: 12,
    padding: 16,
  },
  commentInput: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  commentSendButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalActionPrimary: {},
  modalActionSecondary: {},
  modalActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});