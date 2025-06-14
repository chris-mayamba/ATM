import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  useColorScheme, 
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useSession } from '../ctx';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, MapPin } from 'lucide-react-native';
import InputWithIcon from '../components/InputWithIcon';
import * as Location from 'expo-location';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withSpring
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useSession();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission de localisation refusée');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      await register(name, email, password, { latitude, longitude });
    } catch (e) {
      setError(e.message || 'Erreur lors de la création du compte');
      scale.value = withSequence(
        withSpring(0.95),
        withSpring(1)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de créer un compte avec Google');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  const theme = {
    background: isDark ? '#0a0a0a' : '#f8fafc',
    surface: isDark ? '#1a1a1a' : '#ffffff',
    primary: '#3b82f6',
    secondary: '#10b981',
    text: isDark ? '#f1f5f9' : '#1e293b',
    textSecondary: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#374151' : '#e2e8f0',
    error: '#ef4444',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        style={styles.backgroundGradient}
      />
      
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' }}
              style={styles.logo}
            />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            Créer un compte
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Rejoignez la communauté ATM Finder
          </Text>
        </View>

        {/* Register Form */}
        <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
          <InputWithIcon
            icon={User}
            placeholder="Nom complet"
            value={name}
            onChangeText={setName}
            theme={theme}
          />

          <InputWithIcon
            icon={Mail}
            placeholder="Adresse email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            theme={theme}
          />

          <InputWithIcon
            icon={Lock}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            theme={theme}
          />

          <InputWithIcon
            icon={Lock}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            theme={theme}
          />

          {error ? (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: theme.secondary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Créer le compte</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
              ou
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Google Register */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleGoogleRegister}
          >
            <Image 
              source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
              style={styles.googleIcon}
            />
            <Text style={[styles.googleButtonText, { color: theme.text }]}>
              S'inscrire avec Google
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.loginText, { color: theme.textSecondary }]}>
              Déjà un compte ?{' '}
              <Text style={[styles.loginLinkText, { color: theme.primary }]}>
                Se connecter
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Location Notice */}
          <View style={[styles.locationNotice, { backgroundColor: theme.primary + '10' }]}>
            <MapPin size={16} color={theme.primary} />
            <Text style={[styles.locationText, { color: theme.primary }]}>
              Nous utiliserons votre localisation pour trouver les ATM proches
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  loginLink: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  loginLinkText: {
    fontFamily: 'Inter-SemiBold',
  },
  locationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    lineHeight: 16,
  },
});