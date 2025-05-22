import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Switch,
  useColorScheme,
  StyleSheet,
  Button,
} from 'react-native';
import { useSession } from '../../ctx'; // Pour récupérer le nom de l'utilisateur

export default function ProfileScreen() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { user, logout } = useSession(); // Pour accéder à user.name et logout

  const toggleSwitch = () => setIsDarkTheme(prev => !prev);

  const backgroundColor = isDarkTheme ? '#000' : '#fff';
  const textColor = isDarkTheme ? '#fff' : '#000';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Button title="Profile" onPress={() => {}} />
      <View style={styles.avatar} />
      <Text style={[styles.welcomeText, { color: textColor }]}>
        Bonjour {user?.name || 'Invité'}
      </Text>

      <View style={styles.switchContainer}>
        <Text style={{ color: textColor }}>Thème sombre</Text>
        <Switch
          value={isDarkTheme}
          onValueChange={toggleSwitch}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkTheme ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {/* Bouton Logout en bas */}
      <Button title="Logout" onPress={logout} color="#FF3B30" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#aaa',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
