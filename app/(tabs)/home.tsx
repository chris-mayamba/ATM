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
  Animated,
  StatusBar,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useSession } from "../../ctx";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ATM_ICONS: Record<string, any> = {
  Equity: require("../../assets/images/equity-icon.png"),
  Rawbank: require("../../assets/images/rawbank-icon.jpeg"),
  Default: require("../../assets/images/atm-icon.png"),
};

const GOOGLE_MAPS_API_KEY = "AIzaSyAq_iuJqvPLnoVKkxwlcibyGrSjQyvDzao";

export default function Home() {
  const mapRef = useRef<MapView>(null);
  const { user } = useSession();
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
    title: string;
    description: string;
    icon: any;
    rating?: number;
    isOpen?: boolean;
    raw?: {
      name?: string;
      vicinity?: string;
      rating?: number;
      opening_hours?: {
        open_now?: boolean;
      };
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
  const [atmDisponibilities, setAtmDisponibilities] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'nearby'>('all');

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
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'obtenir votre localisation.");
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const fetchATMsFromGoogle = async () => {
    if (!region) return;
    setIsLoading(true);
    
    try {
      const radius = 5000; // 5km radius
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=${radius}&type=atm&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const markers = data.results.map((place: any) => {
          const distance = region
            ? getDistanceFromLatLonInKm(
                region.latitude,
                region.longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              )
            : 0;

          return {
            id: place.place_id,
            coordinate: {
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            },
            title: place.name || "Distributeur ATM",
            description: place.vicinity || "Adresse non disponible",
            icon: ATM_ICONS.Default,
            distance,
            rating: place.rating || 0,
            isOpen: place.opening_hours?.open_now ?? true,
            raw: place,
          };
        });

        setAtmMarkers(markers);
        
        // Auto-select the nearest ATM
        if (markers.length > 0) {
          const nearest = markers.reduce((prev, current) => 
            prev.distance < current.distance ? prev : current
          );
          setSelectedATM(nearest);
          setAtmDisponibilities(prev => ({
            ...prev,
            [nearest.id]: prev[nearest.id] ?? true,
          }));
        }
      } else {
        Alert.alert("Erreur", "Impossible de récupérer les données des distributeurs.");
      }
    } catch (error) {
      console.error("Erreur API Google Maps:", error);
      Alert.alert("Erreur", "Problème de connexion avec Google Maps.");
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
    const matchesSearch = atm.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedFilter) {
      case 'open':
        return matchesSearch && atm.isOpen;
      case 'nearby':
        return matchesSearch && atm.distance <= 2;
      default:
        return matchesSearch;
    }
  });

  const handleATMPress = (atm: ATMMarker) => {
    setSelectedATM(atm);
    setShowModal(true);
    setAtmDisponibilities(prev => ({
      ...prev,
      [atm.id]: prev[atm.id] ?? true,
    }));
    getRouteToATM(atm.coordinate);
    
    // Center map on selected ATM
    mapRef.current?.animateToRegion({
      ...atm.coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const theme = {
    background: isDark ? '#0a0a0a' : '#f8fafc',
    surface: isDark ? '#1a1a1a' : '#ffffff',
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    text: isDark ? '#f1f5f9' : '#1e293b',
    textSecondary: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#374151' : '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: theme.surface,
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Bonjour, {user?.name?.split(' ')[0] || 'Utilisateur'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Trouvez le distributeur le plus proche
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: theme.primary }]}
            onPress={() => {}}
          >
            <Text style={styles.profileButtonText}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View 
        style={[
          styles.searchContainer,
          { 
            backgroundColor: theme.surface,
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={[styles.searchBar, { backgroundColor: theme.background }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Rechercher une banque..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: showFilters ? theme.primary : 'transparent' }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons 
              name="options" 
              size={20} 
              color={showFilters ? '#ffffff' : theme.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <Animated.View style={[styles.filtersContainer, { backgroundColor: theme.surface }]}>
            {[
              { key: 'all', label: 'Tous', icon: 'apps' },
              { key: 'open', label: 'Ouverts', icon: 'time' },
              { key: 'nearby', label: 'Proches', icon: 'location' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedFilter === filter.key ? theme.primary : theme.background,
                  }
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={selectedFilter === filter.key ? '#ffffff' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: selectedFilter === filter.key ? '#ffffff' : theme.text,
                    }
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      {/* Map */}
      <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
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
                onPress={() => handleATMPress(atm)}
              >
                <View style={[
                  styles.customMarker,
                  {
                    backgroundColor: atm.isOpen ? theme.success : theme.warning,
                    borderColor: selectedATM?.id === atm.id ? theme.primary : 'transparent',
                  }
                ]}>
                  <Ionicons name="card" size={20} color="#ffffff" />
                </View>
              </Marker>
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
      </Animated.View>

      {/* Floating Action Buttons */}
      <Animated.View style={[styles.fabContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary, { backgroundColor: theme.surface }]}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary, { backgroundColor: theme.primary }]}
          onPress={fetchATMsFromGoogle}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons name="refresh" size={24} color="#ffffff" />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* ATM List */}
      {filteredATMs.length > 0 && (
        <Animated.View 
          style={[
            styles.atmListContainer, 
            { 
              backgroundColor: theme.surface,
              opacity: fadeAnim,
            }
          ]}
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
                    <View style={[
                      styles.atmStatusIndicator,
                      { backgroundColor: atm.isOpen ? theme.success : theme.warning }
                    ]} />
                    <Text style={[styles.atmCardTitle, { color: theme.text }]} numberOfLines={1}>
                      {atm.title}
                    </Text>
                  </View>
                  
                  <Text style={[styles.atmCardDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                    {atm.description}
                  </Text>
                  
                  <View style={styles.atmCardFooter}>
                    <View style={styles.atmCardDistance}>
                      <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                      <Text style={[styles.atmCardDistanceText, { color: theme.textSecondary }]}>
                        {atm.distance.toFixed(1)} km
                      </Text>
                    </View>
                    
                    {atm.rating > 0 && (
                      <View style={styles.atmCardRating}>
                        <Ionicons name="star" size={14} color={theme.accent} />
                        <Text style={[styles.atmCardRatingText, { color: theme.textSecondary }]}>
                          {atm.rating.toFixed(1)}
                        </Text>
                      </View>
                    )}
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
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {selectedATM?.title}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {selectedATM?.description}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: theme.background }]}
                onPress={() => {
                  setShowModal(false);
                  setRouteCoords([]);
                  setTravelTime(null);
                }}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Status and Info */}
              <View style={styles.modalSection}>
                <View style={styles.modalInfoGrid}>
                  <View style={[styles.modalInfoCard, { backgroundColor: theme.background }]}>
                    <Ionicons 
                      name={selectedATM?.isOpen ? "checkmark-circle" : "time"} 
                      size={24} 
                      color={selectedATM?.isOpen ? theme.success : theme.warning} 
                    />
                    <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>
                      Statut
                    </Text>
                    <Text style={[styles.modalInfoValue, { color: theme.text }]}>
                      {selectedATM?.isOpen ? "Ouvert" : "Fermé"}
                    </Text>
                  </View>

                  <View style={[styles.modalInfoCard, { backgroundColor: theme.background }]}>
                    <Ionicons name="location" size={24} color={theme.primary} />
                    <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>
                      Distance
                    </Text>
                    <Text style={[styles.modalInfoValue, { color: theme.text }]}>
                      {selectedATM?.distance.toFixed(1)} km
                    </Text>
                  </View>

                  {travelTime && (
                    <View style={[styles.modalInfoCard, { backgroundColor: theme.background }]}>
                      <Ionicons name="car" size={24} color={theme.accent} />
                      <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>
                        Temps
                      </Text>
                      <Text style={[styles.modalInfoValue, { color: theme.text }]}>
                        {travelTime} min
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Availability Toggle */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
                  Disponibilité
                </Text>
                <View style={[styles.availabilityContainer, { backgroundColor: theme.background }]}>
                  <View style={styles.availabilityInfo}>
                    <Text style={[styles.availabilityText, { color: theme.text }]}>
                      Distributeur {atmDisponibilities[selectedATM?.id] ? "disponible" : "indisponible"}
                    </Text>
                    <Text style={[styles.availabilitySubtext, { color: theme.textSecondary }]}>
                      Aidez la communauté en signalant l'état
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.availabilityToggle,
                      {
                        backgroundColor: atmDisponibilities[selectedATM?.id] 
                          ? theme.success 
                          : theme.error
                      }
                    ]}
                    onPress={() =>
                      setAtmDisponibilities(prev => ({
                        ...prev,
                        [selectedATM?.id]: !prev[selectedATM?.id],
                      }))
                    }
                  >
                    <Ionicons 
                      name={atmDisponibilities[selectedATM?.id] ? "checkmark" : "close"} 
                      size={20} 
                      color="#ffffff" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Comment Section */}
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
                  Commentaire
                </Text>
                <View style={[styles.commentContainer, { backgroundColor: theme.background }]}>
                  <TextInput
                    style={[styles.commentInput, { color: theme.text }]}
                    placeholder="Partagez votre expérience..."
                    placeholderTextColor={theme.textSecondary}
                    value={comments[`${selectedATM?.id}_${user?.id}`] || ""}
                    onChangeText={(text) =>
                      setComments(prev => ({
                        ...prev,
                        [`${selectedATM?.id}_${user?.id}`]: text,
                      }))
                    }
                    multiline
                    numberOfLines={3}
                  />
                  <TouchableOpacity
                    style={[styles.commentSendButton, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      const commentKey = `${selectedATM?.id}_${user?.id}`;
                      const comment = comments[commentKey]?.trim();

                      if (!comment) {
                        Alert.alert("Commentaire vide", "Veuillez entrer un commentaire.");
                        return;
                      }

                      Alert.alert("Merci !", "Votre commentaire a été enregistré.");
                      setComments(prev => ({ ...prev, [commentKey]: "" }));
                    }}
                  >
                    <Ionicons name="send" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalActionSecondary, { backgroundColor: theme.background }]}
                onPress={() => {
                  setShowModal(false);
                  setRouteCoords([]);
                  setTravelTime(null);
                }}
              >
                <Text style={[styles.modalActionText, { color: theme.text }]}>
                  Fermer
                </Text>
              </TouchableOpacity>

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
                <Ionicons name="navigate" size={18} color="#ffffff" />
                <Text style={[styles.modalActionText, { color: "#ffffff" }]}>
                  Naviguer
                </Text>
              </TouchableOpacity>
            </View>
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
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
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
    fontWeight: '600',
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
    fontWeight: '400',
  },
  filterButton: {
    padding: 8,
    borderRadius: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
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
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
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
    gap: 8,
  },
  atmStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  atmCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
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
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '500',
    marginBottom: 4,
  },
  availabilitySubtext: {
    fontSize: 12,
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
    fontWeight: '600',
  },
});