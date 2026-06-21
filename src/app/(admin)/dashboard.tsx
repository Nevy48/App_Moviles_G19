import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { planesService } from '@/services/planesService';
import { materiasService } from '@/services/materiasService';
import { eventosService } from '@/services/eventosService';
import { correlativasService } from '@/services/correlativasService';
import { Card, StatsCard } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { BookOpen, GraduationCap, Calendar, Link2, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboardScreen() {
  const { perfil, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    planes: 0,
    materias: 0,
    eventos: 0,
    correlativas: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [planes, materias, _, correlativas] = await Promise.all([
      planesService.getAll(),
      materiasService.getAll(),
      eventosService.getProximosEventos('', 100),
      correlativasService.getAll(),
    ]);

    setStats({
      planes: planes.length,
      materias: materias.length,
      eventos: 0,
      correlativas: correlativas.length,
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Panel de Administración</Text>
            <Text style={styles.userName}>{perfil?.nombre_completo || 'Admin'}</Text>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="Planes de Estudio"
            value={stats.planes}
            icon={<BookOpen size={24} color={colors.primary} />}
            onPress={() => router.push('/(admin)/planes')}
          />
          <StatsCard
            title="Materias"
            value={stats.materias}
            icon={<GraduationCap size={24} color={colors.success} />}
            onPress={() => router.push('/(admin)/materias')}
          />
          <StatsCard
            title="Correlativas"
            value={stats.correlativas}
            icon={<Link2 size={24} color={colors.warning} />}
            onPress={() => router.push('/(admin)/correlativas')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

          <Card style={styles.actionCard} onPress={() => router.push('/(admin)/planes')}>
            <View style={styles.actionContent}>
              <BookOpen size={24} color={colors.primary} />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Gestionar Planes</Text>
                <Text style={styles.actionSubtitle}>Crear, editar o eliminar planes de estudio</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.actionCard} onPress={() => router.push('/(admin)/materias')}>
            <View style={styles.actionContent}>
              <GraduationCap size={24} color={colors.success} />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Gestionar Materias</Text>
                <Text style={styles.actionSubtitle}>Administrar materias y sus datos</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.actionCard} onPress={() => router.push('/(admin)/correlativas')}>
            <View style={styles.actionContent}>
              <Link2 size={24} color={colors.warning} />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Gestionar Correlativas</Text>
                <Text style={styles.actionSubtitle}>Configurar correlatividades entre materias</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Card style={styles.logoutCard} onPress={handleSignOut}>
            <View style={styles.actionContent}>
              <LogOut size={24} color={colors.error} />
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.error }]}>Cerrar Sesión</Text>
                <Text style={styles.actionSubtitle}>Salir de la cuenta administrativa</Text>
              </View>
            </View>
          </Card>
        </View>
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
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  adminBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  adminBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.error,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionCard: {
    marginBottom: spacing.md,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  actionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
    flexShrink: 1,
  },
  logoutCard: {
    marginTop: spacing.md,
  },
});
