import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Materia, PlanEstudio, CorrelativaWithDetails, TipoCorrelativa } from '@/lib/supabase/database.types';
import { planesService } from '@/services/planesService';
import { materiasService } from '@/services/materiasService';
import { correlativasService } from '@/services/correlativasService';
import { Card, Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { Plus, Edit2, Trash2, GraduationCap, ArrowLeft, X, Link2 } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema de validacion para el formulario de materias
const muesmaMateria = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  nivel: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
    message: 'Nivel debe ser un número >= 1',
  }),
  horas_anuales: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Horas debe ser un número válido',
  }),
});

type MateriaFormularioData = z.infer<typeof muesmaMateria>;

export default function AdminDetallePlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Estados de carga e informacion principal
  const [plan, setPlan] = useState<PlanEstudio | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [todasLasCorrelativas, setTodasLasCorrelativas] = useState<CorrelativaWithDetails[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Estados para la gestion de los modales internos
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [vistaInternaModal, setVistaInternaModal] = useState<'detalle' | 'formulario_materia' | 'agregar_correlativa'>('detalle');

  // Estados auxiliares para la creacion de nuevas correlativas
  const [idCorrelativaSeleccionada, setIdCorrelativaSeleccionada] = useState<string>('');
  const [tipoCorrelativaSeleccionada, setTipoCorrelativaSeleccionada] = useState<TipoCorrelativa>('cursada');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<MateriaFormularioData>({
    resolver: zodResolver(muesmaMateria),
    defaultValues: { nombre: '', nivel: '1', horas_anuales: '0' },
  });

  // Funcion centralizada para la extraccion de datos desde Supabase
  const cargarInformacionCompleta = useCallback(async () => {
    if (!id) return;
    try {
      const [datosPlan, listadoMaterias, listadoCorrelativas] = await Promise.all([
        planesService.getById(id),
        materiasService.getByPlan(id),
        correlativasService.getAll(),
      ]);

      setPlan(datosPlan);
      setMaterias(listadoMaterias);
      setTodasLasCorrelativas(listadoCorrelativas);
    } catch (error) {
      console.error('Error cargando los componentes del plan:', error);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarInformacionCompleta();
  }, [cargarInformacionCompleta]);

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargarInformacionCompleta();
    setRefrescando(false);
  };

  // Logica de persistencia para Alta y Modificacion de Materias
  const guardarFormularioMateria = async (data: MateriaFormularioData) => {
    if (!id) return;

    const estructuraMateria = {
      id_plan: id,
      nombre: data.nombre,
      nivel: parseInt(data.nivel, 10),
      horas_anuales: parseInt(data.horas_anuales, 10),
    };

    if (materiaSeleccionada) {
      const exito = await materiasService.update(materiaSeleccionada.id, estructuraMateria);
      if (exito) {
        await cargarInformacionCompleta();
        cerrarContenedorModal();
      } else {
        Alert.alert('Error', 'No se pudo actualizar la materia');
      }
    } else {
      const exito = await materiasService.create(estructuraMateria);
      if (exito) {
        await cargarInformacionCompleta();
        cerrarContenedorModal();
      } else {
        Alert.alert('Error', 'No se pudo crear la materia');
      }
    }
  };

  // Logica de persistencia para Vincular Correlatividades
  const asociarNuevaCorrelativa = async () => {
    if (!materiaSeleccionada || !idCorrelativaSeleccionada) {
      Alert.alert('Error', 'Debe seleccionar una materia correlativa');
      return;
    }

    const exito = await correlativasService.create({
      id_materia: materiaSeleccionada.id,
      id_correlativa: idCorrelativaSeleccionada,
      tipo: tipoCorrelativaSeleccionada,
    });

    if (exito) {
      await cargarInformacionCompleta();
      setIdCorrelativaSeleccionada('');
      setVistaInternaModal('detalle');
    } else {
      Alert.alert('Error', 'No se pudo enlazar la correlativa');
    }
  };

  const removerCorrelativa = async (idCorrelativa: string) => {
    if (!materiaSeleccionada) return;
    const exito = await correlativasService.delete(materiaSeleccionada.id, idCorrelativa);
    if (exito) {
      await cargarInformacionCompleta();
    } else {
      Alert.alert('Error', 'No se pudo remover el enlace');
    }
  };

  const eliminarMateriaCompleta = (materia: Materia) => {
    Alert.alert('Eliminar Materia', `¿Eliminar "${materia.nombre}"? Esto borrara sus correlatividades asociadas.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const exito = await materiasService.delete(materia.id);
          if (exito) {
            await cargarInformacionCompleta();
            cerrarContenedorModal();
          }
        },
      },
    ]);
  };

  const abrirModalCrearMateria = () => {
    setMateriaSeleccionada(null);
    reset({ nombre: '', nivel: '1', horas_anuales: '0' });
    setVistaInternaModal('formulario_materia');
    setModalDetalleVisible(true);
  };

  const abrirModalDetalleMateria = (materia: Materia) => {
    setMateriaSeleccionada(materia);
    reset({
      nombre: materia.nombre,
      nivel: materia.nivel.toString(),
      horas_anuales: materia.horas_anuales.toString(),
    });
    setVistaInternaModal('detalle');
    setModalDetalleVisible(true);
  };

  const cerrarContenedorModal = () => {
    setModalDetalleVisible(false);
    setMateriaSeleccionada(null);
    setIdCorrelativaSeleccionada('');
    setTipoCorrelativaSeleccionada('cursada');
  };

  // Agrupador de asignaturas por el atributo de nivel mecanico
  const materiasAgrupadas = materias.reduce((acumulador, materia) => {
    const nivel = materia.nivel;
    if (!acumulador[nivel]) acumulador[nivel] = [];
    acumulador[nivel].push(materia);
    return acumulador;
  }, {} as Record<number, Materia[]>);

  const nivelesOrdenados = Object.keys(materiasAgrupadas).map(Number).sort((a, b) => a - b);

  // Filtrado local de las correlativas pertenecientes a la materia activa en el modal
  const correlativasDeMateriaActual = todasLasCorrelativas.filter(
    (c) => c.id_materia === materiaSeleccionada?.id
  );

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando estructura del plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra superior de navegacion de retorno */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{plan?.nombre || 'Detalle del Plan'}</Text>
          <Text style={styles.headerSubtitle}>Resolución: {plan?.anio_resolucion || '-'}</Text>
        </View>
        <TouchableOpacity onPress={abrirModalCrearMateria} style={styles.addButton}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Malla principal de asignaturas agrupadas */}
      <FlatList
        data={nivelesOrdenados}
        keyExtractor={(item) => `nivel-plan-${item}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colors.primary} />}
        renderItem={({ item: nivel }) => (
          <View style={styles.nivelSection}>
            <Text style={styles.nivelTitle}>Nivel {nivel}</Text>
            {materiasAgrupadas[nivel].map((materia) => (
              <Card key={materia.id} style={styles.materiaCard} onPress={() => abrirModalDetalleMateria(materia)}>
                <View style={styles.materiaContent}>
                  <View style={styles.materiaIcon}>
                    <GraduationCap size={20} color={colors.primary} />
                  </View>
                  <View style={styles.materiaInfo}>
                    <Text style={styles.materiaName}>{materia.nombre}</Text>
                    <Text style={styles.materiaMeta}>{materia.horas_anuales} horas anuales</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <GraduationCap size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay materias en este plan</Text>
            <Text style={styles.emptySubtext}>Toca el botón + superior para añadir la primera materia.</Text>
          </Card>
        }
      />

      {/* Modal Unificado Intermedio (Detalle, ABM y Correlativas) */}
      <Modal visible={modalDetalleVisible} animationType="slide" transparent={true} onRequestClose={cerrarContenedorModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentStyle}>
              <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {vistaInternaModal === 'detalle' && 'Configuración de Materia'}
                {vistaInternaModal === 'formulario_materia' && (materiaSeleccionada ? 'Modificar Datos' : 'Nueva Asignatura')}
                {vistaInternaModal === 'agregar_correlativa' && 'Asociar Requisito'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={cerrarContenedorModal}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* VISTA 1: DETALLE GENERAL Y REQUISITOS CORRELATIVOS */}
            {vistaInternaModal === 'detalle' && materiaSeleccionada && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.infoRow}>
                  <Text style={styles.detailLabelName}>{materiaSeleccionada.nombre}</Text>
                  <Text style={styles.detailLabelSub}>Nivel {materiaSeleccionada.nivel} • {materiaSeleccionada.horas_anuales} hs anuales</Text>
                </View>

                {/* Sub-modulo de control de correlativas encajonado por nivel */}
                <View style={styles.configSection}>
                  <View style={styles.configHeader}>
                    <Text style={styles.configTitle}>Correlativas Requeridadas</Text>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setVistaInternaModal('agregar_correlativa')}>
                      <Plus size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {correlativasDeMateriaActual.length > 0 ? (
                    <View style={styles.correlativasContainerList}>
                      {correlativasDeMateriaActual.map((item) => (
                        <View key={item.id_correlativa} style={styles.correlativaItemRow}>
                          <View style={styles.correlativaItemInfo}>
                            <Text style={styles.correlativaItemName}>{item.correlativa_nombre}</Text>
                            <Text style={[styles.correlativaItemBadge, { color: item.tipo === 'cursada' ? colors.warning : colors.success }]}>
                              Requiere {item.tipo === 'cursada' ? 'Cursada' : 'Aprobada'}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => removerCorrelativa(item.id_correlativa)}>
                            <Trash2 size={16} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyConfigText}>No posee materias correlativas asignadas actualmente.</Text>
                  )}
                </View>

                {/* Acciones de administracion de registros */}
                <View style={styles.actionButtonRowLayout}>
                  <Button title="Editar Materia" onPress={() => setVistaInternaModal('formulario_materia')} style={{ flex: 1 }} />
                  <TouchableOpacity style={styles.deleteActionButtonBox} onPress={() => eliminarMateriaCompleta(materiaSeleccionada)}>
                    <Trash2 size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* VISTA 2: FORMULARIO ALTA / EDICIÓN */}
            {vistaInternaModal === 'formulario_materia' && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Controller
                  control={control}
                  name="nombre"
                  render={({ field: { onChange, value } }) => (
                    <Input label="Nombre de la materia" placeholder="Ej. Redes de Información" value={value} onChangeText={onChange} error={errors.nombre?.message} />
                  )}
                />
                <View style={styles.rowFormInline}>
                  <View style={{ flex: 1 }}>
                    <Controller
                      control={control}
                      name="nivel"
                      render={({ field: { onChange, value } }) => (
                        <Input label="Nivel (Año)" placeholder="1" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.nivel?.message} />
                      )}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Controller
                      control={control}
                      name="horas_anuales"
                      render={({ field: { onChange, value } }) => (
                        <Input label="Horas Anuales" placeholder="128" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.horas_anuales?.message} />
                      )}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit(guardarFormularioMateria)}>
                  <Text style={styles.primaryButtonText}>{materiaSeleccionada ? 'Actualizar Cambios' : 'Registrar Materia'}</Text>
                </TouchableOpacity>
                {materiaSeleccionada && (
                  <TouchableOpacity style={styles.secondaryCancelButtonTextInline} onPress={() => setVistaInternaModal('detalle')}>
                    <Text style={styles.secondaryButtonTextLabelInline}>Volver al Detalle</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}

            {/* VISTA 3: ASOCIAR NUEVA CORRELATIVA */}
            {vistaInternaModal === 'agregar_correlativa' && materiaSeleccionada && (
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Seleccionar Materia Requisito</Text>
                <TouchableOpacity
                  style={styles.selectBoxStyle}
                  onPress={() => {
                    const poolDisponibles = materias.filter((m) => m.id !== materiaSeleccionada.id && !correlativasDeMateriaActual.some((c) => c.id_correlativa === m.id));
                    if (poolDisponibles.length === 0) {
                      Alert.alert('Aviso', 'No hay otras materias disponibles en este plan para enlazar.');
                      return;
                    }
                    Alert.alert('Materias del Plan', undefined, poolDisponibles.map((m) => ({
                      text: m.nombre,
                      onPress: () => setIdCorrelativaSeleccionada(m.id),
                    })));
                  }}
                >
                  <Text style={[styles.selectBoxText, !idCorrelativaSeleccionada && { color: colors.textTertiary }]}>
                    {idCorrelativaSeleccionada ? materias.find((m) => m.id === idCorrelativaSeleccionada)?.nombre : 'Toca para elegir asignatura'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Condición Necesaria</Text>
                <View style={styles.tipoSelectorRowContainer}>
                  <TouchableOpacity style={[styles.tipoSelectorOptionBox, tipoCorrelativaSeleccionada === 'cursada' && styles.tipoSelectorOptionBoxActive]} onPress={() => setTipoCorrelativaSeleccionada('cursada')}>
                    <Text style={[styles.tipoSelectorOptionText, tipoCorrelativaSeleccionada === 'cursada' && styles.tipoSelectorOptionTextActive]}>Cursada</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tipoSelectorOptionBox, tipoCorrelativaSeleccionada === 'aprobada' && styles.tipoSelectorOptionBoxActive]} onPress={() => setTipoCorrelativaSeleccionada('aprobada')}>
                    <Text style={[styles.tipoSelectorOptionText, tipoCorrelativaSeleccionada === 'aprobada' && styles.tipoSelectorOptionTextActive]}>Aprobada</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={asociarNuevaCorrelativa}>
                  <Text style={styles.primaryButtonText}>Enlazar Requisito</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryCancelButtonTextInline} onPress={() => setVistaInternaModal('detalle')}>
                  <Text style={styles.secondaryButtonTextLabelInline}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textSecondary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
  backButton: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  headerSubtitle: { fontSize: fontSize.xs, fontFamily: fontFamily.monoRegular, color: colors.textSecondary, textTransform: 'uppercase', marginTop: 2 },
  addButton: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  nivelSection: { marginBottom: spacing.lg },
  nivelTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  materiaCard: { padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.card },
  materiaContent: { flexDirection: 'row', alignItems: 'center' },
  materiaIcon: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  materiaInfo: { flex: 1, marginLeft: spacing.md },
  materiaName: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  materiaMeta: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: 4 },
  emptyCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, backgroundColor: colors.inputBackground, borderRadius: borderRadius.lg, marginTop: spacing.sm },
  emptyText: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textSecondary, marginTop: spacing.md },
  emptySubtext: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContentStyle: { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%', minHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  modalTitle: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  closeButton: { padding: spacing.xs },
  modalBody: { padding: spacing.lg },
  infoRow: { marginBottom: spacing.md },
  detailLabelName: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary },
  detailLabelSub: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary, marginTop: 4 },
  configSection: { marginBottom: spacing.lg, padding: spacing.md, backgroundColor: colors.inputBackground, borderRadius: borderRadius.md },
  configHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  configTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  iconBtn: { padding: spacing.xs, backgroundColor: colors.primary + '15', borderRadius: borderRadius.sm },
  correlativasContainerList: { gap: spacing.sm },
  correlativaItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: spacing.sm, borderRadius: borderRadius.sm },
  correlativaItemInfo: { flex: 1 },
  correlativaItemName: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textPrimary },
  correlativaItemBadge: { fontSize: fontSize.xs, fontFamily: fontFamily.monoBold, textTransform: 'uppercase', marginTop: 2 },
  emptyConfigText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, fontStyle: 'italic' },
  actionButtonRowLayout: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  deleteActionButtonBox: { width: 48, backgroundColor: colors.error + '15', borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.error + '30' },
  rowFormInline: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  primaryButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl },
  primaryButtonText: { color: colors.white, fontSize: fontSize.md, fontFamily: fontFamily.bold },
  secondaryCancelButtonTextInline: { padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryButtonTextLabelInline: { color: colors.textSecondary, fontSize: fontSize.md, fontFamily: fontFamily.medium },
  inputLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: spacing.xs, marginTop: spacing.md },
  selectBoxStyle: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md },
  selectBoxText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },
  tipoSelectorRowContainer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  tipoSelectorOptionBox: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md },
  tipoSelectorOptionBoxActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  tipoSelectorOptionText: { fontSize: fontSize.xs, fontFamily: fontFamily.medium, color: colors.textSecondary },
  tipoSelectorOptionTextActive: { color: colors.primary, fontFamily: fontFamily.bold },
});