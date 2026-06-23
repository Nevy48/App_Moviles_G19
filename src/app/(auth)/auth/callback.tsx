import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants';
import { fontSize, fontFamily } from '@/constants/theme';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const temporizador = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2000);

    return () => clearTimeout(temporizador);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background as string }}>
      <ActivityIndicator size="large" color={colors.primary as string} />
      <Text style={{ color: colors.textSecondary as string, marginTop: 16, fontSize: fontSize.md, fontFamily: fontFamily.medium }}>
        Completando autenticación...
      </Text>
    </View>
  );
}