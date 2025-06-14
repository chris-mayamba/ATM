import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Switch,
  useColorScheme,
  StatusBar,
  Animated,
  Alert,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { useSession } from "../../ctx";
import { Client, Databases, Query } from "appwrite";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("682c932f001076e9cc68");

const databases = new Databases(client);

export default function ProfileScreen() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { user, logout } = useSession();
  const [historique, setHistorique] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  const theme = {
    background: isDarkTheme ? '#0a0a0a' : '#f8fafc',
    surface: isDarkTheme ? '#1a1a1a' : '#ffffff',
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    text: isDarkTheme ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkTheme ? '#94a3b8' : '#64748b',
    border: isDarkTheme ? '#374151' : '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchHistorique = async () => {
      try {
        if (!user) return;
        setIsLoading(true);
        const response = await databases.listDocuments(
          "683ca4080011a598c3a6",
          "683ca6bf00206a77511a",
          [Query.equal("userId", user.$id), Query.orderDesc("$createdAt")]
        );
        setHistorique(response.documents);
      } catch (err) {
        console.error("Erreur lors du chargement de l'historique :", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorique();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Déconnexion", style: "destructive", onPress: logout }
      ]
    );
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Animated.View 
      style={[
        styles.statCard, 
        { 
          backgroundColor: theme.surface,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statTitle, { color: theme.textSecondary }]}>{title}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    </Animated.View>
  );

  const HistoryItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.historyItem, 
        { 
          backgroundColor: theme.surface,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={[styles.historyIconContainer, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name="card" size={20} color={theme.primary} />
      </View>
      <View style={styles.historyContent}>
        <Text style={[styles.historyTitle, { color: theme.text }]}>
          {item.nomATM || 'Distributeur ATM'}
        </Text>
        <Text style={[styles.historySubtitle, { color: theme.textSecondary }]}>
          {item.operation || 'Consultation'}
        </Text>
        <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
          {new Date(item.date || item.$createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme.primary, theme.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <Animated.View 
            style={[
              styles.headerContent,
              { 
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </Text>
                <View style={[styles.onlineIndicator, { backgroundColor: theme.success }]} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'Utilisateur'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => {}}
            >
              <Ionicons name="settings-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <StatCard 
            icon="location" 
            title="ATM Visités" 
            value={historique.length.toString()} 
            color={theme.primary} 
          />
          <StatCard 
            icon="time" 
            title="Cette Semaine" 
            value="3" 
            color={theme.secondary} 
          />
          <StatCard 
            icon="star" 
            title="Points" 
            value="127" 
            color={theme.accent} 
          />
        </View>

        {/* Settings Section */}
        <Animated.View 
          style={[
            styles.section,
            { 
              backgroundColor: theme.surface,
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Préférences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: theme.accent + '20' }]}>
                <Ionicons name="moon" size={20} color={theme.accent} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Thème sombre</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Activer le mode sombre
                </Text>
              </View>
            </View>
            <Switch 
              value={isDarkTheme} 
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary + '40' }}
              thumbColor={isDarkTheme ? theme.primary : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: theme.secondary + '20' }]}>
                <Ionicons name="notifications" size={20} color={theme.secondary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Notifications</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Gérer les notifications
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Confidentialité</Text>
                <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                  Paramètres de confidentialité
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* History Section */}
        <Animated.View 
          style={[
            styles.section,
            { 
              backgroundColor: theme.surface,
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Historique Récent</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Chargement de l'historique...
              </Text>
            </View>
          ) : historique.length > 0 ? (
            <FlatList
              data={historique.slice(0, 5)}
              keyExtractor={(item) => item.$id}
              renderItem={({ item, index }) => <HistoryItem item={item} index={index} />}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun historique</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Vos visites d'ATM apparaîtront ici
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Logout Section */}
        <Animated.View 
          style={[
            styles.section,
            { 
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: theme.error + '10', borderColor: theme.error + '30' }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>Se déconnecter</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarText: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 64,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  historySubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});