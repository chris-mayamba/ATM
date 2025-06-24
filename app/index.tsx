// // File: app/index.js
// import { useEffect } from 'react';
// import { useSession } from '../ctx';
// import { useRouter } from 'expo-router';
// import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, loading } = useSession();
  const router = useRouter();

// export default function Index() {
//   const { user, loading } = useSession();
//   const router = useRouter();

  
//   useEffect(() => {
//     if (!loading) {
//       router.replace(user ? '/home' : '/login');
//     }
//   }, [user, loading]);

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <ActivityIndicator size="large" />
//     </View>
//   );
// }

import GuideScreen from './guide';

export default function App() {
  return <GuideScreen />;
}
