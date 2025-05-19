// RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';

export default function RegisterScreen() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [remember, setRemember] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRegister = async () => {
    if (motdepasse !== confirm) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      const response = await fetch(
        'http://192.168.50.51/projet_tutore/api/register.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nom, prenom, email, motdepasse }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessage('Inscription réussie !');
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#181818' : '#fff',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          marginBottom: 10,
          color: isDark ? '#fff' : '#181818',
        }}
      >
        Sign Up
      </Text>
      <TextInput
        placeholder="Nom"
        value={nom}
        onChangeText={setNom}
        style={{
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isDark ? '#fff' : '#181818',
          padding: 8,
          color: isDark ? '#fff' : '#181818',
          width: 250,
          borderRadius: 5,
        }}
        placeholderTextColor={isDark ? '#aaa' : '#555'}
      />
      <TextInput
        placeholder="Prenom"
        value={prenom}
        onChangeText={setPrenom}
        style={{
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isDark ? '#fff' : '#181818',
          padding: 8,
          color: isDark ? '#fff' : '#181818',
          width: 250,
          borderRadius: 5,
        }}
        placeholderTextColor={isDark ? '#aaa' : '#555'}
      />
      <TextInput
        placeholder="email"
        value={email}
        onChangeText={setEmail}
        style={{
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isDark ? '#fff' : '#181818',
          padding: 8,
          color: isDark ? '#fff' : '#181818',
          width: 250,
          borderRadius: 5,
        }}
        placeholderTextColor={isDark ? '#aaa' : '#555'}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={motdepasse}
        onChangeText={setMotdepasse}
        secureTextEntry
        style={{
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isDark ? '#fff' : '#181818',
          padding: 8,
          color: isDark ? '#fff' : '#181818',
          width: 250,
          borderRadius: 5,
        }}
        placeholderTextColor={isDark ? '#aaa' : '#555'}
      />
      <TextInput
        placeholder="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        style={{
          marginBottom: 10,
          borderWidth: 1,
          borderColor: isDark ? '#fff' : '#181818',
          padding: 8,
          color: isDark ? '#fff' : '#181818',
          width: 250,
          borderRadius: 5,
        }}
        placeholderTextColor={isDark ? '#aaa' : '#555'}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Checkbox value={remember} onValueChange={setRemember} color={isDark ? '#fff' : '#181818'} />
        <Text style={{ color: isDark ? '#fff' : '#181818' }}>
          Remember me
        </Text>
      </View>
      <Button
        title="Sign Up"
        onPress={handleRegister}
        color={isDark ? '#fff' : '#181818'}
      />
      <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: isDark ? '#fff' : '#181818',
            borderRadius: 5,
            padding: 10,
            marginRight: 10,
          }}
        >
          <Text style={{ color: isDark ? '#fff' : '#181818' }}>
            Login with Google
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: isDark ? '#fff' : '#181818',
            borderRadius: 5,
            padding: 10,
          }}
        >
          <Text style={{ color: isDark ? '#fff' : '#181818' }}>
            Login with Facebook
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text style={{ color: '#007aff' }}>Already have an account? Sign in</Text>
      </TouchableOpacity>
      {message ? (
        <Text
          style={{
            marginTop: 10,
            color: isDark ? '#4fa3ff' : '#007aff',
          }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}