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
  ActivityIndicator,
} from "react-native";
import { useSession } from "@/ctx";
import { Client, Databases, Query, ID } from "appwrite";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Settings,
  Moon,
  Bell,
  Shield,
  LogOut,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  FileText,
  Key,
  Building2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("682c932f001076e9cc68");

const databases = new Databases(client);

export default function ProfileScreen() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { user, logout } = useSession();
  const [historique, setHistorique] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const colorScheme = useColorScheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const [showAllHistory, setShowAllHistory] = useState(false);
  const router = useRouter();

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  const theme = {
    background: isDarkTheme ? "#0f0f23" : "#f8fafc",
    surface: isDarkTheme ? "#1a1a2e" : "#ffffff",
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#f59e0b",
    text: isDarkTheme ? "#f1f5f9" : "#1e293b",
    textSecondary: isDarkTheme ? "#94a3b8" : "#64748b",
    border: isDarkTheme ? "#374151" : "#e2e8f0",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
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
        console.log("Could not load history:", err);
        setHistorique([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchHistorique();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          setLogoutLoading(true);
          try {
            await logout();
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert(
              "Erreur",
              "Impossible de se déconnecter. Veuillez réessayer."
            );
          } finally {
            setLogoutLoading(false);
          }
        },
      },
    ]);
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "L'application a besoin de la permission de localisation pour fonctionner correctement.",
          [
            {
              text: "Annuler",
              style: "cancel",
            },
            {
              text: "Ouvrir les paramètres",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error("Erreur lors de la demande de permission:", err);
      return false;
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.surface,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
      >
        <Icon size={24} color={color} />
      </View>
      <Text style={[styles.statTitle, { color: theme.textSecondary }]}>
        {title}
      </Text>
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
        },
      ]}
    >
      <View
        style={[
          styles.historyIconContainer,
          { backgroundColor: theme.primary + "20" },
        ]}
      >
        <MapPin size={20} color={theme.primary} />
      </View>
      <View style={styles.historyContent}>
        <Text style={[styles.historyTitle, { color: theme.text }]}>
          {item.nomATM || "Distributeur ATM"}
        </Text>
        <Text style={[styles.historySubtitle, { color: theme.textSecondary }]}>
          {item.Adresse || "Adresse inconnue"}
        </Text>
        {item.travelTime && (
          <Text
            style={[styles.historySubtitle, { color: theme.textSecondary }]}
          >
            Temps estimé: {item.travelTime} min
          </Text>
        )}
        <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
          {new Date(item.date || item.$createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <ChevronRight size={20} color={theme.textSecondary} />
    </Animated.View>
  );

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightElement,
    color = theme.textSecondary,
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIconContainer,
            { backgroundColor: color + "20" },
          ]}
        >
          <Icon size={20} color={color} />
        </View>
        <View>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text
            style={[styles.settingSubtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      {rightElement || <ChevronRight size={20} color={theme.textSecondary} />}
    </TouchableOpacity>
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
              },
            ]}
          >
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.onlineIndicator,
                    { backgroundColor: theme.success },
                  ]}
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.name || "Utilisateur"}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email || "email@example.com"}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.settingsButton} onPress={() => {}}>
              <Settings size={24} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View
          style={[
            styles.statsContainer,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <View style={{ width: 160 }}>
            <StatCard
              icon={MapPin}
              title="ATM Visités"
              value={historique.length.toString()}
              color={theme.primary}
            />
          </View>
        </View>

        {/* Settings Section */}
        <Animated.View
          style={[
            styles.section,
            {
              backgroundColor: theme.surface,
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Préférences
          </Text>
          <SettingItem
            icon={Moon}
            title="Thème sombre"
            subtitle={isDarkTheme ? "Activé" : "Désactivé"}
            color={theme.accent}
            rightElement={
              <Switch
                value={isDarkTheme}
                onValueChange={toggleTheme}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isDarkTheme ? "#f5dd4b" : "#f4f3f4"}
              />
            }
          />

          <SettingItem
            icon={Shield}
            title="Confidentialité"
            subtitle="Gérer vos paramètres"
            color={theme.primary}
            onPress={() => router.push("/settings/privacy")}
          />
        </Animated.View>

        {/* History Section */}
        <Animated.View
          style={[
            styles.section,
            {
              backgroundColor: theme.surface,
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Historique Récent
            </Text>
            <TouchableOpacity
              onPress={() => setShowAllHistory(!showAllHistory)}
            >
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                {showAllHistory ? "Réduire" : "Voir tout"}
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                style={[styles.loadingText, { color: theme.textSecondary }]}
              >
                Chargement de l'historique...
              </Text>
            </View>
          ) : historique.length > 0 ? (
            <FlatList
              data={showAllHistory ? historique : historique.slice(0, 3)}
              keyExtractor={(item) => item.$id}
              renderItem={({ item, index }) => (
                <HistoryItem item={item} index={index} />
              )}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <FileText size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Aucun historique
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: theme.textSecondary }]}
              >
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
            },
          ]}
        >
          <LinearGradient
            colors={["#ef4444", "#f97316"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutButton}
          >
            <TouchableOpacity
              onPress={handleLogout}
              disabled={logoutLoading}
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {logoutLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <LogOut size={22} color="#fff" />
              )}
              <Text style={styles.logoutText}>
                {logoutLoading ? "Déconnexion..." : "Se déconnecter"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontFamily: "Poppins-Bold",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  profileBadgeText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: "#ffffff",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -12,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginBottom: 2,
  },
  historySubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#dc2626",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#ffffff",
  },
});