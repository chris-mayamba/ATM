import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useSession } from '../../ctx';
import { useRouter, Stack } from 'expo-router';
import { ChevronRight, Trash2, Lock, EyeOff, Clock } from 'lucide-react-native';
import { Client, Account, Databases, Query } from 'appwrite';
import { useState } from 'react';

export default function PrivacyScreen() {
  const { user, logout } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cleaningHistory, setCleaningHistory] = useState(false);

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, color = '#64748b' }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#64748b" />
    </TouchableOpacity>
  );

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Suppression du compte",
      "Voulez-vous vraiment supprimer votre compte et toutes vos données ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const client = new Client()
                .setEndpoint("https://cloud.appwrite.io/v1")
                .setProject("682c932f001076e9cc68");

              const databases = new Databases(client);
              const account = new Account(client);

              // Supprimer l'historique
              const documents = await databases.listDocuments(
                "683ca4080011a598c3a6",
                "683ca6bf00206a77511a",
                [Query.equal("userId", user.$id)]
              );

              await Promise.all(
                documents.documents.map(doc => 
                  databases.deleteDocument(
                    "683ca4080011a598c3a6",
                    "683ca6bf00206a77511a",
                    doc.$id
                  )
                )
              );

              // Supprimer le compte
              await account.delete();
              await logout();
              router.push('/');
            } catch (error) {
              console.error(error);
              Alert.alert("Erreur", "La suppression a échoué : " + (error?.message || ""));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCleanHistory = async () => {
    Alert.alert(
      "Supprimer l'historique",
      "Voulez-vous vraiment supprimer tout votre historique de recherche ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setCleaningHistory(true);
            try {
              const client = new Client()
                .setEndpoint("https://cloud.appwrite.io/v1")
                .setProject("682c932f001076e9cc68");

              const databases = new Databases(client);

              const documents = await databases.listDocuments(
                "683ca4080011a598c3a6",
                "683ca6bf00206a77511a",
                [Query.equal("userId", user.$id)]
              );

              await Promise.all(
                documents.documents.map(doc => 
                  databases.deleteDocument(
                    "683ca4080011a598c3a6",
                    "683ca6bf00206a77511a",
                    doc.$id
                  )
                )
              );

              Alert.alert("Succès", "Votre historique a été supprimé avec succès.");
            } catch (error) {
              console.error(error);
              Alert.alert("Erreur", "La suppression de l'historique a échoué : " + (error?.message || ""));
            } finally {
              setCleaningHistory(false);
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Confidentialité' }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <SettingItem
              icon={Clock}
              title="Supprimer l'historique"
              subtitle="Effacer toutes vos recherches"
              onPress={handleCleanHistory}
              color="#f59e0b"
            />
            {cleaningHistory && <ActivityIndicator style={styles.loading} />}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b'
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 23
  },
  loading: {
    marginVertical: 16
  }
});