import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  useColorScheme, 
  Pressable, 
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSession } from '../ctx';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import InputWithIcon from '@/components/InputWithIcon';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
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

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
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
      Alert.alert('Erreur', 'Impossible de se connecter avec Google');
    } finally {
      setGoogleLoading(false);
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
        colors={['#3b82f6', '#1d4ed8', '#1e40af']}
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
            ATM Finder
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Trouvez facilement les distributeurs à Lubumbashi
          </Text>
        </View>

        {/* Login Form */}
        <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.formTitle, { color: theme.text }]}>
            Connexion
          </Text>
          
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
            <Text style={[styles.errorText, { color: theme.error }]}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
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

          {/* Google Login */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
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
                  Continuer avec Google
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
              Pas de compte ?{' '}
              <Text style={[styles.registerLinkText, { color: theme.primary }]}>
                Créer un compte
              </Text>
            </Text>
          </TouchableOpacity>
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
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  formTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 24,
    textAlign: 'center',
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
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
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
    marginBottom: 24,
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
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  registerLinkText: {
    fontFamily: 'Inter-SemiBold',
  },
});