import { useState, useCallback } from 'react';
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
import { useFocusEffect } from 'expo-router';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  X,
} from 'lucide-react';
import { SubjectCard } from '@/components/ui';
import {
  Calendar,
  Users,
} from 'lucide-react-native';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExtendedSubjectStatus = 'disabled' | 'available' | 'pending' | 'in_progress' | 'cursada' | 'approved';

const BASE_DUMMY_SUBJECT = {
  id: 'placeholder-1',
  name: 'Aplicaciones Móviles',
  code: '001',
  status: 'pending' as ExtendedSubjectStatus,
  level: 1,
  semester: 1,
  credits: 4,
  hours: '4 hs/sem',
  correlCursada: [],
  correlAprobada: [],
  isElectivePlaceholder: false,
  isSeminario: false,
  canChangeTo: ['approved', 'cursada', 'in_progress', 'pending'] as ExtendedSubjectStatus[],
};

export default function PlanScreen() {
  const [subject, setSubject] = useState(BASE_DUMMY_SUBJECT);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadStatus = async () => {
        try {
          const savedStatus = await AsyncStorage.getItem('@materia_prueba_status');
          if (savedStatus) {
            setSubject(prev => ({ ...prev, status: savedStatus as ExtendedSubjectStatus }));
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadStatus();
    }, [])
  );

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

  const dummyStats = {
    approved: subject.status === 'approved' ? 1 : 0,
    cursada: subject.status === 'cursada' ? 1 : 0,
    inProgress: subject.status === 'in_progress' ? 1 : 0,
    pending: subject.status === 'pending' ? 1 : 0,
  };

  const totalSubjects = 1;
  const approvalPercentage = Math.round((dummyStats.approved / totalSubjects) * 100);

  const handleStatusChange = async (newStatus: ExtendedSubjectStatus) => {
    setSubject({ ...subject, status: newStatus });
    setShowDetailModal(false);
    try {
      await AsyncStorage.setItem('@materia_prueba_status', newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={[
          {
            title: "1° Año",
            year: 1,
            data: [subject]
          }
        ]}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Plan de Estudios</Text>
            <Text style={styles.subtitle}>Ingeniería en Sistemas</Text>
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
            year={item.level}
            semester={item.semester}
            credits={item.credits}
            hours={item.hours}
            correlCursada={item.correlCursada}
            correlAprobada={item.correlAprobada}
            isElectivePlaceholder={item.isElectivePlaceholder}
            isSeminario={item.isSeminario}
            onPress={() => setShowDetailModal(true)}
            canChangeTo={item.canChangeTo}
          />
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={getStatusColor('approved')} />
                <Text style={styles.statValue}>{dummyStats.approved}</Text>
                <Text style={styles.statLabel}>Aprobadas</Text>
              </View>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={getStatusColor('cursada')} />
                <Text style={styles.statValue}>{dummyStats.cursada}</Text>
                <Text style={styles.statLabel}>Cursadas</Text>
              </View>
              <View style={styles.statItem}>
                <BookOpen size={24} color={getStatusColor('in_progress')} />
                <Text style={styles.statValue}>{dummyStats.inProgress}</Text>
                <Text style={styles.statLabel}>Cursando</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={24} color={getStatusColor('pending')} />
                <Text style={styles.statValue}>{dummyStats.pending}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statItem}>
                <Award size={24} color={colors.primary} />
                <Text style={styles.statValue}>{approvalPercentage}%</Text>
                <Text style={styles.statLabel}>Progreso</Text>
              </View>
            </View>
          </View>
        )}
      />

      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalCode}>{subject.code}</Text>
                <Text style={styles.modalTitle}>{subject.name}</Text>
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
                <Text style={styles.infoText}>{subject.hours}</Text>
              </View>

              <View style={styles.correlSection}>
                <Text style={styles.correlTitle}>Sin correlatividades</Text>
              </View>

              <View style={styles.actionsSection}>
                <Text style={styles.actionsTitle}>Cambiar estado</Text>
                <View style={styles.actionsGrid}>
                  {subject.canChangeTo?.includes('approved') && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton, 
                        subject.status === 'approved' && { backgroundColor: getStatusColor('approved'), borderColor: getStatusColor('approved') }
                      ]}
                      onPress={() => handleStatusChange('approved')}
                    >
                      <CheckCircle size={18} color={subject.status === 'approved' ? colors.white : getStatusColor('approved')} />
                      <Text style={[styles.actionButtonText, subject.status === 'approved' && styles.actionButtonTextActive]}>
                        Aprobada
                      </Text>
                    </TouchableOpacity>
                  )}
                  {subject.canChangeTo?.includes('cursada') && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton, 
                        subject.status === 'cursada' && { backgroundColor: getStatusColor('cursada'), borderColor: getStatusColor('cursada') }
                      ]}
                      onPress={() => handleStatusChange('cursada')}
                    >
                      <CheckCircle size={18} color={subject.status === 'cursada' ? colors.white : getStatusColor('cursada')} />
                      <Text style={[styles.actionButtonText, subject.status === 'cursada' && styles.actionButtonTextActive]}>
                        Cursada
                      </Text>
                    </TouchableOpacity>
                  )}
                  {subject.canChangeTo?.includes('in_progress') && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton, 
                        subject.status === 'in_progress' && { backgroundColor: getStatusColor('in_progress'), borderColor: getStatusColor('in_progress') }
                      ]}
                      onPress={() => handleStatusChange('in_progress')}
                    >
                      <BookOpen size={18} color={subject.status === 'in_progress' ? colors.white : getStatusColor('in_progress')} />
                      <Text style={[styles.actionButtonText, subject.status === 'in_progress' && styles.actionButtonTextActive]}>
                        Cursando
                      </Text>
                    </TouchableOpacity>
                  )}
                  {subject.canChangeTo?.includes('pending') && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton, 
                        subject.status === 'pending' && { backgroundColor: getStatusColor('pending'), borderColor: getStatusColor('pending') }
                      ]}
                      onPress={() => handleStatusChange('pending')}
                    >
                      <Clock size={18} color={subject.status === 'pending' ? colors.background : getStatusColor('pending')} />
                      <Text style={[styles.actionButtonText, subject.status === 'pending' && { color: colors.background }]}>
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
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  header: { paddingVertical: spacing.lg },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, fontFamily: fontFamily.monoRegular, color: colors.textSecondary, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.8 },
  yearHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.md },
  yearTitle: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  yearStats: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  yearStatsText: { fontSize: fontSize.sm, color: colors.primary, fontFamily: fontFamily.medium },
  footer: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary, marginTop: spacing.xs },
  statLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.monoRegular, color: colors.textSecondary, marginTop: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  modalCode: { fontSize: fontSize.sm, fontFamily: fontFamily.monoBold, color: colors.primary },
  modalTitle: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary, marginTop: spacing.xs, maxWidth: '85%' },
  closeButton: { padding: spacing.xs },
  modalBody: { padding: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  infoText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textSecondary },
  correlSection: { marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.inputBackground, borderRadius: borderRadius.md },
  correlTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, color: colors.textPrimary, marginBottom: spacing.sm },
  actionsSection: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  actionsTitle: { fontSize: fontSize.md, fontFamily: fontFamily.medium, color: colors.textPrimary, marginBottom: spacing.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder },
  actionButtonText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, color: colors.textSecondary },
  actionButtonTextActive: { color: colors.white },
});