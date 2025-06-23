import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useSession } from '../../ctx';
import { useRouter, Stack } from 'expo-router';
import { ChevronRight, Trash2, Lock, EyeOff } from 'lucide-react-native';
import { Client, Account, Databases, Query } from 'appwrite';
import { useState } from 'react';

export default function PrivacyScreen() {
  const { user, logout } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <Stack.Screen options={{ title: 'Confidentialité' }} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <SettingItem
            icon={Lock}
            title="Sécurité"
            subtitle="Paramètres de sécurité"
            onPress={() => router.push('/settings/security')}
            color="#3b82f6"
          />
          <SettingItem
            icon={EyeOff}
            title="Vie privée"
            subtitle="Contrôler votre visibilité"
            onPress={() => router.push('/settings/privacy-controls')}
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon={Trash2}
            title="Supprimer le compte"
            subtitle="Action irréversible"
            onPress={handleDeleteAccount}
            color="#ef4444"
          />
          {loading && <ActivityIndicator style={styles.loading} />}
        </View>
      </ScrollView>
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
    marginTop: 2
  },
  loading: {
    marginVertical: 16
  }
});