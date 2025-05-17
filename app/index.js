import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.50.51/projet_tutore/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motdepasse }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Connexion réussie !');
        // Redirige vers la page d'accueil ou une autre page
        // router.replace('/home');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mot de passe"
        value={motdepasse}
        onChangeText={setMotdepasse}
        secureTextEntry
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
      />
      <Button title="Se connecter" onPress={handleLogin} />
      {message ? <Text style={{ marginTop: 10 }}>{message}</Text> : null}
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={{ color: 'blue', marginTop: 20, textAlign: 'center' }}>
          Pas encore de compte ? S&apos;inscrire
        </Text>
      </TouchableOpacity>
    </View>
  );
}