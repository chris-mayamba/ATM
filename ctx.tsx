import { Account, Client } from 'appwrite';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('682c932f001076e9cc68');
const account = new Account(client);

const SessionContext = createContext({
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  loading: true,
});

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const user = await account.get();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      router.replace('/(tabs)/home');
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web implementation
        const redirectUrl = window.location.origin + '/auth/callback';
        const authUrl = `https://cloud.appwrite.io/v1/account/sessions/oauth2/google?project=682c932f001076e9cc68&success=${encodeURIComponent(redirectUrl)}&failure=${encodeURIComponent(redirectUrl)}`;
        
        // Open in same window for web
        window.location.href = authUrl;
      } else {
        // Mobile implementation
        const redirectTo = AuthSession.makeRedirectUri({
          scheme: 'atmfinder',
          path: '/auth/callback'
        });

        const result = await WebBrowser.openAuthSessionAsync(
          `https://cloud.appwrite.io/v1/account/sessions/oauth2/google?project=682c932f001076e9cc68&success=${encodeURIComponent(redirectTo)}&failure=${encodeURIComponent(redirectTo)}`,
          redirectTo
        );

        if (result.type === 'success') {
          // Check if user is authenticated
          try {
            const user = await account.get();
            setUser(user);
            router.replace('/(tabs)/home');
          } catch (error) {
            console.error('Failed to get user after Google auth:', error);
            throw new Error('Authentication failed');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Authentication cancelled');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const register = async (name, email, password, location = null) => {
    try {
      await account.create('unique()', email, password, name);
      await login(email, password);

      if (location) {
        await account.updatePrefs({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        const updatedUser = await account.get();
        setUser(updatedUser);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      router.replace('/login');
    }
  };

  return (
    <SessionContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle, 
      logout, 
      register, 
      loading 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);