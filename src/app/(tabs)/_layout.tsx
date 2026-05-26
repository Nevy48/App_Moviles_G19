import { useEffect } from 'react';
import { Tabs, SplashScreen } from 'expo-router';
import { colors } from '@/constants';
import { Home, User, BookMarked } from 'lucide-react';
import {
  useFonts,
  Syne_400Regular,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';

SplashScreen.preventAutoHideAsync();

export default function TabsLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Syne-Regular': Syne_400Regular,
    'Syne-SemiBold': Syne_600SemiBold,
    'Syne-Bold': Syne_700Bold,
    'Syne-ExtraBold': Syne_800ExtraBold,
    'SpaceMono-Regular': SpaceMono_400Regular,
    'SpaceMono-Bold': SpaceMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary as string,
        tabBarInactiveTintColor: colors.textTertiary as string,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, size }) => <User size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}