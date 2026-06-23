import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The OAuth callback is handled by authService.signInWithGoogle()
    // via WebBrowser.openAuthSessionAsync. This route just needs
    // to exist for the deep link to resolve properly.
    // After a short delay, redirect back to login if somehow we end up here.
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
        Completando autenticación...
      </Text>
    </View>
  );
}
