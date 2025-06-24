// app/settings/cleanhistory.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSession } from "../../ctx";
import { Client, Databases, Query } from "appwrite";
import { Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("682c932f001076e9cc68");

const databases = new Databases(client);

export default function CleanHistory() {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCleanHistory = async () => {
    if (!user) return;

    Alert.alert(
      "Supprimer l'historique",
      "Êtes-vous sûr de vouloir supprimer tout votre historique ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              // Récupérer tous les documents de l'utilisateur
              const response = await databases.listDocuments(
                "683ca4080011a598c3a6",
                "683ca6bf00206a77511a",
                [Query.equal("userId", user.$id)]
              );

              // Supprimer chaque document un par un
              const deletePromises = response.documents.map((doc) =>
                databases.deleteDocument(
                  "683ca4080011a598c3a6",
                  "683ca6bf00206a77511a",
                  doc.$id
                )
              );

              await Promise.all(deletePromises);
              Alert.alert(
                "Succès",
                "Votre historique a été supprimé avec succès."
              );
              router.back();
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de la suppression de l'historique."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supprimer l'historique</Text>
      <Text style={styles.description}>
        Cette action supprimera définitivement tout votre historique de recherche
        d'ATM. Vous ne pourrez pas récupérer ces données par la suite.
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleCleanHistory}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Trash2 size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Supprimer l'historique</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  description: {
    fontSize: 16,
    marginBottom: 32,
    color: "#666",
    lineHeight: 24,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545",
    padding: 16,
    borderRadius: 8,
    gap: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});