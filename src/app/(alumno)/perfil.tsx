import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LogOut,
  Settings,
  ChevronRight,
  Clock,
  CheckCircle,
  BookOpen,
  X,
} from 'lucide-react-native';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

type ExtendedSubjectStatus = 'disabled' | 'available' | 'pending' | 'in_progress' | 'cursada' | 'approved';

const STATUS_STORAGE_KEY = '@materias_status';

const getStatusColor = (status: ExtendedSubjectStatus) => {
  switch (status) {
    case 'approved': return colors.success;
    case 'cursada': return colors.warning;
    case 'in_progress': return colors.primary;
    case 'pending': return colors.white;
    case 'disabled': return colors.textTertiary;
    default: return colors.white;
  }
};

export default function AlumnoPerfilScreen() {
  const router = useRouter();
  const { perfil, user, signOut } = useAuth();
  const [showDetailModal, setShowDetailModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Load is handled in other screens
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const avatarInitials = perfil?.nombre_completo
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AL';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {perfil?.nombre_completo || 'Usuario'}
              </Text>
              <Text style={styles.userEmail}>{user?.email || 'Email no disponible'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Universidad</Text>
              <Text style={styles.detailValue}>UTN</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Carrera</Text>
              <Text style={styles.detailValue}>Ingeniería en Sistemas</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rol</Text>
              <Text style={styles.detailValue}>Alumno</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(alumno)/materias')}
          >
            <View style={styles.menuItemLeft}>
              <BookOpen size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Mis Materias</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(alumno)/home')}
          >
            <View style={styles.menuItemLeft}>
              <Clock size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Mis Eventos</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Preferencias</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <LogOut size={20} color={colors.error} />
              <Text style={[styles.menuItemText, styles.logoutText]}>
                Cerrar Sesión
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Mi Estado Académico v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.md,
  },
  profileDetails: {
    gap: spacing.md,
  },
  detailItem: {
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.monoRegular,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
  },
  logoutText: {
    color: colors.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textTertiary,
    marginTop: spacing.lg,
  },
});
