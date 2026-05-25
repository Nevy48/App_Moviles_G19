import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
  AlertCircle,
  X,
  Calendar,
  Users,
} from 'lucide-react';
import { Card, SubjectCard } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontWeight } from '@/constants/theme';
import { useUserStore, useAcademicStats, useSubjectsByYear } from '@/store/userStore';
import { ExtendedSubjectStatus } from '@/store/userStore';

const statusConfig: Record<ExtendedSubjectStatus, { color: string; bgColor: string; icon: any }> = {
  disabled: { color: colors.textTertiary, bgColor: colors.inputBackground, icon: Lock },
  available: { color: colors.primary, bgColor: colors.primary + '20', icon: Clock },
  pending: { color: colors.textSecondary, bgColor: colors.inputBackground, icon: Clock },
  in_progress: { color: colors.warning, bgColor: colors.warning + '20', icon: BookOpen },
  cursada: { color: '#A78BFA', bgColor: 'rgba(167, 139, 250, 0.2)', icon: CheckCircle },
  approved: { color: colors.success, bgColor: colors.success + '20', icon: CheckCircle },
};

const statusLabels: Record<ExtendedSubjectStatus, string> = {
  disabled: 'Bloqueada',
  available: 'Disponible',
  pending: 'Pendiente',
  in_progress: 'Cursando',
  cursada: 'Cursada',
  approved: 'Aprobada',
};

export default function PlanScreen() {
  const { user, selectedCareer, updateSubjectStatus, subjects } = useUserStore();
  const stats = useAcademicStats();
  const subjectsByYear = useSubjectsByYear();

  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const years = Object.keys(subjectsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  const handleSubjectPress = (subject: any) => {
    setSelectedSubject(subject);
    setShowDetailModal(true);
  };

  const handleStatusChange = (subjectId: string, status: ExtendedSubjectStatus) => {
    updateSubjectStatus(subjectId, status as any);
    setShowDetailModal(false);
  };

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const getSubjectStatus = (id: string): ExtendedSubjectStatus => {
    for (const year of Object.values(subjectsByYear)) {
      const subject = year.find(s => s.id === id);
      if (subject) return subject.status;
    }
    return 'disabled';
  };

  const renderCorrelatividades = (subject: any) => {
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
                    {statusLabels[reqStatus]}
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
                    {isOk ? 'Aprobada' : 'Pendiente'}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </View>
    );
  };

  const renderComisiones = (subject: any) => {
    if (!subject.comisiones || subject.comisiones.length === 0) {
      return null;
    }

    return (
      <View style={styles.comisionesSection}>
        <Text style={styles.comisionesTitle}>Comisiones disponibles</Text>
        {subject.comisiones.map((comision: any, index: number) => (
          <View key={comision.id} style={styles.comisionItem}>
            <View style={styles.comisionHeader}>
              <Text style={styles.comisionId}>{comision.id}</Text>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {comision.duration === 'A' ? 'Anual' : comision.duration === '1' ? '1°C' : comision.duration === '2' ? '2°C' : comision.duration}
                </Text>
              </View>
            </View>
            <View style={styles.comisionDias}>
              {comision.dias.map((dia: any, diaIndex: number) => (
                <View key={diaIndex} style={styles.diaItem}>
                  <Text style={styles.diaNombre}>{dia.nombre}</Text>
                  <Text style={styles.diaHorario}>{dia.inicio} - {dia.fin}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={years.map(year => ({
          title: `${year}° Año`,
          year,
          data: subjectsByYear[year] || [],
        }))}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Plan de Estudios</Text>
            <Text style={styles.subtitle}>
              {selectedCareer?.name || 'Ingeniería en Sistemas'}
            </Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.yearHeader}>
            <Text style={styles.yearTitle}>{section.title}</Text>
            <View style={styles.yearStats}>
              <Text style={styles.yearStatsText}>
                {section.data.filter(s => s.status === 'approved').length}/{section.data.length} aprobadas
              </Text>
            </View>
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
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={colors.success} />
                <Text style={styles.statValue}>{stats.approved}</Text>
                <Text style={styles.statLabel}>Aprobadas</Text>
              </View>
              <View style={styles.statItem}>
                <BookOpen size={24} color={colors.warning} />
                <Text style={styles.statValue}>{stats.inProgress}</Text>
                <Text style={styles.statLabel}>Cursando</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={24} color={colors.textTertiary} />
                <Text style={styles.statValue}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statItem}>
                <Lock size={24} color={colors.error} />
                <Text style={styles.statValue}>{stats.disabled}</Text>
                <Text style={styles.statLabel}>Bloqueadas</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BookOpen size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Sin plan de estudios</Text>
            <Text style={styles.emptySubtitle}>
              Iniciá sesión para ver tu plan de estudios
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
                  {renderCorrelatividades(selectedSubject)}

                  {/* Comisiones */}
                  {renderComisiones(selectedSubject)}

                  {/* Actions */}
                  <View style={styles.actionsSection}>
                    <Text style={styles.actionsTitle}>Cambiar estado</Text>
                    <View style={styles.actionsGrid}>
                      {selectedSubject.canChangeTo?.includes('in_progress') && (
                        <TouchableOpacity
                          style={[styles.actionButton, selectedSubject.status === 'in_progress' && styles.actionButtonActive]}
                          onPress={() => handleStatusChange(selectedSubject.id, 'in_progress')}
                        >
                          <BookOpen size={18} color={selectedSubject.status === 'in_progress' ? colors.white : colors.warning} />
                          <Text style={[styles.actionButtonText, selectedSubject.status === 'in_progress' && styles.actionButtonTextActive]}>
                            Cursando
                          </Text>
                        </TouchableOpacity>
                      )}
                      {selectedSubject.canChangeTo?.includes('cursada') && (
                        <TouchableOpacity
                          style={[styles.actionButton, selectedSubject.status === 'cursada' && styles.actionButtonActive]}
                          onPress={() => handleStatusChange(selectedSubject.id, 'cursada')}
                        >
                          <CheckCircle size={18} color={selectedSubject.status === 'cursada' ? colors.white : '#A78BFA'} />
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
                          <CheckCircle size={18} color={selectedSubject.status === 'approved' ? colors.white : colors.success} />
                          <Text style={[styles.actionButtonText, selectedSubject.status === 'approved' && styles.actionButtonTextActive]}>
                            Aprobada
                          </Text>
                        </TouchableOpacity>
                      )}
                      {selectedSubject.canChangeTo?.includes('pending') && (
                        <TouchableOpacity
                          style={[styles.actionButton, selectedSubject.status === 'pending' && styles.actionButtonActive]}
                          onPress={() => handleStatusChange(selectedSubject.id, 'pending')}
                        >
                          <Clock size={18} color={selectedSubject.status === 'pending' ? colors.white : colors.textSecondary} />
                          <Text style={[styles.actionButtonText, selectedSubject.status === 'pending' && styles.actionButtonTextActive]}>
                            Pendiente
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
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  yearTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  yearStats: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  yearStatsText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
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
  comisionesSection: {
    marginTop: spacing.lg,
  },
  comisionesTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  comisionItem: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  comisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  comisionId: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  durationBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  durationText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  comisionDias: {
    gap: spacing.xs,
  },
  diaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diaNombre: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  diaHorario: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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