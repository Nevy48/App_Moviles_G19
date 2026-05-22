import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, mockLogin } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // For demo purposes, auto-login with mock user
      mockLogin();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return null;
}