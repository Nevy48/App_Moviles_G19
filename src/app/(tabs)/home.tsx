import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  Award,
} from 'lucide-react';
import { Card, SubjectCard, ProgressBar, StatsCard } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { useUserStore, useAcademicStats, useSubjectsByYear } from '@/store/userStore';
import { SubjectStatus } from '@/types';

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user, selectedCareer, selectedUniversity, updateSubjectStatus } = useUserStore();
  const stats = useAcademicStats();
  const subjectsByYear = useSubjectsByYear();

  const onRefresh = async () => {
    setRefreshing(true);
    // Mock refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleStatusChange = (subjectId: string, status: SubjectStatus) => {
    updateSubjectStatus(subjectId, status);
  };

  const years = Object.keys(subjectsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  const sections = years.map((year) => ({
    title: `${year}° Año`,
    year,
    data: subjectsByYear[year] || [],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={() => (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  Hola, {user?.firstName || 'Usuario'}
                </Text>
                <Text style={styles.careerText}>
                  {selectedCareer?.name || 'Ingeniería en Sistemas'}
                </Text>
              </View>
              <Image source={{ uri: logoUrl }} style={styles.logo} />
            </View>

            {/* Progress Card */}
            <Card style={styles.progressCard} variant="glass">
              <LinearGradient
                colors={[colors.primary + '40', colors.primary + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.progressGradient}
              >
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={styles.progressTitle}>Progreso Académico</Text>
                    <Text style={styles.progressSubtitle}>
                      {stats.approved} de {stats.total} materias completadas
                    </Text>
                  </View>
                  <View style={styles.percentageContainer}>
                    <Text style={styles.percentage}>{stats.percentage}%</Text>
                  </View>
                </View>
                <ProgressBar
                  percentage={stats.percentage}
                  showPercentage={false}
                  height={10}
                  color={[colors.primary, colors.primaryLight]}
                />
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <CheckCircle size={16} color={colors.success} />
                    <Text style={styles.progressStatText}>
                      {stats.approved} aprobadas
                    </Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Clock size={16} color={colors.warning} />
                    <Text style={styles.progressStatText}>
                      {stats.inProgress} cursando
                    </Text>
                  </View>
                  <View style={styles.progressStat}>
                    <BookOpen size={16} color={colors.textTertiary} />
                    <Text style={styles.progressStatText}>
                      {stats.pending} pendientes
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Card>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <StatsCard
                title="Créditos"
                value={stats.completedCredits}
                subtitle={`de ${stats.totalCredits} totales`}
                icon={<Award size={16} color={colors.primary} />}
                progress={Math.round((stats.completedCredits / stats.totalCredits) * 100)}
                progressLabel="Completado"
                gradientColors={[colors.warning + '20', colors.warning + '05']}
              />
              <StatsCard
                title="Rendimiento"
                value={stats.percentage + '%'}
                subtitle="Tasa de aprobación"
                icon={<TrendingUp size={16} color={colors.success} />}
                gradientColors={[colors.success + '20', colors.success + '05']}
              />
            </View>

            {/* Career Selector */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Materias por Año</Text>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>Filtrar</Text>
                <ChevronRight size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.yearHeader}>
            <Text style={styles.yearTitle}>{section.title}</Text>
            <Text style={styles.yearCount}>
              {section.data.length} materias
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <SubjectCard
            name={item.name}
            code={item.code}
            status={item.status}
            year={item.year}
            semester={item.semester}
            credits={item.credits}
            difficulty={item.difficulty}
            professor={item.professor}
            onPress={() => {}}
            onStatusChange={(status) => handleStatusChange(item.id, status)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BookOpen size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Sin materias</Text>
            <Text style={styles.emptySubtitle}>
              Selecciona una carrera para ver tus materias
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  careerText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
  },
  progressCard: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  progressGradient: {
    padding: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  progressSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  percentageContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  percentage: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressStatText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  yearTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  yearCount: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});