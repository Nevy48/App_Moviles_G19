import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Mail,
  User,
  Building2,
  GraduationCap,
  LogOut,
  Settings,
  ChevronRight,
  Award,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, ProgressBar } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { useUserStore, useAcademicStats } from '@/store/userStore';

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, selectedUniversity, selectedCareer, logout } = useUserStore();
  const stats = useAcademicStats();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Building2 size={18} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Universidad</Text>
                <Text style={styles.detailValue}>
                  {selectedUniversity?.name || 'UTN'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <GraduationCap size={18} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Carrera</Text>
                <Text style={styles.detailValue}>
                  {selectedCareer?.name || 'Ingeniería en Sistemas'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Academic Progress */}
        <Text style={styles.sectionTitle}>Progreso Académico</Text>
        <Card style={styles.progressCard}>
          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <CheckCircle size={20} color={colors.success} />
            </View>
            <View style={styles.progressContent}>
              <Text style={styles.progressLabel}>Materias Aprobadas</Text>
              <Text style={styles.progressValue}>{stats.approved}</Text>
            </View>
          </View>

          <View style={styles.progressDivider} />

          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <Clock size={20} color={colors.warning} />
            </View>
            <View style={styles.progressContent}>
              <Text style={styles.progressLabel}>Materias Cursando</Text>
              <Text style={styles.progressValue}>{stats.inProgress}</Text>
            </View>
          </View>

          <View style={styles.progressDivider} />

          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <Award size={20} color={colors.primary} />
            </View>
            <View style={styles.progressContent}>
              <Text style={styles.progressLabel}>Créditos Obtenidos</Text>
              <Text style={styles.progressValue}>{stats.completedCredits}</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarHeader}>
              <Text style={styles.progressBarLabel}>Progreso Total</Text>
              <Text style={styles.progressBarPercentage}>{stats.percentage}%</Text>
            </View>
            <ProgressBar
              percentage={stats.percentage}
              showPercentage={false}
              height={8}
            />
          </View>
        </Card>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Configuración</Text>
        <Card padding="sm">
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Preferencias</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

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
        </Card>

        {/* App Version */}
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
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  profileCard: {
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
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: fontSize.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContent: {
    marginLeft: spacing.md,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  progressContent: {
    flex: 1,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  progressDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  progressBarContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressBarLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressBarPercentage: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginLeft: spacing.md,
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
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
});