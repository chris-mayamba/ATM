// RegisterScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.x.x/projet_tutore/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, motdepasse }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Inscription réussie !');
        // navigation.navigate('Login');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Erreur de connexion');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Nom" value={nom} onChangeText={setNom} style={{ marginBottom: 10, borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ marginBottom: 10, borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Mot de passe" value={motdepasse} onChangeText={setMotdepasse} secureTextEntry style={{ marginBottom: 10, borderWidth: 1, padding: 8 }} />
      <Button title="S'inscrire" onPress={handleRegister} />
      {message ? <Text style={{ marginTop: 10 }}>{message}</Text> : null}
    </View>
  );
}