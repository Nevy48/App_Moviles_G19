import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CheckCircle,
  Clock,
  BookOpen,
  X,
  GraduationCap,
} from 'lucide-react-native';
import { SubjectCard, Card } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { materiasService } from '@/services/materiasService';
import { planesService } from '@/services/planesService';
import { Materia, PlanEstudio } from '@/lib/supabase/database.types';

export type ExtendedSubjectStatus = 'disabled' | 'available' | 'pending' | 'in_progress' | 'cursada' | 'approved';

type MateriaWithStatus = Materia & {
  status: ExtendedSubjectStatus;
  canChangeTo: ExtendedSubjectStatus[];
};

const STATUS_STORAGE_KEY = '@materias_status';
const USER_PLAN_KEY = '@plan_id_alumno';

const statusConfig: Record<ExtendedSubjectStatus, { color: string; bgColor: string; textColor: string }> = {
  approved: { color: colors.success, bgColor: colors.success + '15', textColor: colors.success },
  cursada: { color: colors.warning, bgColor: colors.warning + '15', textColor: colors.warning },
  in_progress: { color: colors.primary, bgColor: colors.primary + '15', textColor: colors.primary },
  pending: { color: colors.white, bgColor: 'rgba(255, 255, 255, 0.1)', textColor: colors.white },
  disabled: { color: colors.textTertiary, bgColor: colors.inputBackground, textColor: colors.textTertiary },
  available: { color: colors.white, bgColor: colors.inputBackground, textColor: colors.white },
};

export default function AlumnoMateriasScreen() {
  // Estados para la seleccion del plan
  const [planActivoId, setPlanActivoId] = useState<string | null>(null);
  const [planesDisponibles, setPlanesDisponibles] = useState<PlanEstudio[]>([]);
  
  // Estados para la grilla de materias
  const [materias, setMaterias] = useState<MateriaWithStatus[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<MateriaWithStatus | null>(null);

  const cargarDatosPrincipales = async () => {
    try {
      setCargando(true);
      const planAlmacenado = await AsyncStorage.getItem(USER_PLAN_KEY);

      if (planAlmacenado) {
        setPlanActivoId(planAlmacenado);
        await cargarMateriasDelPlan(planAlmacenado);
      } else {
        const catalogoPlanes = await planesService.getAll();
        setPlanesDisponibles(catalogoPlanes);
      }
    } catch (e) {
      console.error('Error inicializando vista:', e);
    } finally {
      setCargando(false);
    }
  };

  const cargarMateriasDelPlan = async (idPlan: string) => {
    const materiasData = await materiasService.getByPlan(idPlan);
    const estadosGuardados = await AsyncStorage.getItem(STATUS_STORAGE_KEY);
    const mapaEstados: Record<string, ExtendedSubjectStatus> = estadosGuardados ? JSON.parse(estadosGuardados) : {};

    const materiasMapeadas: MateriaWithStatus[] = materiasData.map((m) => {
      const status = mapaEstados[m.id] || 'pending';
      return {
        ...m,
        status,
        canChangeTo: status === 'disabled' ? [] : ['pending', 'in_progress', 'cursada', 'approved'],
      };
    });

    setMaterias(materiasMapeadas);
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatosPrincipales();
    }, [])
  );

  const inscribirseEnPlan = async (plan: PlanEstudio) => {
    Alert.alert(
      'Confirmar Inscripción',
      `¿Deseas matricularte en ${plan.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            await AsyncStorage.setItem(USER_PLAN_KEY, plan.id);
            setPlanActivoId(plan.id);
            await cargarMateriasDelPlan(plan.id);
          }
        }
      ]
    );
  };

  const cambiarEstadoMateria = async (materiaId: string, nuevoEstado: ExtendedSubjectStatus) => {
    const materiasActualizadas = materias.map((m) => {
      if (m.id === materiaId) {
        return { ...m, status: nuevoEstado };
      }
      return m;
    });
    setMaterias(materiasActualizadas);

    const mapaEstados: Record<string, ExtendedSubjectStatus> = {};
    materiasActualizadas.forEach((m) => {
      mapaEstados[m.id] = m.status;
    });
    await AsyncStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(mapaEstados));
    setMostrarModalDetalle(false);
  };

  const agruparMateriasPorNivel = materias.reduce((acumulador, materia) => {
    const nivel = materia.nivel;
    if (!acumulador[nivel]) acumulador[nivel] = [];
    acumulador[nivel].push(materia);
    return acumulador;
  }, {} as Record<number, MateriaWithStatus[]>);

  const nivelesOrdenados = Object.keys(agruparMateriasPorNivel).map(Number).sort((a, b) => a - b);

  const metricas = {
    aprobadas: materias.filter((m) => m.status === 'approved').length,
    cursadas: materias.filter((m) => m.status === 'cursada').length,
    cursando: materias.filter((m) => m.status === 'in_progress').length,
    pendientes: materias.filter((m) => m.status === 'pending').length,
  };

  const totalMaterias = materias.length || 1;
  const porcentajeAvance = Math.round((metricas.aprobadas / totalMaterias) * 100);

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando información académica...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // VISTA 1: Catalogo de seleccion de planes
  if (!planActivoId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Seleccionar Carrera</Text>
          <Text style={styles.subtitle}>Inscríbete en un plan de estudios para comenzar</Text>
        </View>
        <FlatList
          data={planesDisponibles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.planCard} onPress={() => inscribirseEnPlan(item)}>
              <View style={styles.planCardContent}>
                <View style={styles.planIconWrapper}>
                  <BookOpen size={24} color={colors.primary} />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{item.nombre}</Text>
                  <Text style={styles.planYear}>Resolución: {item.anio_resolucion}</Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <GraduationCap size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No hay planes disponibles</Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // VISTA 2: Grilla curricular del plan activo
  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={nivelesOrdenados.map((nivel) => ({
          title: `${nivel}° Año`,
          year: nivel,
          data: agruparMateriasPorNivel[nivel],
        }))}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Mi Plan de Estudios</Text>
            <Text style={styles.subtitle}>Progreso actual</Text>
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
            onPress={() => {
              setMateriaSeleccionada(item);
              setMostrarModalDetalle(true);
            }}
            canChangeTo={item.canChangeTo}
            onStatusChange={(nuevoEstado) => cambiarEstadoMateria(item.id, nuevoEstado)}
          />
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={statusConfig.approved.color} />
                <Text style={styles.statValue}>{metricas.aprobadas}</Text>
                <Text style={styles.statLabel}>Aprobadas</Text>
              </View>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={statusConfig.cursada.color} />
                <Text style={styles.statValue}>{metricas.cursadas}</Text>
                <Text style={styles.statLabel}>Cursadas</Text>
              </View>
              <View style={styles.statItem}>
                <BookOpen size={24} color={statusConfig.in_progress.color} />
                <Text style={styles.statValue}>{metricas.cursando}</Text>
                <Text style={styles.statLabel}>Cursando</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={24} color={statusConfig.pending.color} />
                <Text style={styles.statValue}>{metricas.pendientes}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statItem}>
                <CheckCircle size={24} color={colors.primary} />
                <Text style={styles.statValue}>{porcentajeAvance}%</Text>
                <Text style={styles.statLabel}>Progreso</Text>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={mostrarModalDetalle && materiaSeleccionada !== null} animationType="slide" transparent={true} onRequestClose={() => setMostrarModalDetalle(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalCode}>Nivel {materiaSeleccionada?.nivel}</Text>
                <Text style={styles.modalTitle}>{materiaSeleccionada?.nombre}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setMostrarModalDetalle(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.infoRow}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{materiaSeleccionada?.horas_anuales} horas anuales</Text>
              </View>

              <View style={styles.actionsSection}>
                <Text style={styles.actionsTitle}>Cambiar estado académico</Text>
                <View style={styles.actionsGrid}>
                  {(materiaSeleccionada?.canChangeTo || []).map((estadoDisponible) => (
                    <TouchableOpacity
                      key={estadoDisponible}
                      style={[
                        styles.actionButton,
                        materiaSeleccionada?.status === estadoDisponible && { backgroundColor: statusConfig[estadoDisponible].color, borderColor: statusConfig[estadoDisponible].color }
                      ]}
                      onPress={() => materiaSeleccionada && cambiarEstadoMateria(materiaSeleccionada.id, estadoDisponible)}
                    >
                      <Text style={[styles.actionButtonText, materiaSeleccionada?.status === estadoDisponible && { color: colors.white }]}>
                        {estadoDisponible === 'approved' ? 'Aprobada' : estadoDisponible === 'cursada' ? 'Cursada' : estadoDisponible === 'in_progress' ? 'Cursando' : 'Pendiente'}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: fontSize.md, color: colors.textSecondary },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  planCard: { marginBottom: spacing.md, backgroundColor: colors.card, padding: spacing.md },
  planCardContent: { flexDirection: 'row', alignItems: 'center' },
  planIconWrapper: { width: 48, height: 48, borderRadius: borderRadius.md, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  planInfo: { marginLeft: spacing.md, flex: 1 },
  planName: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  planYear: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: spacing.xxl },
  emptyTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.medium, color: colors.textSecondary, marginTop: spacing.md },
  yearHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  yearTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  yearStats: { backgroundColor: colors.card, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.md },
  yearStatsText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  footer: { marginTop: spacing.xl, paddingTop: spacing.lg },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', paddingVertical: spacing.lg, paddingHorizontal: spacing.xs, backgroundColor: colors.card, borderRadius: borderRadius.lg },
  statItem: { alignItems: 'center', marginHorizontal: spacing.xs },
  statValue: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary, marginTop: spacing.xs },
  statLabel: { fontSize: 10, fontFamily: fontFamily.monoRegular, color: colors.textSecondary, marginTop: spacing.xs, textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  modalCode: { fontSize: fontSize.sm, fontFamily: fontFamily.monoBold, color: colors.primary },
  modalTitle: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary, marginTop: spacing.xs },
  closeButton: { padding: spacing.xs },
  modalBody: { padding: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary },
  actionsSection: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  actionsTitle: { fontSize: fontSize.md, fontFamily: fontFamily.medium, color: colors.textPrimary, marginBottom: spacing.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder },
  actionButtonText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, color: colors.textSecondary },
});