import { View, Text, Button, useColorScheme } from 'react-native';
import { useSession } from '../ctx';

export default function Home() {
  const { user, logout } = useSession();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
      <Text style={{ fontSize: 22, color: isDark ? '#fff' : '#000', marginBottom: 20 }}>
        Welcome, {user?.name}
      </Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}