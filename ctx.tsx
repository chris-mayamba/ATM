// File: ctx.js
import { Account, Client } from 'appwrite';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

const client = new Client();
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('682c932f001076e9cc68');
const account = new Account(client);

const SessionContext = createContext();
// const SessionContext = createContext({
//   user: null,
//   login: async () => {},
//   logout: async () => {},
//   register: async () => {},
//   loading: true,
// });

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
    await account.createEmailSession(email, password);
    const user = await account.get();
    setUser(user);
    router.replace('/home');
  };

  const register = async (name, email, password, location = null) => {
    // Crée le compte
    await account.create('unique()', email, password, name);

    // Se connecte après création
    await login(email, password);

    // Met à jour les préférences avec la localisation (si disponible)
    if (location) {
      await account.updatePrefs({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Rafraîchir les données utilisateur après update
      const updatedUser = await account.get();
      setUser(updatedUser);
    }
  };

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
    router.replace('/');
  };

  return (
    <SessionContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
