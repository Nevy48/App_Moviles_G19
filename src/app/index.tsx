import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { colors } from '@/constants';

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading, mockLogin, selectedCareer, subjectsWithStatus, loadCareerData } = useUserStore();

  useEffect(() => {
    const init = async () => {
      // Small delay to allow zustand to rehydrate from AsyncStorage
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isAuthenticated && !isLoading) {
        await mockLogin();
      } else if (isAuthenticated && selectedCareer && subjectsWithStatus.length === 0) {
        loadCareerData(selectedCareer.id);
      }

      setTimeout(() => setIsReady(true), 300);
    };
    init();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (isAuthenticated && subjectsWithStatus.length > 0) {
        router.replace('/(tabs)/home');
      } else if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (isAuthenticated && selectedCareer && subjectsWithStatus.length === 0) {
        // Trigger load if we have career but no subjects
        loadCareerData(selectedCareer.id);
      }
    }
  }, [isAuthenticated, subjectsWithStatus.length, isReady]);

  // Loading screen while determining auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
});