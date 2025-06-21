import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { MapPin, Bell, Shield, ChevronRight } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export default function PermissionsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [locationPermission, setLocationPermission] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(null);

  const theme = {
    text: colorScheme === 'dark' ? '#f1f5f9' : '#1e293b',
    textSecondary: colorScheme === 'dark' ? '#94a3b8' : '#64748b',
    background: colorScheme === 'dark' ? '#0f0f23' : '#f8fafc',
    surface: colorScheme === 'dark' ? '#1a1a2e' : '#ffffff',
    primary: '#3b82f6',
    secondary: '#10b981',
    border: colorScheme === 'dark' ? '#374151' : '#e2e8f0',
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const locationStatus = await Location.getForegroundPermissionsAsync();
    setLocationPermission(locationStatus.status === 'granted');
    
    const notificationStatus = await Notifications.getPermissionsAsync();
    setNotificationPermission(notificationStatus.status === 'granted');
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'application a besoin de la localisation pour trouver les ATM proches.',
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: 'Ouvrir les paramètres',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Erreur permission localisation:', err);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Activez les notifications pour recevoir des alertes importantes.',
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: 'Ouvrir les paramètres',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Erreur permission notifications:', err);
    }
  };

  const PermissionItem = ({ 
    icon: Icon, 
    title, 
    description, 
    enabled, 
    onPress,
    color 
  }) => (
    <TouchableOpacity 
      style={[styles.permissionItem, { borderBottomColor: theme.border }]} 
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onPress}
        trackColor={{ false: theme.border, true: theme.primary + '40' }}
        thumbColor={enabled ? theme.primary : '#f4f3f4'}
      />
      <ChevronRight size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Gérer les permissions
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Contrôlez ce à quoi l'application peut accéder
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <PermissionItem
          icon={MapPin}
          title="Localisation"
          description="Accéder à votre position pour trouver les ATM"
          enabled={locationPermission}
          onPress={requestLocationPermission}
          color={theme.primary}
        />
        <PermissionItem
          icon={Bell}
          title="Notifications"
          description="Recevoir des alertes et notifications"
          enabled={notificationPermission}
          onPress={requestNotificationPermission}
          color={theme.secondary}
        />
      </View>

      <View style={[styles.footer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Certaines fonctionnalités peuvent ne pas être disponibles si vous désactivez ces permissions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  section: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});