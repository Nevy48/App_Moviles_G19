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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  CheckCircle,
  Clock,
  BookOpen,
  X,
  GraduationCap,
  Search,
  Lock,
  Building,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { SubjectCard, Card } from '@/components/ui';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { materiasService } from '@/services/materiasService';
import { planesService } from '@/services/planesService';
import { correlativasService } from '@/services/correlativasService';
import { progresoService } from '@/services/progresoService';
import { suscripcionesService } from '@/services/suscripcionesService';
import { useAuth } from '@/context/AuthContext';
import { Materia, PlanEstudio, CorrelativaWithDetails } from '@/lib/supabase/database.types';
import { BuscadorInstituciones } from '@/components/BuscadorInstituciones';

export type ExtendedSubjectStatus = 'disabled' | 'available' | 'pending' | 'in_progress' | 'cursada' | 'approved';

type MateriaEvaluada = Materia & {
  status: ExtendedSubjectStatus;
  motivosBloqueo: string[];
};

const STATUS_STORAGE_KEY = '@materias_status';
const USER_PLAN_KEY = '@plan_id_alumno';

export default function AlumnoMateriasScreen() {
  const { perfil } = useAuth();

  // Estados de Navegación Institucional
  const [vistaActual, setVistaActual] = useState<'mi_plan' | 'facultades' | 'planes_facultad' | 'preview_plan' | 'selector_planes'>('selector_planes');
  const [facultades, setFacultades] = useState<any[]>([]);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState<any | null>(null);
  const [planesDisponibles, setPlanesDisponibles] = useState<PlanEstudio[]>([]);
  const [planPreview, setPlanPreview] = useState<PlanEstudio | null>(null);
  
  // Estados - Grilla y Correlatividades
  const [planActivo, setPlanActivo] = useState<PlanEstudio | null>(null);
  const [materias, setMaterias] = useState<MateriaEvaluada[]>([]);
  const [correlativasTotales, setCorrelativasTotales] = useState<CorrelativaWithDetails[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<MateriaEvaluada | null>(null);
  const [planesSuscritos, setPlanesSuscritos] = useState<PlanEstudio[]>([]);

  const cargarDatosPrincipales = async () => {
    setCargando(true);
    const planes = await suscripcionesService.getPlanesSuscritos(perfil!.id);
    setPlanesSuscritos(planes);
    
    if (planes.length === 0) {
      // Si no tiene planes, obligatoriamente cargamos las facultades para que elija uno
      const admins = await planesService.getAdminsInstitucionales();
      setFacultades(admins);
      setVistaActual('facultades');
    } else {
      setVistaActual('selector_planes'); 
    }
    setCargando(false);
  };

  // NUEVA FUNCIÓN: Descarga la lista de instituciones y abre el buscador
  const abrirBuscador = async () => {
    setCargando(true);
    const admins = await planesService.getAdminsInstitucionales();
    setFacultades(admins);
    setVistaActual('facultades');
    setCargando(false);
  };

  useFocusEffect(useCallback(() => { cargarDatosPrincipales(); }, [perfil?.id]));

  // --- MOTOR DE CORRELATIVIDADES (CLOUD) ---
  const procesarMotorAcademico = async (idPlan: string, idAlumno: string, modoPreview: boolean = false) => {
    const [materiasData, correlativasData, progresoData] = await Promise.all([
      materiasService.getByPlan(idPlan),
      correlativasService.getAll(),
      modoPreview ? [] : progresoService.getProgresoAlumno(idAlumno)
    ]);
    
    setCorrelativasTotales(correlativasData);

    const mapaEstados = progresoData.reduce((acc: any, curr) => {
      acc[curr.id_materia] = curr.estado;
      return acc;
    }, {});

    const materiasEvaluadas: MateriaEvaluada[] = materiasData.map((materia) => {
      let estadoActual = mapaEstados[materia.id] || 'pending';
      let motivosBloqueo: string[] = [];

      if (estadoActual === 'pending') {
        const requisitos = correlativasData.filter(c => c.id_materia === materia.id);
        let cumpleTodos = true;

        requisitos.forEach(req => {
          const estadoReq = mapaEstados[req.id_correlativa] || 'pending';
          if (req.tipo === 'aprobada' && estadoReq !== 'approved') {
            cumpleTodos = false;
            motivosBloqueo.push(`Requiere Aprobada: ${req.correlativa_nombre}`);
          } else if (req.tipo === 'cursada' && estadoReq !== 'approved' && estadoReq !== 'cursada') {
            cumpleTodos = false;
            motivosBloqueo.push(`Requiere Cursada: ${req.correlativa_nombre}`);
          }
        });

        estadoActual = cumpleTodos ? 'available' : 'disabled';
      }

      return { ...materia, status: estadoActual, motivosBloqueo };
    });

    setMaterias(materiasEvaluadas);
  };

  const verPlanesDeFacultad = async (facultad: any) => {
    setCargando(true);
    setFacultadSeleccionada(facultad);
    const planes = await planesService.getByAdmin(facultad.id);
    setPlanesDisponibles(planes);
    setVistaActual('planes_facultad');
    setCargando(false);
  };

  const verPreviewPlan = async (plan: PlanEstudio) => {
    setCargando(true);
    setPlanPreview(plan);
    if (perfil?.id) await procesarMotorAcademico(plan.id, perfil.id, true);
    setVistaActual('preview_plan');
    setCargando(false);
  };

  const suscribirsePlan = async () => {
    if (!planPreview || !perfil?.id) return;
    setCargando(true);
    const resultado = await suscripcionesService.seguirPlan(perfil.id, planPreview.id);
    
    if (resultado.success) {
      Alert.alert('¡Éxito!', 'Te has inscrito al plan de estudios.');
      await cargarDatosPrincipales();
    } else {
      Alert.alert('Error al inscribirse', resultado.error || 'Error desconocido');
      setCargando(false);
    }
  };

  const abandonarPlanActual = () => {
    Alert.alert('Abandonar Carrera', '¿Estás seguro? Perderás el progreso de este plan.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abandonar', style: 'destructive', onPress: async () => {
        if (!planActivo || !perfil?.id) return;
        setCargando(true);
        await suscripcionesService.abandonarPlan(perfil.id, planActivo.id);
        
        // Limpiamos el plan activo actual
        setPlanActivo(null);
        setMaterias([]);
        
        // Recargamos los datos para ver si quedan otros planes
        await cargarDatosPrincipales();
      }}
    ]);
  };

  const cambiarEstadoMateria = async (nuevoEstado: ExtendedSubjectStatus) => {
    if (!materiaSeleccionada || !perfil?.id || !planActivo) return;
    
    // Guardamos en la nube
    await progresoService.upsertProgreso(perfil.id, materiaSeleccionada.id, nuevoEstado, []);
    setMostrarModalDetalle(false);
    
    // Recalculamos la malla
    await procesarMotorAcademico(planActivo.id, perfil.id);
  };

  const manejarClickMateria = (materia: MateriaEvaluada) => {
    if (materia.status === 'disabled') {
      // Replicamos el tooltip de la web alertando por qué está bloqueada
      Alert.alert('Materia Bloqueada', materia.motivosBloqueo.join('\n'));
      return;
    }
    setMateriaSeleccionada(materia);
    setMostrarModalDetalle(true);
  };

  // --- RENDERIZADO Y ESTADISTICAS ---
  const agruparMateriasPorNivel = materias.reduce((acc, materia) => {
    if (!acc[materia.nivel]) acc[materia.nivel] = [];
    acc[materia.nivel].push(materia);
    return acc;
  }, {} as Record<number, MateriaEvaluada[]>);

  const nivelesOrdenados = Object.keys(agruparMateriasPorNivel).map(Number).sort((a, b) => a - b);

  const metricas = {
    aprobadas: materias.filter((m) => m.status === 'approved').length,
    cursadas: materias.filter((m) => m.status === 'cursada').length,
    cursando: materias.filter((m) => m.status === 'in_progress').length,
    total: materias.length || 1
  };
  const porcentajeAvance = Math.round((metricas.aprobadas / metricas.total) * 100);

  if (cargando) return <View style={styles.loadingContainer}><Text>Cargando información...</Text></View>;

  // --- VISTAS DE NAVEGACIÓN INSTITUCIONAL ---
  if (vistaActual === 'facultades' || vistaActual === 'planes_facultad') {
    return (
      <BuscadorInstituciones
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        facultades={facultades}
        planesDisponibles={planesDisponibles}
        verPlanesDeFacultad={verPlanesDeFacultad}
        verPreviewPlan={verPreviewPlan}
        facultadSeleccionada={facultadSeleccionada}
        // Le pasamos la función de volver SOLO si el usuario ya tiene planes cargados
        onVolver={planesSuscritos.length > 0 ? () => setVistaActual('selector_planes') : undefined}
      />
    );
  }

  if (vistaActual === 'selector_planes') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.title}>Mis Planes</Text>
            {/* Botón "+" para agregar nuevo plan */}
              <TouchableOpacity onPress={abrirBuscador}>
                <Text style={{ color: colors.primary }}>+ Agregar Plan</Text>
              </TouchableOpacity>
          </View>
        </View>
        <FlatList 
          data={planesSuscritos}
          renderItem={({item}) => (
            <Card onPress={() => {
              setPlanActivo(item);
              procesarMotorAcademico(item.id, perfil!.id);
              setVistaActual('mi_plan');
            }}>
              <Text style={styles.planName}>{item.nombre}</Text>
            </Card>
          )}
        />
      </SafeAreaView>
    );
  }

  // --- VISTA DE PLAN (Preview o Mi Plan) ---
  const esPreview = vistaActual === 'preview_plan';
  const planInfo = esPreview ? planPreview : planActivo;

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={nivelesOrdenados.map((nivel) => ({ title: `Nivel ${nivel}`, data: [{ items: agruparMateriasPorNivel[nivel] }] }))} // Agrupamos para usar flexWrap
        keyExtractor={(item, index) => `section-${index}`}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            
            {/* --- BOTONERA SUPERIOR --- */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
              {/* Si estamos viendo el Preview de un plan nuevo */}
              {esPreview ? (
                <TouchableOpacity onPress={() => setVistaActual('planes_facultad')}>
                  <Text style={{ color: colors.primary, fontFamily: fontFamily.bold }}>← Volver a Planes</Text>
                </TouchableOpacity>
              ) : (
                /* Si estamos viendo NUESTRO plan (ya estamos inscriptos) */
                <TouchableOpacity onPress={() => {
                  setPlanActivo(null); // Limpiamos para no arrastrar materias
                  setVistaActual('selector_planes'); // Volvemos al listado
                }}>
                  <Text style={{ color: colors.primary, fontFamily: fontFamily.bold }}>← Volver a Mis Planes</Text>
                </TouchableOpacity>
              )}
              
              {/* Botón LogOut solo si NO es preview */}
              {!esPreview && (
                <TouchableOpacity onPress={abandonarPlanActual} style={{ padding: 8, backgroundColor: colors.error + '15', borderRadius: 8 }}>
                  <LogOut size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>

            {/* --- TÍTULO DEL PLAN --- */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={styles.title}>{planInfo?.nombre}</Text>
              <Text style={styles.subtitle}>Resolución {planInfo?.anio_resolucion}</Text>
            </View>

            {/* --- ESTADÍSTICAS O BOTÓN SEGUIR --- */}
            {esPreview ? (
              <TouchableOpacity style={styles.btnSeguir} onPress={suscribirsePlan}>
                <Text style={styles.btnSeguirText}>+ Seguir este Plan</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.statsWebContainer}>
                <View style={styles.statsWebRow}>
                  <View style={styles.statBox}><Text style={[styles.statNum, {color: colors.success}]}>{metricas.aprobadas}</Text><Text style={styles.statLabel}>Aprobadas</Text></View>
                  <View style={styles.statBox}><Text style={[styles.statNum, {color: colors.warning}]}>{metricas.cursadas}</Text><Text style={styles.statLabel}>Cursadas</Text></View>
                  <View style={styles.statBox}><Text style={[styles.statNum, {color: colors.primary}]}>{metricas.cursando}</Text><Text style={styles.statLabel}>Cursando</Text></View>
                  <View style={styles.statBox}><Text style={styles.statNum}>{metricas.total}</Text><Text style={styles.statLabel}>Total</Text></View>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressPercent}>{porcentajeAvance}%</Text>
                  <View style={{ flex: 1 }}><ProgressBar percentage={porcentajeAvance} height={6} showPercentage={false} /></View>
                </View>
              </View>
            )}
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.yearHeader}>
            <Text style={styles.yearTitle}>{section.title}</Text>
            <View style={styles.yearLine} />
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.twoColumnGrid}>
            {item.items.map((materia) => (
              <View key={materia.id} style={styles.gridItem}>
                <SubjectCard
                  name={materia.nombre}
                  code={`Nivel ${materia.nivel}`}
                  status={materia.status}
                  year={materia.nivel}
                  semester={1}
                  credits={0}
                  difficulty={0}
                  hours={`${materia.horas_anuales} hs`}
                  correlCursada={[]} correlAprobada={[]} isElectivePlaceholder={false} isSeminario={false} canChangeTo={[]}
                  onPress={() => esPreview ? null : manejarClickMateria(materia)}
                />
              </View>
            ))}
          </View>
        )}
      />

      {/* MODAL DE CAMBIO DE ESTADO DESDE ABAJO */}
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
              <Text style={styles.actionsTitle}>Actualizar estado</Text>
              
              {/* Botones Horizontales */}
              <View style={styles.horizontalActionsGrid}>
                {['approved', 'cursada', 'in_progress', 'available'].map((estado) => {
                   const isAprobada = estado === 'approved';
                   const isCursada = estado === 'cursada';
                   const isCursando = estado === 'in_progress';
                   
                   let color = colors.textTertiary as string;
                   if (isAprobada) color = colors.success as string;
                   if (isCursada) color = colors.warning as string;
                   if (isCursando) color = colors.primary as string;

                   const isActive = materiaSeleccionada?.status === estado;

                   return (
                    <TouchableOpacity
                      key={estado}
                      style={[styles.horizontalButton, isActive && { backgroundColor: color, borderColor: color }]}
                      onPress={() => cambiarEstadoMateria(estado as ExtendedSubjectStatus)}
                    >
                      {isAprobada ? <CheckCircle size={16} color={isActive ? colors.white : color} /> : null}
                      <Text style={[styles.horizontalButtonText, { color: isActive ? colors.white : color }]}>
                        {isAprobada ? 'Aprob.' : isCursada ? 'Curs.' : isCursando ? 'Cursando' : 'Desmarcar'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sección de Destrabes (Correlatividades) */}
              <View style={styles.destrabesSection}>
                <Text style={styles.destrabesTitle}>¿Qué destrabo con esta materia?</Text>
                {(() => {
                  if (!materiaSeleccionada) return null;
                  
                  // Buscamos qué materias piden a ESTA materia como correlativa
                  const materiasQueMePiden = correlativasTotales.filter(c => c.id_correlativa === materiaSeleccionada.id);
                  
                  if (materiasQueMePiden.length === 0) {
                    return <Text style={styles.destrabeText}>No destraba ninguna materia obligatoria directamente.</Text>;
                  }

                  return materiasQueMePiden.map(c => (
                    <View key={`${c.id_materia}-${c.id_correlativa}`} style={styles.destrabeItem}>
                      <Lock size={14} color={colors.textSecondary} />
                      <Text style={styles.destrabeText}>
                        <Text style={{ fontWeight: 'bold' }}>{c.materia_nombre}</Text> (piden tenerla {c.tipo})
                      </Text>
                    </View>
                  ));
                })()}
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
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBackground, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.inputBorder },
  searchInput: { flex: 1, paddingVertical: spacing.md, marginLeft: spacing.sm, color: colors.textPrimary, fontFamily: fontFamily.regular, fontSize: fontSize.md },
  
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  planCard: { marginBottom: spacing.md, backgroundColor: colors.card, padding: spacing.md },
  planCardContent: { flexDirection: 'row', alignItems: 'center' },
  planIconWrapper: { width: 48, height: 48, borderRadius: borderRadius.md, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  planInfo: { marginLeft: spacing.md, flex: 1 },
  planName: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  planYear: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: 4 },
  
  // UI Replicada de la Web
  statsWebContainer: { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.lg, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.cardBorder },
  statsWebRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  statLabel: { fontSize: 10, fontFamily: fontFamily.monoRegular, color: colors.textSecondary, textTransform: 'uppercase', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progressPercent: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textPrimary },
  
  yearHeader: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md },
  yearTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary, marginRight: spacing.sm },
  yearLine: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  modalCode: { fontSize: fontSize.sm, fontFamily: fontFamily.monoBold, color: colors.primary },
  modalTitle: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary, marginTop: spacing.xs },
  closeButton: { padding: spacing.xs },
  modalBody: { padding: spacing.lg },
  actionsTitle: { fontSize: fontSize.md, fontFamily: fontFamily.medium, color: colors.textPrimary, marginBottom: spacing.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { width: '100%', paddingVertical: spacing.md, alignItems: 'center', borderRadius: borderRadius.md, backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder },
  actionButtonText: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textSecondary },
  // Estilos de grilla 2 columnas
  twoColumnGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: spacing.md },
  
  // Botones horizontales del modal
  horizontalActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs, marginBottom: spacing.xl },
  horizontalButton: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.md, backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, flexDirection: 'column', gap: 4 },
  horizontalButtonText: { fontSize: 11, fontFamily: fontFamily.bold, textAlign: 'center' },
  
  // Estilos de Correlatividades / Destrabes
  destrabesSection: { backgroundColor: colors.cardBorder, padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.sm },
  destrabesTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  destrabeItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  destrabeText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary },

  // Botón de suscribirse al plan
  btnSeguir: { backgroundColor: colors.primary, paddingVertical: spacing.md, alignItems: 'center', borderRadius: borderRadius.md, marginTop: spacing.lg },
  btnSeguirText: { color: colors.white, fontSize: fontSize.md, fontFamily: fontFamily.bold },
});