import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SectionList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  X,
} from 'lucide-react';
import { Card, SubjectCard } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { useUserStore, useAcademicStats, useSubjectsByYear } from '@/store/userStore';
import { ExtendedSubjectStatus } from '@/store/userStore';

const logoUrl = 'https://res.cloudinary.com/disx14b4q/image/upload/v1779402010/image_2_bluupa.png';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user, selectedCareer, updateSubjectStatus, subjects } = useUserStore();
  const stats = useAcademicStats();
  const subjectsByYear = useSubjectsByYear();

  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSubjectPress = (subject: any) => {
    setSelectedSubject(subject);
    setShowDetailModal(true);
  };

  const handleStatusChange = (subjectId: string, status: ExtendedSubjectStatus) => {
    updateSubjectStatus(subjectId, status as any);
    setShowDetailModal(false);
  };

  const years = Object.keys(subjectsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  const sections = years
    .map((year) => ({
      title: `${year}° Año`,
      year,
      data: (subjectsByYear[year] || []).filter(s => s.status === 'in_progress'),
    }))
    .filter(section => section.data.length > 0);

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const getSubjectStatus = (id: string): ExtendedSubjectStatus => {
    for (const year of Object.values(subjectsByYear)) {
      const subject = year.find(s => s.id === id);
      if (subject) return subject.status;
    }
    return 'disabled';
  };

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
                    <AlertCircle size={16} color={colors.textTertiary} />
                    <Text style={styles.progressStatText}>
                      {stats.disabled} bloqueadas
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Card>

            {/* Career Selector */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Materias que estoy cursando</Text>
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
            year={item.level || item.year}
            semester={item.semester}
            credits={item.credits}
            difficulty={item.difficulty}
            professor={item.professor}
            hours={item.hours}
            correlCursada={item.correlCursada}
            correlAprobada={item.correlAprobada}
            isElectivePlaceholder={item.isElectivePlaceholder}
            isSeminario={item.isSeminario}
            onPress={() => handleSubjectPress(item)}
            canChangeTo={item.canChangeTo}
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

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSubject && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalCode}>{selectedSubject.code}</Text>
                    <Text style={styles.modalTitle}>{selectedSubject.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <X size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Hours */}
                  {selectedSubject.hours && (
                    <View style={styles.infoRow}>
                      <Clock size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>{selectedSubject.hours}</Text>
                    </View>
                  )}

                  {/* Correlatividades */}
                  {renderCorrelatividades(selectedSubject, getSubjectById, getSubjectStatus)}

                  {/* Actions */}
                  <View style={styles.actionsSection}>
                    <Text style={styles.actionsTitle}>Cambiar estado</Text>
                    <View style={styles.actionsGrid}>
                      {selectedSubject.canChangeTo?.includes('pending') && (
                        <TouchableOpacity
                          style={[styles.actionButton, selectedSubject.status === 'pending' && styles.actionButtonActive]}
                          onPress={() => handleStatusChange(selectedSubject.id, 'pending')}
                        >
                          <Text style={[styles.actionButtonText, selectedSubject.status === 'pending' && styles.actionButtonTextActive]}>
                            Pendiente
                          </Text>
                        </TouchableOpacity>
                      )}
                      {selectedSubject.canChangeTo?.includes('cursada') && (
                        <TouchableOpacity
                          style={[styles.actionButton, selectedSubject.status === 'cursada' && styles.actionButtonActive]}
                          onPress={() => handleStatusChange(selectedSubject.id, 'cursada')}
                        >
                          <Text style={[styles.actionButtonText, selectedSubject.status === 'cursada' && styles.actionButtonTextActive]}>
                            Cursada
                          </Text>
                        </TouchableOpacity>
                      )}
                      {selectedSubject.canChangeTo?.includes('approved') && (
                        <TouchableOpacity
                          style={[styles.actionButton, selectedSubject.status === 'approved' && styles.actionButtonActive]}
                          onPress={() => handleStatusChange(selectedSubject.id, 'approved')}
                        >
                          <Text style={[styles.actionButtonText, selectedSubject.status === 'approved' && styles.actionButtonTextActive]}>
                            Aprobada
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function renderCorrelatividades(subject: any, getSubjectById: (id: string) => any, getSubjectStatus: (id: string) => ExtendedSubjectStatus) {
  const cursadasReq = subject.correlCursada || [];
  const aprobadasReq = subject.correlAprobada || [];

  if (cursadasReq.length === 0 && aprobadasReq.length === 0) {
    return (
      <View style={styles.correlSection}>
        <Text style={styles.correlTitle}>Sin correlatividades</Text>
      </View>
    );
  }

  return (
    <View style={styles.correlSection}>
      {cursadasReq.length > 0 && (
        <>
          <Text style={styles.correlTitle}>Requiere estar cursando:</Text>
          {cursadasReq.map((reqId: string) => {
            const reqSubject = getSubjectById(reqId);
            const reqStatus = getSubjectStatus(reqId);
            const isOk = ['cursada', 'approved', 'in_progress'].includes(reqStatus);
            return (
              <View key={reqId} style={styles.correlItem}>
                {isOk ? (
                  <CheckCircle size={16} color={colors.success} />
                ) : (
                  <AlertCircle size={16} color={colors.error} />
                )}
                <Text style={[styles.correlName, !isOk && styles.correlNamePending]}>
                  {reqSubject?.name || reqId}
                </Text>
                <Text style={[styles.correlStatus, { color: isOk ? colors.success : colors.textTertiary }]}>
                  {isOk ? 'OK' : 'Pendiente'}
                </Text>
              </View>
            );
          })}
        </>
      )}

      {aprobadasReq.length > 0 && (
        <>
          <Text style={[styles.correlTitle, { marginTop: spacing.sm }]}>Requiere tener aprobada:</Text>
          {aprobadasReq.map((reqId: string) => {
            const reqSubject = getSubjectById(reqId);
            const reqStatus = getSubjectStatus(reqId);
            const isOk = reqStatus === 'approved';
            return (
              <View key={reqId} style={styles.correlItem}>
                {isOk ? (
                  <CheckCircle size={16} color={colors.success} />
                ) : (
                  <AlertCircle size={16} color={colors.error} />
                )}
                <Text style={[styles.correlName, !isOk && styles.correlNamePending]}>
                  {reqSubject?.name || reqId}
                </Text>
                <Text style={[styles.correlStatus, { color: isOk ? colors.success : colors.textTertiary }]}>
                  {isOk ? 'OK' : 'Pendiente'}
                </Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

import { ProgressBar } from '@/components/ui/ProgressBar';

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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modalCode: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    maxWidth: '85%',
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  correlSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
  },
  correlTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  correlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  correlName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  correlNamePending: {
    color: colors.textTertiary,
  },
  correlStatus: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  actionsSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  actionsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  actionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  actionButtonTextActive: {
    color: colors.white,
  },
});