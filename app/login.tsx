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
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react-native';
import InputWithIcon from '@/components/InputWithIcon';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  withDelay
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useSession();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    // Entrance animations
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (e) {
      setError(e.message || 'Erreur de connexion');
      scale.value = withSequence(
        withSpring(0.95),
        withSpring(1)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
    } catch (e) {
      setError('Erreur de connexion avec Google');
      Alert.alert('Erreur', e.message || 'Impossible de se connecter avec Google');
    } finally {
      setGoogleLoading(false);
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
    primary: '#3b82f6',
    secondary: '#10b981',
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
      {/* Animated Background */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8', '#1e40af']}
        style={styles.backgroundGradient}
      />
      
      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        <Animated.View style={[styles.floatingCircle, styles.circle1]} />
        <Animated.View style={[styles.floatingCircle, styles.circle2]} />
        <Animated.View style={[styles.floatingCircle, styles.circle3]} />
      </View>

      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Header Section */}
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
              <View style={styles.sparkleContainer}>
                <Sparkles size={16} color="#3b82f6" />
              </View>
            </LinearGradient>
          </View>
          
          <Text style={[styles.title, { color: '#ffffff' }]}>
            Bienvenue
          </Text>
          <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
            Connectez-vous pour trouver les distributeurs près de vous
          </Text>
        </View>

        {/* Login Card */}
        <View style={[styles.loginCard, { backgroundColor: theme.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Connexion
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Accédez à votre compte
            </Text>
          </View>
          
          <View style={styles.formContainer}>
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

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: theme.error + '10' }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Se connecter</Text>
                    <ArrowRight size={20} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
                ou continuer avec
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Google Login */}
            <TouchableOpacity
              style={[styles.googleButton, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border,
                shadowColor: theme.text
              }]}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color={theme.primary} size="small" />
              ) : (
                <>
                  <Image 
                    source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                    style={styles.googleIcon}
                  />
                  <Text style={[styles.googleButtonText, { color: theme.text }]}>
                    Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/register')}
            >
              <Text style={[styles.registerText, { color: theme.textSecondary }]}>
                Pas encore de compte ?{' '}
                <Text style={[styles.registerLinkText, { color: theme.primary }]}>
                  Créer un compte
                </Text>
              </Text>
            </TouchableOpacity>
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
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
  },
  title: {
    fontSize: 36,
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
  loginCard: {
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
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 28,
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
  loginButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#3b82f6',
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
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
    marginBottom: 24,
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
  registerLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  registerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  registerLinkText: {
    fontFamily: 'Inter-Bold',
  },
});