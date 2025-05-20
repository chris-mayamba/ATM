// File: ctx.js
import React, { createContext, useEffect, useState, useContext } from 'react';
import { Client, Account } from 'appwrite';
import { useRouter } from 'expo-router';

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
    await account.createEmailSession(email, password);
    const user = await account.get();
    setUser(user);
    router.replace('/home');
  };

  const register = async (name, email, password) => {
    await account.create('unique()', email, password, name);
    await login(email, password);
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

