import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, useColorScheme, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Ajout pour la navigation

const { width } = Dimensions.get('window');

const pages = [
  {
    title: 'Création du compte',
    description: 'Créez votre compte pour accéder à toutes les fonctionnalités de l’application.',
    image: require('../assets/images/catalogue/signup.jpg'),
  },
  {
    title: 'Page de connexion',
    description: 'Si vous avez déjà un compte connectez-vous avec vos identifiants pour sécuriser l’accès .',
    image: require('../assets/images/catalogue/login.jpg'),
  },
  {
    title: 'Accueil',
    description: 'Visualisez la liste des distributeurs disponibles autour de vous et accédez rapidement aux principales fonctionnalités.',
    image: require('../assets/images/catalogue/home.jpg'),
  },
  {
    title: 'Message',
    description: 'Recevez des notifications ou des messages d’erreur pour vous guider lors de l’utilisation spécialement quand vous voulez accéder aux détails du distributeur via son marqueur sur la carte sans avoir choisi au préalable comment vous vous y rendez.',
    image: require('../assets/images/catalogue/msgerreur.jpg'),
  },
  {
    title: 'Choix du transport',
    description: 'Sélectionnez le mode de transport sur la fenetre qui apparait via la liste des distributeurs trouvés pour obtenir l’itinéraire vers le distributeur choisi.',
    image: require('../assets/images/catalogue/transport.jpg'),
  },
  {
    title: 'Détails du distributeur',
    description: 'Consultez les informations détaillées d’un distributeur ',
    image: require('../assets/images/catalogue/atmdetails.jpg'),
  },
  {
    title: 'Profil utilisateur',
    description: ' Les informations sur vos visites aux distributeurs  .',
    image: require('../assets/images/catalogue/profilut.jpg'),
  },
  // Ajoutez d’autres pages ici
];

export default function GuideScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter(); // Ajout pour la navigation
  const theme = {
    background: isDark ? '#0f0f23' : '#f8fafc',
    surface: isDark ? '#1a1a2e' : '#ffffff',
    text: isDark ? '#f1f5f9' : '#1e293b',
    textSecondary: isDark ? '#94a3b8' : '#64748b',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8', '#1e40af']}
        style={styles.headerBg}
      />
      <Text style={[styles.title, { color: theme.text }]}>Bienvenu sur ATM Locator</Text>
      {pages.map((page, idx) => (
        <View key={idx} style={[styles.card, { backgroundColor: theme.surface }]}>
          <Image source={page.image} style={styles.image} resizeMode="contain" />
          <Text style={[styles.cardTitle, { color: theme.text }]}>{page.title}</Text>
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{page.description}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: '#3b82f6' }]}
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.startButtonText}>Commencer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerBg: {
    height: 120,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 48,
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    margin: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: width * 0.8,
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 15,
    textAlign: 'center',
  },
  startButton: {
    marginHorizontal: 32,
    marginVertical: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});