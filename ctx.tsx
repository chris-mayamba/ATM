// ctx.tsx
import { Account, Client } from "appwrite";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("682c932f001076e9cc68");
const account = new Account(client);

type SessionContextType = {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    location?: any
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loading: boolean;
  setUser: (user: any) => void;
  isDark: boolean;
  toggleTheme: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Charger le thème
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          setIsDark(savedTheme === "dark");
        }

        // Charger la session utilisateur
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        console.log("No active session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

    const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        console.log("No active session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      // Use the correct method name for Appwrite v11+
      await account.createEmailSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Erreur de connexion");
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (Platform.OS === "web") {
        // Web implementation
        const redirectUrl = window.location.origin + "/auth/callback";

        // Create OAuth2 session
        account.createOAuth2Session("google", redirectUrl, redirectUrl);
      } else {
        // Mobile implementation
        const redirectTo = AuthSession.makeRedirectUri({
          scheme: "atmfinder",
          path: "/auth/callback",
        });

        const authUrl = `https://cloud.appwrite.io/v1/account/sessions/oauth2/google?project=682c932f001076e9cc68&success=${encodeURIComponent(
          redirectTo
        )}&failure=${encodeURIComponent(redirectTo)}`;

        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectTo
        );

        if (result.type === "success") {
          // Wait a bit for the session to be established
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Check if user is authenticated
          try {
            const currentUser = await account.get();
            setUser(currentUser);
            router.replace("/(tabs)/home");
          } catch (error) {
            console.error("Failed to get user after Google auth:", error);
            throw new Error("Authentication failed");
          }
        } else if (result.type === "cancel") {
          throw new Error("Authentication cancelled");
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const register = async (name, email, password, location = null) => {
    try {
      // Create account
      await account.create("unique()", email, password, name);

      // Login after registration
      await account.createEmailPasswordSession(email, password);

      // Get user data
      const currentUser = await account.get();

      // Update preferences with location if provided
      if (location) {
        try {
          await account.updatePrefs({
            latitude: location.latitude,
            longitude: location.longitude,
          });

          // Get updated user data
          const updatedUser = await account.get();
          setUser(updatedUser);
        } catch (prefError) {
          console.log("Could not save location preferences:", prefError);
          setUser(currentUser);
        }
      } else {
        setUser(currentUser);
      }

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Erreur lors de la création du compte");
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      setUser(null);
      router.replace("/login");
    }
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        logout,
        register,
        loading,
        setUser,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};