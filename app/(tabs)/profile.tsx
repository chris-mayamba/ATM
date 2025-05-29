import React, { useState } from "react";
import {
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSession } from "../../ctx";

export default function ProfileScreen() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { user, logout } = useSession();

  const toggleSwitch = () => setIsDarkTheme((prev) => !prev);

  const backgroundColor = isDarkTheme ? "#121212" : "#f9f9f9";
  const cardColor = isDarkTheme ? "#1e1e1e" : "#ffffff";
  const textColor = isDarkTheme ? "#ffffff" : "#333";

  const historique = [
    { id: "1", nom: "ATM1", date: "17/05/2025", operation: "Retrait" },
    { id: "2", nom: "ATM2", date: "15/05/2025", operation: "Dépôt" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.headerTitle, { color: textColor }]}>Profil</Text>

      {/* Avatar / Initiale */}
      <View style={[styles.avatarContainer, { backgroundColor: cardColor }]}>
        <Text style={[styles.avatarText, { color: textColor }]}>
          {user?.name?.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>

      {/* Infos utilisateur */}
      <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.infoLabel, { color: textColor }]}>Nom :</Text>
        <Text style={[styles.infoText, { color: textColor }]}>{user?.name}</Text>

        <Text style={[styles.infoLabel, { color: textColor }]}>Email :</Text>
        <Text style={[styles.infoText, { color: textColor }]}>{user?.email}</Text>
      </View>

      {/* Thème */}
      <View style={styles.switchContainer}>
        <Text style={{ color: textColor }}>Thème sombre</Text>
        <Switch
          value={isDarkTheme}
          onValueChange={toggleSwitch}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkTheme ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* Historique */}
      <Text style={[styles.historiqueTitle, { color: textColor }]}>Historique</Text>
      <FlatList
        data={historique}
        keyExtractor={(item) => item.id}
        style={{ width: "90%" }}
        ListEmptyComponent={
          <Text style={{ color: textColor, textAlign: "center", marginTop: 10 }}>
            Aucun historique disponible
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.historiqueCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.historiqueText, { color: textColor }]}>
              🏧 {item.nom}
            </Text>
            <Text style={[styles.historiqueText, { color: textColor }]}>
              📅 {item.date}
            </Text>
            <Text style={[styles.historiqueText, { color: textColor }]}>
              🔄 {item.operation}
            </Text>
          </View>
        )}
      />

      {/* Déconnexion */}
      <View style={styles.logoutButton}>
        <Button title="Se déconnecter" onPress={logout} color="#FF3B30" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
    width: "90%",
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 4,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
  },
  historiqueTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },
  historiqueCard: {
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
  },
  historiqueText: {
    fontSize: 14,
    marginBottom: 4,
  },
  logoutButton: {
    marginTop: 20,
    width: "80%",
  },
});