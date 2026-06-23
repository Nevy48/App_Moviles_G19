import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { planesService } from '@/services/planesService';
import { materiasService } from '@/services/materiasService';
import { correlativasService } from '@/services/correlativasService';
import { Card, StatsCard } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { BookOpen, GraduationCap, Link2, LogOut } from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const { perfil, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ planes: 0, materias: 0, correlativas: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [planes, materias, correlativas] = await Promise.all([
        planesService.getAll(),
        materiasService.getAll(),
        correlativasService.getAll(),
      ]);
      setStats({
        planes: planes.length,
        materias: materias.length,
        correlativas: correlativas.length,
      });
    } catch (e) {
      console.error('Error cargando estadisticas:', e);
    }
  };

  // Se ejecuta de forma automatica cada vez que el administrador entra a la pestaña
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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
            <Text style={styles.userName}>{perfil?.nombre_completo || 'Administrador'}</Text>
          </View>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatsCard title="Planes de Estudio" value={stats.planes} icon={<BookOpen size={24} color={colors.primary} />} onPress={() => router.push('/(admin)/planes')} />
          <StatsCard title="Materias Cargadas" value={stats.materias} icon={<GraduationCap size={24} color={colors.success} />} onPress={() => router.push('/(admin)/materias')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <Card style={styles.actionCard} onPress={() => router.push('/(admin)/planes')}>
            <View style={styles.actionContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <BookOpen size={22} color={colors.primary} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Gestionar Planes</Text>
                <Text style={styles.actionSubtitle}>Crear o ingresar a los planes de estudio</Text>
              </View>
            </View>
          </Card>
          <Card style={styles.actionCard} onPress={() => router.push('/(admin)/materias')}>
            <View style={styles.actionContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.success + '15' }]}>
                <GraduationCap size={22} color={colors.success} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Gestionar Materias Globales</Text>
                <Text style={styles.actionSubtitle}>Administrar el repositorio completo de asignaturas</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Card style={styles.logoutCard} onPress={handleSignOut}>
            <View style={styles.actionContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.error + '15' }]}>
                <LogOut size={22} color={colors.error} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, { color: colors.error }]}>Cerrar Sesión</Text>
                <Text style={styles.actionSubtitle}>Salir del sistema de gestion de forma segura</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg },
  greeting: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary },
  userName: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary, marginTop: spacing.xs },
  adminBadge: { backgroundColor: colors.error + '20', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md },
  adminBadgeText: { fontSize: fontSize.xs, fontFamily: fontFamily.monoBold, color: colors.error },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  actionCard: { padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.card },
  actionContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconContainer: { padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  actionSubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: 2 },
  logoutCard: { padding: spacing.md, backgroundColor: colors.card, marginTop: spacing.sm },
});