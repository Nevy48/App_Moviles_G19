import { Tabs } from 'expo-router';
import { colors } from '@/constants';
import { LayoutDashboard, BookOpen, GraduationCap, Settings } from 'lucide-react-native';

export default function AdminLayout() {
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
        name="dashboard"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="planes"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="materias/index"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <GraduationCap size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color as string} />,
        }}
      />
    </Tabs>
  );
}