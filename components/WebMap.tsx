import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';

const { width, height } = Dimensions.get('window');

interface WebMapProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  atmMarkers: Array<{
    id: string;
    coordinate: { latitude: number; longitude: number };
    title: string;
    description: string;
    isOpen?: boolean;
  }>;
  onMarkerPress: (atm: any) => void;
  selectedATM?: { id: string } | null;
  routeCoords: Array<{ latitude: number; longitude: number }>;
  isDark: boolean;
  mapRef?: any;
}

export default function WebMap({ 
  region, 
  atmMarkers, 
  onMarkerPress, 
  selectedATM, 
  routeCoords, 
  isDark 
}: WebMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [routeLine, setRouteLine] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && region) {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAq_iuJqvPLnoVKkxwlcibyGrSjQyvDzao&libraries=places`;
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
  }, [region]);

  const initializeMap = () => {
    if (!region || !mapRef.current) return;

    const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
      center: { lat: region.latitude, lng: region.longitude },
      zoom: 15,
      styles: isDark ? [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] }
      ] : [],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(mapInstance);
  };

  useEffect(() => {
    if (map && atmMarkers.length > 0) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      const newMarkers = atmMarkers.map(atm => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: atm.coordinate.latitude, lng: atm.coordinate.longitude },
          map: map,
          title: atm.title,
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: atm.isOpen ? '#10b981' : '#f59e0b',
            fillOpacity: 1,
            strokeColor: selectedATM?.id === atm.id ? '#3b82f6' : '#ffffff',
            strokeWeight: 3,
          }
        });

        marker.addListener('click', () => {
          onMarkerPress(atm);
        });

        return marker;
      });

      setMarkers(newMarkers);
    }
  }, [map, atmMarkers, selectedATM]);

  useEffect(() => {
    if (map && routeCoords.length > 0) {
      // Clear existing route
      if (routeLine) {
        routeLine.setMap(null);
      }

      const path = routeCoords.map(coord => ({
        lat: coord.latitude,
        lng: coord.longitude
      }));

      const polyline = new (window as any).google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      polyline.setMap(map);
      setRouteLine(polyline);
    }
  }, [map, routeCoords]);

  if (typeof window === 'undefined') {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 20,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});