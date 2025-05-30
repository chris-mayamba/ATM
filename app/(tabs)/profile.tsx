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

  const backgroundColor = isDarkTheme ? "#000" : "#fff";
  const textColor = isDarkTheme ? "#fff" : "#000";

  const historique = [
    { id: "1", nom: "ATM1", date: "17/05/2025", operation: "Retrait" },
    { id: "2", nom: "ATM2", date: "15/05/2025", operation: "Dépôt" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.headerTitle, { color: textColor }]}>
        Profile
        </Text>

      <View style={styles.avatar} />

      <Text style={[styles.welcomeText, { color: textColor }]}>
        Bonjour {user?.name || "Invité"}
      </Text>

      <View style={styles.switchContainer}>
        <Text style={{ color: textColor }}>Thème sombre</Text>
        <Switch
          value={isDarkTheme}
          onValueChange={toggleSwitch}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDarkTheme ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* ✅ Bouton Logout déplacé ici */}
      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={logout} color="#FF3B30" />
      </View>

      <Text style={[styles.historiqueTitle, { color: textColor }]}>
        Historique
      </Text>

      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Nom</Text>
        <Text style={styles.tableHeaderCell}>Date</Text>
        <Text style={styles.tableHeaderCell}>Opération</Text>
      </View>

      <FlatList
        data={historique}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.nom}</Text>
            <Text style={styles.tableCell}>{item.date}</Text>
            <Text style={styles.tableCell}>{item.operation}</Text>
          </View>
        )}
        style={styles.table}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  textTransform: 'uppercase',
},

  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#aaa",
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "500",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  historiqueTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  table: {
    width: "90%",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: "700",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableCell: {
    flex: 1,
  },
  logoutButton: {
    marginTop: 10,
  },
});
