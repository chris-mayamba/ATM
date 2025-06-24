// app/index.js
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSession } from '../ctx';
import GuideScreen from '@/app/guide';

export default function AppEntry() {
  const [isGuideCompleted, setIsGuideCompleted] = useState(null);
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const guideShown = await AsyncStorage.getItem('@guideShown');
        setIsGuideCompleted(guideShown === 'true');
      } catch (e) {
        console.error('Error reading guide status', e);
        setIsGuideCompleted(false);
      }
    };

    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (isGuideCompleted === true && !loading) {
      router.replace(user ? '/(tabs)/home' : '/login');
    }
  }, [isGuideCompleted, user, loading]);

  const handleGuideComplete = async () => {
    try {
      await AsyncStorage.setItem('@guideShown', 'true');
      setIsGuideCompleted(true);
    } catch (e) {
      console.error('Error saving guide status', e);
    }
  };

  if (isGuideCompleted === null || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isGuideCompleted) {
    return <GuideScreen onComplete={handleGuideComplete} />;
  }

  return null;
}