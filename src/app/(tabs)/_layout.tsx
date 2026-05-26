import { Tabs } from 'expo-router';
import { colors } from '@/constants';
import { Home, User, BookMarked } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          paddingBottom: 12,
          paddingTop: 12,
          height: 85,
        },
        tabBarActiveTintColor: colors.primary as string,
        tabBarInactiveTintColor: colors.textTertiary as string,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}