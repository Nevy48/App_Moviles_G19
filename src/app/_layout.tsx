import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors } from '@/constants';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Syne_400Regular,
  Syne_500Medium,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';

const queryClient = new QueryClient();

function useAuthRedirect() {
  const { isAuthenticated, isLoading, rol } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0];
    const isAuthRoute = currentSegment === '(auth)';

    if (!isAuthenticated && !isAuthRoute) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      if (rol === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(alumno)/home');
      }
      return;
    }

    if (isAuthenticated && !isAuthRoute) {
      if (rol === 'admin' && currentSegment !== '(admin)') {
        router.replace('/(admin)/dashboard');
      } else if (rol === 'alumno' && currentSegment !== '(alumno)') {
        router.replace('/(alumno)/home');
      }
    }
  }, [isAuthenticated, isLoading, rol, segments, router]);

  return { isAuthenticated, isLoading };
}

function RootLayoutNav() {
  const [fontsLoaded] = useFonts({
    'Syne-Regular': Syne_400Regular,
    'Syne-Medium': Syne_500Medium,
    'Syne-SemiBold': Syne_600SemiBold,
    'Syne-Bold': Syne_700Bold,
    'Syne-ExtraBold': Syne_800ExtraBold,
    'SpaceMono-Regular': SpaceMono_400Regular,
    'SpaceMono-Bold': SpaceMono_700Bold,
  });
  const { isLoading } = useAuthRedirect();

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(alumno)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
