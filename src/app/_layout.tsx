import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';
import { colors } from '@/constants';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const queryClient = new QueryClient();

function useAuthRedirect() {
  const { isAuthenticated, isLoading } = useUserStore();

  useEffect(() => {
    // Auth redirect logic handled by layout
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}

function RootLayoutNav() {
  const { isLoading } = useAuthRedirect();

  if (isLoading) {
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
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
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