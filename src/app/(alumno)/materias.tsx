import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CheckCircle,
  Clock,
  BookOpen,
  X,
} from 'lucide-react-native';
import { SubjectCard } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { materiasService } from '@/services/materiasService';
import { Materia } from '@/lib/supabase/database.types';

export type ExtendedSubjectStatus = 'disabled' | 'available' | 'pending' | 'in_progress' | 'cursada' | 'approved';

type MateriaWithStatus = Materia & {
  status: ExtendedSubjectStatus;
  canChangeTo: ExtendedSubjectStatus[];
};

const STATUS_STORAGE_KEY = '@materias_status';
const PLAN_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Plan Ingeniería en Sistemas 2023

const statusConfig: Record<ExtendedSubjectStatus, { color: string; bgColor: string; textColor: string }> = {
  approved: { color: colors.success, bgColor: colors.success + '15', textColor: colors.success },
  cursada: { color: colors.warning, bgColor: colors.warning + '15', textColor: colors.warning },
  in_progress: { color: colors.primary, bgColor: colors.primary + '15', textColor: colors.primary },
  pending: { color: colors.white, bgColor: 'rgba(255, 255, 255, 0.1)', textColor: colors.white },
  disabled: { color: colors.textTertiary, bgColor: colors.inputBackground, textColor: colors.textTertiary },
  available: { color: colors.white, bgColor: colors.inputBackground, textColor: colors.white },
};

const statusLabels: Record<ExtendedSubjectStatus, string> = {
  disabled: 'Bloqueada',
  available: 'Disponible',
  pending: 'Pendiente',
  in_progress: 'Cursando',
  cursada: 'Cursada',
  approved: 'Aprobada',
};

export default function AlumnoMateriasScreen() {
  const [materias, setMaterias] = useState<MateriaWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState<MateriaWithStatus | null>(null);

  const loadData = async () => {
    try {
      const materiasData = await materiasService.getByPlan(PLAN_ID);

      const savedStatuses = await AsyncStorage.getItem(STATUS_STORAGE_KEY);
      const statusMap: Record<string, ExtendedSubjectStatus> = savedStatuses ? JSON.parse(savedStatuses) : {};

      const materiasConStatus: MateriaWithStatus[] = materiasData.map((m) => {
        const status = statusMap[m.id] || 'pending';
        return {
          ...m,
          status,
          canChangeTo: status === 'disabled' ? [] : ['pending', 'in_progress', 'cursada', 'approved'],
        };
      });

      setMaterias(materiasConStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getStatusColor = (status: ExtendedSubjectStatus) => {
    return statusConfig[status]?.color || colors.white;
  };

  const handleStatusChange = async (materiaId: string, newStatus: ExtendedSubjectStatus) => {
    const updatedMaterias = materias.map((m) => {
      if (m.id === materiaId) {
        return { ...m, status: newStatus };
      }
      return m;
    });
    setMaterias(updatedMaterias);

    const statusMap: Record<string, ExtendedSubjectStatus> = {};
    updatedMaterias.forEach((m) => {
      statusMap[m.id] = m.status;
    });
    await AsyncStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusMap));

    setShowDetailModal(false);
  };

  const groupedMaterias = materias.reduce((acc, materia) => {
    const nivel = materia.nivel;
    if (!acc[nivel]) {
      acc[nivel] = [];
    }
    acc[nivel].push(materia);
    return acc;
  }, {} as Record<number, MateriaWithStatus[]>);

  const sortedNiveles = Object.keys(groupedMaterias)
    .map(Number)
    .sort((a, b) => a - b);

  const stats = {
    approved: materias.filter((m) => m.status === 'approved').length,
    cursada: materias.filter((m) => m.status === 'cursada').length,
    inProgress: materias.filter((m) => m.status === 'in_progress').length,
    pending: materias.filter((m) => m.status === 'pending').length,
  };

  const totalSubjects = materias.length || 1;
  const approvalPercentage = Math.round((stats.approved / totalSubjects) * 100);

  const handleSubjectPress = (materia: MateriaWithStatus) => {
    setSelectedMateria(materia);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sortedNiveles.map((nivel) => ({
          title: `${nivel}° Año`,
          year: nivel,
          data: groupedMaterias[nivel],
        }))}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Plan de Estudios</Text>
            <Text style={styles.subtitle}>Ingeniería en Sistemas - Plan 2023</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.yearHeader}>
            <Text style={styles.yearTitle}>{section.title}</Text>
            <View style={styles.yearStats}>
              <Text style={styles.yearStatsText}>
                {section.data.filter((s) => s.status === 'approved').length}/{section.data.length} aprobadas
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <SubjectCard
            name={item.nombre}
            code={`Nivel ${item.nivel}`}
            status={item.status}
            year={item.nivel}
            semester={1}
            credits={0}
            difficulty={0}
            hours={`${item.horas_anuales} hs`}
            correlCursada={[]}
            correlAprobada={[]}
            isElectivePlaceholder={false}
            isSeminario={false}
            onPress={() => handleSubjectPress(item)}
            canChangeTo={item.canChangeTo}
            onStatusChange={(newStatus) => handleStatusChange(item.id, newStatus)}
          />
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={getStatusColor('approved')} />
                <Text style={styles.statValue}>{stats.approved}</Text>
                <Text style={styles.statLabel}>Aprobadas</Text>
              </View>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={getStatusColor('cursada')} />
                <Text style={styles.statValue}>{stats.cursada}</Text>
                <Text style={styles.statLabel}>Cursadas</Text>
              </View>
              <View style={styles.statItem}>
                <BookOpen size={24} color={getStatusColor('in_progress')} />
                <Text style={styles.statValue}>{stats.inProgress}</Text>
                <Text style={styles.statLabel}>Cursando</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={24} color={getStatusColor('pending')} />
                <Text style={styles.statValue}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={colors.primary} />
                <Text style={styles.statValue}>{approvalPercentage}%</Text>
                <Text style={styles.statLabel}>Progreso</Text>
              </View>
            </View>
          </View>
        )}
      />

      <Modal
        visible={showDetailModal && selectedMateria !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalCode}>Nivel {selectedMateria?.nivel}</Text>
                <Text style={styles.modalTitle}>{selectedMateria?.nombre}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.infoRow}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{selectedMateria?.horas_anuales} horas anuales</Text>
              </View>

              <View style={styles.correlSection}>
                <Text style={styles.correlTitle}>Sin correlatividades configuradas</Text>
              </View>

              <View style={styles.actionsSection}>
                <Text style={styles.actionsTitle}>Cambiar estado</Text>
                <View style={styles.actionsGrid}>
                  {(selectedMateria?.canChangeTo || []).includes('approved') && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        selectedMateria?.status === 'approved' && {
                          backgroundColor: getStatusColor('approved'),
                          borderColor: getStatusColor('approved'),
                        },
                      ]}
                      onPress={() => selectedMateria && handleStatusChange(selectedMateria.id, 'approved')}
                    >
                      <CheckCircle
                        size={18}
                        color={
                          selectedMateria?.status === 'approved'
                            ? colors.white
                            : getStatusColor('approved')
                        }
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          selectedMateria?.status === 'approved' && styles.actionButtonTextActive,
                        ]}
                      >
                        Aprobada
                      </Text>
                    </TouchableOpacity>
                  )}
                  {(selectedMateria?.canChangeTo || []).includes('cursada') && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        selectedMateria?.status === 'cursada' && {
                          backgroundColor: getStatusColor('cursada'),
                          borderColor: getStatusColor('cursada'),
                        },
                      ]}
                      onPress={() => selectedMateria && handleStatusChange(selectedMateria.id, 'cursada')}
                    >
                      <CheckCircle
                        size={18}
                        color={
                          selectedMateria?.status === 'cursada'
                            ? colors.white
                            : getStatusColor('cursada')
                        }
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          selectedMateria?.status === 'cursada' && styles.actionButtonTextActive,
                        ]}
                      >
                        Cursada
                      </Text>
                    </TouchableOpacity>
                  )}
                  {(selectedMateria?.canChangeTo || []).includes('in_progress') && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        selectedMateria?.status === 'in_progress' && {
                          backgroundColor: getStatusColor('in_progress'),
                          borderColor: getStatusColor('in_progress'),
                        },
                      ]}
                      onPress={() => selectedMateria && handleStatusChange(selectedMateria.id, 'in_progress')}
                    >
                      <BookOpen
                        size={18}
                        color={
                          selectedMateria?.status === 'in_progress'
                            ? colors.white
                            : getStatusColor('in_progress')
                        }
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          selectedMateria?.status === 'in_progress' && styles.actionButtonTextActive,
                        ]}
                      >
                        Cursando
                      </Text>
                    </TouchableOpacity>
                  )}
                  {(selectedMateria?.canChangeTo || []).includes('pending') && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        selectedMateria?.status === 'pending' && {
                          backgroundColor: getStatusColor('pending'),
                          borderColor: getStatusColor('pending'),
                        },
                      ]}
                      onPress={() => selectedMateria && handleStatusChange(selectedMateria.id, 'pending')}
                    >
                      <Clock
                        size={18}
                        color={
                          selectedMateria?.status === 'pending'
                            ? colors.background
                            : getStatusColor('pending')
                        }
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          selectedMateria?.status === 'pending' && { color: colors.background },
                        ]}
                      >
                        Pendiente
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold,
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
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  yearTitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  yearStats: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  yearStatsText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.monoRegular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
    fontFamily: fontFamily.monoBold,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
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
  },
  infoText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
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
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  actionsSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  actionsTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
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
  actionButtonText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  actionButtonTextActive: {
    color: colors.white,
  },
});
