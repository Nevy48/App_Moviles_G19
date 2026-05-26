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
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
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
import { useUserStore } from '@/store/userStore';

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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, selectedUniversity, selectedCareer, logout } = useUserStore();
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

  const getDummyStats = () => {
    return {
      approved: subject.status === 'approved' ? 1 : 0,
      cursada: subject.status === 'cursada' ? 1 : 0,
      inProgress: subject.status === 'in_progress' ? 1 : 0,
      pending: subject.status === 'pending' ? 1 : 0,
    };
  };

  const handleStatusChange = async (newStatus: ExtendedSubjectStatus) => {
    setSubject({ ...subject, status: newStatus });
    setShowDetailModal(false);
    try {
      await AsyncStorage.setItem('@materia_prueba_status', newStatus);
    } catch (e) {
      console.error(e);
    }
  };

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

  const avatarInitials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

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
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Universidad</Text>
              <Text style={styles.detailValue}>
                {selectedUniversity?.name || 'UTN'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Carrera</Text>
              <Text style={styles.detailValue}>
                {selectedCareer?.name || 'Ingeniería en Sistemas'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Progreso Académico</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <CheckCircle size={24} color={getStatusColor('approved')} />
            <Text style={styles.statValue}>{getDummyStats().approved}</Text>
            <Text style={styles.statLabel}>Aprobadas</Text>
          </View>
          <View style={styles.statItem}>
            <BookOpen size={24} color={getStatusColor('in_progress')} />
            <Text style={styles.statValue}>{getDummyStats().inProgress}</Text>
            <Text style={styles.statLabel}>Cursando</Text>
          </View>
          <View style={styles.statItem}>
            <CheckCircle size={24} color={getStatusColor('cursada')} />
            <Text style={styles.statValue}>{getDummyStats().cursada}</Text>
            <Text style={styles.statLabel}>Cursadas</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={24} color={getStatusColor('pending')} />
            <Text style={styles.statValue}>{getDummyStats().pending}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Configuración</Text>
        </View>

        <View style={styles.menuCard}>
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
        </View>

        <Text style={styles.version}>Mi Estado Académico v1.0.0</Text>
      </ScrollView>

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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
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