import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  useColorScheme, 
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { useSession } from '../ctx';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, MapPin, ArrowRight, Shield } from 'lucide-react-native';
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

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
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
      let location = null;
      
      if (status === 'granted') {
        try {
          const locationResult = await Location.getCurrentPositionAsync({});
          location = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude
          };
        } catch (locationError) {
          console.log('Location error:', locationError);
        }
      }

      await register(name, email, password, location);
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
      Alert.alert('Erreur', e.message || 'Impossible de créer un compte avec Google');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ]
  }));

  const theme = {
    background: isDark ? '#0f0f23' : '#f8fafc',
    surface: isDark ? '#1a1a2e' : '#ffffff',
    primary: '#10b981',
    secondary: '#3b82f6',
    accent: '#f59e0b',
    text: isDark ? '#f1f5f9' : '#1e293b',
    textSecondary: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#374151' : '#e2e8f0',
    error: '#ef4444',
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        style={styles.backgroundGradient}
      />
      
      <View style={styles.floatingElements}>
        <Animated.View style={[styles.floatingCircle, styles.circle1]} />
        <Animated.View style={[styles.floatingCircle, styles.circle2]} />
        <Animated.View style={[styles.floatingCircle, styles.circle3]} />
      </View>

      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#ffffff', '#f1f5f9']}
              style={styles.logoGradient}
            >
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' }}
                style={styles.logo}
              />
              <View style={styles.shieldContainer}>
                <Shield size={16} color="#10b981" />
              </View>
            </LinearGradient>
          </View>
          
          <Text style={[styles.title, { color: '#ffffff' }]}>
            Rejoignez-nous
          </Text>
          <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
            Créez votre compte pour accéder aux distributeurs
          </Text>
        </View>

        <View style={[styles.registerCard, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Créer un compte
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Rejoignez la communauté ATM Finder
            </Text>
          </View>

          <View style={styles.formContainer}>
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
              <View style={[styles.errorContainer, { backgroundColor: theme.error + '10' }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: theme.primary }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Créer le compte</Text>
                    <ArrowRight size={20} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
                ou continuer avec
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border,
                shadowColor: theme.text
              }]}
              onPress={handleGoogleRegister}
            >
              <Image 
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
              />
              <Text style={[styles.googleButtonText, { color: theme.text }]}>
                Google
              </Text>
            </TouchableOpacity>

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

            <View style={[styles.locationNotice, { backgroundColor: theme.primary + '10' }]}>
              <MapPin size={16} color={theme.primary} />
              <Text style={[styles.locationText, { color: theme.primary }]}>
                Nous utiliserons votre localisation pour trouver les ATM proches
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  circle1: {
    width: 100,
    height: 100,
    top: 100,
    right: 50,
  },
  circle2: {
    width: 60,
    height: 60,
    top: 200,
    left: 30,
  },
  circle3: {
    width: 80,
    height: 80,
    top: 150,
    right: 150,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  shieldContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  registerCard: {
    borderRadius: 32,
    padding: 32,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  formContainer: {
    gap: 4,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  registerButton: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
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
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 20,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  googleButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  loginLink: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  loginLinkText: {
    fontFamily: 'Inter-Bold',
  },
  locationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    lineHeight: 16,
  },
});