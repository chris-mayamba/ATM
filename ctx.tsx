import React, { createContext, useEffect, useState, useContext } from 'react';
import { Client, Account, OAuthProvider } from 'appwrite';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('682c932f001076e9cc68');
const account = new Account(client);

const SessionContext = createContext();

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
      await account.createEmailSession(email, password);
      const user = await account.get();
      setUser(user);
      router.replace('/home');
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
          const user = await account.get();
          setUser(user);
          router.replace('/home');
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
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
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