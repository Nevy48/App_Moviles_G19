import { Tabs } from 'expo-router';
import { colors } from '@/constants';
import { Home, BookOpen, User } from 'lucide-react-native';

export default function AlumnoLayout() {
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
        name="materias"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
