import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Pressable } from 'react-native';
import { useSession } from '../ctx';
import { useRouter } from 'expo-router';
import InputWithIcon from '../components/InputWithIcon';
import * as Location from 'expo-location';
import GlassCard from '@/components/Card';
const logo = require('@/assets/images/logo.png');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useSession();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

const handleRegister = async () => {
  try {
    // 1. Demander la permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission de localisation refusée');
      return;
    }

    // 2. Récupérer la position
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // 3. Appeler `register()` avec les coordonnées
    await register(name, email, password, { latitude, longitude });
  } catch (e) {
    setError(e.message);
  }
};

  const cardBgColor = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)';
  const bgColor = isDark ? '#000' : '#f2f2f2';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: bgColor }}>
    <GlassCard
            style={{
              flex: 2/3,
              backgroundColor: cardBgColor,
              padding: 20,
              height: '200px',
            }}
            logo={logo}
          >
      <Text style={{ fontSize: 30, fontWeight: 'bold', color: textColor, marginBottom: 30, textAlign: 'center' }}>Create Account</Text>

      <InputWithIcon
        icon="user"
        placeholder="Name"
        value={name}
        onChangeText={setName}
        isDark={isDark}
      />
      <InputWithIcon
        icon="mail"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        isDark={isDark}
      />
      <InputWithIcon
        icon="lock"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        isDark={isDark}
      />

      {error && <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</Text>}
      <Pressable onPress={handleRegister} style={{
        backgroundColor: '#007aff',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center'
      }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Register</Text>
      </Pressable>

      <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 25 }}>
        <Text style={{ color: '#007aff', textAlign: 'center' }}>Already have an account? Login</Text>
      </TouchableOpacity>
      </GlassCard>
    </View>
  );
}
