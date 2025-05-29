import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Pressable } from 'react-native';
import { useSession } from '../ctx';
import { useRouter } from 'expo-router';
import InputWithIcon from '../components/InputWithIcon';

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

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: bgColor }}>
      <Text style={{ fontSize: 30, fontWeight: 'bold', color: textColor, marginBottom: 30, textAlign: 'center' }}>Login</Text>



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

      <Pressable onPress={handleLogin} style={{
        backgroundColor: '#007aff',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center'
      }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
      </Pressable>

      <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 25 }}>
        <Text style={{ color: '#007aff', textAlign: 'center' }}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}
