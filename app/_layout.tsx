// app/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import { useSession, SessionProvider } from '../ctx'; // assure-toi que `useSession` donne accès à l'utilisateur

export default function RootLayout() {
  return (
    <SessionProvider>
      <LayoutSwitcher />
    </SessionProvider>
  );
}

// Sépare la logique ici
function LayoutSwitcher() {
  const { user } = useSession();

  // Si pas connecté, montrer uniquement les pages publiques
  if (!user) {
    return <Slot />; // montrera login.tsx ou register.tsx
  }

  // Sinon, montrer la navigation à onglets
  return <Slot />; // va charger app/(tabs)/_layout.tsx
}
