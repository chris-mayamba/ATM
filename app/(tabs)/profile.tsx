import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  Switch,
} from "react-native";
import { useSession } from "../../ctx";
import { Client, Databases, Query } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("682c932f001076e9cc68"); // Ton Project ID

const databases = new Databases(client);

export default function ProfileScreen() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { user, logout } = useSession();
  const [historique, setHistorique] = useState([]);

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  const backgroundColor = isDarkTheme ? "#121212" : "#f9f9f9";
  const cardColor = isDarkTheme ? "#1e1e1e" : "#ffffff";
  const textColor = isDarkTheme ? "#ffffff" : "#333";

  useEffect(() => {
    const fetchHistorique = async () => {
      try {
        if (!user) return;
        const response = await databases.listDocuments(
          "683ca4080011a598c3a6",     // ⬅️ Remplace avec ton Database ID
          "683ca6bf00206a77511a",   // ⬅️ Remplace avec ta Collection ID
          [Query.equal("userId", user.$id), Query.orderDesc("$createdAt")]
        );
        setHistorique(response.documents);
      } catch (err) {
        console.error("Erreur lors du chargement de l'historique :", err);
      }
    };

    fetchHistorique();
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Mon Profil</Text>

      <View style={[styles.avatar, { backgroundColor: cardColor }]}>
        <Text style={[styles.avatarText, { color: textColor }]}>
          {user?.name?.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={[styles.label, { color: textColor }]}>Nom :</Text>
        <Text style={[styles.value, { color: textColor }]}>{user?.name}</Text>

        <Text style={[styles.label, { color: textColor }]}>Email :</Text>
        <Text style={[styles.value, { color: textColor }]}>{user?.email}</Text>
      </View>

      <View style={styles.switchRow}>
        <Text style={{ color: textColor }}>Thème sombre</Text>
        <Switch value={isDarkTheme} onValueChange={toggleTheme} />
      </View>

      <Text style={[styles.subtitle, { color: textColor }]}>Historique</Text>
      <FlatList
        data={historique}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={{ color: textColor, textAlign: "center" }}>
            Aucun historique trouvé
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.historiqueCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.historiqueText, { color: textColor }]}>
              🏧 ATM : {item.nomATM}
            </Text>
            <Text style={[styles.historiqueText, { color: textColor }]}>
              📆 Date : {item.date}
            </Text>
            <Text style={[styles.historiqueText, { color: textColor }]}>
              🔄 Opération : {item.operation}
            </Text>
          </View>
        )}
      />

      <View style={styles.logoutButton}>
        <Button title="Se déconnecter" onPress={logout} color="#FF3B30" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 20, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 4,
  },
  avatarText: { fontSize: 36, fontWeight: "bold" },
  card: {
    padding: 16,
    borderRadius: 12,
    width: "90%",
    marginVertical: 10,
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  value: { fontSize: 16 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
  },
  historiqueCard: {
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    width: "90%",
    elevation: 2,
  },
  historiqueText: { fontSize: 14, marginBottom: 4 },
  logoutButton: { marginTop: 20, width: "80%" },
});
