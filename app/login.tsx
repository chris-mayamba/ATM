import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Pressable, Image } from 'react-native';
import { useSession } from '../ctx';
import { useRouter } from 'expo-router';
import InputWithIcon from '@/components/InputWithIcon';
import GlassCard from '@/components/Card';

// Importez votre logo (remplacez par le chemin correct)
const logo = require('@/assets/images/logo.png'); // ou utilisez une URI directe

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useSession();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  const bgColor = isDark ? '#000' : '#f2f2f2';
  const textColor = isDark ? '#fff' : '#000';
  const cardBgColor = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)';

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
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: textColor,
          marginTop: 10,
          marginBottom: 15,
          textAlign: 'center'
        }}>
          Sign In to ATMFinder
        </Text>

        <Text style={{
          fontSize: 15,
          color: textColor,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          Welcome back! Sign in to continue
        </Text>

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

        <Pressable
          onPress={handleLogin}
          style={{
            backgroundColor: '#007aff',
            paddingVertical: 14,
            marginBottom: 10,
            borderRadius: 10,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 15 }}>Sign In</Text>
        </Pressable>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          style={{ padding: 10 }}
        >
          <Text style={{
            color: textColor,
            textAlign: 'center',
            opacity: 0.8
          }}>
            Don't have an account?{' '}
            <Text style={{
              textDecorationLine: 'underline',
              color: '#007aff'
            }}>
              Create account
            </Text>
          </Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
}