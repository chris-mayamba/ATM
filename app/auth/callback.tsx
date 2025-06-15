import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '../../ctx';
import { Account, Client } from 'appwrite';

const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('682c932f001076e9cc68');
const account = new Account(client);

export default function AuthCallback() {
  const router = useRouter();
  const { setUser } = useSession();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if user is authenticated after OAuth callback
        const user = await account.get();
        if (user) {
          setUser(user);
          router.replace('/(tabs)/home');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/login');
      }
    };

    handleCallback();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#64748b' }}>
        Finalisation de la connexion...
      </Text>
    </View>
  );
}