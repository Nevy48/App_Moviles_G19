import { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Materia, PlanEstudio } from '@/lib/supabase/database.types';
import { materiasService } from '@/services/materiasService';
import { planesService } from '@/services/planesService';
import { Card, Button, Input } from '@/components/ui';
import { colors } from '@/constants';
import { borderRadius, spacing, fontSize, fontFamily } from '@/constants/theme';
import { Plus, Edit2, Trash2, GraduationCap, X } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const esquemaMateriaGlobal = z.object({
  id_plan: z.string().min(1, 'Selecciona un plan de estudio obligatorio'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  nivel: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
    message: 'Nivel debe ser un número >= 1',
  }),
  horas_anuales: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Horas debe ser un número válido',
  }),
});

type MateriaGlobalFormData = z.infer<typeof esquemaMateriaGlobal>;

export default function AdminMateriasGlobalesScreen() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [materiaEnEdicion, setMateriaEnEdicion] = useState<Materia | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<MateriaGlobalFormData>({
    resolver: zodResolver(esquemaMateriaGlobal),
    defaultValues: {
      id_plan: '',
      nombre: '',
      nivel: '1',
      horas_anuales: '0',
    },
  });

  const cargarDatosCentrales = async () => {
    try {
      const [datosMaterias, datosPlanes] = await Promise.all([
        materiasService.getAll(),
        planesService.getAll(),
      ]);
      setMaterias(datosMaterias);
      setPlanes(datosPlanes);
    } catch (e) {
      console.error('Error cargando repositorio global de materias:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosCentrales();
  }, []);

  const alRefrescar = async () => {
    setRefrescando(true);
    await cargarDatosCentrales();
    setRefrescando(false);
  };

    const alEnviarFormulario = async (data: MateriaGlobalFormData) => {
    const estructuraData = {
        id_plan: data.id_plan, // Se remueve el cortocircuito a undefined
        nombre: data.nombre,
        nivel: parseInt(data.nivel, 10),
        horas_anuales: parseInt(data.horas_anuales, 10),
    };

    if (materiaEnEdicion) {
      const exito = await materiasService.update(materiaEnEdicion.id, estructuraData);
      if (exito) {
        await cargarDatosCentrales();
        cerrarModal();
      } else {
        Alert.alert('Error', 'No se pudo actualizar la materia');
      }
    } else {
      // Forzamos la asercion para el create, permitiendo omitir el plan en materias independientes
      const exito = await materiasService.create(estructuraData as any);
      if (exito) {
        await cargarDatosCentrales();
        cerrarModal();
      } else {
        Alert.alert('Error', 'No se pudo crear la materia global');
      }
    }
  };

  const confirmarEliminacion = (materia: Materia) => {
    Alert.alert(
      'Eliminar Materia',
      `¿Estás seguro de eliminar "${materia.nombre}" del repositorio global?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const exito = await materiasService.delete(materia.id);
            if (exito) {
              await cargarDatosCentrales();
            } else {
              Alert.alert('Error', 'No se pudo eliminar la materia');
            }
          },
        },
      ]
    );
  };

  const abrirModalEdicion = (materia: Materia) => {
    setMateriaEnEdicion(materia);
    reset({
      id_plan: materia.id_plan || '',
      nombre: materia.nombre,
      nivel: materia.nivel.toString(),
      horas_anuales: materia.horas_anuales.toString(),
    });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setMateriaEnEdicion(null);
    reset({ id_plan: '', nombre: '', nivel: '1', horas_anuales: '0'});
  };

  const obtenerNombreDelPlan = (planId: string | null) => {
    if (!planId) return 'Materia Independiente';
    return planes.find(p => p.id === planId)?.nombre.split(' - ')[0] || 'Sin asignar';
  };

  // Agrupamiento por nivel enfocado en la visualizacion ordenada de la grilla
  const materiasAgrupadasPorNivel = materias.reduce((acc, materia) => {
    const nivel = materia.nivel;
    if (!acc[nivel]) acc[nivel] = [];
    acc[nivel].push(materia);
    return acc;
  }, {} as Record<number, Materia[]>);

  const nivelesOrdenados = Object.keys(materiasAgrupadasPorNivel).map(Number).sort((a, b) => a - b);

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando repositorio general...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materias Globales</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Plus size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={nivelesOrdenados}
        keyExtractor={(item) => `global-nivel-${item}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={alRefrescar} tintColor={colors.primary} />}
        renderItem={({ item: nivel }) => (
          <View style={styles.nivelSection}>
            <Text style={styles.nivelTitle}>Nivel {nivel}</Text>
            {/* Reemplazar el materiasAgrupadasPorNivel[nivel].map anterior por este */}
            {materiasAgrupadasPorNivel[nivel].map((materia) => (
              <Card 
                key={materia.id} 
                style={styles.materiaCard}
                onPress={() => {
                  Alert.alert(
                    materia.nombre,
                    `Plan de estudio asignado:\n${obtenerNombreDelPlan(materia.id_plan)}\n\nNivel: Año ${materia.nivel}\nCarga horaria: ${materia.horas_anuales} hs semanales.`
                  );
                }}
              >
                <View style={styles.materiaContent}>
                  <View style={styles.materiaInfo}>
                    <Text style={styles.materiaName}>{materia.nombre}</Text>
                    <View style={styles.materiaMetaRow}>
                      <Text style={styles.materiaMetaText}>{materia.horas_anuales} hs semanales</Text>
                    </View>
                  </View>
                  <View style={styles.materiaActions}>
                    <TouchableOpacity onPress={() => abrirModalEdicion(materia)} style={styles.actionButton}>
                      <Edit2 size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmarEliminacion(materia)} style={styles.actionButton}>
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <GraduationCap size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No hay materias</Text>
            <Text style={styles.emptySubtext}>Toca + para crear una nueva materia.</Text>
          </Card>
        }
      />

      {/* Modal Deslizante estilo Bottom Sheet */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={cerrarModal}>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={cerrarModal}
        >
          {/* Este contenedor captura los clics internos para evitar que cierren el modal por error */}
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.modalContentStyle}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {materiaEnEdicion ? 'Modificar Asignatura' : 'Nueva Materia Global'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={cerrarModal}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Controller
                control={control}
                name="nombre"
                render={({ field: { onChange, value } }) => (
                  <Input label="Nombre de la asignatura" placeholder="Ej. Legislación" value={value} onChangeText={onChange} error={errors.nombre?.message} />
                )}
              />

              <View style={styles.rowInlineForm}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="nivel"
                    render={({ field: { onChange, value } }) => (
                      <Input label="Nivel / Año" placeholder="1" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.nivel?.message} />
                    )}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="horas_anuales"
                    render={({ field: { onChange, value } }) => (
                      <Input label="Horas semanales" placeholder="64" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.horas_anuales?.message} />
                    )}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Asociar a un plan (Opcional)</Text>
              <TouchableOpacity
                style={styles.select}
                onPress={() => {
                  const opcionesPlanes = planes.map((p) => ({
                    text: p.nombre,
                    onPress: () => reset({ ...control._formValues, id_plan: p.id }),
                  }));

                  // Inyectamos la opción nativa de cancelar para cerrar la alerta limpiamente
                  opcionesPlanes.push({
                    text: 'Cancelar',
                    style: 'cancel',
                    onPress: () => {},
                  });

                  Alert.alert('Planes Disponibles', undefined, opcionesPlanes);
                }}
              >
                <Text style={[styles.selectText, !control._formValues.id_plan && { color: colors.textTertiary }]}>
                {control._formValues.id_plan 
                    ? (planes.find(p => p.id === control._formValues.id_plan)?.nombre || 'Seleccionar plan')
                    : 'Sin plan'
                }
                </Text>
              </TouchableOpacity>
              {errors.id_plan && <Text style={styles.errorText}>{errors.id_plan.message}</Text>}

              <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit(alEnviarFormulario)}>
                <Text style={styles.primaryButtonText}>
                  {materiaEnEdicion ? 'Guardar Cambios' : 'Dar de Alta General'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textSecondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
  headerTitle: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  addButton: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: borderRadius.full, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  nivelSection: { marginBottom: spacing.lg },
  nivelTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  materiaCard: { padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.card },
  materiaContent: { flexDirection: 'row', alignItems: 'center' },
  materiaIcon: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  materiaInfo: { flex: 1, marginLeft: spacing.md },
  materiaName: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textPrimary },
  materiaMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: spacing.xs },
  materiaMetaText: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textSecondary },
  materiaDot: { fontSize: fontSize.sm, color: colors.textTertiary, marginHorizontal: 2 },
  planAsignadoText: { fontSize: fontSize.sm, fontFamily: fontFamily.monoRegular, color: colors.primary, textTransform: 'uppercase' },
  materiaActions: { flexDirection: 'row', gap: spacing.xs, marginLeft: spacing.sm },
  actionButton: { padding: spacing.sm, minWidth: 36, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, backgroundColor: colors.inputBackground, borderRadius: borderRadius.lg, marginTop: spacing.sm },
  emptyText: { fontSize: fontSize.md, fontFamily: fontFamily.bold, color: colors.textSecondary, marginTop: spacing.md },
  emptySubtext: { fontSize: fontSize.sm, fontFamily: fontFamily.regular, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContentStyle: { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '90%', minHeight: '55%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  modalTitle: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, color: colors.textPrimary },
  closeButton: { padding: spacing.xs },
  modalBody: { padding: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bold, color: colors.textSecondary, marginBottom: spacing.xs },
  select: { backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
  selectText: { fontSize: fontSize.md, fontFamily: fontFamily.regular, color: colors.textPrimary },
  errorText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  rowInlineForm: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  primaryButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xxl },
  primaryButtonText: { color: colors.white, fontSize: fontSize.md, fontFamily: fontFamily.bold },
});