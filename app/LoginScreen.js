// LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.x.x/projet_tutore/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motdepasse }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Connexion réussie !');
        // navigation.navigate('Home');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ marginBottom: 10, borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Mot de passe" value={motdepasse} onChangeText={setMotdepasse} secureTextEntry style={{ marginBottom: 10, borderWidth: 1, padding: 8 }} />
      <Button title="Se connecter" onPress={handleLogin} />
      {message ? <Text style={{ marginTop: 10 }}>{message}</Text> : null}
    </View>
  );
}