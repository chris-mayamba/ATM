// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSession } from '../../ctx';

export default function TabsLayout() {
  const { isDark } = useSession();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'help';

          if (route.name === 'home') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ color }) => {
          let label = '';

          if (route.name === 'home') {
            label = 'Map';
          } else if (route.name === 'profile') {
            label = 'Profil';
          }

          return (
            <Text style={{ 
              color, 
              fontSize: 12, 
              marginBottom: 4, 
              fontFamily: 'Inter-Medium' 
            }}>
              {label}
            </Text>
          );
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? '#999' : '#666',
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFF',
          borderTopColor: isDark ? '#333' : '#EEE',
        },
        headerShown: false,
      })}
    />
  );
}