// app/lib/atmSync.ts
import { Databases, ID, Query, Client } from "appwrite";
import { Alert } from "react-native";
import { useSession } from "@/ctx";
import { useState, useEffect } from "react";

// Configuration améliorée du client Appwrite
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("682c932f001076e9cc68")
  /*.setSelfSigned(true)*/; // Important pour le développement

const databases = new Databases(client);

const APPWRITE_CONFIG = {
  databaseId: "683ca4080011a598c3a6",
  atmStatesCollectionId: "6859c0f60012d7412a82",
  historyCollectionId: "683ca6bf00206a77511a"
};

interface ATMState {
  atmId: string;
  isAvailable: boolean;
  lastUpdated: string;
  userId: string;
}

interface UseATMSync {
  atmDisponibilities: Record<string, boolean>;
  lastUpdated: Record<string, string>;
  loadingStates: Record<string, boolean>;
  fetchATMStates: () => Promise<void>;
  saveATMState: (atmId: string, isAvailable: boolean) => Promise<boolean>;
}

export const useATMSync = (): UseATMSync => {
  const { user } = useSession();
  const [atmDisponibilities, setAtmDisponibilities] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Optimistic update helper
  const updateLocalState = (atmId: string, isAvailable: boolean) => {
    setAtmDisponibilities(prev => ({
      ...prev,
      [atmId]: isAvailable
    }));
    setLastUpdated(prev => ({
      ...prev,
      [atmId]: new Date().toISOString()
    }));
  };

  // Récupérer tous les états des ATM avec gestion d'erreur améliorée
  const fetchATMStates = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.atmStatesCollectionId,
        [Query.orderDesc("lastUpdated")]
      );
      
      const newStates: Record<string, boolean> = {};
      const newUpdates: Record<string, string> = {};

      response.documents.forEach((doc: ATMState) => {
        newStates[doc.atmId] = doc.isAvailable;
        newUpdates[doc.atmId] = doc.lastUpdated;
      });

      setAtmDisponibilities(prev => ({ ...prev, ...newStates }));
      setLastUpdated(prev => ({ ...prev, ...newUpdates }));
    } catch (err) {
      console.error("Erreur lors du chargement des états ATM:", err);
      Alert.alert(
        "Erreur", 
        "Impossible de charger les états des distributeurs. Vérifiez votre connexion."
      );
    }
  };

  // Sauvegarde optimisée avec rollback
  const saveATMState = async (atmId: string, isAvailable: boolean): Promise<boolean> => {
    if (!atmId) return false;
    
    const previousState = atmDisponibilities[atmId];
    
    try {
      setLoadingStates(prev => ({ ...prev, [atmId]: true }));
      updateLocalState(atmId, isAvailable); // Mise à jour optimiste
      
      const now = new Date().toISOString();
      const query = [Query.equal("atmId", atmId)];

      // Vérifier l'existence du document
      const { documents } = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.atmStatesCollectionId,
        query
      );

      if (documents.length > 0) {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.atmStatesCollectionId,
          documents[0].$id,
          { isAvailable, lastUpdated: now }
        );
      } else {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.atmStatesCollectionId,
          ID.unique(),
          {
            atmId,
            isAvailable,
            lastUpdated: now,
            userId: user?.$id || "anonymous"
          }
        );
      }

      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      // Rollback en cas d'erreur
      updateLocalState(atmId, previousState);
      Alert.alert(
        "Erreur",
        "Échec de la mise à jour. Vérifiez votre connexion internet."
      );
      return false;
    } finally {
      setLoadingStates(prev => ({ ...prev, [atmId]: false }));
    }
  };

  // Synchronisation initiale
  useEffect(() => {
    fetchATMStates();
  }, []);

  return {
    atmDisponibilities,
    lastUpdated,
    loadingStates,
    fetchATMStates,
    saveATMState
  };
};

// Hook temps réel amélioré
export const useATMRealtime = (callback: (payload: any) => void) => {
  useEffect(() => {
    const subscription = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.atmStatesCollectionId}.documents`;
    
    const unsubscribe = client.subscribe(subscription, (payload) => {
      if (['create', 'update', 'delete'].includes(payload.event)) {
        callback(payload);
      }
    });

    return () => {
      try {
        unsubscribe();
      } catch (err) {
        console.error("Erreur lors de la désinscription:", err);
      }
    };
  }, [callback]);
};